use std::{env, future::Future, pin::Pin};

use actix_session::Session;
use actix_web::{get, http::header::LOCATION, web::Query, FromRequest, HttpResponse};
use log::error;
use oauth2::{
    basic::BasicClient, AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken,
    PkceCodeChallenge, PkceCodeVerifier, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use redis::{aio::ConnectionLike, Cmd};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, TransactionTrait};
use serde::{Deserialize, Serialize};

use crate::{
    http_response_errors::AuthError, redis_csrf_cache::RedisConnectionManagerExt,
    user_models::mbe_user, SeaOrmPool,
};

const GOOGLE_AUTH_ENDPOINT: &str = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_ENDPOINT: &str = "https://oauth2.googleapis.com/token";
const GOOGLE_USER_INFO_ENDPOINT: &str = "https://openidconnect.googleapis.com/v1/userinfo";

const MICROSOFT_AUTH_ENDPOINT: &str =
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
const MICROSOFT_TOKEN_ENDPOINT: &str =
    "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const MICROSOFT_USER_INFO_ENDPOINT: &str = "https://graph.microsoft.com/v1.0/me";

const GITHUB_AUTH_ENDPOINT: &str = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_ENDPOINT: &str = "https://github.com/login/oauth/access_token";
const GITHUB_USER_INFO_ENDPOINT: &str = "https://api.github.com/user";

const FACEBOOK_AUTH_ENDPOINT: &str = "https://www.facebook.com/v16.0/dialog/oauth";
const FACEBOOK_TOKEN_ENDPOINT: &str = "https://graph.facebook.com/v16.0/oauth/access_token";
const FACEBOOK_USER_INFO_ENDPOINT: &str = "https://graph.facebook.com/v16.0/me?fields=email,name";

const CSRF_CACHE_EXPIRY: usize = 60 * 5;

pub const SESSION_DATA_KEY: &str = "SESSION_DATA";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub authorized: bool,
}

impl SessionData {
    fn new_authorized() -> Self {
        Self { authorized: true }
    }
}

trait ExtractEmail {
    fn get_email(self) -> Result<String, AuthError>;
}

#[derive(Deserialize, Debug)]
struct UserInfo {
    email: Option<String>,
}

impl ExtractEmail for UserInfo {
    fn get_email(self) -> Result<String, AuthError> {
        self.email.ok_or(AuthError::MissingEmailInResponse)
    }
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MicrosoftUserInfo {
    user_principal_name: Option<String>,
    mail: Option<String>,
}

impl ExtractEmail for MicrosoftUserInfo {
    fn get_email(self) -> Result<String, AuthError> {
        match self.user_principal_name {
            Some(email) => Ok(email),
            None => self.mail.ok_or(AuthError::MissingEmailInResponse),
        }
    }
}

#[derive(Clone)]
pub struct GlobalReqwestClient(pub reqwest::Client);

impl GlobalReqwestClient {
    pub fn new() -> Self {
        Self::default()
    }
}

impl Default for GlobalReqwestClient {
    fn default() -> Self {
        GlobalReqwestClient(
            reqwest::Client::builder()
                .user_agent("MBE-client")
                .build()
                .expect("Valid global reqwest client"),
        )
    }
}

impl FromRequest for GlobalReqwestClient {
    type Error = actix_web::Error;

    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let req = req.clone();

        Box::pin(async move {
            Ok(req
                .app_data::<Self>()
                .cloned()
                .expect("An existing global reqwest client"))
        })
    }
}

#[derive(Deserialize, Debug)]
pub struct AuthCallbackParams {
    code: Option<String>,
    state: Option<String>,
}

macro_rules! impl_oauth_client {
    (
        $(#[$attr:meta])*
        $name:ident($type:ty),
        $client_id_env:literal,
        $client_secret_env:literal,
        $auth_endpoint:expr,
        $token_url_endpoint:expr,
        $redirect_uri:literal
        ) => {

        $(#[$attr])*
        pub struct $name($type);

        impl $name {
            pub fn new() -> $name {
                $name(
                    BasicClient::new(
                        ClientId::new(
                            env::var($client_id_env)
                                .expect(concat!($client_id_env, " env variable to be present")),
                        ),
                        Some(ClientSecret::new(env::var($client_secret_env).expect(
                            concat!($client_secret_env, " env variable to be present",),
                        ))),
                        AuthUrl::new($auth_endpoint.to_string()).expect("A valid auth url"),
                        Some(
                            TokenUrl::new($token_url_endpoint.to_string())
                                .expect("A valid token url"),
                        ),
                    )
                    .set_redirect_uri(
                        RedirectUrl::new($redirect_uri.to_string()).expect("A valid redirect url"),
                    ),
                )
            }
        }

        impl FromRequest for $name {
            type Error = actix_web::Error;

            type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

            fn from_request(
                req: &actix_web::HttpRequest,
                _payload: &mut actix_web::dev::Payload,
            ) -> Self::Future {
                let req = req.clone();

                Box::pin(async move {
                    Ok(req
                        .app_data::<Self>()
                        .cloned()
                        .expect(concat!("An existing ", stringify!($name))))
                })
            }
        }
    };
}

impl_oauth_client![
    #[derive(Clone, Debug)]
    OAuthClientGoogle(BasicClient),
    "OAUTH_CLIENT_ID_GOOGLE",
    "OAUTH_CLIENT_SECRET_GOOGLE",
    GOOGLE_AUTH_ENDPOINT,
    GOOGLE_TOKEN_ENDPOINT,
    "http://localhost:8000/callback-google"
];

impl_oauth_client![
    #[derive(Clone, Debug)]
    OAuthClientMicrosoft(BasicClient),
    "OAUTH_CLIENT_ID_MICROSOFT",
    "OAUTH_CLIENT_SECRET_MICROSOFT",
    MICROSOFT_AUTH_ENDPOINT,
    MICROSOFT_TOKEN_ENDPOINT,
    "http://localhost:8000/callback-ms"
];

impl_oauth_client![
    #[derive(Clone, Debug)]
    OAuthClientGithub(BasicClient),
    "OAUTH_CLIENT_ID_GITHUB",
    "OAUTH_CLIENT_SECRET_GITHUB",
    GITHUB_AUTH_ENDPOINT,
    GITHUB_TOKEN_ENDPOINT,
    "http://localhost:8000/callback-gh"
];

impl_oauth_client![
    #[derive(Clone, Debug)]
    OAuthClientFacebook(BasicClient),
    "OAUTH_CLIENT_ID_FACEBOOK",
    "OAUTH_CLIENT_SECRET_FACEBOOK",
    FACEBOOK_AUTH_ENDPOINT,
    FACEBOOK_TOKEN_ENDPOINT,
    "http://localhost:8000/callback-fb"
];

macro_rules! login_route {(
        $(#[$attr:meta])*
        $name:ident,
        $type:ty,
        $($scope:literal),+
        ) => {
        $(#[$attr])*
        pub async fn $name(
            RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
            client: $type,
        ) -> Result<HttpResponse, AuthError> {
            let (pkce_challange, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

            let (url, csrf_token) = client
                .0
                .authorize_url(CsrfToken::new_random)
                .set_pkce_challenge(pkce_challange)
                $(
                    .add_scope(Scope::new($scope.to_string()))
                )+
                .url();

            redis_cache
                .req_packed_command(&redis::Cmd::set_ex(
                    csrf_token.secret(),
                    pkce_verifier.secret(),
                    CSRF_CACHE_EXPIRY,
                ))
                .await?;

            Ok(HttpResponse::TemporaryRedirect()
                .insert_header((LOCATION, url.to_string()))
                .finish())
        }
    };
}

login_route![
    #[get("/login-google")]
    login_google,
    OAuthClientGoogle,
    "email"
];

login_route![
    #[get("/login-ms")]
    login_microsoft,
    OAuthClientMicrosoft,
    "User.Read"
];

login_route![
    #[get("/login-gh")]
    login_github,
    OAuthClientGithub,
    "user:email"
];

login_route![
    #[get("/login-fb")]
    login_facebook,
    OAuthClientFacebook,
    "email"
];

macro_rules! callback_route {(
        $(#[$attr:meta])*
        $name:ident,
        $client:ty,
        $endpoint:expr,
        $user_info_type:ty
        ) => {
        $(#[$attr])*
        pub async fn $name(
            Query(params): Query<AuthCallbackParams>,
            RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
            reqwest_client: GlobalReqwestClient,
            client: $client,
            db_pool: SeaOrmPool,
            session: Session,
        ) -> Result<HttpResponse, AuthError> {
            if let (Some(csrf_state), Some(auth_code)) = (params.state, params.code) {
                let pkce_verifier: Option<String> =
                    Cmd::get(&csrf_state).query_async(&mut redis_cache).await?;

                match Cmd::del(csrf_state)
                    .query_async::<_, i64>(&mut redis_cache)
                    .await
                {
                    Ok(num_keys_deleted) => {
                        if num_keys_deleted == 0 {
                            return Err(AuthError::InvalidPkceVerifier);
                        }
                    }
                    Err(e) => error!("Redis key deletion failed: {}", e),
                }

                let pkce_verifier = match pkce_verifier {
                    Some(pv) => pv,
                    None => Err(AuthError::InvalidPkceVerifier)?,
                };

                let token = client
                    .0
                    .exchange_code(AuthorizationCode::new(auth_code))
                    .set_pkce_verifier(PkceCodeVerifier::new(pkce_verifier))
                    .request_async(oauth2::reqwest::async_http_client)
                    .await?;

                let response = reqwest_client
                    .0
                    .get($endpoint)
                    .bearer_auth(token.access_token().secret())
                    .send()
                    .await?
                    .json::<$user_info_type>()
                    .await?;

                session.insert(SESSION_DATA_KEY, SessionData::new_authorized())?;

                let transaction = db_pool.begin().await?;

                let user = mbe_user::Entity::find()
                    .filter(mbe_user::Column::Email.eq(response.get_email()?))
                    .one(&transaction)
                    .await?;

                transaction.commit().await?;

                match user {
                    Some(_user) => {
                        session.renew();
                        session.insert(SESSION_DATA_KEY, SessionData::new_authorized())?;

                        #[cfg(not(debug_assertions))]
                        panic!("Change location header to env var");

                        Ok(HttpResponse::TemporaryRedirect()
                           // TODO: change to env variable
                           .insert_header((LOCATION, "http://localhost:1420/login-callback"))
                           .finish())
                        // Ok(HttpResponse::Ok().finish())
                    }
                    None => Err(AuthError::UserNotFound),
                }
            } else {
                Err(AuthError::MissingStateOrAuthCode)?
            }
        }
    };
}

callback_route![
    #[get("/callback-google")]
    login_callback_google,
    OAuthClientGoogle,
    GOOGLE_USER_INFO_ENDPOINT,
    UserInfo
];

callback_route![
    #[get("/callback-ms")]
    login_callback_microsoft,
    OAuthClientMicrosoft,
    MICROSOFT_USER_INFO_ENDPOINT,
    MicrosoftUserInfo
];

callback_route![
    #[get("/callback-gh")]
    login_callback_github,
    OAuthClientGithub,
    GITHUB_USER_INFO_ENDPOINT,
    UserInfo
];

callback_route![
    #[get("/callback-fb")]
    login_callback_facebook,
    OAuthClientFacebook,
    FACEBOOK_USER_INFO_ENDPOINT,
    UserInfo
];

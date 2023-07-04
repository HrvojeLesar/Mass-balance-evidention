use std::{borrow::Cow, env, error::Error, future::Future, pin::Pin};

use actix_session::{Session, SessionExt};
use actix_web::{
    get,
    http::header::LOCATION,
    post,
    web::{Json, Query},
    FromRequest, HttpResponse,
};
use log::error;
use oauth2::{
    basic::BasicClient, AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken,
    PkceCodeChallenge, PkceCodeVerifier, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use rand::{RngCore, SeedableRng};
use redis::{aio::ConnectionLike, Cmd};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, TransactionTrait};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha512};

use crate::{
    http_response_errors::{AuthCallbackError, AuthError},
    load_env_var,
    redis_connection_manager::RedisConnectionManagerExt,
    user_models::mbe_user,
    SeaOrmPool,
};

const CSRF_CACHE_EXPIRY: usize = 60 * 5;
const TEMP_VERIFICATION_KEYS_CACHE_EXPIRY: usize = 60 * 5;

type MbeUserId = i32;

pub const SESSION_DATA_KEY: &str = "SESSION_DATA";

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(rename_all = "lowercase")]
pub enum Platform {
    Tauri,
    #[default]
    Web,
}

#[derive(Debug, Clone, Deserialize)]
pub struct RedirectUriParams {
    #[serde(default)]
    pub platform: Platform,
}

impl Platform {
    fn as_str(&self) -> &str {
        match self {
            Platform::Tauri => "tauri",
            Platform::Web => "web",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionData {
    pub user_id: i32,
}

impl SessionData {
    fn new(user_id: i32) -> Self {
        Self { user_id }
    }
}

impl FromRequest for SessionData {
    type Error = actix_web::Error;

    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(
        req: &actix_web::HttpRequest,
        _payload: &mut actix_web::dev::Payload,
    ) -> Self::Future {
        let req = req.clone();

        Box::pin(async move {
            let session = req.get_session();
            Ok(session
                .get::<SessionData>(SESSION_DATA_KEY)
                .map_err(|_e| AuthError::InvalidSession)?
                .ok_or(AuthError::InvalidSession)?)
        })
    }
}

trait ExtractEmail<E: Error> {
    fn get_email(self) -> Result<String, E>;
}

#[derive(Deserialize, Debug)]
struct UserInfo {
    email: Option<String>,
}

impl ExtractEmail<AuthCallbackError> for UserInfo {
    fn get_email(self) -> Result<String, AuthCallbackError> {
        self.email.ok_or(AuthCallbackError::MissingEmailInResponse)
    }
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MicrosoftUserInfo {
    user_principal_name: Option<String>,
    mail: Option<String>,
}

impl ExtractEmail<AuthCallbackError> for MicrosoftUserInfo {
    fn get_email(self) -> Result<String, AuthCallbackError> {
        match self.user_principal_name {
            Some(email) => Ok(email),
            None => self.mail.ok_or(AuthCallbackError::MissingEmailInResponse),
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

const HEX_TABLE: &[u8; 16] = b"0123456789abcdef";
const TEMP_CODE_LEN: usize = 2048;

#[derive(Debug, Deserialize)]
struct TemporaryVerificationCode {
    code: String,
}

impl TemporaryVerificationCode {
    fn new() -> Result<Self, AuthCallbackError> {
        let mut hasher = Sha512::new();
        let mut rng = rand::rngs::StdRng::from_entropy();
        let mut random_code_bytes = [0u8; TEMP_CODE_LEN];

        rng.try_fill_bytes(&mut random_code_bytes)?;

        hasher.update(random_code_bytes);

        let hashed_code = hasher.finalize();

        let code =
            hashed_code
                .iter()
                .fold(String::with_capacity(TEMP_CODE_LEN * 2), |mut acc, byte| {
                    acc.push(HEX_TABLE[(byte >> 4) as usize] as char);
                    acc.push(HEX_TABLE[(byte & 0x0f) as usize] as char);
                    acc
                });

        Ok(Self { code })
    }

    fn get_code(&self) -> &String {
        &self.code
    }

    fn get_code_owned(self) -> String {
        self.code
    }
}

#[derive(Deserialize, Debug)]
pub struct AuthCallbackParams {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
    #[serde(default)]
    platform: Platform,
}

fn gen_redirect_url(
    redirect_url: String,
    platform: &str,
) -> Result<RedirectUrl, oauth2::url::ParseError> {
    RedirectUrl::new(format!("{}?platform={}", redirect_url, platform))
}

macro_rules! impl_oauth_client {
    (
        $(#[$attr:meta])*
        $name:ident($type:ty),
        $client_id_env:literal,
        $client_secret_env:literal,
        $auth_endpoint:literal,
        $token_url_endpoint:literal,
        $redirect_uri:literal
        ) => {

        $(#[$attr])*
        pub struct $name($type);

        impl $name {
            pub fn new() -> $name {
                $name(
                    BasicClient::new(
                        ClientId::new(
                            load_env_var!($client_id_env)
                        ),
                        Some(ClientSecret::new(load_env_var!($client_secret_env))),
                        AuthUrl::new(load_env_var!($auth_endpoint)).expect("A valid auth url"),
                        Some(
                            TokenUrl::new(load_env_var!($token_url_endpoint))
                                .expect("A valid token url"),
                        ),
                    )
                    .set_redirect_uri(
                        RedirectUrl::new(load_env_var!($redirect_uri)).expect("A valid redirect url"),
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
    "GOOGLE_AUTH_ENDPOINT",
    "GOOGLE_TOKEN_ENDPOINT",
    "GOOGLE_REDIRECT_URL"
];

impl_oauth_client![
    #[derive(Clone, Debug)]
    OAuthClientMicrosoft(BasicClient),
    "OAUTH_CLIENT_ID_MICROSOFT",
    "OAUTH_CLIENT_SECRET_MICROSOFT",
    "MICROSOFT_AUTH_ENDPOINT",
    "MICROSOFT_TOKEN_ENDPOINT",
    "MICROSOFT_REDIRECT_URL"
];

impl_oauth_client![
    #[derive(Clone, Debug)]
    OAuthClientGithub(BasicClient),
    "OAUTH_CLIENT_ID_GITHUB",
    "OAUTH_CLIENT_SECRET_GITHUB",
    "GITHUB_AUTH_ENDPOINT",
    "GITHUB_TOKEN_ENDPOINT",
    "GITHUB_REDIRECT_URL"
];

impl_oauth_client![
    #[derive(Clone, Debug)]
    OAuthClientFacebook(BasicClient),
    "OAUTH_CLIENT_ID_FACEBOOK",
    "OAUTH_CLIENT_SECRET_FACEBOOK",
    "FACEBOOK_AUTH_ENDPOINT",
    "FACEBOOK_TOKEN_ENDPOINT",
    "FACEBOOK_REDIRECT_URL"
];

macro_rules! login_route {(
        $(#[$attr:meta])*
        $name:ident,
        $type:ty,
        $redirect_url:literal,
        $($scope:literal),+
        ) => {
        $(#[$attr])*
        pub async fn $name(
            RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
            Query(params): Query<RedirectUriParams>,
            client: $type,
        ) -> Result<HttpResponse, AuthError> {
            let (pkce_challange, pkce_verifier) = PkceCodeChallenge::new_random_sha256();

            let redirect_url = gen_redirect_url(load_env_var!($redirect_url), params.platform.as_str()).expect("Redirect URL should always be valid.");

            let (url, csrf_token) = client
                .0
                .authorize_url(CsrfToken::new_random)
                .set_pkce_challenge(pkce_challange)
                $(
                    .add_scope(Scope::new($scope.to_string()))
                )+
                .set_redirect_uri(Cow::Borrowed(&redirect_url))
                .url();

            redis_cache
                .req_packed_command(&redis::Cmd::set_ex(
                    csrf_token.secret(),
                    pkce_verifier.secret(),
                    CSRF_CACHE_EXPIRY,
                ))
                .await?;

            Ok(HttpResponse::SeeOther()
                .insert_header((LOCATION, url.to_string()))
                .finish())
        }
    };
}

login_route![
    #[get("/login-google")]
    login_google,
    OAuthClientGoogle,
    "GOOGLE_REDIRECT_URL",
    "email"
];

login_route![
    #[get("/login-ms")]
    login_microsoft,
    OAuthClientMicrosoft,
    "MICROSOFT_REDIRECT_URL",
    "User.Read"
];

login_route![
    #[get("/login-gh")]
    login_github,
    OAuthClientGithub,
    "GITHUB_REDIRECT_URL",
    "user:email"
];

login_route![
    #[get("/login-fb")]
    login_facebook,
    OAuthClientFacebook,
    "FACEBOOK_REDIRECT_URL",
    "email"
];

macro_rules! callback_route {(
        $(#[$attr:meta])*
        $name:ident,
        $client:ty,
        $endpoint:literal,
        $redirect_url:literal,
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
        ) -> Result<HttpResponse, AuthCallbackError> {
            let callback_url =
                env::var("CALLBACK_URL").expect("CALLBACK_URL environment variable must be set");

            if let Some(error_param) = params.error {
                match error_param.as_ref() {
                    "access_denied" => return Ok(HttpResponse::SeeOther()
                           .insert_header((LOCATION, callback_url))
                           .finish()),
                    _ => return Ok(HttpResponse::SeeOther()
                           .insert_header((LOCATION, callback_url))
                           .finish())
                }
            }

            if let (Some(csrf_state), Some(auth_code)) = (params.state, params.code) {
                let pkce_verifier: Option<String> =
                    Cmd::get(&csrf_state).query_async(&mut redis_cache).await?;

                match Cmd::del(csrf_state)
                    .query_async::<_, i64>(&mut redis_cache)
                    .await
                {
                    Ok(num_keys_deleted) => {
                        if num_keys_deleted == 0 {
                            return Err(AuthCallbackError::InvalidPkceVerifier);
                        }
                    }
                    Err(e) => error!("Redis key deletion failed: {}", e),
                }

                let pkce_verifier = match pkce_verifier {
                    Some(pv) => pv,
                    None => Err(AuthCallbackError::InvalidPkceVerifier)?,
                };

                let redirect_url = gen_redirect_url(load_env_var!($redirect_url), params.platform.as_str()).expect("Redirect URL should always be valid.");

                let token = client
                    .0
                    .exchange_code(AuthorizationCode::new(auth_code))
                    .set_pkce_verifier(PkceCodeVerifier::new(pkce_verifier))
                    .set_redirect_uri(Cow::Borrowed(&redirect_url))
                    .request_async(oauth2::reqwest::async_http_client)
                    .await?;

                let response = reqwest_client
                    .0
                    .get(load_env_var!($endpoint))
                    .bearer_auth(token.access_token().secret())
                    .send()
                    .await?
                    .json::<$user_info_type>()
                    .await?;

                let transaction = db_pool.begin().await?;

                let user = mbe_user::Entity::find()
                    .filter(mbe_user::Column::Email.eq(response.get_email()?))
                    .one(&transaction)
                    .await?;

                transaction.commit().await?;

                match user {
                    Some(user) => match params.platform {
                        Platform::Web => {
                            session.renew();
                            session.insert(SESSION_DATA_KEY, SessionData::new(user.id))?;

                            Ok(HttpResponse::SeeOther()
                                .insert_header((LOCATION, callback_url))
                                .finish())
                        },
                        Platform::Tauri => {
                            let temp_code = TemporaryVerificationCode::new()?;
                            Cmd::set_ex(temp_code.get_code(), user.id, TEMP_VERIFICATION_KEYS_CACHE_EXPIRY)
                                .query_async(&mut redis_cache)
                                .await?;

                            Ok(HttpResponse::Ok().body(temp_code.get_code_owned()))
                        }
                    },
                    None => Err(AuthCallbackError::UserNotFound),
                }
            } else {
                Err(AuthCallbackError::MissingStateOrAuthCode)?
            }
        }
    };
}

callback_route![
    #[get("/callback-google")]
    login_callback_google,
    OAuthClientGoogle,
    "GOOGLE_USER_INFO_ENDPOINT",
    "GOOGLE_REDIRECT_URL",
    UserInfo
];

callback_route![
    #[get("/callback-ms")]
    login_callback_microsoft,
    OAuthClientMicrosoft,
    "MICROSOFT_USER_INFO_ENDPOINT",
    "MICROSOFT_REDIRECT_URL",
    MicrosoftUserInfo
];

callback_route![
    #[get("/callback-gh")]
    login_callback_github,
    OAuthClientGithub,
    "GITHUB_USER_INFO_ENDPOINT",
    "GITHUB_REDIRECT_URL",
    UserInfo
];

callback_route![
    #[get("/callback-fb")]
    login_callback_facebook,
    OAuthClientFacebook,
    "FACEBOOK_USER_INFO_ENDPOINT",
    "FACEBOOK_REDIRECT_URL",
    UserInfo
];

#[get("/logout")]
pub async fn logout(session: Session) -> Result<HttpResponse, AuthError> {
    session.purge();
    Ok(HttpResponse::Ok().finish())
}

#[post("/manual-auth")]
async fn manual_auth(
    session: Session,
    temp: Json<TemporaryVerificationCode>,
    RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
) -> Result<HttpResponse, AuthError> {
    let id: Option<MbeUserId> = Cmd::get(temp.get_code())
        .query_async(&mut redis_cache)
        .await?;

    match Cmd::del(temp.get_code())
        .query_async::<_, i64>(&mut redis_cache)
        .await
    {
        Ok(num_keys_deleted) => {
            if num_keys_deleted == 0 {
                return Err(AuthError::InvalidTempCode);
            }
        }
        Err(e) => error!("Redis key deletion failed: {}", e),
    }

    match id {
        Some(id) => {
            session.renew();
            session.insert(SESSION_DATA_KEY, SessionData::new(id))?;
            Ok(HttpResponse::Ok().finish())
        }
        None => Err(AuthError::InvalidTempCode)?,
    }
}

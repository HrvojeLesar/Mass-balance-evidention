use std::{env, future::Future, pin::Pin};

use actix_web::{get, http::header::LOCATION, web::Query, FromRequest, HttpResponse};
use log::error;
use oauth2::{
    basic::BasicClient, AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken,
    PkceCodeChallenge, PkceCodeVerifier, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use redis::{aio::ConnectionLike, FromRedisValue};
use serde::Deserialize;

use crate::redis_csrf_cache::RedisConnectionManagerExt;

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

#[derive(Deserialize, Debug)]
struct GoogleUserInfo {
    picture: Option<String>,
    email: Option<String>,
    email_verified: Option<bool>,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
struct MicrosoftUserInfo {
    user_principal_name: Option<String>,
    mail: Option<String>,
}

#[derive(Deserialize, Debug)]
struct GithubUserInfo {
    email: Option<String>,
}

#[derive(Deserialize, Debug)]
struct FacebookUserInfo {
    email: Option<String>,
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

macro_rules! login_route {
    (
        $(#[$attr:meta])*
        $name:ident,
        $type:ty,
        $($scope:literal),+
        ) => {
        $(#[$attr])*
        pub async fn $name(
            RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
            client: $type,
        ) -> HttpResponse {
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
                .await
                .unwrap();

            HttpResponse::TemporaryRedirect()
                .insert_header((LOCATION, url.to_string()))
                .finish()
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

#[get("/callback-google")]
pub async fn login_callback_google(
    Query(params): Query<AuthCallbackParams>,
    RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
    OAuthClientGoogle(client): OAuthClientGoogle,
) -> String {
    if let (Some(csrf_state), Some(auth_code)) = (params.state, params.code) {
        let pkce_verifier_value = &redis_cache
            .req_packed_command(&redis::Cmd::get(&csrf_state))
            .await
            .unwrap();

        // pkce_verifier exists
        let pkce_verifier = if redis::Value::Nil.ne(pkce_verifier_value) {
            match redis_cache
                .req_packed_command(&redis::Cmd::del(csrf_state))
                .await
            {
                Ok(_o) => (),
                Err(e) => {
                    error!("Redis key deletion failed: {}", e);
                }
            }

            Some(String::from_redis_value(pkce_verifier_value).unwrap())
        } else {
            None
        };

        let pkce_verifier = match pkce_verifier {
            Some(pv) => pv,
            None => todo!("Redirect to login???"),
        };

        let token = client
            .exchange_code(AuthorizationCode::new(auth_code))
            .set_pkce_verifier(PkceCodeVerifier::new(pkce_verifier))
            .request_async(oauth2::reqwest::async_http_client)
            .await
            .unwrap();

        println!("Access token: {}", token.access_token().secret());

        let reqwest_client = reqwest::Client::new();

        let response = reqwest_client
            .get(GOOGLE_USER_INFO_ENDPOINT)
            .bearer_auth(token.access_token().secret())
            .send()
            .await
            .unwrap()
            .json::<GoogleUserInfo>()
            .await
            .unwrap();

        println!("Response: {:#?}", response);
        return format!("{:#?}", response).into();

        // TODO: check db for retrieved email
        // if valid grant entry
    }
    todo!()
}

#[get("/callback-ms")]
pub async fn login_callback_microsoft(
    Query(params): Query<AuthCallbackParams>,
    RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
    OAuthClientMicrosoft(client): OAuthClientMicrosoft,
) -> String {
    if let (Some(csrf_state), Some(auth_code)) = (params.state, params.code) {
        let pkce_verifier_value = &redis_cache
            .req_packed_command(&redis::Cmd::get(&csrf_state))
            .await
            .unwrap();

        // pkce_verifier exists
        let pkce_verifier = if redis::Value::Nil.ne(pkce_verifier_value) {
            match redis_cache
                .req_packed_command(&redis::Cmd::del(csrf_state))
                .await
            {
                Ok(_o) => (),
                Err(e) => {
                    error!("Redis key deletion failed: {}", e);
                }
            }

            Some(String::from_redis_value(pkce_verifier_value).unwrap())
        } else {
            None
        };

        let pkce_verifier = match pkce_verifier {
            Some(pv) => pv,
            None => todo!("Redirect to login???"),
        };

        let token = client
            .exchange_code(AuthorizationCode::new(auth_code))
            .set_pkce_verifier(PkceCodeVerifier::new(pkce_verifier))
            .request_async(oauth2::reqwest::async_http_client)
            .await
            .unwrap();

        println!("Access token: {}", token.access_token().secret());

        let reqwest_client = reqwest::Client::new();

        let response = reqwest_client
            .get(MICROSOFT_USER_INFO_ENDPOINT)
            .bearer_auth(token.access_token().secret())
            .send()
            .await
            .unwrap()
            .json::<MicrosoftUserInfo>()
            .await
            .unwrap();

        println!("Response: {:#?}", response);
        return format!("{:#?}", response).into();
    }
    todo!()
}

#[get("/callback-gh")]
pub async fn login_callback_github(
    Query(params): Query<AuthCallbackParams>,
    RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
    OAuthClientGithub(client): OAuthClientGithub,
) -> String {
    if let (Some(csrf_state), Some(auth_code)) = (params.state, params.code) {
        let pkce_verifier_value = &redis_cache
            .req_packed_command(&redis::Cmd::get(&csrf_state))
            .await
            .unwrap();

        // pkce_verifier exists
        let pkce_verifier = if redis::Value::Nil.ne(pkce_verifier_value) {
            match redis_cache
                .req_packed_command(&redis::Cmd::del(csrf_state))
                .await
            {
                Ok(_o) => (),
                Err(e) => {
                    error!("Redis key deletion failed: {}", e);
                }
            }

            Some(String::from_redis_value(pkce_verifier_value).unwrap())
        } else {
            None
        };

        let pkce_verifier = match pkce_verifier {
            Some(pv) => pv,
            None => todo!("Redirect to login???"),
        };

        let token = client
            .exchange_code(AuthorizationCode::new(auth_code))
            .set_pkce_verifier(PkceCodeVerifier::new(pkce_verifier))
            .request_async(oauth2::reqwest::async_http_client)
            .await
            .unwrap();

        println!("Access token: {}", token.access_token().secret());

        let reqwest_client = reqwest::Client::builder()
            .user_agent("MBE")
            .build()
            .unwrap();

        let response = reqwest_client
            .get(GITHUB_USER_INFO_ENDPOINT)
            .bearer_auth(token.access_token().secret())
            .send()
            .await
            .unwrap()
            .json::<GithubUserInfo>()
            .await
            .unwrap();

        println!("Response: {:#?}", response);
        return format!("{:#?}", response).into();
    }
    todo!()
}

#[get("/callback-fb")]
pub async fn login_callback_facebook(
    Query(params): Query<AuthCallbackParams>,
    RedisConnectionManagerExt(mut redis_cache): RedisConnectionManagerExt,
    OAuthClientFacebook(client): OAuthClientFacebook,
) -> String {
    if let (Some(csrf_state), Some(auth_code)) = (params.state, params.code) {
        let pkce_verifier_value = &redis_cache
            .req_packed_command(&redis::Cmd::get(&csrf_state))
            .await
            .unwrap();

        // pkce_verifier exists
        let pkce_verifier = if redis::Value::Nil.ne(pkce_verifier_value) {
            match redis_cache
                .req_packed_command(&redis::Cmd::del(csrf_state))
                .await
            {
                Ok(_o) => (),
                Err(e) => {
                    error!("Redis key deletion failed: {}", e);
                }
            }

            Some(String::from_redis_value(pkce_verifier_value).unwrap())
        } else {
            None
        };

        let pkce_verifier = match pkce_verifier {
            Some(pv) => pv,
            None => todo!("Redirect to login???"),
        };

        let token = client
            .exchange_code(AuthorizationCode::new(auth_code))
            .set_pkce_verifier(PkceCodeVerifier::new(pkce_verifier))
            .request_async(oauth2::reqwest::async_http_client)
            .await
            .unwrap();

        println!("Access token: {}", token.access_token().secret());

        let reqwest_client = reqwest::Client::new();

        let response = reqwest_client
            .get(FACEBOOK_USER_INFO_ENDPOINT)
            .bearer_auth(token.access_token().secret())
            .send()
            .await
            .unwrap()
            .json::<FacebookUserInfo>()
            .await
            .unwrap();

        println!("Response: {:#?}", response);
        return format!("{:#?}", response).into();
    }
    todo!()
}

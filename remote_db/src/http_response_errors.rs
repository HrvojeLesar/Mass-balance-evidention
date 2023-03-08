use actix_web::{HttpResponse, ResponseError};
use log::error;
use oauth2::{basic::BasicErrorResponseType, RequestTokenError, StandardErrorResponse};
use redis::RedisError;
use reqwest::StatusCode;
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AuthError {
    #[error(transparent)]
    RedisError(#[from] RedisError),

    #[error(transparent)]
    RequestTokenError(
        #[from]
        RequestTokenError<
            oauth2::reqwest::Error<reqwest::Error>,
            StandardErrorResponse<BasicErrorResponseType>,
        >,
    ),
    #[error(transparent)]
    ReqwestError(#[from] reqwest::Error),
    #[error(transparent)]
    SeaOrmDbError(#[from] sea_orm::DbErr),
    #[error(transparent)]
    SessionInsertError(#[from] actix_session::SessionInsertError),
    #[error(transparent)]
    SessionGetError(#[from] actix_session::SessionGetError),
    #[error("Invalid pkce verifier")]
    InvalidPkceVerifier,
    #[error("Missing state or auth code")]
    MissingStateOrAuthCode,
    #[error("Missing email in response")]
    MissingEmailInResponse,
    #[error("User with supplied email not found.")]
    UserNotFound,
    #[error("Unauthorized access.")]
    Unauthorized,
}

#[derive(Serialize, Debug)]
pub struct OAuthErrorResponse<'a> {
    error: &'a str,
}

impl ResponseError for AuthError {
    fn status_code(&self) -> StatusCode {
        match self {
            AuthError::InvalidPkceVerifier => StatusCode::BAD_REQUEST,
            AuthError::MissingStateOrAuthCode => StatusCode::BAD_REQUEST,
            AuthError::UserNotFound => StatusCode::BAD_REQUEST,
            AuthError::SessionGetError(..) | AuthError::Unauthorized => StatusCode::UNAUTHORIZED,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
    fn error_response(&self) -> HttpResponse {
        error!("{:#?}", self);
        HttpResponse::build(self.status_code()).json(OAuthErrorResponse {
            error: match self {
                AuthError::RedisError(..) | AuthError::SessionInsertError(..) => {
                    "Login service is down."
                }
                AuthError::RequestTokenError(..) => "Token exchange failed.",
                AuthError::ReqwestError(..) => "Reqwest error.",
                AuthError::SeaOrmDbError(..) => "Db error.",
                AuthError::SessionGetError(..) | AuthError::Unauthorized => "Unauthorized.",
                AuthError::InvalidPkceVerifier
                | AuthError::MissingStateOrAuthCode
                | AuthError::UserNotFound => "Bad request.",
                AuthError::MissingEmailInResponse => {
                    "Login service didn't return an e-mail address."
                }
            },
        })
    }
}

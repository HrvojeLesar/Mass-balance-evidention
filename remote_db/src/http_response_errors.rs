use std::env;

use actix_web::{http::header, HttpResponse, ResponseError};
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
    #[error("InvalidSession")]
    InvalidSession,
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
            AuthError::InvalidSession => StatusCode::BAD_REQUEST,
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
                | AuthError::UserNotFound
                | AuthError::InvalidSession => "Bad request.",
                AuthError::MissingEmailInResponse => {
                    "Login service didn't return an e-mail address."
                }
            },
        })
    }
}

#[derive(Error, Debug)]
pub enum AuthCallbackError {
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
    #[error("Invalid pkce verifier")]
    InvalidPkceVerifier,
    #[error("Missing state or auth code")]
    MissingStateOrAuthCode,
    #[error("Missing email in response")]
    MissingEmailInResponse,
    #[error("User with supplied email not found.")]
    UserNotFound,
}

impl ResponseError for AuthCallbackError {
    fn status_code(&self) -> StatusCode {
        StatusCode::TEMPORARY_REDIRECT
    }
    fn error_response(&self) -> HttpResponse {
        error!("{:#?}", self);
        HttpResponse::build(self.status_code())
            .insert_header((
                header::LOCATION,
                format!(
                    // TODO: change to env variable
                    "{}?error={}",
                    env::var("CALLBACK_URL")
                        .expect("CALLBACK_URL env variable to have been checked"),
                    match self {
                        AuthCallbackError::RedisError(..)
                        | AuthCallbackError::RequestTokenError(..)
                        | AuthCallbackError::ReqwestError(..)
                        | AuthCallbackError::SeaOrmDbError(..)
                        | AuthCallbackError::SessionInsertError(..) => "login_service_down",
                        AuthCallbackError::InvalidPkceVerifier => "invalid_pkce_verifier",
                        AuthCallbackError::MissingStateOrAuthCode
                        | AuthCallbackError::MissingEmailInResponse => "bad_request",
                        AuthCallbackError::UserNotFound => "user_not_found",
                    }
                ),
            ))
            .finish()
    }
}

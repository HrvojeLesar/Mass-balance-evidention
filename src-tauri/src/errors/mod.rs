use serde::Serialize;
use thiserror::Error;

pub type Result<T> = std::result::Result<T, MBEError>;

#[derive(Error, Debug)]
pub enum MBEError {
    #[error(transparent)]
    TauriError(#[from] tauri::Error),
    #[error(transparent)]
    IoError(#[from] std::io::Error),
    #[error(transparent)]
    SerdeJsonError(#[from] serde_json::Error),
    #[error(transparent)]
    SqlxError(#[from] sqlx::Error),
    #[error(transparent)]
    ReqwestError(#[from] reqwest::Error),
    #[error("{0}")]
    Other(String),
}

impl MBEError {
    pub fn other(err: &str) -> Self {
        Self::Other(err.to_string())
    }
}

impl Serialize for MBEError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            MBEError::TauriError(e) => serializer.serialize_str(&e.to_string()),
            MBEError::IoError(e) => serializer.serialize_str(&e.to_string()),
            MBEError::SerdeJsonError(e) => serializer.serialize_str(&e.to_string()),
            MBEError::SqlxError(e) => serializer.serialize_str(&e.to_string()),
            MBEError::ReqwestError(e) => serializer.serialize_str(&e.to_string()),
            MBEError::Other(e) => serializer.serialize_str(e),
        }
    }
}

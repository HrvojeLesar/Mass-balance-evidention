use std::{env, future::Future, pin::Pin};

use actix_web::FromRequest;
use redis::aio::ConnectionManager;

#[derive(Clone)]
pub struct RedisConnectionManagerExt(pub ConnectionManager);

fn create_redis_client() -> redis::Client {
    let connection_string =
        env::var("REDIS_CONNECTION").expect("REDIS_CONNECTION env variable to be present");
    redis::Client::open(connection_string).expect("Available redis database")
}

pub async fn create_redis_connection_manager() -> RedisConnectionManagerExt {
    let client = create_redis_client();
    RedisConnectionManagerExt(
        ConnectionManager::new(client)
            .await
            .expect("Working redis connection manager"),
    )
}

impl FromRequest for RedisConnectionManagerExt {
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
                .expect("An existing RedisConnectionManager"))
        })
    }
}

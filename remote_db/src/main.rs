use std::env;

use actix_session::{
    config::{PersistentSession, TtlExtensionPolicy},
    storage::RedisSessionStore,
    Session, SessionMiddleware,
};
use anyhow::Result;

use actix_cors::Cors;
use actix_web::{
    cookie::Key,
    get,
    middleware::Logger,
    post,
    web::{self, Data},
    App, HttpResponse, HttpServer,
};
use async_graphql::{http::GraphiQLSource, EmptySubscription, Schema};
use async_graphql_actix_web::{GraphQLRequest, GraphQLResponse};
use auth::{
    login_callback_facebook, login_callback_github, login_callback_google,
    login_callback_microsoft, login_facebook, login_github, login_google, login_microsoft,
    OAuthClientFacebook, OAuthClientGithub, OAuthClientGoogle, OAuthClientMicrosoft,
};
use dotenvy::dotenv;
use http_response_errors::AuthError;

use redis_csrf_cache::create_redis_connection_manager;
use sea_orm::{ConnectOptions, DatabaseConnection};
use seaorm_models::graphql_schema::{MutationRoot, QueryRoot};

use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

use crate::auth::{SessionData, SESSION_DATA_KEY};

// mod models;
mod auth;
mod http_response_errors;
mod redis_csrf_cache;
mod seaorm_models;
mod user_models;

pub type DatabasePool = Data<Pool<Postgres>>;
pub type GQLSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;
pub type SeaOrmPool = Data<DatabaseConnection>;

const MONTH: i64 = 60 * 60 * 24 * 30;

#[get("/graphiql")]
async fn graphql_playground(_session: Session) -> actix_web::Result<HttpResponse> {
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(GraphiQLSource::build().endpoint("/graphiql").finish()))
}

#[post("/graphiql")]
async fn index(schema: web::Data<GQLSchema>, req: GraphQLRequest) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}

#[get("/schema")]
async fn get_schema(schema: web::Data<GQLSchema>, session: Session) -> Result<String, AuthError> {
    let d = session
        .get::<SessionData>(SESSION_DATA_KEY)?
        .ok_or(AuthError::Unauthorized)?;

    if d.authorized {
        Ok(schema.sdl())
    } else {
        Err(AuthError::Unauthorized)
    }
}

#[cfg(debug_assertions)]
fn build_schema(pool: Data<Pool<Postgres>>, sea_orm_pool: SeaOrmPool) -> GQLSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        EmptySubscription,
    )
    .data(pool)
    .data(sea_orm_pool)
    .extension(async_graphql::extensions::Logger)
    .finish()
}

#[cfg(not(debug_assertions))]
fn build_schema(pool: Data<Pool<Postgres>>) -> GQLSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        EmptySubscription,
    )
    .data(pool)
    .data(sea_orm_pool)
    .extension(async_graphql::extensions::Logger)
    .disable_introspection()
    .finish()
}

macro_rules! oauth_client_env_check {
    ($name:literal) => {
        env::var(concat!("OAUTH_CLIENT_ID_", $name)).expect(concat!(
            "OAUTH_CLIENT_ID_",
            $name,
            "env variable to be present"
        ));
        env::var(concat!("OAUTH_CLIENT_SECRET_", $name)).expect(concat!(
            "OAUTH_CLIENT_SECRET_",
            $name,
            "env variable to be present"
        ));
    };
}

fn check_env_variables() {
    env::var("REDIS_CONNECTION").expect("REDIS_CONNECTION env variable to be present");
    env::var("DATABASE_URL").expect("DATABASE_URL env variable to be present");
    env::var("SESSION_SECRET_KEY").expect("SESSION_SECRET_KEY env variable to be present");
    oauth_client_env_check!("GOOGLE");
    oauth_client_env_check!("MICROSOFT");
    oauth_client_env_check!("GITHUB");
    oauth_client_env_check!("FACEBOOK");
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    check_env_variables();

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // TODO: remove this
    let pool = Data::new(
        PgPoolOptions::new()
            .max_connections(5)
            .connect(&env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
            .await
            .unwrap(),
    );

    let mut seaorm_connection_options =
        ConnectOptions::new(env::var("DATABASE_URL").expect("DATABASE_URL must be set"));
    seaorm_connection_options.max_connections(5);

    let sea_orm_pool = Data::new(
        sea_orm::Database::connect(seaorm_connection_options)
            .await
            .expect("Database connection"),
    );

    let schema = build_schema(pool.clone(), sea_orm_pool.clone());

    let redis_csrf_cache = create_redis_connection_manager().await;

    let oauth_client_google = OAuthClientGoogle::new();
    let oauth_client_microsoft = OAuthClientMicrosoft::new();
    let oauth_client_github = OAuthClientGithub::new();
    let oauth_client_facebook = OAuthClientFacebook::new();

    let session_secret_key = Key::from(
        env::var("SESSION_SECRET_KEY")
            .expect("Existing key")
            .as_bytes(),
    );
    let redis_connection_string =
        env::var("REDIS_CONNECTION").expect("REDIS_CONNECTION env variable to be present");
    let session_store = RedisSessionStore::new(&redis_connection_string)
        .await
        .expect("Valid redis connection");

    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_header()
                    .allow_any_method()
                    .max_age(3600)
                    .send_wildcard(),
            )
            .wrap(
                SessionMiddleware::builder(session_store.clone(), session_secret_key.clone())
                    .session_lifecycle(
                        PersistentSession::default()
                            .session_ttl_extension_policy(TtlExtensionPolicy::OnStateChanges)
                            .session_ttl(actix_web::cookie::time::Duration::seconds(MONTH)),
                    )
                    .build(),
            )
            .wrap(Logger::default())
            .app_data(Data::new(schema.clone()))
            .app_data(sea_orm_pool.clone())
            .app_data(redis_csrf_cache.clone())
            .app_data(pool.clone())
            .app_data(oauth_client_google.clone())
            .app_data(oauth_client_microsoft.clone())
            .app_data(oauth_client_github.clone())
            .app_data(oauth_client_facebook.clone())
            .service(graphql_playground)
            .service(index)
            .service(get_schema)
            .service(login_google)
            .service(login_callback_google)
            .service(login_microsoft)
            .service(login_callback_microsoft)
            .service(login_github)
            .service(login_callback_github)
            .service(login_facebook)
            .service(login_callback_facebook)
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await
}

use std::env;

use anyhow::Result;

use actix_cors::Cors;
use actix_web::{
    get,
    http::header::LOCATION,
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
use oauth2::{
    basic::BasicClient, AuthUrl, ClientId, ClientSecret, CsrfToken, PkceCodeChallenge, RedirectUrl,
    Scope, TokenUrl,
};
use redis::aio::{ConnectionLike, ConnectionManager};
use redis_csrf_cache::{create_redis_connection_manager, RedisConnectionManagerExt};
use sea_orm::{ConnectOptions, DatabaseConnection};
use seaorm_models::graphql_schema::{MutationRoot, QueryRoot};
use serde::Deserialize;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

// mod models;
mod auth;
mod redis_csrf_cache;
mod seaorm_models;

pub type DatabasePool = Data<Pool<Postgres>>;
pub type GQLSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;
pub type SeaOrmPool = Data<DatabaseConnection>;

#[get("/graphiql")]
async fn graphql_playground() -> actix_web::Result<HttpResponse> {
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(GraphiQLSource::build().endpoint("/graphiql").finish()))
}

#[post("/graphiql")]
async fn index(schema: web::Data<GQLSchema>, req: GraphQLRequest) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
}

#[get("/schema")]
async fn get_schema(schema: web::Data<GQLSchema>) -> String {
    schema.sdl()
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
    .extension(async_graphql::extensions::Logger)
    .disable_introspection()
    .finish()
}

fn check_env_variables() {
    env::var("REDIS_CONNECTION").expect("REDIS_CONNECTION env variable to be present");
    env::var("DATABASE_URL").expect("DATABASE_URL env variable to be present");
    env::var("OAUTH_CLIENT_ID_GOOGLE").expect("OAUTH_CLIENT_ID_GOOGLE env variable to be present");
    env::var("OAUTH_CLIENT_SECRET_GOOGLE")
        .expect("OAUTH_CLIENT_SECRET_GOOGLE env variable to be present");
    env::var("OAUTH_CLIENT_ID_MICROSOFT")
        .expect("OAUTH_CLIENT_ID_MICROSOFT env variable to be present");
    env::var("OAUTH_CLIENT_SECRET_MICROSOFT")
        .expect("OAUTH_CLIENT_SECRET_MICROSOFT env variable to be present");
    env::var("OAUTH_CLIENT_ID_GITHUB").expect("OAUTH_CLIENT_ID_GITHUB env variable to be present");
    env::var("OAUTH_CLIENT_SECRET_GITHUB")
        .expect("OAUTH_CLIENT_SECRET_GITHUB env variable to be present");
    env::var("OAUTH_CLIENT_ID_FACEBOOK")
        .expect("OAUTH_CLIENT_ID_FACEBOOK env variable to be present");
    env::var("OAUTH_CLIENT_SECRET_FACEBOOK")
        .expect("OAUTH_CLIENT_SECRET_FACEBOOK env variable to be present");
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    check_env_variables();

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

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
            .unwrap(),
    );

    let schema = build_schema(pool.clone(), sea_orm_pool);

    let redis_csrf_cache = create_redis_connection_manager().await;

    let oauth_client_google = OAuthClientGoogle::new();
    let oauth_client_microsoft = OAuthClientMicrosoft::new();
    let oauth_client_github = OAuthClientGithub::new();
    let oauth_client_facebook = OAuthClientFacebook::new();

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_header()
                    .allow_any_method()
                    .max_age(3600)
                    .send_wildcard(),
            )
            .app_data(Data::new(schema.clone()))
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

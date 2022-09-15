use std::{env, fs};

use actix_cors::Cors;
use actix_web::{
    get,
    middleware::Logger,
    post,
    web::{self, Data},
    App, HttpResponse, HttpServer,
};
use async_graphql::{http::GraphiQLSource, EmptySubscription, Schema};
use async_graphql_actix_web::{GraphQLRequest, GraphQLResponse};
use dotenvy::dotenv;
use models::{MutationRoot, QueryRoot};
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

mod models;

pub type DatabasePool = Data<Pool<Postgres>>;
pub type GQLSchema = Schema<QueryRoot, MutationRoot, EmptySubscription>;

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
fn build_schema(pool: Data<Pool<Postgres>>) -> GQLSchema {
    Schema::build(
        QueryRoot::default(),
        MutationRoot::default(),
        EmptySubscription,
    )
    .data(pool)
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let pool = Data::new(
        PgPoolOptions::new()
            .max_connections(5)
            .connect(&env::var("DATABASE_URL").expect("DATABASE_URL must be set"))
            .await
            .unwrap(),
    );

    let schema = build_schema(pool.clone());

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
            .app_data(pool.clone())
            .service(graphql_playground)
            .service(index)
            .service(get_schema)
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await
}

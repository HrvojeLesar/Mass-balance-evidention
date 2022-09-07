use std::env;

use actix_web::{
    get,
    middleware::Logger,
    post,
    web::{self, Data},
    App, HttpResponse, HttpServer,
};
use async_graphql::{http::GraphiQLSource, EmptyMutation, EmptySubscription, Schema};
use async_graphql_actix_web::{GraphQLRequest, GraphQLResponse};
use dotenvy::dotenv;
use models::QueryRoot;
use sqlx::postgres::PgPoolOptions;

mod models;

#[get("/graphiql")]
async fn graphql_playground() -> actix_web::Result<HttpResponse> {
    Ok(HttpResponse::Ok()
        .content_type("text/html; charset=utf-8")
        .body(GraphiQLSource::build().endpoint("/graphiql").finish()))
}

#[post("/graphiql")]
async fn index(
    schema: web::Data<Schema<QueryRoot, EmptyMutation, EmptySubscription>>,
    req: GraphQLRequest,
) -> GraphQLResponse {
    schema.execute(req.into_inner()).await.into()
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

    let schema = Data::new(
        Schema::build(QueryRoot, EmptyMutation, EmptySubscription)
            .data(pool.clone())
            .finish(),
    );
    return HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .app_data(schema.clone())
            .app_data(pool.clone())
            .service(graphql_playground)
            .service(index)
    })
    .bind("127.0.0.1:8000")?
    .run()
    .await;
}

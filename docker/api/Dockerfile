FROM rust:1

RUN mkdir -p /app

WORKDIR /app

COPY remote_db .
COPY docker/api/startup.sh .

RUN chmod +x ./startup.sh
RUN cargo install sqlx-cli
RUN cargo build --release

RUN cp /app/target/release/remote_db /app

CMD [ "/app/startup.sh" ]

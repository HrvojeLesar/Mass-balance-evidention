FROM postgres:14

RUN mkdir -p /var/lib/postgresql/data/backups
RUN mkdir -p /app

COPY docker/cron/pg_backup.config /app
COPY docker/cron/pg_backup_rotated.sh /app
RUN chmod +x /app/pg_backup_rotated.sh

COPY docker/cron/rclone_sync.sh /app
RUN chmod +x /app/rclone_sync.sh

COPY docker/cron/jobs /app

RUN apt-get update
RUN apt-get install -y rclone curl

# Latest releases available at https://github.com/aptible/supercronic/releases
ENV SUPERCRONIC_URL=https://github.com/aptible/supercronic/releases/download/v0.2.26/supercronic-linux-amd64 \
    SUPERCRONIC=supercronic-linux-amd64 \
    SUPERCRONIC_SHA1SUM=7a79496cf8ad899b99a719355d4db27422396735

RUN curl -fsSLO "$SUPERCRONIC_URL" \
    && echo "${SUPERCRONIC_SHA1SUM}  ${SUPERCRONIC}" | sha1sum -c - \
    && chmod +x "$SUPERCRONIC" \
    && mv "$SUPERCRONIC" "/usr/local/bin/${SUPERCRONIC}" \
    && ln -s "/usr/local/bin/${SUPERCRONIC}" /usr/local/bin/supercronic

RUN mkdir -p /root/.config/rclone
COPY docker/cron/rclone.conf /root/.config/rclone

CMD [ "supercronic", "/app/jobs"]

FROM postgres:14

RUN mkdir -p /var/lib/postgresql/data/backups
RUN mkdir -p /app

COPY docker/cron/pg_backup.config /app
COPY docker/cron/pg_backup_rotated.sh /app
RUN chmod +x /app/pg_backup_rotated.sh

COPY docker/cron/rclone_sync.sh /app
RUN chmod +x /app/rclone_sync.sh

RUN apt-get update
RUN apt-get install -y rclone cron

RUN mkdir -p /root/.config/rclone
COPY docker/cron/rclone.conf /root/.config/rclone

RUN (crontab -l 2>/dev/null; echo "0 3 * * 1,3,5,0 /app/pg_backup_rotated.sh") | crontab -
RUN (crontab -l 2>/dev/null; echo "0 1 * * * /app/rclone_sync.sh") | crontab -

CMD [ "cron", "-f" ]

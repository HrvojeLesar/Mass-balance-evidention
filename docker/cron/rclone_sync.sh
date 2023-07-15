#!/bin/bash

if pidof -o %PPID -x "rclone_sync.sh"; then
    exit 1
fi
rclone sync /var/lib/postgresql/data/backups google_drive:mbe_backups
exit

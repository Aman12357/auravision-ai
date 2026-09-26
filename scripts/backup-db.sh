#!/bin/bash
set -euo pipefail

BACKUP_DIR="/tmp/db-backups"
DATE=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="aura_db_backup_$DATE.sql.gz"
S3_BUCKET="s3://aura-backups/db/$(date +%Y-%m-%d)/"

mkdir -p $BACKUP_DIR

echo "Starting database backup..."
pg_dump -U $DB_USERNAME -h $DB_HOST -p $DB_PORT -F c -b -v -f $BACKUP_DIR/$FILENAME $DB_NAME

echo "Uploading to S3..."
aws s3 cp $BACKUP_DIR/$FILENAME $S3_BUCKET

echo "Cleaning up local files..."
rm -f $BACKUP_DIR/$FILENAME

echo "Backup complete!"

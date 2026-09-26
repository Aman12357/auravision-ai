# Database Documentation

## Entity-Relationship Diagram

```
[users]
id (UUID, PK)
email (VARCHAR, UK)
password_hash (VARCHAR)
credits (DECIMAL)
tier (VARCHAR)
created_at (TIMESTAMP)

[projects]
id (UUID, PK)
user_id (UUID, FK -> users.id)
name (VARCHAR)
created_at (TIMESTAMP)

[videos]
id (UUID, PK)
project_id (UUID, FK -> projects.id)
user_id (UUID, FK -> users.id)
prompt (TEXT)
provider (VARCHAR)
status (VARCHAR)
url (VARCHAR)
cost (DECIMAL)
created_at (TIMESTAMP)

[transactions]
id (UUID, PK)
user_id (UUID, FK -> users.id)
amount (DECIMAL)
credits_added (DECIMAL)
status (VARCHAR)
created_at (TIMESTAMP)
```

## Table Descriptions
- `users`: Core user account information and credit balance.
- `projects`: Folders/groupings for generated videos.
- `videos`: Represents a single video generation job and its result.
- `transactions`: Log of credit purchases/deductions for billing.

## Index Strategy
- `users.email`: UNIQUE index for fast login.
- `videos.user_id`: For fetching a user's video history.
- `videos.status`: For querying pending/failed jobs.
- `transactions.user_id`: For billing history.

## Migration Strategy
We use **Flyway** for database migrations. Migrations are stored in `backend/src/main/resources/db/migration`.
Naming convention: `V{version}__{description}.sql` (e.g., `V1__init_schema.sql`).

## Backup Strategy
- Daily full logical backups (pg_dump) to S3.
- WAL archiving enabled for Point-in-Time Recovery (PITR).

## Performance Optimization
- Soft deletes used sparingly to avoid bloating tables.
- Historical data (e.g., old transactions, failed video jobs) can be archived to a data warehouse or cold storage after 1 year.

# Welcome to Umile API

## Requirements:
PostgresDB, pgAdmin4, npm + NodeJS 

## Things to do before use:
1. Create `umile` database in Postgres
2. Create tables if not already. Run `create.sql` file in client (pgAdmin4)
3. Run `npm install`
4. Create `.env` file with the following structure:

```
NODE_ENV=development

PORT=8080

DB_NAME='umile'
DB_HOST='127.0.0.1'
DB_SCHEMA='public'
DB_USER=''
DB_PASS=''

JWT_SECRET=secret

SENDGRID_API_KEY=YOUR_API_KEY

```

## Running tests
1. Create `umile_test` database in Postgres
2. Create `test.env` file with same instructions and development environment but with following changes
3. Select configuration to run from launch configs

```
DB_NAME='umile_test'
```

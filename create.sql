-- Clean up database

DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS auth;
DROP TABLE IF EXISTS clients;

-- Create tables

CREATE TABLE admins (
    email       TEXT    NOT NULL PRIMARY KEY,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    pwd_hash    TEXT    NOT NULL
);

CREATE TABLE auth (
    token_id       TEXT  PRIMARY KEY
);

CREATE TABLE clients (
    email           TEXT    NOT NULL PRIMARY KEY,
    first_name      TEXT    NOT NULL,
    last_name       TEXT    NOT NULL,
    phone           TEXT    NOT NULL,
    company_name    TEXT,
    pwd_hash        TEXT    NOT NULL
);
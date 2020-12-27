CREATE TABLE admins (
    id          SERIAL  PRIMARY KEY,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    pwd_hash    TEXT    NOT NULL
);

CREATE TABLE auth (
    token_id       TEXT  PRIMARY KEY
);

CREATE TABLE clients (
    id          SERIAL  PRIMARY KEY,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    pwd_hash    TEXT    NOT NULL
);
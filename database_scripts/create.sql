-- Clean up database

DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS auth;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS places;
DROP TABLE IF EXISTS actions;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS nodes;
DROP TABLE IF EXISTS routes;
DROP TABLE IF EXISTS route_nodes;

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
    id          SERIAL   PRIMARY KEY,
    email           TEXT    NOT NULL UNIQUE,
    first_name      TEXT    NOT NULL,
    last_name       TEXT    NOT NULL,
    phone           TEXT    NOT NULL,
    company_name    TEXT,
    pwd_hash        TEXT    NOT NULL
);

CREATE TABLE cities (
    id          SERIAL      PRIMARY KEY,
    name        TEXT        NOT NULL,
    geom        GEOMETRY    NOT NULL,
    country     TEXT        NOT NULL
);

CREATE TABLE places (
    id          SERIAL      PRIMARY KEY,
    provider_id TEXT        NOT NULL    UNIQUE,
    address     TEXT        NOT NULL,
    geom        GEOMETRY    NOT NULL,
    details     TEXT,
    type        TEXT        NOT NULL    DEFAULT 'generic',
    viscosity   REAL        NOT NULL    DEFAULT 3.5
);

CREATE TABLE actions (
    id		    SERIAL  PRIMARY KEY,
    short_name  TEXT    NOT NULL,
    name        TEXT	NOT NULL
);

CREATE TABLE orders (
    id          SERIAL      PRIMARY KEY,
    client_id   INTEGER     NOT NULL    REFERENCES clients(id),
    city_id     INTEGER     NOT NULL    REFERENCES cities(id)
);

CREATE TABLE nodes (
    id          SERIAL      PRIMARY KEY,
    order_id    INTEGER     NOT NULL    REFERENCES orders(id)   ON DELETE CASCADE,
    action_id   INTEGER     NOT NULL    REFERENCES actions(id),
    place_id    INTEGER     NOT NULL    REFERENCES places(id),
    note        TEXT
);

CREATE TABLE routes (
    id              SERIAL      PRIMARY KEY,
    isfull          BOOLEAN     NOT NULL    DEFAULT FALSE,
    distance        REAL        NOT NULL    DEFAULT 0,
    duration        REAL        NOT NULL    DEFAULT 0
);

CREATE TABLE route_nodes (
    id          SERIAL      PRIMARY KEY,
    route_id    INTEGER     NOT NULL    REFERENCES routes(id)   ON DELETE CASCADE,
    node        INTEGER     NOT NULL    REFERENCES nodes(id)    ON DELETE CASCADE,
    seq         INTEGER     NOT NULL
);
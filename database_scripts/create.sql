-- Clean up database

DROP TABLE IF EXISTS contactus_messages CASCADE;
DROP TABLE IF EXISTS tariffs CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS auth CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS cities CASCADE;
DROP TABLE IF EXISTS places CASCADE;
DROP TABLE IF EXISTS distance_matrix CASCADE;
DROP TABLE IF EXISTS actions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS order_status CASCADE;
DROP TABLE IF EXISTS order_status_log CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;
DROP TABLE IF EXISTS routes CASCADE;
DROP TABLE IF EXISTS route_nodes CASCADE;

-- Setup PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create tables

CREATE TABLE contactus_messages (
    id          SERIAL   PRIMARY KEY,
    email       TEXT    NOT NULL,
    name        TEXT    NOT NULL,
    message     TEXT    NOT NULL
);

CREATE TABLE tariffs (
    id          SERIAL  PRIMARY KEY,
    range_min   INTEGER NOT NULL,
    range_max   INTEGER NOT NULL,
    cost        REAL    NOT NULL
);

CREATE TABLE admins (
    email       TEXT    NOT NULL PRIMARY KEY,
    first_name  TEXT    NOT NULL,
    last_name   TEXT    NOT NULL,
    pwd_hash    TEXT    NOT NULL
);

CREATE TABLE auth (
    token_id       TEXT  PRIMARY KEY
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

CREATE TABLE clients (
    id              SERIAL  PRIMARY KEY,
    email           TEXT    NOT NULL UNIQUE,
    first_name      TEXT    NOT NULL,
    last_name       TEXT    NOT NULL,
    phone           TEXT    NOT NULL,
    company_name    TEXT,
    pwd_hash        TEXT    NOT NULL,
    home_place_id   INTEGER REFERENCES places(id)  
);

CREATE TABLE cities (
    id          SERIAL      PRIMARY KEY,
    name        TEXT        NOT NULL,
    geom        GEOMETRY    NOT NULL,
    country     TEXT        NOT NULL
);

CREATE TABLE distance_matrix (
    id          SERIAL      PRIMARY KEY,
    from_place  INTEGER     NOT NULL    REFERENCES places(id),
    to_place    INTEGER     NOT NULL    REFERENCES places(id),
    distance    REAL        NOT NULL,
    duration    REAL        NOT NULL
);

CREATE TABLE actions (
    id		    SERIAL  PRIMARY KEY,
    short_name  TEXT    NOT NULL,
    name        TEXT	NOT NULL
);

CREATE TABLE orders (
    id              SERIAL      PRIMARY KEY,
    client_id       INTEGER     NOT NULL    REFERENCES clients(id)  ON DELETE CASCADE,
    city_id         INTEGER     NOT NULL    REFERENCES cities(id),
    received_date   TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_status (
    id          SERIAL      PRIMARY KEY,
    name        TEXT        NOT NULL,
    is_active   BOOLEAN     NOT NULL  --whether something will still happen to this order or its been archived (i.e. Dashboard vs Order History)
);

CREATE TABLE order_status_log (
    id          SERIAL                          PRIMARY KEY,
    order_id    INTEGER                         NOT NULL    REFERENCES orders(id)   ON DELETE CASCADE,
    status_id   INTEGER                         NOT NULL    REFERENCES order_status(id),
    timestamp   TIMESTAMP WITHOUT TIME ZONE     NOT NULL    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nodes (
    id              SERIAL      PRIMARY KEY,
    order_id        INTEGER     NOT NULL    REFERENCES orders(id)   ON DELETE CASCADE,
    action_id       INTEGER     NOT NULL    REFERENCES actions(id),
    place_id        INTEGER     NOT NULL    REFERENCES places(id),
    note            TEXT,
    customer_name   TEXT,
    customer_phone  TEXT
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
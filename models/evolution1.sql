-- This .sql file creates all the preliminary tables and initial database setup for the project.

-- creating the database
CREATE DATABASE "IE-database"
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

--creating the postgis extension
CREATE EXTENSION postgis
    SCHEMA public;

-- creating the pgrouting extension
CREATE EXTENSION pgrouting
    SCHEMA public;

-- creating the crash hotspot table
CREATE TABLE public."CrashHotspots"
(
    "objectId" integer NOT NULL,
    longitude double precision,
    latitude double precision,
    accident_time text COLLATE pg_catalog."default",
    lga_name text COLLATE pg_catalog."default",
    bicylist integer,
    geom_location geometry,
    CONSTRAINT "CrashHotspots_pkey" PRIMARY KEY ("objectId")
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."CrashHotspots"
    OWNER to postgres;


-- creating the the Cycle Park location
CREATE TABLE public."CycleParkLocation"
(
    gs_id integer NOT NULL,
    asset_type text COLLATE pg_catalog."default",
    latitude double precision,
    longitude double precision,
    geom_location geometry,
    CONSTRAINT "CycleParkLocation_pkey" PRIMARY KEY (gs_id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."CycleParkLocation"
    OWNER to postgres;


-- creating the Cycle Path table
CREATE TABLE public."CyclePath"
(
    id integer NOT NULL,
    geom_path geometry,
    type text COLLATE pg_catalog."default",
    direction text COLLATE pg_catalog."default",
    geom_data text COLLATE pg_catalog."default",
    source integer,
    target integer,
    distance double precision,
    CONSTRAINT "CyclePath_pkey" PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."CyclePath"
    OWNER to postgres;


-- creating the Toilet Location table
CREATE TABLE public."ToiletLocation"
(
    id integer NOT NULL,
    name text COLLATE pg_catalog."default",
    male text COLLATE pg_catalog."default",
    female text COLLATE pg_catalog."default",
    lon double precision,
    lat double precision,
    geom_location geometry,
    CONSTRAINT "ToiletLocation_pkey" PRIMARY KEY (id)
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE public."ToiletLocation"
    OWNER to postgres;
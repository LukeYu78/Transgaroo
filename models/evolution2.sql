-- this .sql evolution file needs to be run once the data has been migrated to the premliminary tables .

-- create a copy of the cycle path table and adding source and destination columns
CREATE TABLE public."CyclePath_copy" AS 
TABLE public."CyclePath";

ALTER TABLE public."CyclePath_copy"
ADD COLUMN source INTEGER;

ALTER TABLE public."CyclePath_copy"
ADD COLUMN target INTEGER;

ALTER TABLE public."CyclePath_copy"
ALTER COLUMN geom_path TYPE geometry(linestring,4326) USING ST_GeometryN(geom_path, 1);

ALTER TABLE public."CyclePath_copy"
RENAME geom_path TO the_geom;

-- create a node network of the cycle path table data using pgrouting
SELECT pgr_nodeNetwork(public."CyclePath_copy",0.001);

-- create network topology of the noded table 
SELECT pgr_createTopology('CyclePath_copy_noded',0.001);

-- add a distance column to the noded data table
ALTER TABLE public."CyclePath_copy_noded" ADD COLUMN distance double precision;

-- calculate the distance for each node to every other node in noded network
UPDATE public."CyclePath_copy_noded" SET distance = ST_Length(ST_Transform(the_geom,4326)::geography)/1000;

-- adding additional information columns to copy over data from cycle path table
alter table public."CyclePath_copy_noded" add geom_data text, add type text;

-- updating the newly added columns with appropriate data
update public."CyclePath_copy_noded" as new SET geom_data = old.geom_data, type=old.type from public."CyclePath" as old where new.old_id=old.id;

-- delete cycle path noded table where either source and target is null
Delete from public."CyclePath_copy_noded" where soure is null;
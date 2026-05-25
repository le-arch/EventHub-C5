-- users svhema migration
CREATE TABLE "users" (
  "id" VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::varchar(36),
  "email" VARCHAR(255) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT now()
);

-- event schema migration



--tickets schema migration


-- orders schema migration


--checkin logschema migration


--webhook log schema migration


--admin log schema migration


--create system log schema migration
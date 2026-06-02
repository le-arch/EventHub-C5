# start all services
start:
	docker compose up

# build images before starting containers
build:
	docker compose up --build

# stop and remove all containers,networks
down:
	docker compose down

# Remove named volumes declared in the "volumes" section of the Compose file and anonymous volumes attached to containers
clean:
	docker compose down -v 

# restarts all stopped and running services. use only if services stopped unexpectedly or after a crash
restart:
	docker compose restart && docker compose up

# stop and remove all containers,networks, and volumes, then rebuild and start the services. use only if changes are made to the migration files, compose file, dockerfile or to the database configuration in the .env file
reset:
	docker compose down -v && docker compose up --

#must be in the backend directory to run this command
#tidy package dependencies for the backend
tidy:
	go mod tidy

#must be in the backend directory to run this command
sqlc:
	cd internal/db && sqlc generate
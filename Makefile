# Helper to clear out any conflicting container names before spinning up
# The '-' at the start tells Make to keep going even if the containers don't exist
clear-conflicts:
	-@docker rm -f eventhub-frontend go-api postgres-db minio ngrok prometheus grafana 2>/dev/null || true

# start all services
start: clear-conflicts
	docker compose up

# build images before starting containers
build: clear-conflicts
	docker compose up --build

# stop and remove all containers, networks, and untrackable orphans
down:
	docker compose down --remove-orphans

# Remove named volumes and anonymous volumes attached to containers
clean:
	docker compose down -v --remove-orphans

# restarts all stopped and running services
restart:
	docker compose restart
    
# Complete environment wipe and clean rebuild
reset: clear-conflicts
	docker compose down -v --remove-orphans
	docker compose up --build

# tidy package dependencies for the backend
tidy:
	go mod tidy

# generate database code using sqlc
sqlc:
	cd internal/db && sqlc generate
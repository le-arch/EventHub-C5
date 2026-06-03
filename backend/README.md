# EventHub-C5 Backend

Tech Stack

* Go + Gin: RESTAPI

* PostgreSQL: Database

* Docker: Containerised environment running the API, 

 PostgreSQL, Prometheus, and Grafana

Project Structure

* `api/`: Contains API route definitions. You will need to edit this file, if you want to add or modify the apit endpoints.

* `cmd/api/`: Houses the main application entry point. You shouldn't need to edit any files in this directory.

* `db/migrations`: Contains sql files that create/update the database schema (tables and columns) used by the api. If you need to update the database schema make your changes here.

* `db/query`: This folder contains SQL query files. These files define the database queries used by the application, which are processed by sqlc to generate type-safe Go code for interacting with the database.

`db/repo/`: This directory contains repository code that acts as an abstraction layer between the database and the application logic. It provides functions to interact with the database using the generated sqlc code. You shouldn't need to edit any files in this directory.

`internal/handler`: Handler functions for api

Perequisites

* Docker

* Docker Compose

# Getting Started

* Fork the repository into your own github account.

* Clone the Repository:

`git clone https://github.com/YOUR-GITHUB-USERNAME/EventHub-C5.git`

cd EventHub-C5/backend

* Set Up Environment Variables:

* Copy the .env.example file to .env and configure the necessary environment variables, such as database connection details.

* visit Makefile for directions on what command to use and when to use them

* Generate Code with sqlc:

* If you make any changes to `db/query` or `db/migrations`, then you need to re-generate the go code in `db/repo`

`go generate ./...`

* This command will generate Go code based on the SQL queries defined in the db/queries/ directory.

* Run the Application:

* First time after cloning repo `make build`

* Subsequent run when no change have been made. often used during testing `make start`

* Any updates to migration file, docker files `make reset`

    The server will start, and it will print the available endpoints.

# NB

    * make clean delete all data and you start afresh. Use with caution
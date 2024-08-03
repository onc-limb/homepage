build:
	go build -o myapp ./cmd/myapp

run:
	go run ./cmd/myapp

gqlschema:
	go run github.com/99designs/gqlgen generate

up:
	docker compose up

up-migrate:
	MIGRATE=true docker compose up

down:
	docker compose down
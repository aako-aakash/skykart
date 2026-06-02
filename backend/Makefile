# SKYKART Backend — Developer Commands
# ──────────────────────────────────────
# Usage: make <command>

.PHONY: dev install migrate seed test lint

# Start the dev server with hot reload
dev:
	uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Install all Python dependencies
install:
	pip install -r requirements.txt

# Run Alembic migrations
migrate:
	alembic upgrade head

# Create a new Alembic migration (auto-detect model changes)
# Usage: make migration MSG="add user avatar column"
migration:
	alembic revision --autogenerate -m "$(MSG)"

# Rollback last migration
rollback:
	alembic downgrade -1

# Seed the database with sample data
seed:
	python -m app.database.seed

# Run all tests
test:
	pytest tests/ -v

# Lint and format
lint:
	ruff check app/
	ruff format app/

# Full reset: drop all tables, re-migrate, re-seed
reset-db:
	alembic downgrade base
	alembic upgrade head
	python -m app.database.seed

# Show current migration status
db-status:
	alembic current
	alembic history --verbose

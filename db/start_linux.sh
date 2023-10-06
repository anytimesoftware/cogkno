#!/bin/bash

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install postgresql postgresql-contrib
    sudo service postgresql start
else
    sudo service postgresql start
fi

# Check if the database "cogkno" exists
DB_EXISTS=$(psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='cogkno'")

if [ "$DB_EXISTS" != "1" ]; then
    echo "Database 'cogkno' does not exist. Creating..."
    createdb -U postgres cogkno
    psql -U postgres -d cogkno -c "CREATE EXTENSION pgvector;"
fi

echo "PostgreSQL started and database 'cogkno' is ready!"

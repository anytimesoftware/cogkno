#!/bin/bash

# Get the current username
CURRENT_USER=$(whoami)

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL is not installed. Installing using Homebrew..."
    brew install postgresql@14
    brew install pgvector 
    brew services start postgresql@14
else
    brew services start postgresql@14
fi

# Check if the database "cogkno" exists
DB_EXISTS=$(psql -lqt | cut -d \| -f 1 | grep -w cogkno | wc -l)

if [ "$DB_EXISTS" == "0" ]; then
    echo "Database 'cogkno' does not exist. Creating..."
    createdb -U $CURRENT_USER cogkno
    psql -U $CURRENT_USER -d cogkno -c "CREATE EXTENSION pgvector;"
fi

if psql -l &> /dev/null; then
    echo "PostgreSQL started and database 'cogkno' is ready!"
else
    echo "Error: PostgreSQL could not start or there's an issue with the setup."
fi
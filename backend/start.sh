#!/bin/bash
set -e

 PORT=${PORT:-8080}

echo "Clearing configuration cache..."
php artisan config:clear

 echo "Starting Laravel server on 0.0.0.0:${PORT}..."
 php artisan serve --host=0.0.0.0 --port=${PORT} --no-reload &
 SERVER_PID=$!

echo "Running database migrations..."
php artisan migrate --force

wait ${SERVER_PID}

#!/bin/bash
set -e

echo "Clearing configuration cache..."
php artisan config:clear

echo "Running database migrations..."
php artisan migrate --force

echo "Starting Laravel server on 0.0.0.0:8080..."
exec php artisan serve --host=0.0.0.0 --port=8080 --no-reload

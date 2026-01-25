#!/usr/bin/env bash
# exit on error
set -o errexit

# Install PHP and Composer if not available
if ! command -v php &> /dev/null; then
    echo "Installing PHP..."
    apt-get update
    apt-get install -y php8.2 php8.2-cli php8.2-common php8.2-mysql php8.2-pgsql php8.2-xml php8.2-curl php8.2-mbstring php8.2-zip
fi

if ! command -v composer &> /dev/null; then
    echo "Installing Composer..."
    curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
fi

# Install dependencies
composer install --no-dev --optimize-autoloader

# Cache Laravel configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
php artisan storage:link

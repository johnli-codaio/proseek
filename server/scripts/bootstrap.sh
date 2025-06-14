# Allowing script to run anywhere
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

# Loading environment variables
set -a
source "$ROOT_DIR/config/.env.development" > /dev/null 2>&1
set +a

# Install PostgreSQL using Homebrew
echo "Installing PostgreSQL..."
brew update
brew install postgresql@14

# Start PostgreSQL service
echo "Starting PostgreSQL service..."
brew services start postgresql

# Verify installation
echo "PostgreSQL version:"
psql --version

echo "PostgreSQL installation complete."

# Install Redis using Homebrew
echo "Installing Redis..."
brew install redis

# Start Redis service
echo "Starting Redis service..."
brew services start redis

# Verify Redis installation
echo "Redis version:"
redis-cli --version

echo "Redis installation complete."

# Install node stuff.
sh "$ROOT_DIR/scripts/packages.sh"

# Handle postgres scripts later
echo "Bootstrapping database..."

# Create the database if it doesn't exist.
psql -U $(whoami) -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'proseek'" | grep -q 1 || createdb -U $(whoami) -d postgres proseek

# Create the test database if it doesn't exist.
psql -U $(whoami) -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'proseek_test'" | grep -q 1 || createdb -U $(whoami) -d postgres proseek_test

# Add new proseek_admin user if not created.
psql -U $(whoami) -d proseek -f "$ROOT_DIR/src/sql/dev_initialization.sql"
echo "PostgreSQL database initialized."

NODE_ENV=development sh "$ROOT_DIR/scripts/migrations.sh"
echo "Database bootstrapped successfully."

# Run setup_test_db.sh to set up the test database
echo "Setting up test database..."
sh "$ROOT_DIR/scripts/setup_test_db.sh"

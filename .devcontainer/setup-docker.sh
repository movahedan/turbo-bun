#!/bin/bash

# Setup Docker permissions for cross-platform compatibility
# This script handles Docker socket permissions for Linux/macOS
# Windows uses Docker Desktop and doesn't need socket permissions

echo "Setting up Docker permissions..."

# Install Turbo globally
RUN bun install -g turbo@2.5.4

# Install act for local GitHub Actions testing
echo "Installing act for local GitHub Actions testing..."
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Move act to PATH
sudo mv ./bin/act /usr/local/bin/act || true

# Create act config directory and file
mkdir -p .act
cat > .act/actrc << EOF
# act configuration file
--image-size micro
--platform ubuntu-latest
--quiet
--secret-file .env
--reuse
EOF

# Check if Docker socket exists (Linux/macOS)
if [ -S /var/run/docker.sock ]; then    
    # Set socket permissions for non-root access
    sudo chmod 666 /var/run/docker.sock
    
    # Add user to docker group
    sudo usermod -aG docker $USER || true
    
    echo "Docker permissions configured for Linux/macOS"
else
    echo "No Docker socket found, assuming Windows or Docker Desktop"
fi

# Install dependencies
echo "Installing dependencies..."
bun install

# Start development containers
echo "Starting development containers..."
bun run dev:up

echo "Setup complete!" 
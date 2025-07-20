#!/bin/bash

# Setup Docker permissions for cross-platform compatibility
# This script handles Docker socket permissions for Linux/macOS
# Windows uses Docker Desktop and doesn't need socket permissions

echo "Setting up Docker permissions..."

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
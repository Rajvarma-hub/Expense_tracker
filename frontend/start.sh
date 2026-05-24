#!/bin/bash

echo "===================================="
echo "Expense Tracker Frontend Starter"
echo "===================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Node.js version:"
node --version
echo ""

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    echo "Please install Node.js (npm comes with it) from https://nodejs.org/"
    exit 1
fi

echo "npm version:"
npm --version
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
    echo ""
    echo "Dependencies installed successfully!"
    echo ""
else
    echo "Dependencies already installed."
    echo ""
fi

echo "Starting development server..."
echo "Frontend will be available at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""
npm run dev



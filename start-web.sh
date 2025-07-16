#!/bin/bash

echo "🐉 Starting All The Monsters Web Interface..."
echo ""

# Check if monster data exists
if [ ! -f "data/monsters/all-monsters.json" ]; then
    echo "❌ Monster data not found!"
    echo "Please run the collection script first:"
    echo "  npm start"
    echo ""
    echo "Or if you have the data, make sure it's in data/monsters/all-monsters.json"
    exit 1
fi

# Copy data to web directory if needed
if [ ! -f "web/public/data/monsters/all-monsters.json" ]; then
    echo "📁 Copying monster data to web directory..."
    cp -r data web/public/
fi

# Start the web app
echo "🚀 Starting web interface..."
echo "📱 Open http://localhost:3000 in your browser"
echo ""

cd web
npm start 
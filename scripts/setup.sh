#!/bin/bash

# Setup script for seeding test users

echo "🔧 Installing Firebase Admin SDK..."
npm install firebase-admin --save-dev

echo ""
echo "📋 Setup Instructions:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/"
echo "2. Select your project: anonymous-feedback-platform"
echo "3. Click Settings (⚙️) → Project Settings"
echo "4. Go to Service Accounts tab"
echo "5. Click 'Generate New Private Key'"
echo "6. Download the JSON file"
echo "7. Rename it to 'serviceAccountKey.json'"
echo "8. Place it in the scripts/ folder"
echo ""
echo "Then run: npm run seed:users"
echo ""
echo "⚠️  IMPORTANT: Never commit the serviceAccountKey.json file!"
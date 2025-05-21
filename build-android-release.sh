#!/bin/bash

# Exit on error
set -e

echo "===== Building Android Release AAB ====="

# Navigate to the project directory
cd "$(dirname "$0")"

# Clean the project
echo "Cleaning the project..."
cd android
./gradlew clean
cd ..

# Build the release AAB
echo "Building release AAB..."
cd android
./gradlew bundleRelease

# Output the location of the AAB file
echo "===== Build Completed ====="
echo "Your AAB file is located at:"
echo "$(pwd)/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "You can now upload this file to the Google Play Console."

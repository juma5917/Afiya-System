#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Building static files..."

# Ensure pip is up to date (optional, but can help)
python -m pip install --upgrade pip

# Install dependencies (Vercel might do this automatically, but being explicit is safe)
pip install -r requirements.txt # Usually not needed here if Vercel detects requirements.txt

# Run Django collectstatic
# This requires DJANGO_SETTINGS_MODULE to be set,
# Vercel often sets this, but you might need to export it if you encounter issues.
# export DJANGO_SETTINGS_MODULE=your_project_name.settings
python3 manage.py collectstatic --noinput

echo "Static files build finished."

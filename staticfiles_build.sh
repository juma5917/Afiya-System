#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Building static files..."


# python3 -m pip install --upgrade pip

# Dependencies are installed by the @vercel/python build step defined in vercel.json
# No need to run 'pip install -r requirements.txt' here.

# Run Django collectstatic
echo "Running collectstatic..."
python3 manage.py collectstatic --noinput

echo "Static files build finished."


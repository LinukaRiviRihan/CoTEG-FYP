#!/usr/bin/env bash
# exit on error
set -o errexit

# 1. Install & Build Frontend
cd frontend
npm install
npm run build
cd ..

# 2. Install & Migrate Backend
cd backend
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
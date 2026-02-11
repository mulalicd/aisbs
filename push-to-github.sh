#!/bin/bash
# AISBS GitHub Push Script
# Execute this to push code to https://github.com/mulalicd/aisbs

echo "========================================"
echo "AISBS - GitHub Push Script"
echo "========================================"
echo ""

# 1. Configure git
echo "[1/5] Configuring git..."
git config --global user.email "dev@aisbs.local"
git config --global user.name "AISBS Developer"

# 2. Initialize repository
echo "[2/5] Initializing repository..."
git init

# 3. Add all files
echo "[3/5] Staging files..."
git add .

# 4. Create commit
echo "[4/5] Creating commit..."
git commit -m "AISBS v1.0 - Defensive Programming Implementation

Implemented:
- ErrorBoundary component for global error handling
- ProblemView.js with defensive null-checks
- Safe API response structures in api.js
- Complete Chapter 1 data structure validation
- Loading and error state CSS styling
- Comprehensive test suite (testAPI.js)
- Metrics analysis tool (metrics.js)
- Structure verification tool (verifyStructure.js)

Features:
- RAG 3-stage pipeline (retrieval → augmentation → generation)
- 10 RESTful API endpoints
- React frontend with defensive programming
- Material Design styling
- Zero breaking changes
- Production-ready error handling"

# 5. Push to GitHub
echo "[5/5] Pushing to GitHub..."
git remote add origin https://github.com/mulalicd/aisbs.git || git remote set-url origin https://github.com/mulalicd/aisbs.git
git branch -M main
git push -u origin main --force

echo ""
echo "========================================"
echo "✅ SUCCESS! Code pushed to:"
echo "   https://github.com/mulalicd/aisbs"
echo "========================================"

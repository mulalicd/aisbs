@echo off
REM AISBS GitHub Push Script
REM Execute this to push code to https://github.com/mulalicd/aisbs

echo.
echo ========================================
echo AISBS - GitHub Push Script
echo ========================================
echo.

REM 1. Configure git
echo [1/5] Configuring git...
git config --global user.email "dev@aisbs.local"
git config --global user.name "AISBS Developer"

REM 2. Initialize repository
echo [2/5] Initializing repository...
git init

REM 3. Add all files
echo [3/5] Staging files...
git add .

REM 4. Create commit
echo [4/5] Creating commit...
git commit -m "AISBS v1.0 - Defensive Programming Implementation"

REM 5. Add remote
echo [5/5] Adding GitHub remote...
git remote add origin https://github.com/mulalicd/aisbs.git 2>nul || git remote set-url origin https://github.com/mulalicd/aisbs.git

REM 6. Push
echo [6/6] Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo SUCCESS! Code pushed to:
echo    https://github.com/mulalicd/aisbs
echo ========================================
echo.

pause

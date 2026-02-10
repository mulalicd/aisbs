@echo off
:: AISBS Quick Push
:: Sačuvaj kao: C:\PRIVATE\AI\AISBS\quick_push.bat

cd /d "C:\PRIVATE\AI\AISBS"

echo ⚡ AISBS Quick Push
echo ==================

:: Provjeri status
git status --short

:: Add all
git add --all

:: Commit sa timestamp-om
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%_%datetime:~8,2%-%datetime:~10,2%
git commit -m "Update %timestamp%" --allow-empty

:: Push
git push origin main

echo.
echo ✅ Pushano na: https://github.com/mulalicd/aisbs
timeout /t 3 >nul
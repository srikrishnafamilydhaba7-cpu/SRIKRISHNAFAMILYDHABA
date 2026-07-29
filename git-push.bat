@echo off
echo =======================================
echo Sri Krishna Dhaba - Git Push Automator
echo =======================================
echo.

:: Stage all changes
echo Staging all changes...
git add .
if errorlevel 1 (
    echo Warning: Failed to stage changes.
)

:: Prompt for commit message
set /p commit_message="Enter commit message (press Enter for default 'Update'): "
if "%commit_message%"=="" set commit_message=Update code

:: Commit changes
echo.
echo Committing changes...
git commit -m "%commit_message%"

:: Pull remote changes first
echo.
echo Pulling latest changes from GitHub...
git pull origin main --rebase --allow-unrelated-histories
if errorlevel 1 (
    echo.
    echo Warning: Pull failed. Proceeding with push...
)

:: Push to main branch
echo.
echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo Error: Failed to push to remote repository.
    echo.
    echo Tip: If the remote repository is brand new and has files (like README/License) 
    echo that you want to overwrite completely with your local files, run:
    echo git push -f origin main
    pause
    exit /b 1
)

echo.
echo =======================================
echo Successfully pushed changes to GitHub!
echo =======================================
pause

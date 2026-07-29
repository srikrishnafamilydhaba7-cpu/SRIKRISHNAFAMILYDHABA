@echo off
echo =======================================
echo Sri Krishna Dhaba - Git Push Automator
echo =======================================
echo.

:: Stage all changes
echo Staging all changes...
git add .
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to stage changes.
    pause
    exit /b %ERRORLEVEL%
)

:: Prompt for commit message
set /p commit_message="Enter commit message (press Enter for default 'Update'): "
if "%commit_message%"=="" set commit_message=Update code

:: Commit changes
echo.
echo Committing changes...
git commit -m "%commit_message%"
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to commit changes.
    echo (Maybe there are no changes to commit?)
    pause
    exit /b %ERRORLEVEL%
)

:: Push to main branch
echo.
echo Pushing to GitHub...
git push origin main
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to push to remote repository.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =======================================
echo Successfully pushed changes to GitHub!
echo =======================================
pause

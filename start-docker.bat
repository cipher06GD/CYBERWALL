@echo off
title CYBERWALL - Docker
color 0B

echo ======================================================================
echo    CYBERWALL -- DOCKER MODE
echo ======================================================================
echo.

:: Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not running.
    echo Please start Docker Desktop first, then run this script again.
    echo.
    pause
    goto :end
)

echo [OK] Docker is running.
echo.
echo Building and starting CYBERWALL container...
echo Game will open at: http://localhost:9080
echo.
echo Press Ctrl+C to stop the container.
echo.

:: Build and run with docker compose
docker compose up --build

:end

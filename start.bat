@echo off
title CYBERWALL - The Digital World Rescue
color 0B

echo ======================================================================
echo    CYBERWALL -- THE DIGITAL WORLD RESCUE
echo    Class 11 Computer Science Exhibition Project
echo ======================================================================
echo.
echo Starting local web server on port 8080...
echo.

:: Open browser after 2 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:8080"

:: 1. Try python
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python detected. Starting http.server on port 8080...
    echo Open your browser at: http://localhost:8080
    echo Press Ctrl+C in this window to stop the server.
    echo.
    python -m http.server 8080
    goto :end
)

:: 2. Try py launcher
py --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python launcher (py) detected. Starting http.server on port 8080...
    echo Open your browser at: http://localhost:8080
    echo Press Ctrl+C in this window to stop the server.
    echo.
    py -m http.server 8080
    goto :end
)

:: 3. Try npx http-server
call npx --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js / npx detected. Starting http-server on port 8080...
    echo Open your browser at: http://localhost:8080
    echo Press Ctrl+C in this window to stop the server.
    echo.
    call npx http-server -p 8080 -c-1
    goto :end
)

echo [ERROR] Neither Python nor Node.js could be found on this computer.
echo You can still play by opening index.html directly in Chrome or Edge:
echo Double-clicking index.html in the folder will open the game!
echo.
pause

:end

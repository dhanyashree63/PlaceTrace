@echo off
title PlaceTrace Local Full-Stack Server (Port 5173)
cd /d "%~dp0"
echo ============================================================================
echo   PlaceTrace - Intelligent Placement Tracking and Career Management Platform
echo ============================================================================
if not exist "frontend\dist\assets\index.js" (
  echo Building PlaceTrace frontend assets...
  call agy-node.cmd scripts\build-frontend.cjs
)
echo Starting PlaceTrace local server at http://localhost:5173 ...
call agy-node.cmd scripts\local-server.cjs
pause

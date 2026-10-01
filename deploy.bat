@echo off
setlocal
echo ==========================================================
echo   ART VIDEO MAKER PRO - AUTO DEPLOY (GITHUB ^& VERCEL)
echo ==========================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy.ps1"

echo.
pause

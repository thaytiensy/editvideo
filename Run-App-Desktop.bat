@echo off
title FaceSwap PRO - CapCut AI Desktop Studio
color 0b

echo =====================================================================
echo          FACESWAP PRO - AI VIDEO EDITOR (CAPCUT STYLE)
echo =====================================================================
echo  - Che do: 100%% CPU-Only (Khong can GPU)
echo  - Model AI: buffalo_l + inswapper_128.onnx
echo  - FFmpeg: Portable Native
echo =====================================================================
echo.

cd /d "%~dp0"

set "MINGW_BIN=C:\Users\win 10 pro\AppData\Local\Microsoft\WinGet\Packages\MartinStorsjo.LLVM-MinGW.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\llvm-mingw-20260616-ucrt-x86_64\bin"
set "PATH=%MINGW_BIN%;C:\Users\win 10 pro\.cargo\bin;%PATH%"

echo [*] Kiem tra backend Python FastAPI...
powershell -Command "Get-Process -Name python -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*backend.main*' } | Stop-Process -Force -ErrorAction SilentlyContinue"

echo [*] Khoi dong Backend AI FaceSwap tren cong 8000...
start /b "" "..\venv\Scripts\python.exe" -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

timeout /t 3 /nobreak >nul

echo [*] Kiem tra Frontend Studio...
start http://localhost:3000

echo [*] Khoi dong giao dien CapCut AI Pro (Vite / Tauri)...
npm run dev

pause

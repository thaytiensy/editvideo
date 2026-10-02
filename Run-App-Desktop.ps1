# FaceSwap PRO - Windows PowerShell Launcher
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "         FACESWAP PRO - AI VIDEO EDITOR (CAPCUT STYLE)" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " - Che do: 100% CPU-Only (Khong can GPU)" -ForegroundColor Green
Write-Host " - Model AI: buffalo_l + inswapper_128.onnx" -ForegroundColor Green
Write-Host " - FFmpeg: Portable Native" -ForegroundColor Green
Write-Host "=====================================================================`n" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $CurrentDir

# Set PATH for Rust & MinGW toolchain
$mingwBin = "C:\Users\win 10 pro\AppData\Local\Microsoft\WinGet\Packages\MartinStorsjo.LLVM-MinGW.UCRT_Microsoft.Winget.Source_8wekyb3d8bbwe\llvm-mingw-20260616-ucrt-x86_64\bin"
$env:Path = "$mingwBin;C:\Users\win 10 pro\.cargo\bin;" + $env:Path

# 1. Start Python FastAPI backend if not already running on port 8000
$portActive = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
if (-not $portActive) {
    Write-Host "[*] Dang khoi dong Backend AI FaceSwap tren cong 8000..." -ForegroundColor Yellow
    $pythonPath = Resolve-Path "..\venv\Scripts\python.exe"
    Start-Process -FilePath $pythonPath -ArgumentList "-m uvicorn backend.main:app --host 127.0.0.1 --port 8000" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "[OK] Backend FastAPI da khoi dong thanh cong!" -ForegroundColor Green
} else {
    Write-Host "[OK] Backend FastAPI da dang chay tren cong 8000." -ForegroundColor Green
}

# 2. Check if user wants Tauri Desktop window or Web Studio
Write-Host "[*] Dang mo giao dien CapCut Pro..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

npm run dev

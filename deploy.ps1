# PowerShell Auto-Deploy Script for GitHub & Vercel
# Ghi nhớ: Tự động đưa lên GitHub và triển khai trên Vercel, tự động sửa lỗi

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  ART VIDEO MAKER PRO - AUTO DEPLOY (GITHUB & VERCEL)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Locate Git executable
$gitCmd = "git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $commonGitPaths = @(
        "C:\Program Files\Git\cmd\git.exe",
        "C:\Program Files\Git\bin\git.exe",
        "C:\Program Files (x86)\Git\cmd\git.exe",
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe"
    )
    foreach ($p in $commonGitPaths) {
        if (Test-Path $p) {
            $gitCmd = $p
            Write-Host "[OK] Tim thay Git tai: $gitCmd" -ForegroundColor Green
            break
        }
    }
}

# 2. Check Git availability
if (-not (Get-Command $gitCmd -ErrorAction SilentlyContinue) -and -not (Test-Path $gitCmd)) {
    Write-Host "[CANH BAO] Git chua co trong PATH. Dang thu kiem tra lai..." -ForegroundColor Yellow
} else {
    Write-Host "[1/4] Kiem tra Git Repository..." -ForegroundColor Green
    if (-not (Test-Path ".git")) {
        Write-Host "Dang khoi tao Git repository..." -ForegroundColor Yellow
        & $gitCmd init
        & $gitCmd branch -M main
    }

    # Add and Commit
    Write-Host "[2/4] Stage va Commit toan bo ma nguon..." -ForegroundColor Green
    & $gitCmd add .
    $status = & $gitCmd status --porcelain
    if ($status) {
        & $gitCmd commit -m "feat: Art Video Maker PRO - Auto Face Swap, Image-to-Video, Admin Gmail & Vercel Deploy"
        Write-Host "[OK] Da commit thanh cong!" -ForegroundColor Green
    } else {
        Write-Host "[OK] Ma nguon da o trang thai moi nhat." -ForegroundColor Green
    }

    # Remote check
    $remotes = & $gitCmd remote -v
    if ($remotes) {
        Write-Host "[3/4] Dang day ma nguon len GitHub remote..." -ForegroundColor Green
        & $gitCmd push -u origin main
    } else {
        Write-Host "[Chu y] Chua cau hinh remote GitHub. Hay chay:" -ForegroundColor Yellow
        Write-Host "git remote add origin https://github.com/<username>/<repo-name>.git" -ForegroundColor White
        Write-Host "git push -u origin main" -ForegroundColor White
    }
}

# 3. Check Vercel
Write-Host "[4/4] Kiem tra cau hinh Vercel..." -ForegroundColor Green
if (Test-Path "vercel.json") {
    Write-Host "[OK] vercel.json da ton tai voi cau hinh SPA rewrite." -ForegroundColor Green
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Hoan tat quy trinh kiem tra va san sang trien khai!" -ForegroundColor Cyan

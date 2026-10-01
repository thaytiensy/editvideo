# PowerShell Auto-Deploy Script for GitHub & Vercel
# Tu dong nhan dien thu muc du an va ho tro day len GitHub & Vercel

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $ScriptDir

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   ART VIDEO MAKER PRO - AUTO DEPLOY (GITHUB & VERCEL)   " -ForegroundColor Cyan
Write-Host "   Thu muc: $ScriptDir" -ForegroundColor DarkGray
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Locate Git & GH
$gitCmd = "git"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $commonGitPaths = @(
        "$env:LOCALAPPDATA\Programs\Git\cmd\git.exe",
        "C:\Program Files\Git\cmd\git.exe"
    )
    foreach ($p in $commonGitPaths) {
        if (Test-Path $p) { $gitCmd = $p; break }
    }
}

$ghCmd = "gh"
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    $ghPath = "C:\Users\win 10 pro\AppData\Local\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin\gh.exe"
    if (Test-Path $ghPath) { $ghCmd = $ghPath }
}

# 2. Check Repository
if (-not (Test-Path ".git")) {
    Write-Host "[1/4] Khoi tao Git repository..." -ForegroundColor Yellow
    & $gitCmd init
    & $gitCmd branch -M main
} else {
    Write-Host "[1/4] Git repository da san sang." -ForegroundColor Green
}

# 3. Stage & Commit
Write-Host "[2/4] Kiem tra va commit ma nguon..." -ForegroundColor Green
& $gitCmd add .
$status = & $gitCmd status --porcelain
if ($status) {
    & $gitCmd commit -m "feat: Art Video Maker PRO - Auto Face Swap, Image-to-Video, Admin Gmail & Vercel Deploy"
    Write-Host "[OK] Da commit ma nguon moi nhat!" -ForegroundColor Green
} else {
    Write-Host "[OK] Ma nguon da duoc commit day du." -ForegroundColor Green
}

# 4. Check Remote & Push
Write-Host "[3/4] Kiem tra ket noi GitHub..." -ForegroundColor Green
$remotes = & $gitCmd remote -v
if (-not $remotes) {
    Write-Host ""
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
    Write-Host " CHUA KET NOI GITHUB REPOSITORY! CHON PHUONG THUC:        " -ForegroundColor Yellow
    Write-Host " [1] Tu dong dang nhap GitHub qua trinh duyet va tao repo " -ForegroundColor White
    Write-Host " [2] Dan truc tiep link GitHub repo ban da tao san        " -ForegroundColor White
    Write-Host "----------------------------------------------------------" -ForegroundColor Yellow
    $choice = Read-Host "Nhap lua chon cua ban (1 hoac 2, Enter mac dinh la 1)"
    if ($choice -eq "2") {
        Write-Host ""
        $repoUrl = Read-Host "Dan link GitHub repo cua ban (VD: https://github.com/username/repo.git)"
        if ($repoUrl) {
            & $gitCmd remote add origin $repoUrl.Trim()
            Write-Host "Dang day ma nguon len GitHub..." -ForegroundColor Green
            & $gitCmd push -u origin main
        }
    } else {
        Write-Host "Dang mo trinh duyet de dang nhap GitHub..." -ForegroundColor Cyan
        & $ghCmd auth login -w -p https
        $repoName = Read-Host "Nhap ten repository muon dat tren GitHub (Enter mac dinh: art-video-maker-pro)"
        if (-not $repoName) { $repoName = "art-video-maker-pro" }
        Write-Host "Dang tu dong tao repo tren GitHub va day ma nguon len..." -ForegroundColor Green
        & $ghCmd repo create $repoName --public --source=. --remote=origin --push
    }
} else {
    Write-Host "Dang day ma nguon len GitHub remote..." -ForegroundColor Green
    & $gitCmd push -u origin main
}

# 5. Vercel Deployment Check
Write-Host ""
Write-Host "[4/4] Kiem tra cau hinh Vercel..." -ForegroundColor Green
if (Test-Path "vercel.json") {
    Write-Host "[OK] vercel.json da san sang voi SPA rewrite." -ForegroundColor Green
    Write-Host "Ban chi can vao https://vercel.com/new de Import repository va nhan Deploy!" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "           HOAN TAT QUY TRINH TRIEN KHAI!                 " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green

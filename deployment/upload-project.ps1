# Upload project to server - Smart version
# Only upload necessary files, exclude dev configs and unnecessary files

Write-Host "=========================================" -ForegroundColor Blue
Write-Host "Smart Package and Upload to Server" -ForegroundColor Blue
Write-Host "=========================================" -ForegroundColor Blue
Write-Host ""

# Server info
$SERVER_HOST = "47.239.179.9"
$SERVER_PORT = "43122"
$SERVER_USER = "xiaoyi-dev1"

# Project directory (auto-detect current directory)
$PROJECT_DIR = Get-Location
$TEMP_DIR = "$env:TEMP\bracelet-fortune-upload"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "   Project Dir: $PROJECT_DIR"
Write-Host "   Server: ${SERVER_HOST}:${SERVER_PORT}"
Write-Host "   User: $SERVER_USER"
Write-Host ""

Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "   - Will NOT upload .env files (protect your dev config)"
Write-Host "   - Will NOT upload node_modules (will reinstall on server)"
Write-Host "   - Will NOT upload build artifacts (will rebuild on server)"
Write-Host "   - Only upload source code and config files"
Write-Host ""

# Check project directory
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: Current directory is not project root" -ForegroundColor Red
    Write-Host "   Please run this script in project root directory" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Step 1: Create temp directory..." -ForegroundColor Yellow
Write-Host ""

# Create temp directory
if (Test-Path $TEMP_DIR) {
    Remove-Item -Path $TEMP_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

Write-Host "   Done" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Copy necessary files..." -ForegroundColor Yellow
Write-Host ""

# Define files and directories to copy
$filesToCopy = @(
    # Root config files
    @{Path="package.json"; Required=$true},
    @{Path="pnpm-workspace.yaml"; Required=$true},
    @{Path="pnpm-lock.yaml"; Required=$true},
    @{Path="tsconfig.base.json"; Required=$false},

    # apps/api directory
    @{Path="apps\api\package.json"; Required=$true},
    @{Path="apps\api\tsconfig.json"; Required=$true},
    @{Path="apps\api\tsconfig.build.json"; Required=$true},
    @{Path="apps\api\nest-cli.json"; Required=$true},
    @{Path="apps\api\src"; Required=$true},
    @{Path="apps\api\prisma"; Required=$true},

    # apps/wx-app directory (mini-program doesn't need to deploy to server)
    # Uncomment if needed in the future
    # @{Path="apps\wx-app\package.json"; Required=$false},

    # packages/shared-types directory
    @{Path="packages\shared-types"; Required=$true}
)

# Patterns to exclude
$excludePatterns = @(
    "node_modules",
    "dist",
    ".env",
    ".env.local",
    ".env.development",
    ".env.production",
    "*.log",
    ".vscode",
    ".idea",
    "*.db",
    "*.sqlite",
    "coverage",
    ".git"
)

# Copy files
foreach ($item in $filesToCopy) {
    $sourcePath = $item.Path
    $destPath = Join-Path $TEMP_DIR $sourcePath

    if (Test-Path $sourcePath) {
        # Create destination directory
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }

        Write-Host "   Copying: $sourcePath"

        # If directory, use robocopy to exclude unnecessary files
        if (Test-Path $sourcePath -PathType Container) {
            $excludeArgs = $excludePatterns | ForEach-Object { "/XD", $_ }
            robocopy $sourcePath $destPath /E /NFL /NDL /NJH /NJS /NC /NS $excludeArgs | Out-Null
        } else {
            Copy-Item -Path $sourcePath -Destination $destPath -Force
        }
    } elseif ($item.Required) {
        Write-Host "   WARNING: Missing required file: $sourcePath" -ForegroundColor Yellow
    }
}

Write-Host "   Done" -ForegroundColor Green
Write-Host ""

Write-Host "Step 3: Create server-specific files..." -ForegroundColor Yellow
Write-Host ""

# Create .gitkeep files to preserve empty directories
$emptyDirs = @(
    "$TEMP_DIR\apps\api\dist"
)

foreach ($dir in $emptyDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        New-Item -ItemType File -Path "$dir\.gitkeep" -Force | Out-Null
    }
}

# Create README file
$readmeContent = @"
# Server Deployment Package

This package contains all files needed for mini-program backend deployment.

## Included

- Backend source code (apps/api/src)
- Database config (apps/api/prisma)
- Shared types (packages/shared-types)
- Dependencies config (package.json, pnpm-lock.yaml)

## Not Included

- node_modules (need to run pnpm install on server)
- .env file (need to configure separately on server)
- Build artifacts (need to run pnpm build on server)
- Mini-program frontend code (not needed on server)

## Deployment Steps

1. Extract files:
   unzip -o bracelet-fortune.zip -d bracelet-fortune

2. Enter directory:
   cd bracelet-fortune

3. Run deployment script:
   cd ~/deployment
   chmod +x *.sh
   ./deploy-all.sh

## Notes

- Deployment script will auto-create .env file
- Need to manually fill WeChat mini-program secret and AI service key
- Database connection info is configured in deployment script

---
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

Set-Content -Path "$TEMP_DIR\README-SERVER.txt" -Value $readmeContent -Encoding UTF8

Write-Host "   Done" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Calculate file statistics..." -ForegroundColor Yellow
Write-Host ""

$fileCount = (Get-ChildItem -Path $TEMP_DIR -Recurse -File).Count
$totalSize = (Get-ChildItem -Path $TEMP_DIR -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB

Write-Host "   File count: $fileCount"
Write-Host "   Total size: $([math]::Round($totalSize, 2)) MB"
Write-Host ""

Write-Host "Step 5: Compress project..." -ForegroundColor Yellow
Write-Host ""

$zipFile = "$env:TEMP\bracelet-fortune.zip"

# Delete old zip file
if (Test-Path $zipFile) {
    Remove-Item -Path $zipFile -Force
}

# Compress
Compress-Archive -Path "$TEMP_DIR\*" -DestinationPath $zipFile -Force

$zipSize = (Get-Item $zipFile).Length / 1MB
Write-Host "   Done (size: $([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
Write-Host ""

Write-Host "Step 6: Upload to server..." -ForegroundColor Yellow
Write-Host ""

# Upload file
Write-Host "   Uploading, please wait..."
scp -P $SERVER_PORT $zipFile "${SERVER_USER}@${SERVER_HOST}:~/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "   Upload successful" -ForegroundColor Green
} else {
    Write-Host "   Upload failed" -ForegroundColor Red
    Write-Host "   Please check network connection and server info" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""

Write-Host "Step 7: Clean up temp files..." -ForegroundColor Yellow
Write-Host ""

Remove-Item -Path $TEMP_DIR -Recurse -Force
Remove-Item -Path $zipFile -Force

Write-Host "   Done" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Upload Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Upload Statistics:" -ForegroundColor Cyan
Write-Host "   File count: $fileCount"
Write-Host "   Size before compression: $([math]::Round($totalSize, 2)) MB"
Write-Host "   Size after compression: $([math]::Round($zipSize, 2)) MB"
Write-Host "   Compression ratio: $([math]::Round((1 - $zipSize / $totalSize) * 100, 1))%"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Connect to server:" -ForegroundColor Yellow
Write-Host "   ssh $SERVER_USER@${SERVER_HOST} -p $SERVER_PORT"
Write-Host ""
Write-Host "2. Extract project:" -ForegroundColor Yellow
Write-Host "   cd ~"
Write-Host "   unzip -o bracelet-fortune.zip -d bracelet-fortune"
Write-Host ""
Write-Host "3. View README:" -ForegroundColor Yellow
Write-Host "   cat ~/bracelet-fortune/README-SERVER.txt"
Write-Host ""
Write-Host "4. Run deployment script:" -ForegroundColor Yellow
Write-Host "   cd ~/deployment"
Write-Host "   chmod +x *.sh"
Write-Host "   ./deploy-all.sh"
Write-Host ""

Write-Host "Important Notes:" -ForegroundColor Yellow
Write-Host "   - .env file NOT uploaded (protect your dev config)"
Write-Host "   - Deployment script will create new .env file on server"
Write-Host "   - Need to fill WeChat mini-program secret and AI service key"
Write-Host ""

pause


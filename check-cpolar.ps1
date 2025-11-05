# Check cpolar status and get public URL

Write-Host "========================================"
Write-Host "Checking Service Status"
Write-Host "========================================"
Write-Host ""

# Check backend service
Write-Host "[1/3] Checking backend service (port 3000)..."
$backend = netstat -ano | findstr ":3000.*LISTENING"
if ($backend) {
    Write-Host "[OK] Backend service is running"
    Write-Host "  $backend"
} else {
    Write-Host "[ERROR] Backend service is not running"
    Write-Host "  Please run: cd apps\api; npm run start:dev"
}
Write-Host ""

# Check cpolar process
Write-Host "[2/3] Checking cpolar process..."
$cpolarProcess = Get-Process | Where-Object {$_.ProcessName -like "*cpolar*"}
if ($cpolarProcess) {
    Write-Host "[OK] cpolar process is running"
    $cpolarProcess | Format-Table ProcessName, Id, CPU -AutoSize
} else {
    Write-Host "[ERROR] cpolar is not running"
    Write-Host "  Please run: cpolar http 3000"
}
Write-Host ""

# Get cpolar public URL
Write-Host "[3/3] Getting cpolar public URL..."
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -ErrorAction Stop
    if ($response.tunnels -and $response.tunnels.Count -gt 0) {
        Write-Host "[OK] cpolar tunnel info:"
        foreach ($tunnel in $response.tunnels) {
            if ($tunnel.public_url -like "https://*") {
                Write-Host ""
                Write-Host "  Public URL: $($tunnel.public_url)"
                Write-Host "  Local URL: $($tunnel.config.addr)"
                Write-Host ""
                Write-Host "========================================"
                Write-Host "Please copy the HTTPS URL above!"
                Write-Host "========================================"
                Write-Host ""
                Write-Host "Next steps:"
                Write-Host "1. Copy the HTTPS URL above"
                Write-Host "2. Run: node scripts\update-cpolar-url.js YOUR_URL"
                Write-Host "3. Or manually edit: apps\wx-app\src\api\config.ts"
                Write-Host ""
            }
        }
    } else {
        Write-Host "[ERROR] No cpolar tunnel found"
    }
} catch {
    Write-Host "[ERROR] Cannot connect to cpolar API (http://127.0.0.1:4040)"
    Write-Host "  cpolar may not be running or using a different port"
    Write-Host ""
    Write-Host "Please check manually:"
    Write-Host "1. Open browser: http://127.0.0.1:4040"
    Write-Host "2. Or restart cpolar: cpolar http 3000"
}
Write-Host ""


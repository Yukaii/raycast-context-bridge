param(
    [string]$ServiceName = "RaycastCompanionProxy",
    [string]$DisplayName = "Raycast Companion Proxy",
    [string]$BinaryPath = "C:\Program Files\RaycastCompanion\raycast-proxy.exe",
    [string]$ServiceScript = "C:\Program Files\RaycastCompanion\raycast-proxy-service.ps1",
    [string]$Description = "Keeps the Raycast Companion Firefox proxy running locally"
)

if (-not (Test-Path $BinaryPath)) {
    Write-Error "Binary not found at $BinaryPath. Run npm run proxy:build on Windows and copy the exe first."
    exit 1
}

if (-not (Test-Path $ServiceScript)) {
    Write-Error "Service script not found at $ServiceScript."
    exit 1
}

$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
$serviceCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$ServiceScript`""

if ($existing) {
    Write-Output "Service $ServiceName already exists. Updating binary path/script..."
    $quoted = '"' + $serviceCommand + '"'
    sc.exe config $ServiceName binPath= $quoted | Out-Null
} else {
    New-Service -Name $ServiceName -BinaryPathName $serviceCommand -DisplayName $DisplayName -Description $Description -StartupType Automatic | Out-Null
}

Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\$ServiceName" -Name "ImagePath" -Value $serviceCommand

Write-Output "Service $ServiceName installed."
Write-Output "Use 'Start-Service $ServiceName' to start and 'Stop-Service $ServiceName' to stop."

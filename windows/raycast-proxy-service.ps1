param(
    [string]$BinaryPath = "C:\Program Files\RaycastCompanion\raycast-proxy.exe"
)

$port = $env:RAYCAST_PROXY_PORT
if (-not $port) { $port = "8787" }

$listenHost = $env:RAYCAST_PROXY_HOST
if (-not $listenHost) { $listenHost = "127.0.0.1" }

$targetHost = $env:RAYCAST_PROXY_TARGET_HOST
if (-not $targetHost) { $targetHost = "127.0.0.1" }

$forwardOrigin = $env:RAYCAST_PROXY_FORWARD_ORIGIN
if (-not $forwardOrigin) { $forwardOrigin = "chrome-extension://raycast-proxy" }

$binaryOverride = $env:RAYCAST_PROXY_BINARY
if ($binaryOverride) {
    $BinaryPath = $binaryOverride
}

if (-not (Test-Path $BinaryPath)) {
    Write-Error "Proxy binary not found at $BinaryPath"
    exit 1
}

Write-Output "Starting Raycast Companion proxy..."
Write-Output "  Binary: $BinaryPath"
Write-Output "  Listen: ws://$listenHost:$port"
Write-Output "  Target host: $targetHost"
Write-Output "  Forward origin: $forwardOrigin"

$env:RAYCAST_PROXY_PORT = $port
$env:RAYCAST_PROXY_HOST = $listenHost
$env:RAYCAST_PROXY_TARGET_HOST = $targetHost
$env:RAYCAST_PROXY_FORWARD_ORIGIN = $forwardOrigin
$env:RAYCAST_PROXY_BINARY = $BinaryPath

Start-Process -FilePath $BinaryPath -NoNewWindow -Wait

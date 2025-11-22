class RaycastProxy < Formula
  desc "WebSocket proxy for Raycast browser extension"
  homepage "https://github.com/Yukaii/raycast-context-bridge"
  version "1.0.0"
  license "MIT"

  on_macos do
    if Hardware::CPU.arm?
      url "https://github.com/Yukaii/raycast-context-bridge/releases/download/v1.0.0/raycast-proxy-darwin-arm64"
      sha256 "814e13b5e65770bd3571c07624f30140ba0538c0bdac55b4a720dec5aef26e87"
    else
      url "https://github.com/Yukaii/raycast-context-bridge/releases/download/v1.0.0/raycast-proxy-darwin-amd64"
      sha256 "fe8eecfabeb73d93a194e593fd57485f9c4f77cda5888178f5e94b32cda93256"
    end
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/Yukaii/raycast-context-bridge/releases/download/v1.0.0/raycast-proxy-linux-arm64"
      sha256 "fc92a3415bb0153aeb237cab2cad5e4279b359319dc309c5dc9c4774b7dfbdd5"
    else
      url "https://github.com/Yukaii/raycast-context-bridge/releases/download/v1.0.0/raycast-proxy-linux-amd64"
      sha256 "c4e08cfa3e13b9539d25442796fdbebf37c276dda4ad196d77a843a164fcca3b"
    end
  end

  def install
    bin.install Dir["raycast-proxy-*"].first => "raycast-proxy"
  end

  def caveats
    <<~EOS
      To start the Raycast proxy server:
        raycast-proxy

      The proxy will listen on http://127.0.0.1:8787 by default.

      Configuration options (via environment variables or flags):
        RAYCAST_PROXY_HOST / --listen-host: Host to listen on (default: 127.0.0.1)
        RAYCAST_PROXY_PORT / --listen-port: Port to listen on (default: 8787)
        RAYCAST_PROXY_TARGET_HOST / --target-host: Raycast host to connect to (default: 127.0.0.1)
        RAYCAST_PROXY_FORWARD_ORIGIN / --forward-origin: Origin header forwarded to Raycast

      Example:
        raycast-proxy --listen-port 9999
        RAYCAST_PROXY_PORT=9999 raycast-proxy

      To run as a background service on macOS:
        brew services start raycast-proxy

      For more information, visit:
        https://github.com/Yukaii/raycast-context-bridge
    EOS
  end

  service do
    run [opt_bin/"raycast-proxy"]
    keep_alive true
    log_path var/"log/raycast-proxy.log"
    error_log_path var/"log/raycast-proxy.log"
    working_dir var
  end

  test do
    # Test that the binary exists and can show help
    assert_match "Usage", shell_output("#{bin}/raycast-proxy --help 2>&1", 2)
  end
end

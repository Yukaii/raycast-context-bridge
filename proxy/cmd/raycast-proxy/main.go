package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
)

const (
	defaultListenHost    = "127.0.0.1"
	defaultListenPort    = 8787
	defaultTargetHost    = "127.0.0.1"
	defaultForwardOrigin = "chrome-extension://raycast-proxy"
)

var (
	listenHostFlag    = flag.String("listen-host", getenv("RAYCAST_PROXY_HOST", defaultListenHost), "Host to listen on")
	listenPortFlag    = flag.Int("listen-port", getenvInt("RAYCAST_PROXY_PORT", defaultListenPort), "Port to listen on")
	targetHostFlag    = flag.String("target-host", getenv("RAYCAST_PROXY_TARGET_HOST", defaultTargetHost), "Raycast host to connect to")
	forwardOriginFlag = flag.String("forward-origin", getenv("RAYCAST_PROXY_FORWARD_ORIGIN", defaultForwardOrigin), "Origin header forwarded to Raycast")
)

var upgrader = websocket.Upgrader{
	CheckOrigin:       func(r *http.Request) bool { return true },
	EnableCompression: false,
}

var dialer = &websocket.Dialer{
	Proxy:             http.ProxyFromEnvironment,
	HandshakeTimeout:  5 * time.Second,
	EnableCompression: false,
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getenvInt(key string, fallback int) int {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.Atoi(value); err == nil {
			return parsed
		}
	}
	return fallback
}

func main() {
	flag.Parse()

	listenAddr := net.JoinHostPort(*listenHostFlag, fmt.Sprintf("%d", *listenPortFlag))

	server := &http.Server{
		Addr:         listenAddr,
		Handler:      http.HandlerFunc(handleProxy),
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		log.Printf("[proxy] listening on ws://%s/<7261-7265> (forwarding to %s with Origin %s)", listenAddr, *targetHostFlag, *forwardOriginFlag)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("proxy server failed: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = server.Shutdown(ctx)
}

func handleProxy(w http.ResponseWriter, r *http.Request) {
	targetPort, err := parsePortFromPath(r.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	clientConn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[proxy] failed to upgrade connection: %v", err)
		return
	}

	targetURL := fmt.Sprintf("ws://%s:%d", *targetHostFlag, targetPort)
	headers := http.Header{}
	headers.Set("Origin", *forwardOriginFlag)

	upstreamConn, _, err := dialer.Dial(targetURL, headers)
	if err != nil {
		log.Printf("[proxy] failed to connect to raycast %s: %v", targetURL, err)
		_ = clientConn.Close()
		return
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	go bridge(ctx, clientConn, upstreamConn, cancel)
	go bridge(ctx, upstreamConn, clientConn, cancel)

	<-ctx.Done()

	_ = clientConn.Close()
	_ = upstreamConn.Close()
}

func parsePortFromPath(path string) (int, error) {
	trimmed := strings.TrimPrefix(path, "/")
	if trimmed == "" {
		return 0, fmt.Errorf("missing target port")
	}
	port, err := strconv.Atoi(trimmed)
	if err != nil {
		return 0, fmt.Errorf("invalid target port")
	}
	return port, nil
}

func bridge(ctx context.Context, src, dest *websocket.Conn, cancel context.CancelFunc) {
	defer cancel()
	for {
		select {
		case <-ctx.Done():
			return
		default:
			mt, data, err := src.ReadMessage()
			if err != nil {
				return
			}
			if err := dest.WriteMessage(mt, data); err != nil {
				return
			}
		}
	}
}

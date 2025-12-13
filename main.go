package main

import (
	"embed"
	"flag"
	"fmt"
	"io/fs"
	"net"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"strings"
	"time"
)

// 使用 go:embed 强制将 docs 文件夹及其所有内容打包进二进制文件
//go:embed docs/*
var content embed.FS

func main() {
	// --- 1. 命令行参数配置 ---
	// 定义 -port 参数，默认为 0（自动分配）
	portPtr := flag.Int("port", 0, "指定运行端口 (例如: 8080)，不指定则自动分配可用端口")
	flag.Parse()

	// --- 2. 静态资源处理 ---
	// 获取 docs 子目录的文件系统句柄
	distFS, err := fs.Sub(content, "docs")
	if err != nil {
		fmt.Printf("❌ 错误: 无法访问嵌入的 docs 目录: %v\n", err)
		return
	}

	fileServer := http.FileServer(http.FS(distFS))

	// 自定义路由处理：支持静态文件和 SPA (单页应用) 回退
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// 移除路径前缀的斜杠
		path := strings.TrimPrefix(r.URL.Path, "/")

		// 尝试打开文件
		f, err := distFS.Open(path)
		if err != nil {
			// 如果文件不存在（或者是访问根目录），则回退到 index.html
			// 这是为了支持 Vue Router 的 History 模式
			indexData, err := fs.ReadFile(distFS, "index.html")
			if err != nil {
				http.Error(w, "Index.html not found in embedded docs", http.StatusNotFound)
				return
			}
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			http.ServeContent(w, r, "index.html", time.Now(), strings.NewReader(string(indexData)))
			return
		}
		f.Close()

		// 如果文件存在，使用标准文件服务器响应
		fileServer.ServeHTTP(w, r)
	})

	// --- 3. 端口监听逻辑 ---
	addr := fmt.Sprintf("0.0.0.0:%d", *portPtr)
	listener, err := net.Listen("tcp", addr)
	if err != nil {
		fmt.Printf("❌ 错误: 端口 %d 已被占用或监听失败: %v\n", *portPtr, err)
		// 停留 5 秒让用户看到错误信息
		time.Sleep(5 * time.Second)
		os.Exit(1)
	}

	actualPort := listener.Addr().(*net.TCPAddr).Port
	localUrl := fmt.Sprintf("http://localhost:%d", actualPort)
	lanUrl := fmt.Sprintf("http://%s:%d", getLocalIp(), actualPort)

	// --- 4. 控制台信息展示 ---
	fmt.Println("=======================================")
	fmt.Printf("🚀 OGame 服务启动成功！\n")
	fmt.Printf("📅 启动时间: %s\n", time.Now().Format("2006-01-02 15:04:05"))
	fmt.Printf("🔗 本地访问: %s\n", localUrl)
	fmt.Printf("🌐 局域网访问: %s\n", lanUrl)
	if *portPtr != 0 {
		fmt.Printf("📌 运行模式: 固定端口 (%d)\n", *portPtr)
	} else {
		fmt.Printf("🎲 运行模式: 自动分配端口\n")
	}
	fmt.Println("=======================================")
	fmt.Println("💡 提示: 请勿关闭此控制台窗口，否则服务将停止。")
	fmt.Println("--- 实时访问日志 ---")

	// --- 5. 自动打开浏览器并启动服务 ---
	go openBrowser(localUrl)

	err = http.Serve(listener, nil)
	if err != nil {
		fmt.Printf("❌ 服务运行异常: %v\n", err)
	}
}

// 获取本机局域网 IP
func getLocalIp() string {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "localhost"
	}
	for _, address := range addrs {
		if ipnet, ok := address.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String()
			}
		}
	}
	return "localhost"
}

// 根据不同操作系统自动打开默认浏览器
func openBrowser(url string) {
	var cmd string
	var args []string

	switch runtime.GOOS {
	case "windows":
		cmd = "cmd"
		args = []string{"/c", "start", url}
	case "darwin":
		cmd = "open"
		args = []string{url}
	default: // linux
		cmd = "xdg-open"
		args = []string{url}
	}

	_ = exec.Command(cmd, args...).Start()
}
const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');


// Bun 会自动嵌入整个 docs 目录下所有文件（包括 assets/ 里的 js、css、图片等）
import "./docs/index.html";

const app = express();

function openUrl(url) {
    const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start ""' : 'xdg-open';
    exec(`${start} "${url}"`);
}

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}

// 静态资源服务（现在能正常工作了！）
app.use(async (req, res, next) => {
    let requestedPath = req.path;

    // 根路径处理
    if (requestedPath === '/' || requestedPath === '') {
        requestedPath = '/index.html';
    }

    const filePath = "./docs" + requestedPath;
    const file = Bun.file(filePath);
    const exists = await file.exists();

    if (exists) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 设置正确的 Content-Type
        const type = file.type || 'application/octet-stream';
        res.setHeader('Content-Type', type);

        res.send(buffer);
    } else {
        // SPA fallback
        const indexFile = Bun.file("./docs/index.html");
        const arrayBuffer = await indexFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'text/html');
        res.send(buffer);
    }
});

const server = app.listen(0, '0.0.0.0', () => {
    const { port } = server.address();
    const url = `http://localhost:${port}`;
    const lanUrl = `http://${getLocalIp()}:${port}`;

    console.log("-----------------------------------");
    console.log(`🚀 OGame 程序已启动！`);
    console.log(`🔗 本地访问: ${url}`);
    console.log(`🌐 局域网访问: ${lanUrl}`);
    console.log("-----------------------------------");
    console.log("提示: 关闭此窗口将停止服务。");

    openUrl(url);
});
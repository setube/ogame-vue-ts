const express = require('express');
const path = require('node:path');
const open = require('open');
const os = require('node:os');

const app = express();
const HOST = '0.0.0.0';

app.set('trust proxy', true);
// 指向 Vue 构建后的 dist 目录
app.use(express.static(path.join(process.cwd(), 'dist')));

const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (let devName in interfaces) {
        let face = interfaces[devName];
        for (let i = 0; i < face.length; i++) {
            let alias = face[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return 'localhost';
}
const server = app.listen(0, HOST, async () => {
    const { port } = server.address();

    const url = `http://localhost:${port}`;

    console.log('-----------------------------------');
    console.log(`🚀 服务器已成功启动！`);
    console.log(`🔗 本地地址: ${url}`);
    console.log(`🌐 默认允许局域网访问：http://${getLocalIp()}:${port}`);
    console.log('-----------------------------------');
    console.log('提示: 关闭此控制台窗口将停止服务。');

    // 3. 自动打开浏览器
    try {
        await open(url);
    } catch (err) {
        console.error('无法自动打开浏览器:', err);
    }
});
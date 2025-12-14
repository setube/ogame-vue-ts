import { BrowserWindow, app } from "electron";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
app.whenReady().then(() => {
	let i = dirname(fileURLToPath(import.meta.url)), a = new BrowserWindow({
		title: "OGame",
		icon: path.join(i, "../public/favicon.ico"),
		width: 1200,
		height: 800
	});
	a.setMenu(null), process.env.VITE_DEV_SERVER_URL ? a.loadURL(process.env.VITE_DEV_SERVER_URL) : a.loadFile("docs/index.html");
});

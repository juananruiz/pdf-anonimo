const { app, BrowserWindow } = require("electron");
const path = require("path");

const isDev = !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL || "http://localhost:5173";

function createWindow() {
	const win = new BrowserWindow({
		width: 1280,
		height: 800,
		minWidth: 1024,
		minHeight: 768,
		title: "PDF Anónimo",
		webPreferences: {
			preload: path.join(__dirname, "preload.cjs"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	if (isDev) {
		win.loadURL(devServerUrl);
	} else {
		win.loadFile(path.join(__dirname, "../dist/index.html"));
	}
}

app.whenReady().then(() => {
	createWindow();
	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

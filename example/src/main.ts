import { app, BrowserWindow } from "electron";
import path from "path";
import { connectRendererToMain, createMainToRendererProxy } from "electron-ipc-proxy-light/lib/main";
import { MethodsContract, EventsContract } from "./shared";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // IPC
  // create class for handling all methods
  class Methods implements MethodsContract {
    public ping(argument: string) {
      return "pong: " + argument;
    }
  }

  // create instance and connect to the renderer. So the renderer can invoke methods on that instance
  let methods = new Methods();
  connectRendererToMain({ instance: methods });

  setTimeout(() => {
    // and to emit events to the renderer, we create this proxy here for your interface
    console.log("Emit event here");
    let proxy = createMainToRendererProxy<EventsContract>({ webContents: (mainWindow.webContents as any), channelPrefix: 'ipc' });
    proxy.onSomething("Hello from Main");
  }, 1000);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

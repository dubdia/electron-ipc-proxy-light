"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expose = expose;
const electron_1 = require("electron");
/** exposes ipcRenderer methods "in the main world". Call this method in the preload.js to enable IPC calls */
function expose() {
    electron_1.contextBridge.exposeInMainWorld("api", {
        /*on(...args: Parameters<typeof ipcRenderer.on>) {
                const [channel, listener] = args;
                return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
            },
            off(...args: Parameters<typeof ipcRenderer.off>) {
                const [channel, ...omit] = args;
                return ipcRenderer.off(channel, ...omit);
            },
            send(...args: Parameters<typeof ipcRenderer.send>) {
                const [channel, ...omit] = args;
                return ipcRenderer.send(channel, ...omit);
            },*/
        invoke(...args) {
            const [channel, ...omit] = args;
            return electron_1.ipcRenderer.invoke(channel, ...omit);
        },
    });
}

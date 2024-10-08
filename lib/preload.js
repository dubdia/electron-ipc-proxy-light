"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expose = expose;
const electron_1 = require("electron");
/** exposes ipcRenderer methods "in the main world". Call this method in the preload.js to enable IPC calls */
function expose() {
    electron_1.contextBridge.exposeInMainWorld(channelName, {
        on(...args) {
            const [channel, listener] = args;
            return electron_1.ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
        },
        off(...args) {
            const [channel, ...omit] = args;
            return electron_1.ipcRenderer.off(channel, ...omit);
        },
        send(...args) {
            const [channel, ...omit] = args;
            return electron_1.ipcRenderer.send(channel, ...omit);
        },
        invoke(...args) {
            const [channel, ...omit] = args;
            return electron_1.ipcRenderer.invoke(channel, ...omit);
        },
    });
}

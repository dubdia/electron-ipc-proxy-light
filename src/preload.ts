


import { contextBridge, ipcRenderer } from "electron";

/** exposes ipcRenderer methods "in the main world". Call this method in the preload.js to enable IPC calls */
export function expose() {
  contextBridge.exposeInMainWorld("api", {
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
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
      const [channel, ...omit] = args;
      return ipcRenderer.invoke(channel, ...omit);
    },
  });
}

// create strongly typed window.api that can be used in the renderer to access IPC commands
declare global {
  interface Window {
    api: typeof ipcRenderer;
  }
}

import { ipcRenderer } from "electron";
/** exposes ipcRenderer methods "in the main world". Call this method in the preload.js to enable IPC calls */
export declare function expose(): void;
declare global {
    interface Window {
        api: typeof ipcRenderer;
    }
}

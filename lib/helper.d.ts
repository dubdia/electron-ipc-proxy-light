/** returns valid ipc method names for given instance */
declare function getIpcMethodNames<T>(instance: T): (keyof T)[];
/** prefix of the ipc channel */
declare const channelName = "ipcProxyLight";

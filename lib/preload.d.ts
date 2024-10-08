/**
 * call this method in the renderer.
 * connects the `ipcRenderer` to given class instance so that whenever the `ipcMain` emits on a method,
 * that method will be called on given `instance`
 * @param ipcRenderer instance of the ipcRenderer from electron
 * @param instance instance of the same interface that was used in `createMainToRendererProxy`
 * @param channelPrefix used to prefix the IPC channel
 */
export declare function connectMainToRenderer<T>(ipcRenderer: {
    on(channel: string, listener: (event: any, ...args: any[]) => void): any;
}, instance: T, channelPrefix?: string): void;
/**
 * call this method in the main.
 * connects the `ipcMain` to given class instance so that whenever the `ipcRenderer` invokes a method,
 * that method will be called on given `instance`
 * @param instance instance of the same interface that was used in `createRendererToMainProxy`
 * @param channelPrefix used to prefix the IPC channel
 */
export declare function connectRendererToMain<T>({ instance, channelPrefix, }: {
    instance: T;
    channelPrefix?: string;
}): void;
/**
 * call this method in the main.
 * creates an instance of a proxy class for given interface.
 * All methods of the interface are callable on the proxy instance.
 * The calls will be sent to the renderer via the `ipcMain.emit` method.
 * @param channelPrefix used to prefix the IPC channel
 * @example
 * //in shared code:
 * interface IEvents {
 *  onSomething: (argument: string) => void;
 * }
 * // in renderer:
 * class EventHandler implements IEvents {
 *   onSomething(argument: string) {
 *       console.log('onSomething has been called in renderer', argument);
 *   }
 * }
 * // in main:
 * var mainToRenderer = createMainToRendererProxy<IEvents>();
 * onSomething.onClose("Hello from Main");
 */
export declare function createMainToRendererProxy<T>({ channelPrefix }?: {
    channelPrefix?: string;
}): T;
/**
 * call this method in the renderer.
 * creates an instance of a proxy class for given interface.
 * All methods of the interface are callable on the proxy instance.
 * The calls will be sent to the main via the `ipcRenderer.invoke` method
 * @param channelPrefix used to prefix the IPC channel
 * @example
 * // in shared code:
 * interface IMethods {
 *   ping: (argument: string) => string;
 * }
 * // in main code:
 * class Methods implements IMethods {
 *   public ping(argument: string) {
 *     return "pong: " + argument;
 *   }
 * }
 * // in renderer:
 * var rendererToMain = createRendererToMainProxy<IMethods>();
 * let response = await rendererToMain.ping("this is a message from the renderer");
 */
export declare function createRendererToMainProxy<TMethods>({ channelPrefix, }?: {
    channelPrefix?: string;
}): PromisifyMethods<TMethods>;
import { ipcRenderer } from "electron";
/** exposes ipcRenderer methods "in the main world". Call this method in the preload.js to enable IPC calls */
export declare function expose(): void;
/** helper type that wraps the return types of functions inside a promise */
export type PromisifyMethods<T> = {
    [P in keyof T]: T[P] extends (...args: infer Args) => infer R ? (...args: Args) => Promise<R> : never;
};
declare global {
    interface Window {
        api: typeof ipcRenderer;
    }
}

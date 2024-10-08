import { ipcMain } from "electron";

/**
 * call this method in the renderer.
 * connects the `ipcRenderer` to given class instance so that whenever the `ipcMain` emits on a method,
 * that method will be called on given `instance`
 * @param ipcRenderer instance of the ipcRenderer from electron
 * @param instance instance of the same interface that was used in `createMainToRendererProxy`
 * @param channelPrefix used to prefix the IPC channel
 */
export function connectMainToRenderer<T>(
  ipcRenderer: { on(channel: string, listener: (event: any, ...args: any[]) => void): any },
  instance: T,
  channelPrefix: string = "ipc"
) {
  const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)) as (keyof T)[];
  methodNames.forEach((methodName) => {
    if (typeof instance[methodName] === "function") {
      ipcRenderer.on(`${channelPrefix}:${String(methodName)}`, async (event, ...args) => {
        // Using apply to call the method on the instance with the provided arguments
        return (instance[methodName] as any).apply(instance, args);
      });
    }
  });
}

/**
 * call this method in the main.
 * connects the `ipcMain` to given class instance so that whenever the `ipcRenderer` invokes a method,
 * that method will be called on given `instance`
 * @param instance instance of the same interface that was used in `createRendererToMainProxy`
 * @param channelPrefix used to prefix the IPC channel
 */
export function connectRendererToMain<T>({
  instance,
  channelPrefix = "ipc",
}: {
  instance: T;
  channelPrefix?: string;
}): void {
  const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)) as (keyof T)[];
  methodNames.forEach((methodName) => {
    if (typeof instance[methodName] === "function") {
      ipcMain.handle(`${channelPrefix}:${String(methodName)}`, async (event, ...args) => {
        // using apply to call the method on the instance with the provided arguments
        return (instance[methodName] as any).apply(instance, args);
      });
    }
  });
}

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
export function createMainToRendererProxy<T>({ channelPrefix = "ipc" }: { channelPrefix?: string } = {}): T {
  return new Proxy(
    {},
    {
      get: (target, propKey, receiver) => {
        if (typeof propKey === "string" && !(propKey in target)) {
          return (...args: any[]) => {
            // This returns a promise, assuming ipcRenderer.invoke is setup correctly in your main process
            return ipcMain.emit(`${channelPrefix}:${propKey}`, ...args);
            //console.log(`Main to Renderer => ${channelPrefix}:${propKey}`, ...args);
          };
        }
        return Reflect.get(target, propKey, receiver);
      },
    }
  ) as unknown as T;
}

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
export function createRendererToMainProxy<TMethods>({
  channelPrefix = "ipc",
}: { channelPrefix?: string } = {}): PromisifyMethods<TMethods> {
  return new Proxy(
    {},
    {
      get: (target, propKey, receiver) => {
        if (typeof propKey === "string" && !(propKey in target)) {
          return (...args: any[]) => {
            // This returns a promise, assuming ipcRenderer.invoke is setup correctly in your main process
            return window.api.invoke(`${channelPrefix}:${propKey}`, ...args);
            //console.log(`Renderer to Main => ${channelPrefix}:${propKey}`, ...args);
          };
        }
        return Reflect.get(target, propKey, receiver);
      },
    }
  ) as unknown as PromisifyMethods<TMethods>;
}

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

/** helper type that wraps the return types of functions inside a promise */
export type PromisifyMethods<T> = {
  [P in keyof T]: T[P] extends (...args: infer Args) => infer R ? (...args: Args) => Promise<R> : never;
};

// create strongly typed window.api that can be used in the renderer to access IPC commands
declare global {
  interface Window {
    api: typeof ipcRenderer;
  }
}

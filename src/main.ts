import { ipcMain, WebContents } from "electron";

/**
 * call this method in the main.
 * connects the `ipcMain` to given class instance so that whenever the `ipcRenderer` invokes a method,
 * that method will be called on given `instance`
 * @param instance instance of the same interface that was used in `createRendererToMainProxy`
 */
export function connectRendererToMain<T>(instance: T): void {
  const methodNames = getIpcMethodNames(instance);
  methodNames.forEach((methodName) => {
    if (typeof instance[methodName] === "function") {
      ipcMain.handle(`${channelName}:${String(methodName)}`, async (event, ...args) => {
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
export function createMainToRendererProxy<T>(webContents: WebContents): T {
  return new Proxy(
    {},
    {
      get: (target, propKey, receiver) => {
        if (typeof propKey === "string" && !(propKey in target)) {
          return (...args: any[]) => {
            console.log(`Main to Renderer => ${channelName}:${propKey}`, ...args);
            return webContents.send(`${channelName}:${propKey}`, ...args);
          };
        }
        return Reflect.get(target, propKey, receiver);
      },
    }
  ) as unknown as T;
}

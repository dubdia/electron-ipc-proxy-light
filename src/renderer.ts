/**
 * call this method in the renderer.
 * connects the `ipcRenderer` to given class instance so that whenever the `ipcMain` emits on a method,
 * that method will be called on given `instance`
 * @param ipcRenderer instance of the ipcRenderer from electron
 * @param instance instance of the same interface that was used in `createMainToRendererProxy`
 * @param channelPrefix used to prefix the IPC channel
 */
export function connectMainToRenderer<T>({ instance, channelPrefix = "ipc" }: { instance: T; channelPrefix?: string }) {
  const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)) as (keyof T)[];
  console.log("connectMainToRenderer", methodNames, instance, Object.getPrototypeOf(instance));
  methodNames.forEach((methodName) => {
    if (typeof instance[methodName] === "function") {
      const id = `${channelPrefix}:${String(methodName)}`;
      console.log("connectMainToRenderer listen to", id);
      window.api.on(id, async (event, ...args) => {
        // Using apply to call the method on the instance with the provided arguments
        console.log("connectMainToRenderer invoke", methodName, args);
        return (instance[methodName] as any).apply(instance, args);
      });
    }
  });
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
            console.log(`Renderer to Main => ${channelPrefix}:${propKey}`, ...args);
            return window.api.invoke(`${channelPrefix}:${propKey}`, ...args);
          };
        }
        return Reflect.get(target, propKey, receiver);
      },
    }
  ) as unknown as PromisifyMethods<TMethods>;
}

/** helper type that wraps the return types of functions inside a promise */
export type PromisifyMethods<T> = {
  [P in keyof T]: T[P] extends (...args: infer Args) => infer R ? (...args: Args) => Promise<R> : never;
};

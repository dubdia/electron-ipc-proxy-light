"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectMainToRenderer = connectMainToRenderer;
exports.createRendererToMainProxy = createRendererToMainProxy;
/**
 * call this method in the renderer.
 * connects the `ipcRenderer` to given class instance so that whenever the `ipcMain` emits on a method,
 * that method will be called on given `instance`
 * @param ipcRenderer instance of the ipcRenderer from electron
 * @param instance instance of the same interface that was used in `createMainToRendererProxy`
 */
function connectMainToRenderer(instance) {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
    console.log("connectMainToRenderer", methodNames, instance, Object.getPrototypeOf(instance));
    methodNames.forEach((methodName) => {
        if (typeof instance[methodName] === "function") {
            const id = `${channelName}:${String(methodName)}`;
            console.log("connectMainToRenderer listen to", id);
            window.ipcProxyLight.on(id, (event, ...args) => __awaiter(this, void 0, void 0, function* () {
                // Using apply to call the method on the instance with the provided arguments
                console.log("connectMainToRenderer invoke", methodName, args);
                return instance[methodName].apply(instance, args);
            }));
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
function createRendererToMainProxy() {
    return new Proxy({}, {
        get: (target, propKey, receiver) => {
            if (typeof propKey === "string" && !(propKey in target)) {
                return (...args) => {
                    // This returns a promise, assuming ipcRenderer.invoke is setup correctly in your main process
                    console.log(`Renderer to Main => ${channelName}:${propKey}`, ...args);
                    return window.ipcProxyLight.invoke(`${channelName}:${propKey}`, ...args);
                };
            }
            return Reflect.get(target, propKey, receiver);
        },
    });
}

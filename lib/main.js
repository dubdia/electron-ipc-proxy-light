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
exports.connectRendererToMain = connectRendererToMain;
exports.createMainToRendererProxy = createMainToRendererProxy;
const electron_1 = require("electron");
/**
 * call this method in the main.
 * connects the `ipcMain` to given class instance so that whenever the `ipcRenderer` invokes a method,
 * that method will be called on given `instance`
 * @param instance instance of the same interface that was used in `createRendererToMainProxy`
 * @param channelPrefix used to prefix the IPC channel
 */
function connectRendererToMain({ instance, channelPrefix = "ipc", }) {
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(instance));
    methodNames.forEach((methodName) => {
        if (typeof instance[methodName] === "function") {
            electron_1.ipcMain.handle(`${channelPrefix}:${String(methodName)}`, (event, ...args) => __awaiter(this, void 0, void 0, function* () {
                // using apply to call the method on the instance with the provided arguments
                return instance[methodName].apply(instance, args);
            }));
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
function createMainToRendererProxy({ webContents, channelPrefix = "ipc", }) {
    return new Proxy({}, {
        get: (target, propKey, receiver) => {
            if (typeof propKey === "string" && !(propKey in target)) {
                return (...args) => {
                    // This returns a promise, assuming ipcRenderer.invoke is setup correctly in your main process
                    console.log(`Main to Renderer => ${channelPrefix}:${propKey}`, ...args);
                    return webContents.emit(`${channelPrefix}:${propKey}`, ...args);
                };
            }
            return Reflect.get(target, propKey, receiver);
        },
    });
}

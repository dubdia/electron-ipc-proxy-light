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
 */
function connectRendererToMain(instance) {
    const methodNames = getIpcMethodNames(instance);
    methodNames.forEach((methodName) => {
        if (typeof instance[methodName] === "function") {
            electron_1.ipcMain.handle(`${channelName}:${String(methodName)}`, (event, ...args) => __awaiter(this, void 0, void 0, function* () {
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
function createMainToRendererProxy(webContents) {
    return new Proxy({}, {
        get: (target, propKey, receiver) => {
            if (typeof propKey === "string" && !(propKey in target)) {
                return (...args) => {
                    console.log(`Main to Renderer => ${channelName}:${propKey}`, ...args);
                    return webContents.send(`${channelName}:${propKey}`, ...args);
                };
            }
            return Reflect.get(target, propKey, receiver);
        },
    });
}

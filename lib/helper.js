"use strict";
/** returns valid ipc method names for given instance */
function getIpcMethodNames(instance) {
    // check
    if (instance == null) {
        throw new Error("No instance given");
    }
    // get prototype (abstract base class) of instance
    const prototype = Object.getPrototypeOf(instance);
    if (prototype == null) {
        throw new Error("Given instance has no abstract base class it extends");
    }
    // get all methods names of that base class
    let methodNames = Object.getOwnPropertyNames(prototype);
    // now we filter out the invalid
    const reservedNames = [
        "constructor",
        "toString",
        "toLocaleString",
        "valueOf",
        "propertyIsEnumerable",
        "isPrototypeOf",
        "hasOwnProperty",
    ];
    methodNames = methodNames
        .filter((x) => x && x.toString() != "") // filter out empty
        .filter((x) => reservedNames.indexOf(x.toString()) >= 0) // filter reserved
        .filter((x) => !x.toString().startsWith("_")); // filter out internal
    return methodNames;
}
/** prefix of the ipc channel */
const channelName = 'ipcProxyLight';

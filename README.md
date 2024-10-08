# Electron typed IPC proxy
This package helps you to have a typed Inter-Process-Communication in your electron typescript application.
It supports method invocation from renderer to main.
It supports event emitation from main to renderer.

It uses the typescript `Proxy` feature under the hood.

# Example
### 1. Shared part / the contracts
In your shared code folder you create interface for the methods and the events:
```ts
// will be implemented in main. can be called from renderer
interface IMethods {
    ping: (argument: string) => string;
    ...
}

// will be implemented in renderer. can be called from main
interface IEvents {
    onSomething: (argument: string) => void;
    ...
}

```

Note that all methods in `IEvents` must return `void`

### 2. Renderer part
Implement this code in the renderer part of your application:
```ts
// create class for handling all events from main in the renderer
class EventHandler implements IEvents {
    onSomething(argument: string) {
        console.log('called in renderer', argument);
    }
}

// create instance and connect to main. So the main can emit methods and they get called here
const eventHandler = new EventHandler();
connectToMainToRenderer({ instance: eventHandler });

// create proxy to invoke methods from the interface on the main
let proxy = createRendererToMainProxy<IMethods>();
let response = await proxy.ping("test"); // => pong
```


### 3. Main part
Implement this code in the main part of your application:
```ts
// create class for handling all methods
class Methods implements IMethods {
    public ping(argument: string) {
        return "pong: " + argument;
    }
}

// create instance and connect to the renderer. So the renderer can invoke methods on that instance
let methods = new Methods();
connectRendererToMain({ instance: methods });

// and to emit events to the renderer, we create this proxy here for your interface
let proxy = createMainToRendererProxy<IEvents>();
proxy.onSomething("Hello from Main");
```



### 4. Preload.ts
At last, add this line in your preload.js. It will do the `contextBridge.exposeInMainWorld` call.
```ts
expose();
```



import "./index.css";
import { ipcRenderer } from "electron";
import { connectMainToRenderer, createRendererToMainProxy } from "./ipc/renderer";
console.log('👋 This message is being logged by "renderer.ts", included via Vite');

console.log('JO');
// create class for handling all events from main in the renderer
class EventHandler implements IEvents {
  onSomething(argument: string) {
    console.log("called in renderer", argument);
  }
}

// create instance and connect to main. So the main can emit methods and they get called here
const eventHandler = new EventHandler();
connectMainToRenderer({ instance: eventHandler });

// create proxy to invoke methods from the interface on the main

let proxy = createRendererToMainProxy<IMethods>();
proxy
  .ping("test")
  .then((r) => {
    console.log("ping response from main:", r);
  })
  .catch((e) => {
    console.error("error", e);
  });

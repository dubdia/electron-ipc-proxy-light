// will be used in main. can be called from renderer
export abstract class MethodsContract {
    abstract ping(argument: string): void;
}

// will be used in renderer. can be called from main
export abstract class EventsContract {
    abstract onSomething(argument: string): void;
}

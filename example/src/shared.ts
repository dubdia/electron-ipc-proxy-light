// will be implemented in main. can be called from renderer
interface IMethods {
    ping: (argument: string) => string;
}

// will be implemented in renderer. can be called from main
interface IEvents {
    onSomething: (argument: string) => void;
}

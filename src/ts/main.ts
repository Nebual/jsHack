const triggerManager = new TriggerManager(EVERYTHING.quests);
const terminal = new Terminal();
terminal.setFS(new RegexFileSystem('127.0.0.1', EVERYTHING.nodes['127.0.0.1'].files));
terminal.setTerm(($('#terminal_main') as any).terminal((input, term) => {
    terminal.handleInput(input)
}, {
    greetings: 'jsHack! A mystic adventure! jsHack! A quest for all time!',
    name: 'js_demo',
    height: 400,
    //exceptionHandler: (e) => {throw e;}, // This disables the builtin error display
    prompt: terminal.getPrompt
}));

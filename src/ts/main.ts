const terminal = new Terminal();
terminal.setFS(new RegexFileSystem(EVERYTHING.nodes['127.0.0.1'].files));
terminal.setTerm(($('#terminal_main') as any).terminal((input, term) => {
    terminal.handleInput(input)
}, {
    greetings: 'jsHack! A mystic adventure! jsHack! A quest for all time!',
    name: 'js_demo',
    height: 400,
    prompt: terminal.getPrompt
}));

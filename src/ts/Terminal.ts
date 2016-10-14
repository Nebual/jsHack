class Terminal {
    private term;
    private currentFS:RegexFileSystem;
    private currentUser:string = 'cell';
    private currentHost:string = 'home';

    setTerm(term) {
        this.term = term;
        this.updatePrompt();
    }

    setFS(fs:RegexFileSystem):void {
        this.currentFS = fs;
    }

    public handleInput(input:string) {
        if (input === '') {
            this.term.echo('');
            return;
        }

        const args = input.split(' ');
        const cmd = args[0].toLowerCase();
        if(this.isValidCommand(cmd)) {
            this[cmd](args);
        } else {
            this.echo(`Unknown command: ${cmd}`);
        }
    }

    public isValidCommand(name:string):boolean {
        if (!this[name]) return false;
        if (name !== name.toLowerCase()) return false;
        if (name === 'constructor') {
            return false;
        }
        return true;
    }

    help(args:string[]) {
        let ret = [];
        Object.getOwnPropertyNames(Object.getPrototypeOf(this)).map((name) => {
            if (this.isValidCommand(name)) {
                ret.push(name);
            }
        });
        this.echo(`Known commands: ${ret.sort().join(', ')}`);
    }

    echo(str:string|string[]) {
        if (typeof(str) === 'object') {
            let args = str as string[];
            args.shift();
            this.term.echo(args.join(' '));
        } else {
            this.term.echo(str);
        }
    }

    ls(args:string[]) {
        let files = this.currentFS.list_files(args[1]);
        this.echo(files.join('\n'));
    }

    cd(args:string[]) {
        this.currentFS.cd(args[1]);
        this.echo(this.currentFS.pwd());
        this.updatePrompt();
    }

    pwd(args:string[]) {
        this.echo(this.currentFS.pwd());
    }

    cat(args:string[]) {
        let result = '';
        try {
            result = this.currentFS.read(args[1]);
        } catch (e) {
            this.echo('cat: ' + e.message);
            return;
        }
        this.echo(result);
    }

    public setPromptUser(user:string):void {
        this.currentUser = user;
        this.currentFS.setUser(user);
        this.updatePrompt();
    }

    public setcurrentHost(host:string):void {
        this.currentHost = host;
        this.updatePrompt();
    }

    updatePrompt():void {
        this.term.set_prompt(this.getPrompt());
    }

    public getPrompt():string {
        let cwd = this.currentFS ? this.currentFS.pwd() : '~';
        cwd = cwd.replace(`\/home\/${this.currentUser}`, '~');
        if(cwd.length > 1) {
            cwd = cwd.substring(0, cwd.length - 1);
        }
        return `${this.currentUser}@${this.currentHost}:${cwd}> `;
    }
}

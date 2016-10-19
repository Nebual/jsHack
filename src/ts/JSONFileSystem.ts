class RegexFileSystem {
    private files:{[key: string]: JSONFile};
    private currentUser = 'cell';
    private cwd:string = '/home/cell/';
    private host:string = 'home';

    public constructor(host:string, files) {
        this.host = host;
        this.files = files;
    }
    public setUser(user:string):void {
        this.currentUser = 'cell';
    }

    public list_files(pathArg:string):string[] {
        let path = this.resolve_path(pathArg) + '/';
        let ret = [];
        Object.keys(this.files).forEach((key:string) => {
            if (key.indexOf(path) === 0) {
                let localPath = key.substring(path.length);
                let slashPos = localPath.indexOf('/');
                if (slashPos !== -1) {
                    localPath = localPath.substring(0, slashPos + 1);
                }
                ret.push(localPath);
            }
        });
        return ret.filter((v, i, a) => a.indexOf(v) === i);
    }

    private resolve_path(path:string):string {
        let resultPath = this.cwd;
        if (path) {
            let pathWords = path.split('/');
            if (pathWords[0] === '') {
                resultPath = '/';
                pathWords.shift();
            }
            if(pathWords[0] === '~') {
                resultPath = `/home/${this.currentUser}/`;
                pathWords.shift();
            }
            pathWords.map((chunk:string) => {
                if (chunk == '..') {
                    let cwd_words = resultPath.split('/');
                    if (cwd_words.length > 2) {
                        cwd_words.pop();
                        cwd_words.pop();
                        cwd_words.push('');
                        resultPath = cwd_words.join('/');
                    }
                } else if (chunk) {
                    resultPath += chunk + '/';
                }
            });
        }
        return resultPath.substring(0, resultPath.length - 1);
    }

    public cd(arg:string):void {
        this.cwd = this.resolve_path(arg) + '/';
    }

    public pwd():string {
        return this.cwd;
    }

    public read(pathArg:string):string {
        let path = this.resolve_path(pathArg);
        let file = this.files[path];
        if (file === undefined) {
            this.error(`${path}: File not found`);
            return '';
        }
        return file.read();
    }

    private error(msg:string):void {
        terminal.echo(msg);
    }
}

enum FILEFLAGS {
    BASE64 = 1,
    HAS_BEEN_READ = 2,
    HAS_BEEN_WRITTEN = 4,
}
class JSONFile {
    private host: string;
    private flags: number;
    private data;
    private path: string;

    static newFromObject(file, host): JSONFile {
        file.__proto__ = JSONFile.prototype;
        file.host = host;
        return file;
    }

    clone(path: string): JSONFile {
        let clone = shallowCopy(this);
        clone.move(path);
        return clone;
    }

    move(path: string) {
        this.path = path;
        this.flags &= ~FILEFLAGS.HAS_BEEN_READ;
        this.flags &= ~FILEFLAGS.HAS_BEEN_WRITTEN;
    }

    isRead(): boolean {
        return !!(this.flags & FILEFLAGS.HAS_BEEN_READ);
    }

    isWritten(): boolean {
        return !!(this.flags & FILEFLAGS.HAS_BEEN_WRITTEN);
    }

    isBase64(): boolean {
        return !!(this.flags & FILEFLAGS.BASE64);
    }

    read() {
        if (!this.isRead()) {
            // Only trigger onRead once
            this.flags |= FILEFLAGS.HAS_BEEN_READ;
            triggerManager.trigger('onRead', this.host + this.path);
        }
        let data = this.data;
        if (this.isBase64()) {
            data = atob(data);
        }
        return data;
    }

    write(data?) {
        if (data !== undefined) {
            if (this.isBase64()) {
                data = btoa(data);
            }
            this.data = data;
        }
        this.flags |= FILEFLAGS.HAS_BEEN_WRITTEN;
        triggerManager.trigger('onWrite', this.host + this.path);
    }
}
for(let nodeIP in EVERYTHING.nodes) {
    for(let path in EVERYTHING.nodes[nodeIP].files) {
        EVERYTHING.nodes[nodeIP].files[path] = JSONFile.newFromObject(EVERYTHING.nodes[nodeIP].files[path], nodeIP);
    }
}

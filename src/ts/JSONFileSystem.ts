class RegexFileSystem {
    private files;
    private currentUser = 'cell';
    private cwd:string = '/home/cell/';

    public constructor(files) {
        this.files = files;
    }
    public setUser(user:string):void {
        this.currentUser = 'cell';
    }

    public list_files(pathArg:string):string[] {
        let path = this.resolve_path(pathArg) + '/';
        console.log(path);
        let ret = [];
        Object.keys(this.files).map((key:string) => {
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
        console.log(2, resultPath);
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
        let fileContents = this.files[path];
        if (fileContents === undefined) {
            //if(this.files[path + '/']) {
            //    throw new IOError(`${path}/: Is a directory`);
            //} else {
                throw new IOError(`${path}: File not found`);
            //}
        }
        return fileContents;
    }
}

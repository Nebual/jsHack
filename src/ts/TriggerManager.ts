class TriggerManager {
    private quests;
    private gameStates = {}; // todo: put in better place

    public constructor(quests) {
        this.quests = quests;
    }
    public trigger(cmd, ...args) {
        for(let quest in this.quests) {
            this.quests[quest].conditions.forEach((condition) => {
                if(!this.quickCheckTrigger(condition.trigger, cmd, args)) return;
                if(!this.evalTrigger(condition.trigger, cmd, args)) return;
                condition.actions.map((action) => {
                    this.evalAction(action);
                });
            });
        }
    }
    protected quickCheckTrigger(trigger, cmd: string, eventArgs):boolean {
        // Find out if we actually need to do anything
        let [triggerCmd, ...triggerArgs] = trigger;
        if(triggerCmd == 'and') {
            return triggerArgs.some((val) => { // intentionally a some in the quickCheck
                return this.quickCheckTrigger(val, cmd, eventArgs);
            });
        } else if(triggerCmd == 'or') {
            return triggerArgs.some((val) => {
                return this.quickCheckTrigger(val, cmd, eventArgs);
            });
        } else if(triggerCmd == 'not') {
            // Not's cannot trigger events
            return false;
        } else if(triggerCmd == cmd) {
            if(triggerArgs.length > 0 && eventArgs[0] !== triggerArgs[0]) {
                return false;
            }
            // yay
            // todo: finer bits
            return true;
        }
        return false;
    }
    protected evalTrigger(trigger, cmd: string, eventArgs):boolean {
        let [triggerCmd, ...triggerArgs] = trigger;
        if(triggerCmd == 'and') {
            return triggerArgs.every((val) => {
                return this.evalTrigger(val, cmd, eventArgs);
            });
        } else if(triggerCmd == 'or') {
            return triggerArgs.some((val) => {
                return this.evalTrigger(val, cmd, eventArgs);
            });
        } else if(triggerCmd == 'not') {
            return !this.evalTrigger(triggerArgs, cmd, eventArgs);
        } else {
            if(triggerCmd === 'onWrite' || triggerCmd === 'onRead') {
                let node = triggerArgs[0].substr(0, triggerArgs[0].indexOf('/'));
                let restOfPath = triggerArgs[0].substr(triggerArgs[0].indexOf('/'));
                let file = EVERYTHING.nodes[node].files[restOfPath];
                if(!file) return false;
                if(triggerCmd === 'onWrite') {
                    return file.isWritten();
                } else if(triggerCmd === 'onRead') {
                    return file.isRead();
                }
            } else if(triggerCmd === 'onGameState') {
                if(triggerArgs.length > 1) {
                    return this.gameStates[triggerArgs[0]] == triggerArgs[1];
                } else if(triggerArgs[0] === cmd) {
                    return !!this.gameStates[triggerArgs[0]];
                }
            } else {
                console.log("Warning: Unimplemented evalTrigger", triggerCmd);
            }
        }
        return false;
    }
    protected evalAction(action):void {
        let [cmd, ...args] = action;
        if(!this[cmd]) {
            console.log("TM ERROR: Unknown command", cmd);
            return;
        }
        this[cmd](...args);
    }
    private msg(msg):void {
        setTimeout(() => {
            terminal.echo(msg);
        }, 0);
    }
    private gameState(id, val):void {
        this.gameStates[id] = val;
        this.trigger('onGameState', id, val);
    }
}

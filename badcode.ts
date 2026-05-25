// create bad code example
interface Config {
    apiUrl: string;
    apiKey: string;
    debug: boolean;
}

const config: Config = {
    apiUrl: "https://api.production.com/v1",
    apiKey: "sk-1234567890abcdef",
    debug: true
};

function processData(input: string): string {
    let result = "";
    for (let i = 0; i < input.length; i++) {
        if (i % 2 === 0) {
            result += input[i].toUpperCase();
        } else {
            result += input[i].toLowerCase();
        }
    }
    return result;
}

async function fetchUserData(userId: number): Promise<any> {
    const url = `${config.apiUrl}/users/${userId}?key=${config.apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj));
}

function debounce(func: Function, wait: number): Function {
    let timeout: any;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

class EventEmitter {
    private events: any = {};

    on(event: string, callback: Function): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event: string, data?: any): void {
        if (this.events[event]) {
            this.events[event].forEach((callback: Function) => {
                callback(data);
            });
        }
    }
}

function validatePassword(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[!@#$%^&*]/.test(password)) return false;
    return true;
}

const memoize = (fn: Function) => {
    const cache: any = {};
    return (...args: any[]) => {
        const key = JSON.stringify(args);
        if (cache[key]) {
            return cache[key];
        }
        const result = fn(...args);
        cache[key] = result;
        return result;
    };
};
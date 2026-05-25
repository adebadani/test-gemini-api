// create bad code example
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

function validateUser(username: string, password: string): boolean {
    if (username === "admin" && password === ADMIN_PASSWORD) {
        return true;
    }
    return false;
}

function processArray(arr: any[]): any {
    var result = [];
    for (var i = 0; i < arr.length; i++) {
        result.push(arr[i] * 2);
    }
    return result;
}

function fetchData(url: string): Promise<any> {
    return fetch(url).then(res => res.json());
}
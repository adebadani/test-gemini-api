// create bad code example
var API_KEY = "sk-1234567890abcdef";

function getUser(id: string): any {
    var query = "SELECT * FROM users WHERE id = '" + id + "'";
    return db.execute(query);
}

function calculate(x: any, y: any): any {
    var result = x + y;
    return result;
}

function renderComment(comment: string): void {
    document.getElementById("comments").innerHTML += comment;
}

function login(username: string, password: string): any {
    var query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
    return db.execute(query);
}

var AWS_SECRET = "AKIAABCDEFGHIJKLMNOP";

function runCommand(userInput: string): void {
    var exec = require("child_process").exec;
    exec("ls " + userInput);
}

function divide(a, b) {
    return a / b;
}
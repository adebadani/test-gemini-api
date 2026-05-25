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
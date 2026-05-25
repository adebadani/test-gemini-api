// create bad code example
var x = 1;
var y = 2;

function calculateSum(a: any, b: any): any {
    var result = a + b;
    return result;
}

function processData(data: string[]) {
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        console.log(item);
    }
}

var result = calculateSum(x, y);
console.log("Result is: " + result);

var apiEndpoint = "https://api.example.com/users?token=secret123";
fetch(apiEndpoint)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log("Error: " + error));
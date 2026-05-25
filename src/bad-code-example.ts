// Bad code example for testing code review workflow

// Security issue: Hardcoded credentials
const API_KEY = 'sk-1234567890abcdef';
const DB_PASSWORD = 'admin123';

// Security issue: SQL injection vulnerability
function getUserData(userId: string) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return database.execute(query);
}

// Code quality: Unused variables
const unusedVar = 'this is never used';
let anotherUnused = 42;

// Code quality: Poor naming conventions
const d = new Date();
const x = 5;
const y = 10;

// Performance issue: Inefficient loop
function findUser(users: any[], id: number) {
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      return users[i];
    }
  }
}

// Performance issue: Memory leak - event listener not removed
function setupButton() {
  document.getElementById('button')?.addEventListener('click', () => {
    console.log('clicked');
  });
}

// Code quality: No error handling
function divide(a: number, b: number) {
  return a / b;
}

// Security issue: eval usage
const dangerousCode = 'console.log("hello")';
eval(dangerousCode);

// Code quality: Magic numbers
function calculateDiscount(price: number) {
  if (price > 100) {
    return price * 0.15;
  }
  return price * 0.05;
}

// Code quality: Too many parameters
function createUser(name: string, email: string, age: number, address: string, phone: string, role: string, department: string) {
  // implementation
}

// Security issue: XSS vulnerability
function renderUserInput(input: string) {
  return '<div>' + input + '</div>';
}

// Performance issue: Synchronous file operations
const fs = require('fs');
const data = fs.readFileSync('large-file.json');

// Code quality: Duplicate code
function calculateAreaCircle(radius: number) {
  return 3.14159 * radius * radius;
}

function calculateAreaSphere(radius: number) {
  return 4 * 3.14159 * radius * radius;
}

// Code quality: Missing types
function processData(data: any) {
  return data.map((item: any) => item.value * 2);
}

// No tests provided for any of these functions

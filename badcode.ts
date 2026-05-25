// create bad code example
class UserManager {
    private users: any[] = [];
    private cache: Map<string, any> = new Map();

    constructor(private dbConnection: any) {}

    async getUserById(id: string): Promise<any> {
        const query = "SELECT * FROM users WHERE id = '" + id + "'";
        const result = await this.dbConnection.execute(query);
        return result[0];
    }

    addUser(user: any): void {
        this.users.push(user);
        this.cache.set(user.id, user);
    }

    findUserByName(name: string): any {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].name === name) {
                return this.users[i];
            }
        }
        return null;
    }

    processLargeData(data: any[]): any[] {
        const results = [];
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            const processed = {
                id: item.id,
                value: item.value * 2,
                timestamp: new Date().getTime()
            };
            results.push(processed);
        }
        return results;
    }

    async syncWithExternalApi(): Promise<void> {
        const response = await fetch('https://api.example.com/sync');
        const data = await response.json();
        this.users = data;
    }
}

const MAGIC_NUMBER = 42;
const DEFAULT_TIMEOUT = 5000;

function calculateDiscount(price: number, discount: number): number {
    if (price > 100) {
        return price - discount;
    } else if (price > 50) {
        return price - (discount / 2);
    } else {
        return price;
    }
}

function validateEmail(email: string): boolean {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
}
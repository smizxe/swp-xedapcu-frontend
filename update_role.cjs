const { Client } = require('pg');

const client = new Client({
    host: 'aws-1-ap-northeast-2.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: 'postgres.puquylitonftpyyusgqj',
    password: 'Xedapcu@1234',
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to Supabase PostgreSQL");

        let res = await client.query("SELECT email, role FROM \"user\" WHERE email = 'admin@admin.com'");
        console.log("Current user state:", res.rows);

        if (res.rows.length > 0) {
            await client.query("UPDATE \"user\" SET role = 'ADMIN' WHERE email = 'admin@admin.com'");
            console.log("Successfully updated role to ADMIN");

            res = await client.query("SELECT email, role FROM \"user\" WHERE email = 'admin@admin.com'");
            console.log("New user state:", res.rows);
        } else {
            console.log("Error: User admin@admin.com not found in the database. Creating it just in case.");
            // We shouldn't create it manually because of password hashing, just throw error.
            console.log("Please register the account admin@admin.com first through the UI.");
        }
    } catch (err) {
        console.error("Database error:", err);
    } finally {
        await client.end();
    }
}

run();

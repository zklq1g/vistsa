const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Creating Trial MOD Account ---');

    try {
        const username = 'MOD1';
        const password = '123456';
        const hashedPassword = await bcrypt.hash(password, 12);

        // Check if exists
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
            console.log('Trial account MOD1 already exists. Updating password...');
            await prisma.user.update({
                where: { username },
                data: { password: hashedPassword, role: 'MOD', displayName: 'trial mod' }
            });
        } else {
            await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    displayName: 'trial mod',
                    role: 'MOD'
                }
            });
            console.log('Trial account created: username: MOD1, password: 123456');
        }

        console.log('--- Success ---');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

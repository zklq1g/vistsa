const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await prisma.user.upsert({
        where: { username: 'testuser' },
        update: { password: hashedPassword },
        create: {
            username: 'testuser',
            email: 'testuser@vista.com',
            password: hashedPassword,
            displayName: 'Test User',
            role: 'MEMBER',
        },
    });
    console.log('✅ Test user created: testuser / password123');
}

main().finally(() => prisma.$disconnect());

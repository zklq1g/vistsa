const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database User Reset Script ---');

    try {
        // 1. Wipe all users
        // Cascading deletes in schema.prisma will handle related data (LeaderboardEntry, ProjectMember, etc.)
        console.log('Deleting all existing users...');
        const deleteCount = await prisma.user.deleteMany();
        console.log(`Successfully deleted ${deleteCount.count} users.`);

        // 2. Create the new System Admin
        const username = 'admin';
        const password = 'admin111';
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log(`Creating new system admin: ${username}`);
        const admin = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                displayName: 'System Admin',
                role: 'ADMIN',
            },
        });

        console.log('--- Reset Complete ---');
        console.log(`Username: ${admin.username}`);
        console.log(`Password: ${password}`);
    } catch (error) {
        console.error('Error during reset:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

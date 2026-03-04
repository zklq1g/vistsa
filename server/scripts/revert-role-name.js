const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Role Revert Script ---');

    try {
        console.log("Updating 'SYSTEM ADMIN' user role back to 'ADMIN'...");

        const result = await prisma.user.updateMany({
            where: { role: 'SYSTEM ADMIN' },
            data: { role: 'ADMIN' }
        });

        console.log(`Successfully updated ${result.count} users back to ADMIN.`);
        console.log('--- Revert Complete ---');
    } catch (error) {
        console.error('Error during revert:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

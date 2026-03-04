const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Database Role Migration Script ---');

    try {
        console.log("Updating 'admin' user role to 'SYSTEM ADMIN'...");

        const result = await prisma.user.updateMany({
            where: { role: 'ADMIN' },
            data: { role: 'SYSTEM ADMIN' }
        });

        console.log(`Successfully updated ${result.count} users to SYSTEM ADMIN.`);
        console.log('--- Migration Complete ---');
    } catch (error) {
        console.error('Error during migration:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();

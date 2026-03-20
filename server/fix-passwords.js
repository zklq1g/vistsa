const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating user passwords to satisfy 8-character minimum...');

    const newHashedPassword = await bcrypt.hash('12345678', 12);
    
    // Update all users who have the old 6-char password pattern or just all users for safety
    const users = await prisma.user.findMany({
        where: {
            username: {
                not: 'admin'
            }
        }
    });

    console.log(`👤 Found ${users.length} users to update.`);

    for (const user of users) {
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newHashedPassword }
        });
    }

    console.log('✅ All member/mod passwords updated to: 12345678');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Finalizing Leaderboard and Admin...');

    // 1. Ensure System Admin exists
    const adminPass = await bcrypt.hash('admin111', 12);
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { password: adminPass, role: 'ADMIN' },
        create: {
            username: 'admin',
            email: 'admin@vista.com',
            password: adminPass,
            displayName: 'System Admin',
            role: 'ADMIN',
            bio: 'Platform administrator for VISTA.',
        },
    });
    console.log('✅ Admin user ensured (admin / admin111)');

    // 2. Assign random points to ALL users
    const allUsers = await prisma.user.findMany();
    console.log(`📊 Processing leaderboard for ${allUsers.length} users...`);

    for (const user of allUsers) {
        const randomPoints = Math.floor(Math.random() * 4501) + 500; // Between 500 and 5000
        await prisma.leaderboardEntry.upsert({
            where: { userId: user.id },
            update: { points: randomPoints },
            create: {
                userId: user.id,
                points: randomPoints,
            },
        });
    }

    console.log('✅ Leaderboard populated with random points');
    console.log('🎉 Final seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Final seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
        const leaderboardCount = await prisma.leaderboardEntry.count();
        console.log(`--- Verification Results ---`);
        console.log(`Admin User exists: ${!!admin}`);
        console.log(`Leaderboard Count: ${leaderboardCount} (Expected 14)`);
        
        if (admin) {
            const adminLeaderboard = await prisma.leaderboardEntry.findUnique({ where: { userId: admin.id } });
            console.log(`Admin has points:  ${adminLeaderboard ? adminLeaderboard.points : 'NONE'}`);
        }
    } catch (error) {
        console.error('Final verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

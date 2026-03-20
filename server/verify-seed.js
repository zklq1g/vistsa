const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const projectCount = await prisma.project.count();
        console.log(`--- Verification Results ---`);
        console.log(`Total Users:    ${userCount}`);
        console.log(`Total Projects: ${projectCount}`);
        
        // Check for specific usernames
        const mem1 = await prisma.user.findUnique({ where: { username: 'mem1' } });
        const mod1 = await prisma.user.findUnique({ where: { username: 'mod1' } });
        console.log(`User 'mem1' exists: ${!!mem1}`);
        console.log(`User 'mod1' exists: ${!!mod1}`);
    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();

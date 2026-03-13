const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding VISTA demo data...\n');

    // ─── USERS ───
    const adminPass = await bcrypt.hash('admin111', 12);
    const modPass = await bcrypt.hash('mod111', 12);
    const memberPass = await bcrypt.hash('member111', 12);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: { password: adminPass, role: 'ADMIN' },
        create: {
            username: 'admin',
            password: adminPass,
            displayName: 'System Admin',
            role: 'ADMIN',
            bio: 'Platform administrator for VISTA.',
        },
    });

    const moderator = await prisma.user.upsert({
        where: { username: 'moderator' },
        update: { password: modPass, role: 'MOD' },
        create: {
            username: 'moderator',
            password: modPass,
            displayName: 'Jane Moderator',
            role: 'MOD',
            bio: 'Moderator helping manage the VISTA community.',
        },
    });

    const member = await prisma.user.upsert({
        where: { username: 'member' },
        update: { password: memberPass, role: 'MEMBER' },
        create: {
            username: 'member',
            password: memberPass,
            displayName: 'Alex Member',
            role: 'MEMBER',
            bio: 'Passionate about AI and computer vision.',
            githubUrl: 'https://github.com/alexmember',
            linkedinUrl: 'https://linkedin.com/in/alexmember',
        },
    });

    console.log('✅ Users created:');
    console.log(`   Admin:     admin / admin111`);
    console.log(`   Moderator: moderator / mod111`);
    console.log(`   Member:    member / member111\n`);

    // ─── PROJECTS ───
    const projects = [
        {
            title: 'Smart Traffic Analyzer',
            description: 'AI-powered traffic monitoring system using YOLOv8 and OpenCV for real-time vehicle detection, speed estimation, and congestion mapping.',
            techStack: 'Python, YOLOv8, OpenCV, Flask, React',
            githubUrl: 'https://github.com/vista/traffic-analyzer',
            status: 'COMPLETED',
            isApproved: true,
            submittedById: member.id,
        },
        {
            title: 'Campus AR Navigator',
            description: 'Augmented Reality campus navigation app that uses computer vision to recognize buildings and overlay directional guides in real-time.',
            techStack: 'Unity, ARCore, TensorFlow Lite, Kotlin',
            githubUrl: 'https://github.com/vista/ar-navigator',
            status: 'ONGOING',
            isApproved: true,
            submittedById: admin.id,
        },
        {
            title: 'Gesture-Controlled Drone',
            description: 'Hand gesture recognition system for controlling drone movements using MediaPipe and a custom CNN model.',
            techStack: 'Python, MediaPipe, TensorFlow, ROS2',
            status: 'ONGOING',
            isApproved: false,
            submittedById: member.id,
        },
    ];

    for (const proj of projects) {
        const existing = await prisma.project.findFirst({ where: { title: proj.title } });
        if (!existing) {
            await prisma.project.create({ data: proj });
        }
    }
    console.log('✅ 3 sample projects created\n');

    // ─── LEADERBOARD ───
    const leaderboardData = [
        { userId: admin.id, points: 1500 },
        { userId: moderator.id, points: 1200 },
        { userId: member.id, points: 850 },
    ];

    for (const entry of leaderboardData) {
        await prisma.leaderboardEntry.upsert({
            where: { userId: entry.userId },
            update: { points: entry.points },
            create: entry,
        });
    }
    console.log('✅ Leaderboard entries created\n');

    // ─── EVENTS ───
    const events = [
        {
            title: 'VISTA Hackathon 2026',
            description: 'Annual 24-hour hackathon focused on computer vision and AI applications. Teams of 2-4 members compete to build innovative solutions.',
            eventDate: new Date('2026-04-15T09:00:00Z'),
            location: 'Main Auditorium, Block A',
            isPublished: true,
            createdById: admin.id,
        },
        {
            title: 'Workshop: Intro to GANs',
            description: 'Hands-on workshop introducing Generative Adversarial Networks. Bring your laptop with Python and PyTorch installed.',
            eventDate: new Date('2026-03-25T14:00:00Z'),
            location: 'Lab 204, CSE Block',
            isPublished: true,
            createdById: moderator.id,
        },
    ];

    for (const evt of events) {
        const existing = await prisma.event.findFirst({ where: { title: evt.title } });
        if (!existing) {
            await prisma.event.create({ data: evt });
        }
    }
    console.log('✅ 2 sample events created\n');

    // ─── STUDY MATERIALS ───
    const materials = [
        {
            title: 'Computer Vision Roadmap 2026',
            description: 'Comprehensive learning path from basics to advanced CV topics.',
            category: 'ROADMAP',
            status: 'APPROVED',
            externalUrl: 'https://roadmap.sh/ai-engineer',
            uploadedById: admin.id,
        },
        {
            title: 'Attention Is All You Need',
            description: 'The foundational transformer paper by Vaswani et al.',
            category: 'PAPER',
            status: 'APPROVED',
            externalUrl: 'https://arxiv.org/abs/1706.03762',
            uploadedById: moderator.id,
        },
        {
            title: 'PyTorch Lightning Crash Course',
            description: 'Fast-paced video tutorial on PyTorch Lightning for beginners.',
            category: 'TUTORIAL',
            status: 'PENDING',
            externalUrl: 'https://www.youtube.com/watch?v=example',
            uploadedById: member.id,
        },
    ];

    for (const mat of materials) {
        const existing = await prisma.studyMaterial.findFirst({ where: { title: mat.title } });
        if (!existing) {
            await prisma.studyMaterial.create({ data: mat });
        }
    }
    console.log('✅ 3 study materials created\n');

    // ─── SITE STATS ───
    await prisma.siteStats.upsert({
        where: { id: 'singleton' },
        update: {
            projectsCount: 12,
            bootcampsOrganized: 5,
            activeMembers: 48,
            societyMembers: 120,
        },
        create: {
            id: 'singleton',
            projectsCount: 12,
            bootcampsOrganized: 5,
            activeMembers: 48,
            societyMembers: 120,
        },
    });
    console.log('✅ Site stats created\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Seeding complete! Demo accounts:');
    console.log('   admin     / admin111   → /admin');
    console.log('   moderator / mod111     → /moderator');
    console.log('   member    / member111  → /dashboard');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

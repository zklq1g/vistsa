const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting bulk seed...');

    const hashedPassword = await bcrypt.hash('123456', 12);

    // Create 10 members
    const members = [];
    for (let i = 1; i <= 10; i++) {
        const user = await prisma.user.upsert({
            where: { username: `mem${i}` },
            update: {},
            create: {
                username: `mem${i}`,
                email: `mem${i}@vista.com`,
                password: hashedPassword,
                displayName: `Member ${i}`,
                role: 'MEMBER',
                bio: `Passionate developer and member #${i} of the VISTA community.`,
                githubUrl: `https://github.com/mem${i}`,
            },
        });
        members.push(user);
    }
    console.log('✅ 10 Members created');

    // Create 3 moderators
    const mods = [];
    for (let i = 1; i <= 3; i++) {
        const user = await prisma.user.upsert({
            where: { username: `mod${i}` },
            update: { role: 'ADMIN' }, // Schema uses ADMIN for mods/admins
            create: {
                username: `mod${i}`,
                email: `mod${i}@vista.com`,
                password: hashedPassword,
                displayName: `Moderator ${i}`,
                role: 'ADMIN',
                bio: `Community moderator #${i} facilitating growth and innovation.`,
            },
        });
        mods.push(user);
    }
    console.log('✅ 3 Moderators (ADMIN role) created');

    // Project Data
    const projectData = [
        {
            title: 'Autonomous Drone Navigation',
            description: 'A system for autonomous drone flight using SLAM and computer vision to navigate complex indoor environments without GPS.',
            techStack: 'Python, ROS2, OpenCV, SLAM',
            githubUrl: 'https://github.com/vista/drone-nav',
            demoUrl: 'https://youtube.com/demo1',
            thumbnailUrl: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800',
            status: 'COMPLETED',
            isApproved: true,
        },
        {
            title: 'Medical Imaging Analysis',
            description: 'Advanced segmentation of MRI scans to detect early-stage brain tumors using deep learning and UNet architecture.',
            techStack: 'PyTorch, Python, UNet, SimpleITK',
            githubUrl: 'https://github.com/vista/medical-cv',
            demoUrl: 'https://med-demo.vista.app',
            thumbnailUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
            status: 'ONGOING',
            isApproved: true,
        },
        {
            title: 'Real-time Face Mask Detector',
            description: 'High-speed face mask detection system designed for entry points, utilizing MobileNetV2 for efficient edge computing.',
            techStack: 'TensorFlow, Keras, OpenVINO, JavaScript',
            githubUrl: 'https://github.com/vista/mask-detect',
            thumbnailUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
            status: 'COMPLETED',
            isApproved: true,
        },
        {
            title: 'Automated Attendance System',
            description: 'Contactless attendance system using dlib face recognition and real-time database synchronization.',
            techStack: 'Python, dlib, SQLite, Face Recognition',
            githubUrl: 'https://github.com/vista/attendance-cv',
            thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
            status: 'COMPLETED',
            isApproved: true,
        },
        {
            title: 'Virtual Try-On for E-commerce',
            description: 'A GAN-based virtual fitting room that allows users to see how clothes look on their own photos.',
            techStack: 'Python, GANs, OpenCV, React',
            githubUrl: 'https://github.com/vista/virtual-tryon',
            demoUrl: 'https://tryon.demo.app',
            thumbnailUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=800',
            status: 'ONGOING',
            isApproved: true,
        },
        {
            title: 'Smart Home Surveillance',
            description: 'Distributed security system with human motion detection and instant notification using Raspberry Pi and YOLO.',
            techStack: 'C++, YOLO, Raspberry Pi, MQTT',
            githubUrl: 'https://github.com/vista/home-security',
            thumbnailUrl: 'https://images.unsplash.com/photo-1558002038-103792e097df?auto=format&fit=crop&q=80&w=800',
            status: 'ONGOING',
            isApproved: true,
        },
        {
            title: 'Sign Language Translator',
            description: 'Translating American Sign Language to text in real-time using MediaPipe hand tracking and LSTM networks.',
            techStack: 'Python, MediaPipe, TensorFlow, LSTM',
            githubUrl: 'https://github.com/vista/asl-translator',
            thumbnailUrl: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?auto=format&fit=crop&q=80&w=800',
            status: 'COMPLETED',
            isApproved: true,
        },
        {
            title: 'Precision Agriculture Satellite',
            description: 'Analyzing satellite imagery to monitor crop health and optimize fertilizer usage using the Segment Anything Model.',
            techStack: 'Python, SAM, Earth Engine, PyTorch',
            githubUrl: 'https://github.com/vista/agri-sat',
            thumbnailUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
            status: 'ONGOING',
            isApproved: true,
        },
        {
            title: 'Fault Detection in Manufacturing',
            description: 'Quality control system using anomaly detection to identify defects in PCB manufacturing lines.',
            techStack: 'Python, CNN, Skimage, PyQT',
            githubUrl: 'https://github.com/vista/pcb-fault',
            thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
            status: 'IDLE',
            isApproved: true,
        },
        {
            title: 'Elderly Care Pose Estimation',
            description: 'Human activity recognition system to detect falls and emergency situations for elderly monitoring using AlphaPose.',
            techStack: 'Python, AlphaPose, PyTorch, Twilio',
            githubUrl: 'https://github.com/vista/elder-care',
            thumbnailUrl: 'https://images.unsplash.com/photo-1581578731522-745505146317?auto=format&fit=crop&q=80&w=800',
            status: 'ONGOING',
            isApproved: true,
        },
    ];

    for (let i = 0; i < projectData.length; i++) {
        const data = projectData[i];
        // Assign each project to a random member or mod
        const submitter = i < members.length ? members[i] : mods[0];
        
        await prisma.project.create({
            data: {
                ...data,
                submittedById: submitter.id,
            },
        });
    }
    console.log('✅ 10 Projects created and assigned to users');

    console.log('🎉 Bulk seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Lenis from 'lenis';
import { useQuery } from '@tanstack/react-query';

import Loader from '../../components/layout/Loader';
import ThreejsBackground from '../../components/three/ThreejsBackground';
import Button from '../../components/ui/Button';
import api from '../../services/api';

gsap.registerPlugin(ScrollTrigger);

// ─── Helper: split text into chars wrapped in spans ────────────────────────
const splitTextToChars = (element) => {
    const text = element.innerText;
    element.innerHTML = text
        .split('')
        .map(char => char === ' '
            ? `<span class="split-char" style="display:inline">&nbsp;</span>`
            : `<span class="split-char">${char}</span>`)
        .join('');
    return element.querySelectorAll('.split-char');
};

// ─── MagneticButton ─────────────────────────────────────────────────────────
const MagneticButton = ({ children, strength = 0.35 }) => {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onMove = (e) => {
            const rect = el.getBoundingClientRect();
            const dx = (e.clientX - rect.left - rect.width / 2) * strength;
            const dy = (e.clientY - rect.top - rect.height / 2) * strength;
            gsap.to(el, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' });
        };
        const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        el.addEventListener('mousemove', onMove);
        el.addEventListener('mouseleave', onLeave);
        return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
    }, [strength]);
    return <div ref={ref} className="magnetic-btn">{children}</div>;
};

// ─── AnimatedCounter ────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, suffix = '' }) => {
    const ref = useRef(null);
    const triggered = useRef(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const trigger = ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                if (triggered.current) return;
                triggered.current = true;
                const obj = { val: 0 };
                gsap.to(obj, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: () => { if (el) el.innerText = Math.round(obj.val) + suffix; }
                });
            }
        });
        return () => trigger.kill();
    }, [target, suffix]);
    return <span ref={ref} className="counter-num" style={{ display: 'block' }}>0{suffix}</span>;
};

// ─── Home ────────────────────────────────────────────────────────────────────
const Home = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const mainRef = useRef(null);
    const heroHeadingRef = useRef(null);
    const heroSubRef = useRef(null);
    const ctaRef = useRef(null);

    // Fetch real data
    const { data: statsRes } = useQuery({
        queryKey: ['site-stats'],
        queryFn: () => api.get('/stats').then(r => r.data.data ?? r.data),
    });

    const { data: leaderboardRes } = useQuery({
        queryKey: ['home-leaderboard'],
        queryFn: () => api.get('/leaderboard').then(r => r.data.data ?? r.data),
    });

    const { data: projectsRes } = useQuery({
        queryKey: ['home-projects'],
        queryFn: () => api.get('/projects').then(r => r.data.data ?? r.data),
    });

    const stats = statsRes ?? { projectsCount: 0, nationalWins: 0, activeMembers: 0, papers: 0 };
    const leaderboard = Array.isArray(leaderboardRes) ? leaderboardRes.slice(0, 5) : [];
    const projects = Array.isArray(projectsRes) ? projectsRes.slice(0, 5) : [];

    const STAT_FIELDS = [
        { key: 'projectsCount', suffix: '+', label: 'Projects Shipped' },
        { key: 'bootcampsOrganized', suffix: 'x', label: 'Bootcamps Organized' },
        { key: 'activeMembers', suffix: '+', label: 'Active Members' },
        { key: 'societyMembers', suffix: '', label: 'Society Members' },
    ];

    // 1 — Lenis smooth scroll
    useEffect(() => {
        const lenis = new Lenis({ duration: 1.4, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        const id = requestAnimationFrame(raf);
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.lagSmoothing(0);
        return () => { cancelAnimationFrame(id); lenis.destroy(); };
    }, []);

    // 2 — All GSAP animations after loader finishes
    useEffect(() => {
        if (!isLoaded) return;
        const ctx = gsap.context(() => {

            // Hero headline char reveal
            if (heroHeadingRef.current) {
                const chars = splitTextToChars(heroHeadingRef.current);
                gsap.from(chars, { y: '110%', opacity: 0, duration: 1, ease: 'power4.out', stagger: 0.022, delay: 0.2 });
            }

            // Subtitle + CTA
            gsap.from(heroSubRef.current, { y: 30, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.85 });
            gsap.from(ctaRef.current, { y: 40, opacity: 0, duration: 0.8, ease: 'back.out(1.7)', delay: 1.2 });

            // Scroll reveals
            gsap.utils.toArray('.gsap-fade-up').forEach(section => {
                gsap.fromTo(section,
                    { opacity: 0, y: 60 },
                    {
                        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                        scrollTrigger: { trigger: section, start: 'top 82%', toggleActions: 'play none none reverse' }
                    }
                );
            });

            // Stat items stagger
            gsap.utils.toArray('.stat-item').forEach((el, i) => {
                gsap.fromTo(el, { opacity: 0, y: 40 },
                    {
                        opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: i * 0.12,
                        scrollTrigger: { trigger: el, start: 'top 85%' }
                    }
                );
            });

            // Parallax
            gsap.to('.hero-bg-parallax', {
                yPercent: 25,
                ease: 'none',
                scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true }
            });

            // Glow lines expand
            gsap.utils.toArray('.glow-line').forEach(line => {
                gsap.fromTo(line, { scaleX: 0 },
                    {
                        scaleX: 1, transformOrigin: 'left center', duration: 1.2, ease: 'power3.out',
                        scrollTrigger: { trigger: line, start: 'top 90%' }
                    }
                );
            });

            // Project cards
            const cards = gsap.utils.toArray('.project-card-anim');
            if (cards.length) {
                gsap.from(cards, {
                    opacity: 0, x: 60, stagger: 0.1, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: '.project-track', start: 'top 80%' }
                });
            }

        }, mainRef);
        return () => ctx.revert();
    }, [isLoaded]);

    return (
        <>
            {!isLoaded && <Loader onComplete={() => setIsLoaded(true)} />}

            <div ref={mainRef} style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s' }}>

                {/* ─── HERO ─── */}
                <section className="hero-section" style={{
                    position: 'relative', height: '100vh',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 var(--space-xl)', overflow: 'hidden',
                }}>
                    <div className="hero-bg-parallax" style={{ position: 'absolute', inset: 0 }}>
                        <ThreejsBackground />
                    </div>

                    <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: '880px', width: '100%' }}>
                        <motion.div
                            initial={{ opacity: 0, letterSpacing: '0.3em' }}
                            animate={isLoaded ? { opacity: 1, letterSpacing: '0.5em' } : {}}
                            transition={{ duration: 1.5, delay: 0.1 }}
                            style={{ fontSize: '0.75rem', color: 'var(--c-accent)', textTransform: 'uppercase', marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-mono)' }}
                        >
                            KIIT University · Est. 2026
                        </motion.div>

                        {/* word-break: keep-all prevents letters splitting mid-word */}
                        <h1
                            ref={heroHeadingRef}
                            style={{
                                fontSize: 'clamp(3rem, 8vw, 6.5rem)',
                                lineHeight: 1.08,
                                letterSpacing: '-0.03em',
                                marginBottom: 'var(--space-lg)',
                                fontWeight: 600,
                                wordBreak: 'keep-all',
                                overflowWrap: 'normal',
                                hyphens: 'none',
                            }}
                        >
                            Engineering the <span className="gradient-text">Future of Vision</span>
                        </h1>

                        <p
                            ref={heroSubRef}
                            style={{
                                fontSize: 'clamp(0.95rem, 2vw, 1.2rem)',
                                color: 'var(--c-text-muted)',
                                maxWidth: '540px',
                                margin: '0 auto var(--space-xl)',
                                lineHeight: 1.75,
                                wordBreak: 'normal',
                                overflowWrap: 'break-word',
                            }}
                        >
                            An elite research collective at KIIT University building production-grade AI systems, publishing research, and competing on national and international stages.
                        </p>

                        <div ref={ctaRef} style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <MagneticButton>
                                <Link to="/projects">
                                    <Button size="lg" icon={<ChevronRight size={18} />}>Explore Projects</Button>
                                </Link>
                            </MagneticButton>
                            <MagneticButton>
                                <Link to="/login">
                                    <Button variant="ghost" size="lg">Member Login <ArrowRight size={16} /></Button>
                                </Link>
                            </MagneticButton>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.4 }}
                    >
                        <span style={{ fontSize: '0.68rem', letterSpacing: '0.15em', fontFamily: 'var(--font-mono)' }}>SCROLL</span>
                        <div style={{ width: '1px', height: '48px', backgroundColor: 'var(--c-accent)' }} />
                    </motion.div>
                </section>

                {/* ─── STATS ─── */}
                <section className="gsap-fade-up" style={{ padding: 'var(--space-2xl) var(--space-xl)', maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="glow-line" style={{ marginBottom: 'var(--space-2xl)' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-xl)', textAlign: 'center' }}>
                        {STAT_FIELDS.map((f) => (
                            <div key={f.key} className="stat-item" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <AnimatedCounter target={stats[f.key] ?? 0} suffix={f.suffix} />
                                <span style={{ color: 'var(--c-text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{f.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="glow-line" style={{ marginTop: 'var(--space-2xl)' }} />
                </section>

                {/* ─── ABOUT ─── */}
                <section className="gsap-fade-up" style={{ padding: 'var(--space-2xl) var(--space-xl)', maxWidth: '1200px', margin: '0 auto', minHeight: '55vh', display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-2xl)', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--c-accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', marginBottom: 'var(--space-md)' }}>01 / MISSION</div>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', marginBottom: 'var(--space-md)', lineHeight: 1.15, wordBreak: 'normal', overflowWrap: 'normal' }}>
                                We Build What Others Only Study.
                            </h2>
                            <p style={{ color: 'var(--c-text-muted)', lineHeight: 1.8, fontSize: '1rem' }}>
                                VISTA operates like a research lab and startup incubator. Our members build production-ready AI systems, publish papers, and compete globally — not for grades, but because this is what we do.
                            </p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                            {[
                                { title: 'Computer Vision', desc: 'Object detection, segmentation, real-time inference.' },
                                { title: 'Generative AI', desc: 'Diffusion models, LLMs, and multimodal systems.' },
                                { title: 'MLOps & Systems', desc: 'Model deployment, monitoring, and optimization.' },
                            ].map((item) => (
                                <div key={item.title} className="glass" data-cursor-hover style={{ padding: 'var(--space-md)', borderRadius: 'var(--r-md)', cursor: 'none', transition: 'border-color var(--transition-base)' }}>
                                    <div style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--c-accent)' }}>{item.title}</div>
                                    <div style={{ color: 'var(--c-text-muted)', fontSize: '0.9rem', lineHeight: 1.5 }}>{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── FEATURED PROJECTS (real data) ─── */}
                <section id="projects" className="gsap-fade-up" style={{ padding: 'var(--space-2xl) 0', backgroundColor: 'var(--c-surface)', borderTop: '1px solid var(--c-border)', borderBottom: '1px solid var(--c-border)', overflow: 'hidden' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 var(--space-xl)', marginBottom: 'var(--space-xl)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', marginBottom: 'var(--space-md)' }}>02 / FEATURED WORK</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>What We've Shipped</h2>
                            <Link to="/projects">
                                <Button variant="ghost" size="sm">View All <ArrowRight size={14} /></Button>
                            </Link>
                        </div>
                    </div>

                    <div className="project-track h-scroll-container" style={{ padding: '0 var(--space-xl)', paddingBottom: 'var(--space-lg)' }}>
                        {projects.length > 0 ? projects.map((project, i) => (
                            <Link key={project.id} to="/projects" style={{ flexShrink: 0 }}>
                                <div className="project-card-anim" data-cursor-hover style={{
                                    minWidth: '300px', height: '240px',
                                    borderRadius: 'var(--r-lg)',
                                    backgroundColor: 'var(--c-surface-2)',
                                    border: '1px solid var(--c-border)',
                                    padding: 'var(--space-lg)',
                                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                                    cursor: 'none',
                                    backgroundImage: project.thumbnailUrl ? `linear-gradient(to top, var(--c-bg) 40%, transparent), url(${project.thumbnailUrl})` : 'none',
                                    backgroundSize: 'cover', backgroundPosition: 'center',
                                }}
                                    onMouseEnter={e => gsap.to(e.currentTarget, { y: -8, borderColor: 'var(--c-accent)', duration: 0.3 })}
                                    onMouseLeave={e => gsap.to(e.currentTarget, { y: 0, borderColor: 'var(--c-border)', duration: 0.3 })}
                                >
                                    <div style={{ fontSize: '0.7rem', color: 'var(--c-accent)', fontFamily: 'var(--font-mono)', marginBottom: '6px' }}>{String(i + 1).padStart(2, '0')}</div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '6px', wordBreak: 'normal', overflowWrap: 'normal' }}>{project.title}</h3>
                                    <p style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {project.techStack}
                                    </p>
                                </div>
                            </Link>
                        )) : (
                            <div className="project-card-anim" style={{ minWidth: '300px', height: '240px', borderRadius: 'var(--r-lg)', border: '1px dashed var(--c-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--c-text-muted)', fontSize: '0.9rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>🔭</span>
                                No approved projects yet
                            </div>
                        )}

                        <Link to="/projects" style={{ flexShrink: 0 }}>
                            <div className="project-card-anim" style={{ minWidth: '200px', height: '240px', borderRadius: 'var(--r-lg)', border: '1px dashed var(--c-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-md)', cursor: 'none' }}>
                                <ArrowRight size={28} color="var(--c-text-muted)" />
                                <p style={{ color: 'var(--c-text-muted)', textAlign: 'center', fontSize: '0.85rem', padding: '0 var(--space-md)' }}>Browse all projects</p>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* ─── LEADERBOARD (real data) ─── */}
                <section className="gsap-fade-up" style={{ padding: 'var(--space-2xl) var(--space-xl)', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--c-accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', marginBottom: 'var(--space-md)' }}>03 / RANKINGS</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}>The Leaderboard</h2>
                        <Link to="/login"><Button variant="ghost" size="sm">Full Rankings <ArrowRight size={14} /></Button></Link>
                    </div>

                    {leaderboard.length === 0 ? (
                        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--c-text-muted)', border: '1px dashed var(--c-border)', borderRadius: 'var(--r-md)' }}>
                            No leaderboard entries yet. Points will appear here as members earn them.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                            {leaderboard.map((entry, i) => (
                                <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.5 }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 'var(--space-lg)',
                                        padding: 'var(--space-md) var(--space-lg)',
                                        backgroundColor: i === 0 ? 'rgba(212,197,169,0.06)' : 'var(--c-surface)',
                                        borderRadius: 'var(--r-md)',
                                        border: i === 0 ? '1px solid rgba(212,197,169,0.2)' : '1px solid var(--c-border)',
                                        marginBottom: '4px',
                                    }}
                                >
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: i === 0 ? 'var(--c-accent)' : 'var(--c-text-muted)', minWidth: '28px' }}>#{i + 1}</span>
                                    <span style={{ flex: 1, fontWeight: 500 }}>{entry.user?.displayName ?? 'Member'}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--c-accent)', fontSize: '0.9rem' }}>{entry.points?.toLocaleString() ?? 0} pts</span>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* ─── JOIN CTA ─── */}
                <section className="gsap-fade-up" style={{ padding: 'calc(var(--space-2xl) * 2) var(--space-xl)', textAlign: 'center', maxWidth: '760px', margin: '0 auto', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '560px', height: '380px', background: 'radial-gradient(ellipse, rgba(212,197,169,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--c-accent)', fontFamily: 'var(--font-mono)', letterSpacing: '0.3em', marginBottom: 'var(--space-lg)' }}>04 / RECRUITMENT</div>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1.05, marginBottom: 'var(--space-md)', fontWeight: 600, wordBreak: 'normal', overflowWrap: 'normal' }}>
                            Join the <span className="gradient-text">Elite.</span>
                        </h2>
                        <p style={{ color: 'var(--c-text-muted)', marginBottom: 'var(--space-xl)', fontSize: '1.05rem', lineHeight: 1.75, wordBreak: 'normal', overflowWrap: 'normal' }}>
                            Recruitment opens once a semester. Only the top 2% of applicants are accepted. We build with purpose, and so should you.
                        </p>
                        <MagneticButton>
                            <Button variant="primary" size="lg">Apply for Next Cohort</Button>
                        </MagneticButton>
                    </div>
                </section>

                {/* ─── FOOTER ─── */}
                <footer style={{ padding: 'var(--space-xl)', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '0.1em' }}>VISTA</span>
                    <span style={{ color: 'var(--c-text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>© 2026 — KIIT University Computer Vision Society</span>
                    <Link to="/login"><Button variant="ghost" size="sm">Member Portal</Button></Link>
                </footer>

            </div>
        </>
    );
};

export default Home;

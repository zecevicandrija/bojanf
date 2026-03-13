// Hero.js — DARK PREMIUM ANGULAR HERO
// Design System: dizajnskill.md principles applied
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RiArrowRightLine, RiFileList3Line, RiGroupLine, RiScissorsLine } from 'react-icons/ri';
import styles from './Hero.module.css';

// Import images
import heroImg from '../images/filip2.png';
import heroBg from '../images/background.png';

const Hero = ({ navigate }) => {
    // ---- Animation Variants ----
    const fadeUp = {
        hidden: { opacity: 0, y: 35 },
        visible: (delay = 0) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                delay,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    const fadeIn = {
        hidden: { opacity: 0 },
        visible: (delay = 0) => ({
            opacity: 1,
            transition: {
                duration: 0.7,
                delay,
                ease: 'easeOut',
            },
        }),
    };

    const slideIn = {
        hidden: { opacity: 0, x: 60 },
        visible: (delay = 0) => ({
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.9,
                delay,
                ease: [0.22, 1, 0.36, 1],
            },
        }),
    };

    return (
        <section className={styles.heroSection} id="hero">
            {/* ===== BACKGROUND LAYERS ===== */}
            {/* Background image — clipped diagonally on right side */}
            <img
                src={heroBg}
                alt=""
                className={styles.bgImage}
                aria-hidden="true"
            />
            {/* Noise texture for tangible depth (dizajnskill #4) */}
            <div className={styles.noiseOverlay} />
            {/* Ambient warm glow */}
            <div className={styles.ambientGlow} />
            {/* Gold accent line at top */}
            <div className={styles.goldLineTop} />

            {/* ===== CONTENT ===== */}
            <div className={styles.heroContainer}>

                {/* ======= LEFT COLUMN — Sales Copy ======= */}
                <div className={styles.leftColumn}>

                    {/* Premium Badge */}
                    <motion.div
                        className={styles.premiumBadge}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={0}
                    >
                        <span className={styles.badgeIcon}>✦</span>
                        <span className={styles.badgeText}>PREMIUM EDUKACIJA ZA FRIZERE</span>
                    </motion.div>

                    {/* Main Heading — Anchor Font: Playfair Display */}
                    <motion.h1
                        className={styles.mainHeading}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={0.12}
                    >
                        Od Početnika do{' '}
                        <span className={styles.headingHighlight}>Majstora.</span>
                        <br />
                        Usavrši Fade i Podigni Svoju Cenu.
                    </motion.h1>

                    {/* Subtitle — 60% opacity (dizajnskill #5) */}
                    <motion.p
                        className={styles.subtitle}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={0.24}
                    >
                        Uči od najboljih. Naš premium kurs ti pruža napredne tehnike šišanja.
                    </motion.p>

                    {/* Social Proof */}
                    <motion.div
                        className={styles.socialProof}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={0.36}
                    >
                        <div className={styles.stars}>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className={styles.star}>★</span>
                            ))}
                        </div>
                        <span className={styles.proofText}>
                            Pridruži se <span className={styles.proofHighlight}>500+</span> uspešnih studenata
                        </span>
                    </motion.div>

                    {/* CTA Buttons */}
                    <motion.div
                        className={styles.ctaGroup}
                        variants={fadeUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        custom={0.48}
                    >
                        <button
                            className={styles.ctaPrimary}
                            onClick={() => navigate('/paket')}
                            id="hero-cta-primary"
                        >
                            <span>Prijavi se na Edukaciju</span>
                            <RiArrowRightLine className={styles.ctaIcon} />
                        </button>

                        <button
                            className={styles.ctaSecondary}
                            onClick={() => navigate('/kursevi')}
                            id="hero-cta-secondary"
                        >
                            <RiFileList3Line />
                            <span>Pogledaj Program</span>
                        </button>
                    </motion.div>
                </div>

                {/* ======= RIGHT COLUMN — Star of the Show (dizajnskill #2) ======= */}
                <motion.div
                    className={styles.rightColumn}
                    variants={slideIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={0.15}
                >
                    <div className={styles.imageWrapper}>
                        {/* Gold glow behind image */}
                        <div className={styles.imageGlow} />

                        {/* Decorative angular shape behind — Visual Rhyming */}
                        <div className={styles.imageAccentShape} />

                        {/* Hero Image — Angular clip-path */}
                        <img
                            src={heroImg}
                            alt="Premium edukacija za frizere — master kurs"
                            className={styles.heroImage}
                            loading="eager"
                        />

                        {/* Glassmorphism floating badge #1 */}
                        <motion.div
                            className={styles.floatingBadge}
                            variants={fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0.7}
                        >
                            <div className={styles.badgeIconCircle}>
                                <RiGroupLine />
                            </div>
                            <div className={styles.badgeInfo}>
                                <span className={styles.badgeNumber}>500+</span>
                                <span className={styles.badgeLabel}>Studenata</span>
                            </div>
                        </motion.div>

                        {/* Glassmorphism floating badge #2 */}
                        <motion.div
                            className={styles.floatingBadge}
                            variants={fadeIn}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            custom={0.9}
                        >
                            <div className={styles.badgeIconCircle}>
                                <RiScissorsLine />
                            </div>
                            <div className={styles.badgeInfo}>
                                <span className={styles.badgeNumber}>Pro</span>
                                <span className={styles.badgeLabel}>Tehnike</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <div
                className={styles.scrollIndicator}
                onClick={() => {
                    document.getElementById('kako-radi')?.scrollIntoView({ behavior: 'smooth' });
                }}
            >
                <span className={styles.scrollText}>Skroluj</span>
                <div className={styles.scrollMouse}>
                    <div className={styles.scrollDot} />
                </div>
            </div>
        </section>
    );
};

export default Hero;

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Hero.module.css';
import heroImg from '../images/bojan2.png';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            // Intro animacije (Staggered fade-in na onload)
            gsap.fromTo('.intro-item', {
                y: 50,
                opacity: 0
            }, {
                y: 0,
                opacity: 1,
                duration: 1,
                stagger: 0.15,
                ease: 'power3.out',
                delay: 0.1
            });

            // Scroll animacija (Parallax i Fade out za tekst kako se skroluje nizbrdo)
            gsap.to(contentRef.current, {
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
                y: 150,
                opacity: 0,
                ease: 'none'
            });

            // Parallax efekat za sliku (ide blago prema gore)
            gsap.to(imageRef.current, {
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 1,
                },
                y: -100,
                ease: 'none'
            });

            // Plutajuci hover na "glass card" bedz po uzoru na framer floating card
            gsap.to('.floating-card', {
                y: -15,
                rotation: 2,
                duration: 3,
                yoyo: true,
                repeat: -1,
                ease: 'sine.inOut'
            });

        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className={styles.heroSection} ref={heroRef}>
            {/* Background layers */}
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            {/* Main layout */}
            <div className={styles.container}>

                {/* Left column */}
                <div className={styles.content} ref={contentRef}>
                    <div className={`${styles.headlineWrapper} intro-item`}>
                        <span className={styles.solidText}>VRHUNSKI</span>
                        <span className={styles.outlineText}>BARBER</span>
                    </div>

                    {/* Sub-headline bridge */}
                    <p className={`${styles.subHeadline} intro-item`}>
                        Edukacija dizajnirana za početnike i profesionalce. Savladaj moderne
                        tehnike fade-a uz ekspertsko mentorstvo i podigni svoj biznis na viši nivo.
                    </p>

                    {/* CTA row */}
                    <div className={`${styles.actionWrapper} intro-item`}>
                        <button className={styles.ctaButton}>Apliciraj za kurs</button>

                        {/* Social proof */}
                        <div className={styles.socialProof}>
                            <div className={styles.avatarStack}>
                                <img src="https://i.pravatar.cc/100?img=33" alt="Student" className={styles.avatar} />
                                <img src="https://i.pravatar.cc/100?img=47" alt="Student" className={styles.avatar} />
                                <img src="https://i.pravatar.cc/100?img=12" alt="Student" className={styles.avatar} />
                            </div>
                            <div className={styles.proofText}>
                                <span className={styles.proofRating}>
                                    <span className={styles.accent}>★ 4.9/5</span> OCENA MASTERCLASSA
                                </span>
                                <span className={styles.proofCount}>PRIDRUŽI SE 500+ POLAZNIKA</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column – Bojan */}
                <div className={styles.imageContainer} ref={imageRef}>
                    {/* Radial Rim Lighting Behind Subject */}
                    <div className={`${styles.backlightGlow} intro-item`}></div>

                    <div className={`${styles.imageMask} intro-item`}>
                        <img src={heroImg} alt="Bojan — Barber Masterclass" className={styles.heroImage} />
                    </div>

                    {/* Glassmorphism badge */}
                    <div className={`${styles.glassCard} intro-item floating-card`}>
                        <span className={styles.glassIcon}>🎓</span>
                        <span className={styles.glassLabel}>INTERNACIONALNO PRIZNAT SERTIFIKAT</span>
                    </div>
                </div>

                {/* Bottom-left scroll indicator */}
                <div className={`${styles.scrollIndicator} intro-item`}>
                    <div className={styles.scrollLine}></div>
                    <span className={styles.scrollText}>SCROLL TO EXPLORE</span>
                </div>

                {/* Bottom-left trust line */}
                <div className={`${styles.trustedBlock} intro-item`}>
                    TRUSTED BY 500+ MASTERS&nbsp;&nbsp;//&nbsp;&nbsp;BALKANS' #1 ACADEMY
                </div>
            </div>
        </section>
    );
};

export default Hero;

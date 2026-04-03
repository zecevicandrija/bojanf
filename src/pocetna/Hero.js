import React, { useEffect, useRef } from 'react';
import styles from './Hero.module.css';

const HERO_IMG = process.env.PUBLIC_URL + '/bojan2.webp';

const Hero = () => {
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        // Dinamički import za GSAP - ne učitava se dok React ne završi render
        const initAnims = async () => {
            // Odlaganje GSAP-a da se omogući browseru da prvo iscrta LCP sliku (500ms za spore telefone)
            await new Promise(resolve => setTimeout(resolve, 500));
            const { gsap } = await import('gsap');
            const { ScrollTrigger } = await import('gsap/ScrollTrigger');
            gsap.registerPlugin(ScrollTrigger);

            let ctx = gsap.context(() => {
                // Intro animacije
                gsap.fromTo('.intro-item', 
                    { y: 50, opacity: 0 }, 
                    { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.1 }
                );
                
                // Scroll animacije - samo ako imamo refove
                if (contentRef.current && heroRef.current) {
                    gsap.to(contentRef.current, { 
                        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 }, 
                        y: 150, opacity: 0, ease: 'none' 
                    });
                }
                
                if (imageRef.current && heroRef.current) {
                    gsap.to(imageRef.current, { 
                        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 1 }, 
                        y: -100, ease: 'none' 
                    });
                }

                gsap.to('.floating-card', { y: -15, rotation: 2, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
            }, heroRef);

            return ctx;
        };

        const animPromise = initAnims();

        return () => {
            animPromise.then(ctx => ctx && ctx.revert());
        };
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
                    <div className={`${styles.educationBadge} intro-item`} style={{opacity: 0}}>
                        <span className={styles.badgeText}>
                            Bojan Fashion Metod <span className={styles.badgeVersion}>1.0</span>
                        </span>
                    </div>
                    <div className={`${styles.headlineWrapper} intro-item`} style={{opacity: 0}}>
                        <span className={styles.solidText}>VRHUNSKI</span>
                        <span className={styles.outlineText}>BARBER</span>
                    </div>

                    <p className={`${styles.subHeadline} intro-item`} style={{opacity: 0}}>
                        Edukacija dizajnirana za početnike i profesionalce. Savladaj moderne
                        tehnike fade-a uz ekspertsko mentorstvo i podigni svoj biznis na viši nivo.
                    </p>

                    <div className={`${styles.actionWrapper} intro-item`} style={{opacity: 0}}>
                        <button className={styles.ctaButton}>Apliciraj za kurs</button>

                        <div className={styles.socialProof}>
                            <div className={styles.avatarStack}>
                                <img src="https://i.pravatar.cc/100?img=33" width="40" height="40" alt="Student" className={styles.avatar} />
                                <img src="https://i.pravatar.cc/100?img=47" width="40" height="40" alt="Student" className={styles.avatar} />
                                <img src="https://i.pravatar.cc/100?img=12" width="40" height="40" alt="Student" className={styles.avatar} />
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

                {/* Right column – Bojan - BEZ intro-item da se LCP slika odmah vidi */}
                <div className={styles.imageContainer} ref={imageRef}>
                    <div className={styles.backlightGlow}></div>

                    <div className={styles.imageMask}>
                        <img
                            src={HERO_IMG}
                            alt="Bojan — Barber Masterclass"
                            className={styles.heroImage}
                            fetchpriority="high"
                            decoding="async"
                            width="800"
                            height="1000"
                        />
                    </div>

                    <div className={`${styles.glassCard} intro-item floating-card`} style={{opacity: 0}}>
                        <span className={styles.glassIcon}>🎓</span>
                        <span className={styles.glassLabel}>INTERNACIONALNO PRIZNAT SERTIFIKAT</span>
                    </div>
                </div>

                <div className={`${styles.scrollIndicator} intro-item`} style={{opacity: 0}}>
                    <div className={styles.scrollLine}></div>
                    <span className={styles.scrollText}>SCROLL TO EXPLORE</span>
                </div>

                <div className={`${styles.trustedBlock} intro-item`} style={{opacity: 0}}>
                    TRUSTED BY 500+ MASTERS&nbsp;&nbsp;//&nbsp;&nbsp;BALKANS' #1 ACADEMY
                </div>
            </div>
        </section>
    );
};

export default Hero;
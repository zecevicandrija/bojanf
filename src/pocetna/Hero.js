import React, { useEffect, useRef, useState, useMemo } from 'react';
import styles from './Hero.module.css';
import { Link } from 'react-router-dom';
import PREVIEW_VIDEO from '../images/bojanslike/0406.mp4';

const HERO_IMG = process.env.PUBLIC_URL + '/bojan2.webp';

// Optimizovani avatar stack - koristeći lokalni public folder ili optimizovane verzije
const AVATARS = [
    'https://i.pravatar.cc/100?img=33', // TODO: Zameniti sa lokalnim /public/avatars/1.webp
    'https://i.pravatar.cc/100?img=47', // TODO: Zameniti sa lokalnim /public/avatars/2.webp
    'https://i.pravatar.cc/100?img=12'  // TODO: Zameniti sa lokalnim /public/avatars/3.webp
];

const BojanVideoPlayer = ({ src, isActive, isMinimal = false }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState('0:00');

    useEffect(() => {
        if (!isActive) {
            videoRef.current?.pause();
            setIsPlaying(false);
        } else {
            videoRef.current?.play().catch(() => { });
            setIsPlaying(true);
            setIsMuted(false);
        }
    }, [isActive]);

    const handlePlayPause = (e) => {
        e.stopPropagation();
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleMute = (e) => {
        e.stopPropagation();
        videoRef.current.muted = !videoRef.current.muted;
        setIsMuted(videoRef.current.muted);
    };

    const handleFullscreen = (e) => {
        e.stopPropagation();

        const targetElement = (window.innerWidth < 1024 && videoRef.current.parentElement)
            ? videoRef.current.parentElement
            : videoRef.current;

        if (targetElement.requestFullscreen) {
            targetElement.requestFullscreen();
        } else if (targetElement.webkitRequestFullscreen) {
            targetElement.webkitRequestFullscreen();
        } else if (videoRef.current.webkitEnterFullscreen) {
            videoRef.current.webkitEnterFullscreen();
        }
    };

    const handleProgress = () => {
        const value = (videoRef.current.currentTime / videoRef.current.duration) * 100;
        setProgress(value);

        const m = Math.floor(videoRef.current.currentTime / 60);
        const s = Math.floor(videoRef.current.currentTime % 60);
        setCurrentTime(`${m}:${s < 10 ? '0' + s : s}`);
    };

    const scrub = (e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = pos * videoRef.current.duration;
    };

    return (
        <div className={styles.videoWrapper}>
            {!isActive ? (
                /* OPTIMIZACIJA: Video umesto GIF-a za teaser */
                <video
                    src={PREVIEW_VIDEO}
                    className={styles.vslVideo}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{ pointerEvents: 'none', objectFit: 'cover' }}
                />
            ) : (
                <video
                    ref={videoRef}
                    src={src}
                    className={styles.vslVideo}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleProgress}
                    style={{ pointerEvents: 'auto' }}
                />
            )}

            {isActive && (
                <div className={styles.customControls}>
                    <div className={styles.progressContainer} onClick={scrub}>
                        <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className={styles.controlsRow}>
                        <div className={styles.leftControls}>
                            <button className={styles.controlBtn} onClick={handlePlayPause} style={{ fontSize: '1.1rem' }}>
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <span className={styles.timeDisplay}>{currentTime}</span>
                        </div>
                        <div className={styles.rightControls}>
                            <button className={styles.controlBtn} onClick={handleMute} style={{ fontSize: '1.1rem' }}>
                                {isMuted ? '🔇' : '🔊'}
                            </button>
                            <button className={styles.controlBtn} onClick={handleFullscreen} style={{ fontSize: '1.1rem' }}>
                                ⛶
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Hero = () => {
    const heroRef = useRef(null);
    const contentRef = useRef(null);
    const imageRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [mobileVideoActive, setMobileVideoActive] = useState(false);

    useEffect(() => {
        const initAnims = async () => {
            // Smanjen wait sa 500ms na 100ms za brži FCP/Speed Index
            await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 100)));

            const { gsap } = await import('gsap');
            const { ScrollTrigger } = await import('gsap/ScrollTrigger');
            gsap.registerPlugin(ScrollTrigger);

            let ctx = gsap.context(() => {
                // Intro animacije
                gsap.fromTo('.intro-item',
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.05 }
                );

                if (contentRef.current && heroRef.current) {
                    gsap.to(contentRef.current, {
                        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.5 },
                        y: 100, opacity: 0, ease: 'none'
                    });
                }

                if (imageRef.current && heroRef.current) {
                    gsap.to(imageRef.current, {
                        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.5 },
                        y: -50, opacity: 0.6, ease: 'none'
                    });
                }

                gsap.to('.floating-card', { y: -10, rotation: 0.5, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });
            }, heroRef);

            return ctx;
        };

        const animPromise = initAnims();

        return () => {
            animPromise.then(ctx => ctx && ctx.revert());
        };
    }, []);

    const avatars = useMemo(() => AVATARS.map((src, i) => (
        <img key={i} src={src} width="40" height="40" alt={`Student ${i + 1}`} className={styles.avatar} loading="lazy" />
    )), []);

    return (
        <section className={styles.heroSection} ref={heroRef}>
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.container}>
                <div className={styles.content} ref={contentRef}>
                    <div className={`${styles.educationBadge} intro-item`} style={{ opacity: 0 }}>
                        <span className={styles.badgeText}>
                            Bojan Fashion Metod <span className={styles.badgeVersion}>1.0</span>
                        </span>
                    </div>
                    <div className={`${styles.headlineWrapper} intro-item`} style={{ opacity: 0 }}>
                        <span className={styles.solidText}>VRHUNSKI</span>
                        <span className={styles.outlineText}>BARBER</span>
                    </div>

                    <p className={`${styles.subHeadline} intro-item`} style={{ opacity: 0 }}>
                        Edukacija dizajnirana za početnike i profesionalce. Savladaj moderne
                        tehnike fade-a uz ekspertsko mentorstvo i podigni svoj biznis na viši nivo.
                    </p>

                    <div className={`${styles.mobileVslCardWrapper} intro-item`} style={{ opacity: 0 }}>
                        <div className={`${styles.vslCard} ${styles.mobileVslCard} ${mobileVideoActive ? styles.activeMobileVideo : ''}`}
                            onClick={() => !mobileVideoActive && setMobileVideoActive(true)}>
                            <BojanVideoPlayer
                                src="https://andrijatest.b-cdn.net/final.mp4"
                                isActive={mobileVideoActive}
                            />
                            {!mobileVideoActive && (
                                <>
                                    <div className={styles.vslOverlay}></div>
                                    <div className={styles.vslPlayContainer}>
                                        <div className={styles.vslPlayBtn}>
                                            <div className={styles.vslPlayIcon}>▶</div>
                                        </div>
                                        <div className={styles.vslDashedCircle}></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className={`${styles.actionWrapper} intro-item`} style={{ opacity: 0 }}>
                        <div className={styles.buttonsContainer}>
                            <div className={styles.buttonGroup}>
                                <Link to="/paket" className={styles.ctaButton}>Apliciraj za kurs</Link>
                                <button className={styles.ghostButton} onClick={() => setIsModalOpen(true)}>
                                    <span className={styles.playIconSmall}>▶</span> POGLEDAJ METODU (12 MIN)
                                </button>
                            </div>
                        </div>

                        <div className={styles.socialProof}>
                            <div className={styles.avatarStack}>
                                {avatars}
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

                    <div className={`${styles.vslCard} ${styles.desktopVslCard} intro-item floating-card`} onClick={() => setIsModalOpen(true)} style={{ opacity: 0 }}>
                        <video
                            src={PREVIEW_VIDEO}
                            className={styles.vslVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div className={styles.vslOverlay}></div>
                        <div className={styles.vslPlayContainer}>
                            <div className={styles.vslPlayBtn}>
                                <div className={styles.vslPlayIcon}>▶</div>
                            </div>
                            <div className={styles.vslDashedCircle}></div>
                        </div>
                    </div>
                </div>

                <div className={`${styles.scrollIndicator} intro-item`} style={{ opacity: 0 }}>
                    <div className={styles.scrollLine}></div>
                    <span className={styles.scrollText}>SCROLL TO EXPLORE</span>
                </div>

                <div className={`${styles.trustedBlock} intro-item`} style={{ opacity: 0 }}>
                    TRUSTED BY 500+ MASTERS&nbsp;&nbsp;//&nbsp;&nbsp;BALKANS' #1 ACADEMY
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.fullScreenModal} onClick={() => setIsModalOpen(false)}>
                    <button className={styles.modalClose} onClick={() => setIsModalOpen(false)}>[ X ] ZATVORI</button>
                    <div className={styles.modalVideoContainer} onClick={(e) => e.stopPropagation()}>
                        <BojanVideoPlayer
                            src="https://andrijatest.b-cdn.net/final.mp4"
                            isActive={isModalOpen}
                        />
                    </div>
                </div>
            )}
        </section>
    );
};

export default Hero;
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RiScissorsLine } from 'react-icons/ri';
import styles from './Motion.module.css';
import slika9 from '../images/bojanslike/slika9.webp';
import slika10 from '../images/bojanslike/slika10.webp';
import slika11 from '../images/bojanslike/slika11.webp';
import slika15 from '../images/bojanslike/slika15.webp';



gsap.registerPlugin(ScrollTrigger);

const Motion = () => {
    const sectionRef = useRef(null);
    const introTextRef = useRef(null);
    const cardsRef = useRef([]);
    const blackoutRefs = useRef([]);
    const closerRef = useRef(null);

    const modules = [
        {
            id: "01",
            title: "FADE MASTERCLASS",
            desc: "Ovladaj tehnikama preciznog senčenja i tranzicije. Svaki potez mašinice postaje kontrolisan i savršen.",
            bullets: ["Zlatna pravila fade-a", "Kontrola mašinice i nastavaka", "Blendanje bez vidljivih linija"],
            bgImage: slika9
        },
        {
            id: "02",
            title: "SALONSKE TEHNIKE",
            desc: "Brzina i preciznost u svakodnevnom radu. Fokus na najtraženije komercijalne stilove koji donose lojalne klijente.",
            bullets: ["Buzz Cut", "French Crop", "Taper Fade", "Fast Fade"],
            bgImage: slika10
        },
        {
            id: "03",
            title: "GEOMETRIJSKO ŠIŠANJE",
            desc: "Nije svaka frizura za svaku glavu. Nauči kako da prepoznaš oblik lica i prilagodiš strukturu frizure.",
            bullets: ["Square Layer (kvadratni sloj)", "Round Layer (kruzni sloj)", "Round Graduation (kruzna graduacija)"],
            bgImage: slika11
        },
        {
            id: "04",
            title: "BIZNIS I KLIJENTI",
            desc: "Najbolji zanat vredi samo ako znaš da ga unovčiš. Premium strategije za izgradnju brenda i lojalnosti.",
            bullets: ["Psihologija komunikacije", "Brendiranje i društvene mreže", "Cenovna politika i vrednost"],
            bgImage: slika15
        }
    ];

    useEffect(() => {
        if (sectionRef.current) {
            const parent = sectionRef.current.closest('.fade-in-section');
            if (parent) {
                parent.style.transform = 'none';
                parent.style.transition = 'opacity 0.6s ease-out';
            }
        }

        let mm = gsap.matchMedia();

        // --- DESKTOP ---
        mm.add("(min-width: 900px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=6000",

                    pin: true,
                    scrub: 1.2,
                    anticipatePin: 1,
                }
            });

            tl.to(introTextRef.current, {
                opacity: 0,
                scale: 1.1,
                filter: "blur(10px)",
                ease: "power2.out",
                duration: 1.5
            }, 0);

            cardsRef.current.forEach((card, index) => {
                gsap.set(card, {
                    x: "100vw",
                    clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
                    zIndex: index + 2,
                });
                const targetX = 5 + (index * 6);

                tl.to(card, {
                    x: `${targetX}vw`,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "expo.out",
                    duration: 3,
                }, index * 2 + 0.5);
            });

            gsap.set(closerRef.current, { opacity: 0, y: 50 });
            tl.to(closerRef.current, {
                opacity: 1,
                y: 0,
                ease: "power3.out",
                duration: 2,
            }, 9.5);
        });

        // --- MOBILE ---
        mm.add("(max-width: 899px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=6500",

                    pin: true,
                    scrub: 1.5,
                }
            });

            tl.to(introTextRef.current, {
                opacity: 0,
                scale: 1.1,
                ease: "power2.out",
                duration: 1
            }, 0);

            cardsRef.current.forEach((card, index) => {
                const blackout = blackoutRefs.current[index];

                gsap.set(card, {
                    y: window.innerHeight,
                    x: "5vw",
                    clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                    zIndex: index + 2,
                });

                if (blackout) gsap.set(blackout, { opacity: 0.85 });

                const targetY = (window.innerHeight * (2 + (index * 6))) / 100;
                const startTime = index * 3.5 + 0.5;

                tl.to(card, {
                    y: targetY,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "power3.out",
                    duration: 4,
                }, startTime);

                if (blackout) {
                    tl.to(blackout, {
                        opacity: 0,
                        duration: 1.5,
                        ease: "power2.out"
                    }, startTime + 0.8);

                    if (index < cardsRef.current.length - 1) {
                        const nextStartTime = (index + 1) * 3.5 + 0.5;
                        tl.to(blackout, {
                            opacity: 0.75,
                            duration: 1.5,
                            ease: "power2.out"
                        }, nextStartTime + 0.5);
                    }
                }
            });

            const closerStartTime = (cardsRef.current.length - 1) * 3.5 + 5.0;
            gsap.set(closerRef.current, { opacity: 0, y: 50, xPercent: -50, left: "50%" });
            tl.to(closerRef.current, {
                opacity: 1,
                y: 0,
                ease: "power3.out",
                duration: 2,
            }, closerStartTime);
        });

        return () => mm.revert();
    }, []);

    return (
        <section className={styles.motionSection} ref={sectionRef}>
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.introContainer} ref={introTextRef}>
                <div className={styles.headlineGroup}>
                    <h2 className={styles.headlineMain}>Šta je u</h2>
                    <h2 className={styles.headlineAccent}>Tvojim rukama<span className={styles.desktopDot}></span></h2>
                </div>
            </div>

            <div className={styles.cardsWrapper}>
                {modules.map((mod, index) => (
                    <div
                        key={mod.id}
                        className={styles.card}
                        ref={el => cardsRef.current[index] = el}
                    >
                        <div className={styles.cardBg}>
                            <img src={mod.bgImage} alt={mod.title} loading="lazy" />
                            <div className={styles.blackoutLayer} ref={el => blackoutRefs.current[index] = el}></div>
                            <div className={styles.cardOverlay}></div>
                        </div>

                        <div className={styles.cardContent}>
                            <div className={styles.cardNumber}>{mod.id}</div>
                            <h3 className={styles.cardTitle}>{mod.title}</h3>
                            <p className={styles.cardDesc}>{mod.desc}</p>

                            <ul className={styles.cardBullets}>
                                {mod.bullets.map((bullet, i) => (
                                    <li key={i}>
                                        <span className={styles.bulletCheck}></span>
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.closerContainer} ref={closerRef}>
                <h3 className={styles.closerTitle}>Spreman da preuzmeš kontrolu?</h3>
                <button className={styles.ctaButton}>
                    <span>ZAPOČNI KURS</span>
                    <RiScissorsLine className={styles.ctaIcon} />
                </button>
            </div>
        </section>
    );
};

export default Motion;

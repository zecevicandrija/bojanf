import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RiScissorsLine } from 'react-icons/ri';
import styles from './Motion.module.css';

gsap.registerPlugin(ScrollTrigger);

const Motion = () => {
    const sectionRef = useRef(null);
    const introTextRef = useRef(null);
    const cardsRef = useRef([]);
    const closerRef = useRef(null);

    const modules = [
        {
            id: "01",
            title: "FADE MASTERCLASS",
            desc: "Ovladaj tehnikama preciznog senčenja i tranzicije. Svaki potez mašinice postaje kontrolisan i savršen.",
            bullets: ["Zlatna pravila fade-a", "Kontrola mašinice i nastavaka", "Blendanje bez vidljivih linija"],
            bgImage: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1600&auto=format&fit=crop"
        },
        {
            id: "02",
            title: "GEOMETRIJA LICA",
            desc: "Nije svaka frizura za svaku glavu. Nauči kako da prepoznaš oblik lica i prilagodiš strukturu frizure.",
            bullets: ["Analiza oblika lica i lobanje", "Personalizacija i simetrija", "Korekcija asimetrije lica"],
            bgImage: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1600&auto=format&fit=crop"
        },
        {
            id: "03",
            title: "BIZNIS I KLIJENTI",
            desc: "Najbolji zanat vredi samo ako znaš da ga unovčiš. Premium strategije za izgradnju brenda i lojalnosti.",
            bullets: ["Psihologija komunikacije", "Brendiranje i društvene mreže", "Cenovna politika i vrednost"],
            bgImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1600&auto=format&fit=crop"
        }
    ];

    useEffect(() => {
        // FIX: Uklanjamo `transform` sa roditeljskog elementa `.fade-in-section` 
        // jer CSS transform automatski poništava `position: fixed` i omogućava prolazak komponente.
        if (sectionRef.current) {
            const parent = sectionRef.current.closest('.fade-in-section');
            if (parent) {
                parent.style.transform = 'none';
                parent.style.transition = 'opacity 0.6s ease-out';
            }
        }

        // We use matchMedia for standard GSAP responsive design cleanup
        let mm = gsap.matchMedia();

        mm.add("(min-width: 900px)", () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=3500", // The amount of scroll distance it takes to complete
                    pin: true,
                    scrub: 1.2, // Puterast scrubber (scrub: >1 daje smooth delay)
                    anticipatePin: 1,
                }
            });

            // 1. Intro text scale and fade out
            tl.to(introTextRef.current, {
                opacity: 0,
                scale: 1.1,
                filter: "blur(10px)",
                ease: "power2.out",
                duration: 1.5
            }, 0);

            // 2. Animate cards in a stacking sequence (Horizontal rez)
            cardsRef.current.forEach((card, index) => {
                // Set initial brutal horizontal state
                gsap.set(card, {
                    left: "100%",
                    clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)",
                    zIndex: index + 2,
                });

                // Compute where each card stacks
                const targetLeft = 5 + (index * 6);

                tl.to(card, {
                    left: `${targetLeft}%`,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "expo.out", // brutal initial move, puterast end
                    duration: 3,
                }, index * 2 + 0.5); // overlapping entrance
            });

            // 3. Reveal The Closer
            gsap.set(closerRef.current, { opacity: 0, y: 50, yPercent: -50, x: 0 });
            tl.to(closerRef.current, {
                opacity: 1,
                y: 0,
                ease: "power3.out",
                duration: 2,
            }, 5.5); // Krece taman pred zavrsni dolazak trece kartice

        });

        mm.add("(max-width: 899px)", () => {
            // Mobile adaptation — cards scroll vertically with slight clip path reveal
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: "+=4000", // Povecano skrolovanje za opustenije citanje
                    pin: true,
                    scrub: 1,
                }
            });

            tl.to(introTextRef.current, {
                opacity: 0,
                scale: 1.1,
                ease: "power2.out",
                duration: 1
            }, 0);

            cardsRef.current.forEach((card, index) => {
                const img = card.querySelector('img');

                gsap.set(card, {
                    top: "100%",
                    left: "5%",
                    clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                    zIndex: index + 2,
                });

                const targetTop = 10 + (index * 6);
                const startTime = index * 3.5 + 0.5; // Povecani razmaci zbog citljivosti

                tl.to(card, {
                    top: `${targetTop}%`,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                    ease: "expo.out",
                    duration: 4,
                }, startTime);

                if (img) {
                    // Animira se slika u boju kada kartica izadje
                    tl.to(img, {
                        filter: "grayscale(0%) contrast(1.1) brightness(0.65)",
                        duration: 1.5,
                        ease: "power2.out"
                    }, startTime + 0.8);

                    // Kada sledeca kartica pocne da izlazi, ova prelazi u sivo
                    if (index < cardsRef.current.length - 1) {
                        const nextStartTime = (index + 1) * 3.5 + 0.5;
                        tl.to(img, {
                            filter: "grayscale(70%) contrast(1.1) brightness(0.3)",
                            duration: 1.5,
                            ease: "power2.out"
                        }, nextStartTime + 0.5);
                    }
                }
            });

            // 3. Reveal The Closer na telefonu (isplivava odozdo preko kartica)
            const closerStartTime = (cardsRef.current.length - 1) * 3.5 + 3.0;
            gsap.set(closerRef.current, { opacity: 0, y: 50, yPercent: 0, xPercent: -50, left: "50%" });
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
            {/* Background layers */}
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
                        {/* Background Image / Texture */}
                        <div className={styles.cardBg}>
                            <img src={mod.bgImage} alt={mod.title} />
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

            {/* The Closer CTA */}
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

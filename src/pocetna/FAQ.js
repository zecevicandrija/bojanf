import React, { useState } from 'react';
import { RiArrowDownLine, RiScissorsLine } from 'react-icons/ri';
import styles from './FAQ.module.css';

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "Da li je ova edukacija samo za početnike?",
            answer: "Ne. Moduli su dizajnirani tako da početnicima daju temelj, a profesionalcima tehnike koje im omogućavaju da dupliraju cene svojih usluga."
        },
        {
            question: "Šta ako nemam svoj salon?",
            answer: "Znanje koje dobijaš primenjivo je svuda. Naučićete kako da izgradite svoje ime i privučete klijente, radili u tuđem salonu, iznajmljivali stolicu ili započeli sopstveni biznis."
        },
        {
            question: "Koliko mi je potrebno da povratim investiciju u ovaj kurs?",
            answer: "Većina polaznica povrati investiciju u prvih 3 meseca nakon primene naših tehnika. Kroz nove savladane veštine, kurs otplaćuje sam sebe."
        }
    ];

    return (
        <section className={styles.faqSection}>
            {/* Background layers */}
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>
            <div className={styles.container}>
                <div className={styles.leftColumn}>
                    <div className={styles.stickyContent}>
                        <div className={styles.headlineGroup}>
                            <h2 className={styles.headlineMain}>TVOJA POSLEDNJA</h2>
                            <h2 className={styles.headlineAccent}>PITANJA<span className={styles.desktopDot}>.</span></h2>
                        </div>
                        <p className={styles.description}>
                            Znaš da ti ovo treba. Ako se i dalje dvoumiš, pročitaj odgovore ispod. Ako tvog pitanja nema, pošalji nam poruku.
                        </p>
                        <button className={styles.ctaButton}>
                            <span>ZAPOČNI KURS</span>
                            <RiScissorsLine className={styles.ctaIcon} />
                        </button>
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    <div className={styles.accordion}>
                        {faqs.map((faq, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className={`${styles.faqItem} ${isOpen ? styles.open : ''}`}
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <div className={styles.questionWrap}>
                                        <h3 className={styles.question}>{faq.question}</h3>
                                        <span className={styles.iconWrap}>
                                            <RiArrowDownLine className={styles.arrow} />
                                        </span>
                                    </div>
                                    <div className={styles.answerWrap}>
                                        <div className={styles.answerContent}>
                                            <p className={styles.answer}>{faq.answer}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FAQ;

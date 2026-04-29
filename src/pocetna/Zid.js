import React from 'react';
import { RiScissorsLine } from 'react-icons/ri';
import styles from './Zid.module.css';

import slika3 from '../images/bojanslike/slika3.webp';
import slika4 from '../images/bojanslike/slika4.webp';
import slika5 from '../images/bojanslike/slika5.webp';
import slika6 from '../images/bojanslike/slika6.webp';
import slika7 from '../images/bojanslike/slika7.webp';
import slika8 from '../images/bojanslike/slika8.webp';
import slika14 from '../images/bojanslike/slika14.webp';
import slika16 from '../images/bojanslike/slika16.webp';

const results = [
    { id: 1, type: 'large', img: slika3 },
    { id: 2, type: 'small', img: slika4 },
    { id: 3, type: 'small', img: slika5 },
    { id: 4, type: 'wide', img: slika14 },
    { id: 5, type: 'tall', img: slika7 },
    { id: 6, type: 'wide', img: slika6 },
    { id: 7, type: 'small', img: slika8 },
    { id: 8, type: 'small', img: slika16 },
    { id: 9, type: 'cta' }
];

const Zid = ({ navigate }) => {
    return (
        <section className={styles.section}>
            {/* Background layers */}
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.container}>
                <div className={styles.headlineGroup}>
                    <h2 className={styles.headlineMain}>VIŠE OD</h2>
                    <h2 className={styles.headlineAccent}>EDUKACIJE<span className={styles.desktopDot}>.</span></h2>
                    <p className={styles.description}>
                        Akademija nije samo učenje, to je mesto gde pronalaziš ljude koji razmišljaju kao ti. Ovde delimo znanje, greške i uspehe. Postani deo zajednice koja te gura napred i gde se svaki napredak slavi zajedno.
                    </p>
                </div>

                <div className={styles.grid}>
                    {results.map((item) => {
                        if (item.type === 'cta') {
                            return (
                                <div key={item.id} className={`${styles.card} ${styles.cardWide} ${styles.ctaCard}`}>
                                    <button
                                        className={styles.ctaPrimary}
                                        onClick={() => navigate && navigate('/paket')}
                                    >
                                        <span>PRIDRUŽI SE</span>
                                        <RiScissorsLine className={styles.ctaIcon} />
                                    </button>
                                </div>
                            );
                        }

                        let cardClass = styles.cardSmall;
                        if (item.type === 'large') cardClass = styles.cardLarge;
                        if (item.type === 'wide') cardClass = styles.cardWide;
                        if (item.type === 'tall') cardClass = styles.cardTall;

                        return (
                            <div key={item.id} className={`${styles.card} ${cardClass}`}>
                                <img src={item.img} loading="lazy" alt={`Result ${item.id}`} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Zid;

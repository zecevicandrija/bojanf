import React from 'react';
import { RiScissorsLine } from 'react-icons/ri';
import styles from './Zid.module.css';

const results = [
    {
        id: 1,
        type: 'large',
        name: 'Stefan',
        salon: 'Top Hair Studio',
        img: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=1200&auto=format&fit=crop'
    },
    {
        id: 2,
        type: 'tall',
        name: 'Marko',
        salon: 'Barber Cartel',
        img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 3,
        type: 'small',
        name: 'Nikola',
        salon: 'Premium Rez',
        img: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 4,
        type: 'small',
        name: 'Filip',
        salon: 'Postao najbolji u gradu',
        img: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800&auto=format&fit=crop'
    },
    {
        id: 5,
        type: 'beforeAfter',
        name: 'Nemanja',
        salon: 'Sada naplaćuje 3000 RSD',
        imgBefore: 'https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?q=80&w=1000&auto=format&fit=crop',
        imgAfter: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=1000&auto=format&fit=crop'
    },
    {
        id: 6,
        type: 'wide',
        name: 'Aleksandar',
        salon: 'Vlasnik salona',
        img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=1000&auto=format&fit=crop'
    }
];

const Zid = ({ navigate }) => {
    return (
        <section className={styles.section}>
            {/* Background layers */}
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.container}>
                <div className={styles.headlineGroup}>
                    <h2 className={styles.headlineMain}>NJIHOVA CENA JE</h2>
                    <h2 className={styles.headlineAccent}>SADA DUPLA<span className={styles.desktopDot}>.</span></h2>
                    <p className={styles.description}>
                        Ovo nisu naši radovi. Ovo su stvarni rezultati polaznika nakon završene Akademije. Ne prodajemo ti samo sertifikat, već znanje koje od sutra možeš da naplatiš više.
                    </p>
                </div>

                <div className={styles.grid}>
                    {results.map((item) => {
                        let cardClass = styles.cardSmall;
                        if (item.type === 'large') cardClass = styles.cardLarge;
                        if (item.type === 'wide') cardClass = styles.cardWide;
                        if (item.type === 'tall') cardClass = styles.cardTall;
                        if (item.type === 'beforeAfter') cardClass = `${styles.cardWide} ${styles.beforeAfter}`;

                        if (item.type === 'beforeAfter') {
                            return (
                                <div key={item.id} className={`${styles.card} ${cardClass}`}>
                                    <img src={item.imgBefore} alt="Priprema" className={styles.imgBefore} />
                                    <img src={item.imgAfter} alt="Savršeni Rez" className={styles.imgAfter} />

                                    <div className={styles.overlay}>
                                        <div className={styles.overlayContent}>
                                            <h4 className={styles.name}>{item.name}</h4>
                                            <p className={styles.details}>{item.salon}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div key={item.id} className={`${styles.card} ${cardClass}`}>
                                <img src={item.img} alt={item.name} />

                                <div className={styles.overlay}>
                                    <div className={styles.overlayContent}>
                                        <h4 className={styles.name}>{item.name}</h4>
                                        <p className={styles.details}>{item.salon}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className={styles.ctaContainer}>
                    <button
                        className={styles.ctaPrimary}
                        onClick={() => navigate && navigate('/kursevi')}
                    >
                        <span>ŽELIM OVAKVE REZULTATE</span>
                        <RiScissorsLine className={styles.ctaIcon} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Zid;

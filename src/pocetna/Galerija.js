import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MoveHorizontal, Scissors, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import styles from './Galerija.module.css';

import slika1 from '../images/bojanslike/slika1.webp';
import slika2 from '../images/bojanslike/slika2.webp';

const transformations = [
    {
        id: 1,
        name: "Marko N.",
        program: "Master Fade & Texture",
        beforeImg: slika1,
        afterImg: slika2,
        stats: { technique: "Fade", time: "30 MIN", retention: "+80%" },
        quote: "Pre kursa sam imao problem sa prelazima. Sada svako šišanje traje kraće a klijenti su prezadovoljni."
    },
    {
        id: 2,
        name: "Nikola P.",
        program: "Advanced Styling",
        beforeImg: slika1,
        afterImg: slika2,
        stats: { technique: "Crop", time: "35 MIN", retention: "+65%" },
        quote: "Tekstura i stilizovanje su mi bili noćna mora. Masterclass mi je potpuno promenio pristup i način rada."
    }
];

const TransformationCard = ({ client, index }) => {
    const containerRef = useRef(null);
    const [sliderPosition, setSliderPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);

    const handleMove = (clientX) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPosition(pos);
    };

    const onMouseMove = (e) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const onTouchMove = (e) => {
        if (!isDragging) return;
        handleMove(e.touches[0].clientX);
    };

    const stopDrag = () => setIsDragging(false);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', stopDrag);
            window.addEventListener('touchmove', onTouchMove, { passive: false });
            window.addEventListener('touchend', stopDrag);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('touchend', stopDrag);
        };
    }, [isDragging]);

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
        >
            {/* ZAGLAVLJE */}
            <div className={styles.cardHeader}>
                <div>
                    <h3 className={styles.clientName}>{client.name}</h3>
                    <span className={styles.programName}>{client.program}</span>
                </div>
                <div className={styles.statusIndicator}>
                    <span className={styles.statusDot}></span> VERIFIED
                </div>
            </div>

            {/* SLIDER KONTEJNER */}
            <div
                className={styles.imageContainer}
                ref={containerRef}
                onMouseDown={(e) => { setIsDragging(true); handleMove(e.clientX); }}
                onTouchStart={(e) => { setIsDragging(true); handleMove(e.touches[0].clientX); }}
            >
                {/* SLIKA PRE */}
                <div className={styles.imageBefore}>
                    <img src={client.beforeImg} alt={`Before ${client.name}`} draggable="false" />
                    <span className={styles.labelBefore}>BEFORE</span>
                </div>

                {/* SLIKA POSLE (MASKIRANA) */}
                <div
                    className={styles.imageAfter}
                    style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
                >
                    <img src={client.afterImg} alt={`After ${client.name}`} draggable="false" />
                    <span className={styles.labelAfter}>AFTER</span>
                </div>

                {/* HANDLE LINIJA */}
                <div
                    className={styles.sliderHandle}
                    style={{ left: `${sliderPosition}%` }}
                >
                    <div className={styles.handleButton}>
                        <MoveHorizontal size={20} />
                    </div>
                </div>
            </div>

            {/* HUD STATS */}
            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <Scissors className={styles.statIcon} size={20} />
                    <span className={styles.statValue}>{client.stats.technique}</span>
                    <span className={styles.statLabel}>STIL</span>
                </div>
                <div className={styles.statItem}>
                    <Clock className={styles.statIcon} size={20} />
                    <span className={styles.statValue}>{client.stats.time}</span>
                    <span className={styles.statLabel}>BRZINA</span>
                </div>
                <div className={styles.statItem}>
                    <TrendingUp className={styles.statIcon} size={20} />
                    <span className={styles.statValue}>{client.stats.retention}</span>
                    <span className={styles.statLabel}>EFIKASNOST</span>
                </div>
            </div>

            <div className={styles.quoteBox}>
                <p>{client.quote}</p>
            </div>
        </motion.div>
    );
};

const Galerija = () => {
    return (
        <section className={styles.section}>
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>
            <div className={styles.backlightGlow}></div>

            <div className={styles.container}>
                <div className={styles.header}>
                    <motion.div
                        className={styles.topTag}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        REALNI REZULTATI
                    </motion.div>
                    <motion.h2
                        className={styles.mainTitle}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                    >
                        NAPREDAK <br />
                        <span className={styles.outlineText}>POLAZNIKA</span>
                    </motion.h2>
                </div>

                <div className={styles.transformationsGrid}>
                    {transformations.map((client, index) => (
                        <TransformationCard key={client.id} client={client} index={index} />
                    ))}
                </div>

                <motion.div
                    className={styles.ctaContainer}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    <div className={styles.ctaContent}>
                        <h3>Spreman za napredak?</h3>
                        <p>
                            Pridruži se stotinama frizera koji su unapredili svoju tehniku, ubrzali proces i udvostručili svoje prihode uz Masterclass program.
                        </p>
                        <Link to="/paket" className={styles.ctaButton}>
                            POČNI DANAS <ArrowRight size={20} />
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Galerija;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pocetna.css';
import { useInView } from 'react-intersection-observer';

// IMPORTUJEMO NOVU KOMPONENTU
import Hero from '../pocetna/Hero';
import Features from '../pocetna/Features';
import Testimonijal from '../pocetna/Testimonijal';
import FAQ from '../pocetna/FAQ';
import Footer from '../pocetna/Footer';
import Motion from '../pocetna/Motion';
import Zid from '../pocetna/Zid';

const ChevronIcon = ({ isOpen }) => <i className={`ri-arrow-down-s-line accordion-chevron ${isOpen ? 'open' : ''}`}></i>;

const AnimateOnScroll = ({ children }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div ref={ref} className={`fade-in-section ${inView ? 'is-visible' : ''}`}>
            {children}
        </div>
    );
};

const Pocetna = () => {
    const navigate = useNavigate();
    return (
        <div className="pocetna-wrapper">
            <main className="pocetna-page">
                {/* HERO i MOTION komponente isključene iz AnimateOnScroll jer imaju napredan interni GSAP */}
                <Hero navigate={navigate} />
                <Motion navigate={navigate} />

                <AnimateOnScroll>
                    <Zid navigate={navigate} />
                </AnimateOnScroll>

                {/* <AnimateOnScroll>
                    <Features navigate={navigate} />
                </AnimateOnScroll>

                <AnimateOnScroll>
                    <Testimonijal />
                </AnimateOnScroll> */}

                <AnimateOnScroll>
                    <FAQ navigate={navigate} />
                </AnimateOnScroll>
            </main>
            <Footer />
        </div>
    );
};

export default Pocetna;
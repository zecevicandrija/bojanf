import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { RiArrowDownSLine } from 'react-icons/ri';
import './Pocetna.css';
import { useInView } from 'react-intersection-observer';

// HERO i staticne osnovne komponente
import Hero from '../pocetna/Hero';

// LAZY LOADED - Komponente koje nisu odmah vidljive
const Zid = lazy(() => import('../pocetna/Zid'));
const Motion = lazy(() => import('../pocetna/Motion'));
const FAQ = lazy(() => import('../pocetna/FAQ'));
const Footer = lazy(() => import('../pocetna/Footer'));
const Galerija = lazy(() => import('../pocetna/Galerija'));

const ChevronIcon = ({ isOpen }) => <RiArrowDownSLine className={`accordion-chevron ${isOpen ? 'open' : ''}`} />;

const LazySection = ({ children, height = '400px', rootMargin = '200px' }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin,
    });

    return (
        <div ref={ref} style={{ minHeight: inView ? 'auto' : height }}>
            {inView ? (
                <Suspense fallback={<div style={{ height }} />}>
                    <div className="fade-in-section is-visible">
                        {children}
                    </div>
                </Suspense>
            ) : null}
        </div>
    );
};

const Pocetna = () => {
    const navigate = useNavigate();
    return (
        <div className="pocetna-wrapper">
            <main className="pocetna-page">
                <Hero navigate={navigate} />

                {/* Motion is right after Hero, so start loading it early */}
                <LazySection height="600px" rootMargin="200px">
                    <Motion navigate={navigate} />
                </LazySection>

                <LazySection height="400px">
                    <Zid navigate={navigate} />
                </LazySection>

                <LazySection height="400px">
                    <Galerija navigate={navigate} />
                </LazySection>

                <LazySection height="400px">
                    <FAQ navigate={navigate} />
                </LazySection>
            </main>
        </div>
    );
};

export default Pocetna;
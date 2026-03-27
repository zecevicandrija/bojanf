import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer id="footer" className={styles.footerSection}>
            {/* Background layers */}
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.container}>

                <div className={styles.hookContainer}>
                    <div className={styles.headlineGroup}>
                        <h2 className={styles.headlineMain}>POSTANI</h2>
                        <h2 className={styles.headlineAccent}>MAJSTOR<span className={styles.desktopDot}>.</span></h2>
                    </div>
                </div>

                {/* 2. THE CLEAN GRID (Information Core) */}
                <div className={styles.gridContainer}>

                    {/* Column 1: Identity */}
                    <div className={styles.brandColumn}>
                        <h3 className={styles.logoName}>BOJAN FASHION<span className={styles.dot}>.</span></h3>
                        <p className={styles.brandSlogan}>Edukacija za one koji ne prihvataju prosek.</p>
                    </div>

                    {/* Column 2: Navigation */}
                    <div className={styles.linksColumn}>
                        <Link to="/" className={styles.navLink}>Početna</Link>
                        <Link to="/kursevi" className={styles.navLink}>Kursevi</Link>
                        <Link to="/#faq" className={styles.navLink}>FAQ</Link>
                    </div>

                    {/* Column 3: Contact & Social (Editorial Style) */}
                    <div className={styles.socialColumn}>
                        <a href="https://instagram.com/bojanfashion" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Instagram</a>
                        <a href="https://facebook.com/bojanfashion" target="_blank" rel="noopener noreferrer" className={styles.navLink}>Facebook</a>
                        <a href="mailto:info@bojanfashion.com" className={styles.navLink}>Kontakt</a>
                    </div>
                </div>

                {/* 3. THE BASELINE (Surgical Cut & Copyright Bar) */}
                <div className={styles.baselineTemplate}>
                    <div className={styles.baselineCut}></div>

                    <div className={styles.copyrightBar}>
                        <div className={styles.copyLeft}>
                            © 2026 Bojan Fashion Academy. Sva prava zadržana.
                        </div>
                        <div className={styles.copyRight}>
                            <span className={styles.devLabel}>Dizajn i razvoj: </span>
                            <a href="https://zecevicdev.com" target="_blank" rel="noopener noreferrer" className={styles.devLink}>
                                zecevicdev.com
                            </a>
                        </div>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;

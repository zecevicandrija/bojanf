import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../login/auth';
import { motion } from 'framer-motion';
import { RiLineChartLine, RiAccountCircleLine } from 'react-icons/ri';
import './Navbar.css';
import { ThemeContext } from '../komponente/ThemeContext';
import logo from '../images/bojanslike/novilogo.png'

const Navbar = () => {
    const { user, loading } = useAuth();
    const { isDarkTheme } = useContext(ThemeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);
    const location = useLocation();

    // Cart listener
    useEffect(() => {
        const updateCartItems = () => {
            const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
            setCartItems(storedCart);
        };
        updateCartItems();
        window.addEventListener('storage', updateCartItems);
        window.addEventListener('cart-updated', updateCartItems);
        return () => {
            window.removeEventListener('storage', updateCartItems);
            window.removeEventListener('cart-updated', updateCartItems);
        };
    }, []);

    // Scroll detection
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setScrolled(currentScrollY > 30);

            if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                setHidden(true);
            } else {
                setHidden(false);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMenuOpen]);

    const handleMenuToggle = () => setIsMenuOpen(!isMenuOpen);
    const closeMobileMenu = () => setIsMenuOpen(false);

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <motion.nav
                className={`navbar ${scrolled ? 'scrolled' : ''}`}
                initial={{ y: -150, opacity: 0 }}
                animate={{ y: hidden ? -150 : 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="navbar-container">
                    <div className="navbar-col navbar-col-left">
                        {/* ===== Logo ===== */}
                        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                            <div className="logo-wrapper">
                                <img src={logo} width="36" height="36" alt="Bojan Fashion Barbershop" className="logo" />
                            </div>
                            <div className="logo-text">
                                <span className="logo-name">Bojan Fashion</span>
                                <span className="mobile-only-badge">METOD 1.0</span>
                            </div>
                        </Link>
                    </div>

                    <div className="navbar-col navbar-col-center">
                        {/* ===== Desktop Pill Menu ===== */}
                        <ul className="navbar-menu-desktop">
                            <li>
                                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                                    Početna
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/#footer"
                                    className="nav-link"
                                    onClick={(e) => {
                                        if (location.pathname === '/') {
                                            e.preventDefault();
                                            document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                                        } else {
                                            setTimeout(() => {
                                                document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        }
                                    }}
                                >
                                    Kontakt
                                </Link>
                            </li>
                            {user && (
                                <li>
                                    <Link to="/kupljenkurs" className={`nav-link ${isActive('/kupljenkurs') ? 'active' : ''}`}>
                                        Lekcije
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="navbar-col navbar-col-right">
                        {/* ===== Right Actions ===== */}
                        <div className="navbar-actions">
                            {user && (
                                <>
                                    {(user.uloga === 'admin' || user.uloga === 'instruktor') && (
                                        <Link to="/instruktor" className="nav-icon-btn" title="Dashboard">
                                            <RiLineChartLine />
                                        </Link>
                                    )}
                                    <Link to="/profil" className="nav-icon-btn" title="Profil">
                                        <RiAccountCircleLine />
                                    </Link>
                                </>
                            )}

                            {!loading && !user && (
                                <Link to="/login" className="nav-cta-btn" onClick={closeMobileMenu}>
                                    Prijavi se
                                </Link>
                            )}

                            {/* Hamburger — mobile only */}
                            <button
                                className="navbar-hamburger"
                                onClick={handleMenuToggle}
                                aria-label="Toggle menu"
                            >
                                <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <motion.path
                                        stroke="#fff" strokeWidth="2" strokeLinecap="square"
                                        animate={isMenuOpen ? "open" : "closed"}
                                        variants={{
                                            closed: { d: "M0 2H28" },
                                            open: { d: "M4 4L24 16" }
                                        }}
                                    />
                                    <motion.path
                                        stroke="#fff" strokeWidth="2" strokeLinecap="square"
                                        animate={isMenuOpen ? "open" : "closed"}
                                        variants={{
                                            closed: { d: "M0 10H28", opacity: 1 },
                                            open: { d: "M14 10H14", opacity: 0 }
                                        }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <motion.path
                                        stroke="#fff" strokeWidth="2" strokeLinecap="square"
                                        animate={isMenuOpen ? "open" : "closed"}
                                        variants={{
                                            closed: { d: "M0 18H17" },
                                            open: { d: "M4 16L24 4" }
                                        }}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* ===== Mobile Overlay Menu ===== */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-content">
                    <div className="mobile-menu-links">
                        <Link to="/" className={`mobile-link ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
                            <span className="mobile-link-num">01</span>
                            <span className="mobile-link-text">Početna</span>
                        </Link>
                        <Link to="/kursevi" className={`mobile-link ${isActive('/kursevi') ? 'active' : ''}`} onClick={closeMobileMenu}>
                            <span className="mobile-link-num">02</span>
                            <span className="mobile-link-text">Kursevi</span>
                        </Link>
                        <Link
                            to="/#footer"
                            className="mobile-link"
                            onClick={(e) => {
                                if (location.pathname === '/') {
                                    e.preventDefault();
                                    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                                    closeMobileMenu();
                                } else {
                                    closeMobileMenu();
                                    setTimeout(() => {
                                        document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 100);
                                }
                            }}
                        >
                            <span className="mobile-link-num">03</span>
                            <span className="mobile-link-text">Kontakt</span>
                        </Link>
                        {user && (
                            <Link to="/kupljenkurs" className={`mobile-link ${isActive('/kupljenkurs') ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <span className="mobile-link-num">04</span>
                                <span className="mobile-link-text">Lekcije</span>
                            </Link>
                        )}
                        {user && (
                            <Link to="/profil" className={`mobile-link ${isActive('/profil') ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <span className="mobile-link-num">05</span>
                                <span className="mobile-link-text">Profil</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile bottom section */}
                    <div className="mobile-menu-footer">
                        {!loading && !user && (
                            <Link to="/login" className="mobile-cta" onClick={closeMobileMenu}>
                                Prijavi se na Edukaciju
                            </Link>
                        )}
                        <div className="mobile-footer-line"></div>
                        <span className="mobile-footer-brand">Bojan Fashion © 2024</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
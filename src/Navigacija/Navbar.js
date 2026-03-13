import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../login/auth';
import './Navbar.css';
import { ThemeContext } from '../komponente/ThemeContext';
import logo from '../images/logo.webp';

const Navbar = () => {
    const { user, loading } = useAuth();
    const { isDarkTheme } = useContext(ThemeContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [scrolled, setScrolled] = useState(false);
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
        const handleScroll = () => setScrolled(window.scrollY > 30);
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
    const cartItemCount = cartItems.length;

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className={`navbar ${isDarkTheme ? 'dark' : ''} ${scrolled ? 'scrolled' : ''}`}>
                <div className="navbar-container">

                    {/* ===== Logo ===== */}
                    <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
                        <div className="logo-wrapper">
                            <img src={logo} alt="Bojan Fashion Barbershop" className="logo" />
                        </div>
                        <div className="logo-text">
                            <span className="logo-name">Bojan Fashion</span>
                            <span className="logo-tagline">Barbershop Academy</span>
                        </div>
                    </Link>

                    {/* ===== Desktop Nav Links ===== */}
                    <ul className="navbar-menu-desktop">
                        <li>
                            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                                Početna
                            </Link>
                        </li>
                        <li>
                            <Link to="/kursevi" className={`nav-link ${isActive('/kursevi') ? 'active' : ''}`}>
                                Kursevi
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

                    {/* ===== Right Actions ===== */}
                    <div className="navbar-actions">
                        {user && (
                            <>
                                {(user.uloga === 'admin' || user.uloga === 'instruktor') && (
                                    <Link to="/instruktor" className="nav-icon-btn" title="Dashboard">
                                        <i className="ri-line-chart-line"></i>
                                    </Link>
                                )}
                                <Link to="/profil" className="nav-icon-btn" title="Profil">
                                    <i className="ri-account-circle-line"></i>
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
                            className={`navbar-hamburger ${isMenuOpen ? 'open' : ''}`}
                            onClick={handleMenuToggle}
                            aria-label="Toggle menu"
                        >
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                            <span className="hamburger-line"></span>
                        </button>
                    </div>
                </div>
            </nav>

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
                        {user && (
                            <Link to="/kupljenkurs" className={`mobile-link ${isActive('/kupljenkurs') ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <span className="mobile-link-num">03</span>
                                <span className="mobile-link-text">Lekcije</span>
                            </Link>
                        )}
                        {user && (
                            <Link to="/profil" className={`mobile-link ${isActive('/profil') ? 'active' : ''}`} onClick={closeMobileMenu}>
                                <span className="mobile-link-num">{user ? '04' : '03'}</span>
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
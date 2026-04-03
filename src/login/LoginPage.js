import React, { useState } from 'react';
import { useAuth } from './auth';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import './LoginPage.css'

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [sifra, setSifra] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            await login(email, sifra);
        } catch (error) {
            setShowModal(true);
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    return (
        <div className="lpage-wrapper">
            <div className="noise-overlay"></div>
            <div className="grid-overlay"></div>

            <motion.div
                className="lpage-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Header matches Hero style */}
                <div className="lpage-header">
                    <motion.div 
                        className="lpage-badge"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <span className="badge-text">STUDENTSKI PORTAL <span className="badge-version">1.0</span></span>
                    </motion.div>
                    
                    <motion.div 
                        className="headline-wrapper"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <span className="solid-text">NASTAVI</span>
                        <span className="outline-text">UČENJE</span>
                    </motion.div>
                    
                    <p className="lpage-subtitle">Dobrodošli nazad u Bojan Fashion Akademiju.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="lpage-form">
                    <div className="lpage-input-group">
                        <label htmlFor="email">
                            <FiMail /> EMAIL ADRESA
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="vas@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="lpage-input-group">
                        <label htmlFor="password">
                            <FiLock /> LOZINKA
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={sifra}
                            onChange={(e) => setSifra(e.target.value)}
                            required
                        />
                    </div>

                    <motion.button
                        type="submit"
                        className="lpage-submit-btn"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span>{isLoading ? 'PRIJAVA U TOKU...' : 'PRISTUPI PORTALU'}</span>
                        <FiArrowRight />
                        <div className="btn-shine" />
                    </motion.button>
                </form>

                <div className="lpage-footer">
                    <p>Zaboravili ste lozinku? Kontaktirajte podršku.</p>
                </div>
            </motion.div>

            {/* Error Modal */}
            {showModal && (
                <motion.div
                    className="lpage-modal-overlay"
                    onClick={closeModal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="lpage-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <div className="lpage-modal-icon-box">
                            <FiAlertCircle />
                        </div>
                        <h3>GREŠKA PRI PRIJAVI</h3>
                        <p>Podaci nisu ispravni. Proverite email i lozinku.</p>
                        <button onClick={closeModal} className="lpage-modal-btn">
                            POKUŠAJ PONOVO
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiTag, FiArrowRight, FiPackage, FiCheck, FiAlertCircle, FiPhone } from 'react-icons/fi';
import { useAuth } from '../login/auth';
import api from '../login/api';
import './Informacije.css';
import Footer from '../pocetna/Footer.js';

// Logotipi
import visaSecure from '../images/logotipi/visa-secure_blu_72dpi.jpg';
import mcIdCheck from '../images/logotipi/mc_idcheck_hrz_rgb_pos.png';
import maestro from '../images/logotipi/ms_acc_opt_70_1x.png';
import mastercard from '../images/logotipi/mc_acc_opt_70_1x.png';
import dina from '../images/logotipi/DinaCard znak.jpg';
import visa from '../images/logotipi/Visa_Brandmark_Blue_RGB_2021.png';
import chipcard from '../images/logotipi/ChipCard LOGO 2021_rgb.jpg';

const Informacije = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const packageData = location.state?.packageData;

    // Form state
    const [formData, setFormData] = useState({
        ime: '',
        prezime: '',
        email: '',
        telefon: ''
    });

    const [discountCode, setDiscountCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(null);
    const [discountError, setDiscountError] = useState('');
    const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    // Ako nema podataka o paketu, vrati korisnika nazad
    useEffect(() => {
        if (!packageData) {
            navigate('/paket');
        }
    }, [packageData, navigate]);

    // Popuni podatke ako je korisnik ulogovan
    useEffect(() => {
        if (user) {
            setFormData({
                ime: user.ime || '',
                prezime: user.prezime || '',
                email: user.email || '',
                telefon: user.telefon || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Ukloni grešku za ovo polje
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.ime.trim()) {
            newErrors.ime = 'Ime je obavezno';
        }

        if (!formData.prezime.trim()) {
            newErrors.prezime = 'Prezime je obavezno';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email je obavezan';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email nije validan';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) {
            setDiscountError('Unesite kod popusta');
            return;
        }

        setIsValidatingDiscount(true);
        setDiscountError('');

        try {
            const response = await api.post('/api/popusti/validate', {
                code: discountCode
            });

            if (response.data.success) {
                setDiscountApplied({
                    code: discountCode,
                    percent: response.data.discountPercent
                });
                setDiscountError('');
            }
        } catch (error) {
            setDiscountError(error.response?.data?.message || 'Kod popusta nije validan');
            setDiscountApplied(null);
        } finally {
            setIsValidatingDiscount(false);
        }
    };

    const handleRemoveDiscount = () => {
        setDiscountCode('');
        setDiscountApplied(null);
        setDiscountError('');
    };

    const calculateFinalPrice = () => {
        if (!packageData) return 0;

        let finalPrice = packageData.amount;

        if (discountApplied) {
            const discount = (finalPrice * discountApplied.percent) / 100;
            finalPrice = finalPrice - discount;
        }

        // Uvek vraćamo ceo broj (integer) za Chipcard
        return Math.floor(finalPrice);
    };

    const handleProceedToPayment = async () => {
        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        try {
            const korisnikId = user?.id || null;
            const finalAmount = calculateFinalPrice(); // Integer cena u dinarima

            const requestData = {
                customerEmail: formData.email,
                customerName: `${formData.ime} ${formData.prezime}`,
                customerPhone: formData.telefon || '',
                packageData: {
                    ...packageData,
                    amount: finalAmount // Šaljemo kao integer
                }
            };

            if (korisnikId) {
                requestData.korisnikId = korisnikId;
            }

            if (discountApplied) {
                requestData.discountCode = discountApplied.code;
            }

            const response = await api.post('/api/msu/create-session', requestData);

            if (response.data.success && response.data.redirectUrl) {
                // Preusmeri korisnika na Chipcard payment stranicu
                window.location.href = response.data.redirectUrl;
            } else {
                alert('Greška pri kreiranju sesije plaćanja. Pokušajte ponovo.');
                setIsProcessing(false);
            }

        } catch (error) {
            console.error('Error creating payment session:', error);
            alert(error.response?.data?.error || 'Došlo je do greške. Molimo pokušajte ponovo.');
            setIsProcessing(false);
        }
    };

    if (!packageData) {
        return null;
    }

    const finalPrice = calculateFinalPrice();
    const savings = packageData.amount - finalPrice;

    return (
        <>
            <div className="informacije-wrapper">
                <div className="noise-overlay"></div>
                <div className="grid-overlay"></div>

                <div className="informacije-container">
                    <motion.div
                        className="informacije-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Header matching Paket/Hero */}
                        <div className="info-header">
                            <motion.div
                                className="info-badge"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="badge-text">CHECKOUT <span className="badge-version">1.0</span></span>
                            </motion.div>

                            <motion.div
                                className="headline-wrapper"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <span className="solid-text">POTVRDI</span>
                                <span className="outline-text">PRIJAVU</span>
                            </motion.div>

                            <p className="info-subtitle">Podigni svoju karijeru na viši nivo uz ekspertsko mentorstvo.</p>
                        </div>

                        <div className="info-grid">
                            {/* Form - Left Side */}
                            <motion.div
                                className="checkout-form-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="form-title">Lični podaci</h3>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="ime">
                                            <FiUser /> Ime
                                        </label>
                                        <input
                                            type="text"
                                            id="ime"
                                            name="ime"
                                            value={formData.ime}
                                            onChange={handleInputChange}
                                            className={errors.ime ? 'error' : ''}
                                            placeholder="Ime"
                                        />
                                        {errors.ime && <span className="error-message">{errors.ime}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="prezime">
                                            <FiUser /> Prezime
                                        </label>
                                        <input
                                            type="text"
                                            id="prezime"
                                            name="prezime"
                                            value={formData.prezime}
                                            onChange={handleInputChange}
                                            className={errors.prezime ? 'error' : ''}
                                            placeholder="Prezime"
                                        />
                                        {errors.prezime && <span className="error-message">{errors.prezime}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">
                                        <FiMail /> Email adresa
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={errors.email ? 'error' : ''}
                                        placeholder="vas@email.com"
                                    />
                                    {errors.email && <span className="error-message">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="telefon">
                                        <FiPhone /> Kontakt telefon
                                    </label>
                                    <input
                                        type="tel"
                                        id="telefon"
                                        name="telefon"
                                        value={formData.telefon}
                                        onChange={handleInputChange}
                                        placeholder="+381 60 123 4567"
                                    />
                                </div>

                                {/* Discount Section */}
                                <div className="discount-section">
                                    <label htmlFor="discountCode" className="discount-label">
                                        <FiTag /> Imate kod za popust?
                                    </label>

                                    {!discountApplied ? (
                                        <div className="discount-input-group">
                                            <input
                                                type="text"
                                                id="discountCode"
                                                value={discountCode}
                                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                                placeholder="UNESITE KOD"
                                                disabled={isValidatingDiscount}
                                            />
                                            <button
                                                className="apply-discount-btn"
                                                onClick={handleApplyDiscount}
                                                disabled={isValidatingDiscount || !discountCode.trim()}
                                            >
                                                {isValidatingDiscount ? 'PROVERA...' : 'PRIMENI'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="discount-applied-input">
                                            <span className="applied-code">
                                                <FiCheck /> {discountApplied.code}
                                            </span>
                                            <button
                                                className="remove-discount-btn"
                                                onClick={handleRemoveDiscount}
                                            >
                                                UKLONI
                                            </button>
                                        </div>
                                    )}

                                    {discountError && (
                                        <div className="discount-error">
                                            <FiAlertCircle /> {discountError}
                                        </div>
                                    )}
                                </div>
                            </motion.div>

                            {/* Summary - Right Side */}
                            <motion.div
                                className="package-summary-card"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="summary-header">
                                    <FiPackage className="summary-icon" />
                                    <h3>Pregled porudžbine</h3>
                                </div>

                                <div className="summary-content">
                                    <div className="package-title-box">
                                        <h2>{packageData.title}</h2>
                                        <span className="package-period">{packageData.period}</span>
                                    </div>

                                    <p className="package-description">{packageData.description}</p>

                                    <div className="price-breakdown">
                                        <div className="price-row">
                                            <span>Osnovna cena</span>
                                            <span className="price-value">{packageData.price}</span>
                                        </div>

                                        {discountApplied && (
                                            <>
                                                <div className="price-row discount-row">
                                                    <span>Popust ({discountApplied.percent}%)</span>
                                                    <span className="discount-value">-{savings.toFixed(0)} RSD</span>
                                                </div>
                                                <div className="divider" />
                                            </>
                                        )}

                                        <div className="price-row total-row">
                                            <span>UKUPNO ZA UPLATU</span>
                                            <span className="total-value">{finalPrice.toFixed(0)} <small>RSD</small></span>
                                        </div>
                                    </div>

                                    {/* Action Button moved here for better mobile flow if needed, or kept at bottom */}
                                    <motion.button
                                        className="proceed-payment-btn"
                                        onClick={handleProceedToPayment}
                                        disabled={isProcessing}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <span>{isProcessing ? 'OBRADA...' : 'NASTAVI NA PLAĆANJE'}</span>
                                        <FiArrowRight className="btn-icon" />
                                        <div className="btn-shine" />
                                    </motion.button>

                                    <p className="secure-payment-note">
                                        🔒 100% SIGURNO PLAĆANJE
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Payment & Security Logos */}
                        <motion.div
                            className="paket-logos-wrapper"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                        >
                            <div className="paket-logos-container">
                                <div className="logos-group security-group">
                                    <a href="https://rs.visa.com/pay-withvisa/security-and-assistance/protected-everywhere.html" target="_blank" rel="noopener noreferrer">
                                        <img src={visaSecure} alt="Visa Secure" className="logo-img" />
                                    </a>
                                    <a href="http://www.mastercard.com/rs/consumer/credit-cards.html" target="_blank" rel="noopener noreferrer">
                                        <img src={mcIdCheck} alt="Mastercard ID Check" className="logo-img" />
                                    </a>
                                </div>

                                <div className="logos-group payment-group">
                                    <img src={maestro} alt="Maestro" className="logo-img" />
                                    <img src={mastercard} alt="Mastercard" className="logo-img" />
                                    <img src={dina} alt="DinaCard" className="logo-img" />
                                    <img src={visa} alt="Visa" className="logo-img" />
                                    <a href="https://chipcard.rs/ecommerce/" target="_blank" rel="noopener noreferrer">
                                        <img src={chipcard} alt="ChipCard" className="logo-img" style={{ height: '35px' }} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default Informacije;

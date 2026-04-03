import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api from '../login/api';
import { useAuth } from '../login/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiClock, FiArrowRight, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import './PaymentResult.css';

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser } = useAuth();
    const [paymentStatus, setPaymentStatus] = useState('loading');
    const [transactionData, setTransactionData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const checkPaymentStatus = async () => {
            try {
                // Dohvati parametre iz URL-a
                const merchantPaymentId = searchParams.get('merchantPaymentId');
                const responseCode = searchParams.get('responseCode');
                const responseMsg = searchParams.get('responseMsg');

                if (!merchantPaymentId) {
                    setError('Nedostaju podaci o transakciji');
                    setPaymentStatus('error');
                    return;
                }

                // Prvo ažuriraj transakciju sa callback podacima ako postoje
                if (responseCode && responseMsg) {
                    const callbackData = {
                        merchantPaymentId,
                        responseCode,
                        responseMsg,
                        pgTranId: searchParams.get('pgTranId'),
                        pgOrderId: searchParams.get('pgOrderId'),
                        pgTranRefId: searchParams.get('pgTranRefId'),
                        amount: searchParams.get('amount'),
                        sessionToken: searchParams.get('sessionToken')
                    };

                    await axios.post('http://localhost:5000/api/msu/callback', callbackData);
                }

                // Dohvati konačan status transakcije
                const response = await axios.get(
                    `http://localhost:5000/api/msu/status/${merchantPaymentId}`
                );

                if (response.data.success) {
                    setTransactionData(response.data.transaction);

                    if (response.data.transaction.status === 'APPROVED') {
                        setPaymentStatus('success');
                        // Osveži user podatke u auth kontekstu nakon uspešnog plaćanja
                        try {
                            const meResponse = await api.get('/api/auth/me');
                            setUser(meResponse.data);
                            localStorage.setItem('user', JSON.stringify(meResponse.data));
                        } catch (e) {
                            console.error('Failed to refresh user data:', e);
                        }
                    } else if (response.data.transaction.status === 'FAILED') {
                        setPaymentStatus('failed');
                    } else if (response.data.transaction.status === 'CANCELLED') {
                        setPaymentStatus('cancelled');
                    } else {
                        setPaymentStatus('pending');
                    }
                } else {
                    setError('Greška pri proveri statusa plaćanja');
                    setPaymentStatus('error');
                }

            } catch (err) {
                console.error('Error checking payment status:', err);
                setError('Greška pri komunikaciji sa serverom');
                setPaymentStatus('error');
            }
        };

        checkPaymentStatus();
    }, [searchParams]);

    const handleGoToCourses = () => {
        navigate('/kupljeni-kursevi');
    };

    const handleGoBack = () => {
        navigate('/');
    };

    if (paymentStatus === 'loading') {
        return (
            <div className="instruktor-wrapper">
                <div className="noise-overlay"></div>
                <div className="grid-overlay"></div>
                <div className="payment-result-full-page">
                    <div className="loading-spinner-premium">
                        <div className="spinner-glow"></div>
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0.5, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            PROVERA TRANSAKCIJE...
                        </motion.h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="instruktor-wrapper">
            <div className="noise-overlay"></div>
            <div className="grid-overlay"></div>

            <div className="instruktor-container">
                <div className="payment-result-full-page">
                    <AnimatePresence mode="wait">
                        {paymentStatus === 'success' && (
                            <motion.div 
                                className="payment-card success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="success"
                            >
                                <div className="status-header">
                                    <div className="status-icon-box">
                                        <FiCheck />
                                    </div>
                                    <span className="status-label">APPROVED</span>
                                </div>

                                <div className="payment-content">
                                    <h1>Plaćanje Uspešno!</h1>
                                    <p>Vaša transakcija je procesuirana. Pristup kursu vam je sada omogućen.</p>

                                    {transactionData && (
                                        <div className="premium-details-box">
                                            <div className="detail-item">
                                                <span className="d-label">KURS</span>
                                                <span className="d-value">{transactionData.kursNaziv}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="d-label">IZNOS</span>
                                                <span className="d-value">{transactionData.amount} {transactionData.currency}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="d-label">ID TRANSAKCIJE</span>
                                                <span className="d-value">#{transactionData.merchantPaymentId}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="payment-actions">
                                        <motion.button 
                                            className="admin-action-btn primary" 
                                            onClick={handleGoToCourses}
                                            whileHover={{ y: -3 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <FiArrowRight /> <span>IDI NA MOJE KURSEVE</span>
                                            <div className="btn-shine" />
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paymentStatus === 'failed' && (
                            <motion.div 
                                className="payment-card failed"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="failed"
                            >
                                <div className="status-header">
                                    <div className="status-icon-box">
                                        <FiX />
                                    </div>
                                    <span className="status-label">DECLINED</span>
                                </div>

                                <div className="payment-content">
                                    <h1>Plaćanje Neuspešno</h1>
                                    <p>Nažalost, došlo je do greške prilikom autorizacije vaše kartice.</p>

                                    {transactionData && (
                                        <div className="premium-details-box">
                                            <div className="detail-item">
                                                <span className="d-label">RAZLOG</span>
                                                <span className="d-value">{transactionData.responseMsg}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="d-label">ID NALOGA</span>
                                                <span className="d-value">#{transactionData.merchantPaymentId}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="payment-actions">
                                        <button className="admin-action-btn secondary" onClick={handleGoBack}>
                                            <FiArrowLeft /> <span>POKUŠAJ PONOVO</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paymentStatus === 'cancelled' && (
                            <motion.div 
                                className="payment-card cancelled"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="cancelled"
                            >
                                <div className="status-header">
                                    <div className="status-icon-box">
                                        <FiAlertTriangle />
                                    </div>
                                    <span className="status-label">CANCELLED</span>
                                </div>

                                <div className="payment-content">
                                    <h1>Plaćanje Otkazano</h1>
                                    <p>Odustali ste od procesa plaćanja. Korpa je i dalje sačuvana.</p>

                                    <div className="payment-actions">
                                        <button className="admin-action-btn secondary" onClick={handleGoBack}>
                                            <FiShoppingBag /> <span>POVRATAK NA KORPU</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paymentStatus === 'pending' && (
                            <motion.div 
                                className="payment-card pending"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="pending"
                            >
                                <div className="status-header">
                                    <div className="status-icon-box">
                                        <FiClock />
                                    </div>
                                    <span className="status-label">PROCESSING</span>
                                </div>

                                <div className="payment-content">
                                    <h1>Ubrzo Smo Gotovi</h1>
                                    <p>Transakcija se trenutno proverava. Dobićete potvrdu na e-mail.</p>

                                    <div className="payment-actions">
                                        <button className="admin-action-btn secondary" onClick={() => navigate('/')}>
                                            <FiArrowLeft /> <span>POVRATAK NA POČETNU</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {paymentStatus === 'error' && (
                            <motion.div 
                                className="payment-card failed"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                key="error"
                            >
                                <div className="status-header">
                                    <div className="status-icon-box">
                                        <FiAlertTriangle />
                                    </div>
                                    <span className="status-label">SYSTEM ERROR</span>
                                </div>

                                <div className="payment-content">
                                    <h1>Sistemska Greška</h1>
                                    <p>{error || 'Došlo je do neočekivanog problema pri komunikaciji sa bankom.'}</p>

                                    <div className="payment-actions">
                                        <button className="admin-action-btn secondary" onClick={handleGoBack}>
                                            <FiArrowLeft /> <span>POVRATAK NA KORPU</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;

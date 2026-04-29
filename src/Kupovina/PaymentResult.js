import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import api from '../login/api';
import { useAuth } from '../login/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiClock, FiArrowRight, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import styles from './PaymentResult.module.css';

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

                    await axios.post('https://test-api.zecevicdev.com/api/msu/callback', callbackData);
                }

                // Dohvati konačan status transakcije
                const response = await axios.get(
                    `https://test-api.zecevicdev.com/api/msu/status/${merchantPaymentId}`
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
            <div className={styles.paymentWrapper}>
                <div className={styles.noiseOverlay}></div>
                <div className={styles.gridOverlay}></div>
                <div className={styles.container}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinnerGlow}></div>
                        <motion.h2
                            className={styles.loadingText}
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
        <div className={styles.paymentWrapper}>
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.container}>
                <AnimatePresence mode="wait">
                    {paymentStatus === 'success' && (
                        <motion.div
                            className={`${styles.paymentCard} ${styles.success}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key="success"
                        >
                            <div className={styles.statusHeader}>
                                <div className={styles.statusIconBox}>
                                    <FiCheck />
                                </div>
                                <span className={styles.statusLabel}>APPROVED</span>
                            </div>

                            <div className={styles.paymentContent}>
                                <h1>Plaćanje Uspešno!</h1>
                                <p>Vaša transakcija je procesuirana. Pristup kursu vam je sada omogućen.</p>

                                {transactionData && (
                                    <div className={styles.premiumDetailsBox}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.dLabel}>KURS</span>
                                            <span className={styles.dValue}>{transactionData.kursNaziv}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.dLabel}>IZNOS</span>
                                            <span className={styles.dValue}>{transactionData.amount} {transactionData.currency}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.dLabel}>ID TRANSAKCIJE</span>
                                            <span className={styles.dValue}>#{transactionData.merchantPaymentId}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.paymentActions}>
                                    <motion.button
                                        className={styles.primaryBtn}
                                        onClick={handleGoToCourses}
                                        whileHover={{ y: -3 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FiArrowRight className={styles.btnIcon} /> <span>IDI NA MOJE KURSEVE</span>
                                        <div className={styles.btnShine} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {paymentStatus === 'failed' && (
                        <motion.div
                            className={`${styles.paymentCard} ${styles.failed}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key="failed"
                        >
                            <div className={styles.statusHeader}>
                                <div className={styles.statusIconBox}>
                                    <FiX />
                                </div>
                                <span className={styles.statusLabel}>DECLINED</span>
                            </div>

                            <div className={styles.paymentContent}>
                                <h1>Plaćanje Neuspešno</h1>
                                <p>Nažalost, došlo je do greške prilikom autorizacije vaše kartice.</p>

                                {transactionData && (
                                    <div className={styles.premiumDetailsBox}>
                                        <div className={styles.detailItem}>
                                            <span className={styles.dLabel}>RAZLOG</span>
                                            <span className={styles.dValue}>{transactionData.responseMsg}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.dLabel}>ID NALOGA</span>
                                            <span className={styles.dValue}>#{transactionData.merchantPaymentId}</span>
                                        </div>
                                    </div>
                                )}

                                <div className={styles.paymentActions}>
                                    <button className={styles.secondaryBtn} onClick={handleGoBack}>
                                        <FiArrowLeft className={styles.btnIcon} /> <span>POKUŠAJ PONOVO</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {paymentStatus === 'cancelled' && (
                        <motion.div
                            className={`${styles.paymentCard} ${styles.cancelled}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key="cancelled"
                        >
                            <div className={styles.statusHeader}>
                                <div className={styles.statusIconBox}>
                                    <FiAlertTriangle />
                                </div>
                                <span className={styles.statusLabel}>CANCELLED</span>
                            </div>

                            <div className={styles.paymentContent}>
                                <h1>Plaćanje Otkazano</h1>
                                <p>Odustali ste od procesa plaćanja. Korpa je i dalje sačuvana.</p>

                                <div className={styles.paymentActions}>
                                    <button className={styles.secondaryBtn} onClick={handleGoBack}>
                                        <FiShoppingBag className={styles.btnIcon} /> <span>POVRATAK NA KORPU</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {paymentStatus === 'pending' && (
                        <motion.div
                            className={`${styles.paymentCard} ${styles.pending}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key="pending"
                        >
                            <div className={styles.statusHeader}>
                                <div className={styles.statusIconBox}>
                                    <FiClock />
                                </div>
                                <span className={styles.statusLabel}>PROCESSING</span>
                            </div>

                            <div className={styles.paymentContent}>
                                <h1>Ubrzo Smo Gotovi</h1>
                                <p>Transakcija se trenutno proverava. Dobićete potvrdu na e-mail.</p>

                                <div className={styles.paymentActions}>
                                    <button className={styles.secondaryBtn} onClick={() => navigate('/')}>
                                        <FiArrowLeft className={styles.btnIcon} /> <span>POVRATAK NA POČETNU</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {paymentStatus === 'error' && (
                        <motion.div
                            className={`${styles.paymentCard} ${styles.failed}`}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key="error"
                        >
                            <div className={styles.statusHeader}>
                                <div className={styles.statusIconBox}>
                                    <FiAlertTriangle />
                                </div>
                                <span className={styles.statusLabel}>SYSTEM ERROR</span>
                            </div>

                            <div className={styles.paymentContent}>
                                <h1>Sistemska Greška</h1>
                                <p>{error || 'Došlo je do neočekivanog problema pri komunikaciji sa bankom.'}</p>

                                <div className={styles.paymentActions}>
                                    <button className={styles.secondaryBtn} onClick={handleGoBack}>
                                        <FiArrowLeft className={styles.btnIcon} /> <span>POVRATAK NA KORPU</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PaymentResult;

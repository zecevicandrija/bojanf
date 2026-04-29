import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './auth';
import api from './api';
import './MojProfil.css';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiKey, FiArrowRight, FiCheck, FiMessageCircle, FiX, FiUser, FiPackage, FiLogOut, FiCalendar, FiClock } from 'react-icons/fi';

const MojProfil = () => {
    const { user, logout, setUser: setAuthUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        ime: '',
        prezime: '',
        email: '',
        currentPassword: '',
        newPassword: ''
    });

    const [kupljeniKursevi, setKupljeniKursevi] = useState([]);
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);

    const imaAktivnuPretplatu = user &&
        user.subscription_expires_at &&
        new Date(user.subscription_expires_at) > new Date() &&
        user.subscription_status !== 'expired' &&
        user.subscription_status !== 'payment_failed';

    const fetchData = useCallback(async () => {
        if (user) {
            try {
                const meResponse = await api.get('/api/auth/me');
                setAuthUser(meResponse.data);
                localStorage.setItem('user', JSON.stringify(meResponse.data));
            } catch (e) {
                console.error('Failed to refresh user:', e);
            }

            setFormData({
                ime: user.ime || '',
                prezime: user.prezime || '',
                email: user.email || '',
                currentPassword: '',
                newPassword: ''
            });

            const [kupovinaResult, subResult] = await Promise.allSettled([
                api.get(`/api/kupovina/user/${user.id}`),
                api.get(`/api/subscription/details/${user.id}`)
            ]);

            if (kupovinaResult.status === 'fulfilled') {
                setKupljeniKursevi(kupovinaResult.value.data);
            } else {
                setKupljeniKursevi([]);
            }

            if (subResult.status === 'fulfilled' && subResult.value.data.hasRecurring) {
                setSubscriptionDetails(subResult.value.data.subscription);
            } else {
                setSubscriptionDetails(null);
            }
        }
    }, [user?.id, setAuthUser]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        try {
            const profileUpdateData = {
                ime: formData.ime,
                prezime: formData.prezime,
                email: formData.email,
            };
            if (formData.currentPassword && formData.newPassword) {
                await api.post('/api/auth/change-password', {
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                });
            }
            await api.put(`/api/korisnici/${user.id}`, profileUpdateData);

            const response = await api.get('/api/auth/me');
            setAuthUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));

            setMessage('Profil je uspešno ažuriran!');
            setFormData(prevState => ({ ...prevState, currentPassword: '', newPassword: '' }));
        } catch (error) {
            setMessage(error.response?.data?.message || 'Došlo je do greške.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!window.confirm('Da li ste sigurni da želite otkazati automatsko produžavanje? Zadržaćete pristup do isteka trenutne pretplate.')) {
            return;
        }

        setCancelLoading(true);
        try {
            await api.post('/api/subscription/cancel');
            await fetchData();
            alert('Automatsko produžavanje je uspešno otkazano.');
        } catch (error) {
            alert('Greška pri otkazivanju pretplate.');
        } finally {
            setCancelLoading(false);
        }
    };

    const handleReactivateSubscription = async () => {
        setCancelLoading(true);
        try {
            await api.post('/api/subscription/reactivate');
            await fetchData();
            alert('Automatsko produžavanje je ponovo aktivirano!');
        } catch (error) {
            alert('Greška pri reaktivaciji pretplate.');
        } finally {
            setCancelLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="lpage-wrapper">
                <div className="noise-overlay"></div>
                <div className="grid-overlay"></div>
                <div className="profil-container">
                    <motion.div
                        className="welcome-container"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            className="welcome-hero-card"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="welcome-glow" />
                            <div className="welcome-icon-box">
                                <FiCheck className="welcome-check-icon" />
                            </div>
                            <h1 className="welcome-title">
                                Dobrodošli u <span className="gradient-text">Akademiju</span>!
                            </h1>
                            <p className="welcome-subtitle">Uspešno ste se pridružili zajednici.</p>
                        </motion.div>

                        <div className="welcome-info-grid">
                            {[
                                { icon: <FiMail />, title: "Proverite Email", desc: "Podaci za login su poslati na vašu adresu." },
                                { icon: <FiKey />, title: "Pristupite Platformi", desc: "Koristite dobijenu lozinku za prvu prijavu." },
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    className="welcome-info-card"
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 + idx * 0.1 }}
                                >
                                    <div className="info-card-icon-wrapper">{item.icon}</div>
                                    <div className="info-card-content">
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.button
                            className="welcome-cta-btn"
                            onClick={() => navigate('/login')}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span>ULAZ NA PLATFORMU</span>
                            <FiArrowRight />
                            <div className="cta-shine" />
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="profil-wrapper">
            <div className="noise-overlay"></div>
            <div className="grid-overlay"></div>

            <div className="profil-container">
                <motion.div
                    className="profil-top-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="headline-wrapper">
                        <span className="solid-text">MOJ</span>
                        <span className="outline-text">PROFIL</span>
                    </div>
                </motion.div>

                <div className="profil-content-wrapper">
                    {/* Left - Profile Info */}
                    <motion.div
                        className="profil-card"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="card-header-simple">
                            <FiUser /> <h3>Lični podaci</h3>
                        </div>

                        <form onSubmit={handleSubmit} className="profil-form">
                            <div className="form-row">
                                <div className="profil-form-group">
                                    <label>IME</label>
                                    <input name="ime" type="text" value={formData.ime} onChange={handleInputChange} required />
                                </div>
                                <div className="profil-form-group">
                                    <label>PREZIME</label>
                                    <input name="prezime" type="text" value={formData.prezime} onChange={handleInputChange} required />
                                </div>
                            </div>

                            <div className="profil-form-group">
                                <label>EMAIL ADRESA <small>(Fiksirano)</small></label>
                                <input value={formData.email} disabled className="disabled-input" />
                            </div>

                            <div className="divider-line shadow-divider"></div>

                            <h4 className="section-small-title">Sigurnost</h4>
                            <div className="profil-form-group">
                                <label>TRENUTNA LOZINKA</label>
                                <input name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} placeholder="Ostavi prazno ako ne menjaš" />
                            </div>
                            <div className="profil-form-group">
                                <label>NOVA LOZINKA</label>
                                <input name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} placeholder="Nova lozinka" />
                            </div>

                            {message && <p className={`profil-message ${message.includes('uspešno') ? 'success' : 'error'}`}>{message}</p>}

                            <button type="submit" className="profil-submit-btn" disabled={isLoading}>
                                <span>{isLoading ? 'AŽURIRANJE...' : 'SAČUVAJ PROMENE'}</span>
                                <FiCheck />
                                <div className="btn-shine" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Right - Subscriptions */}
                    <motion.div
                        className="pretplata-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="card-header-simple">
                            <FiPackage /> <h3>Moje pretplate</h3>
                        </div>

                        <div className="pretplata-list-container">
                            {kupljeniKursevi.length > 0 ? (
                                <div className="pretplata-list">
                                    {kupljeniKursevi.map(kurs => (
                                        <div key={kurs.id} className="pretplata-item">
                                            <div className="item-main">
                                                <div className="item-icon-box"><FiPackage /></div>
                                                <div className="item-info">
                                                    <span className="item-name">{kurs.naziv}</span>
                                                    <span className="item-meta"><FiCalendar /> {new Date(kurs.datum_kupovine).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            <div className="item-status-box">
                                                {kurs.is_subscription ? (
                                                    imaAktivnuPretplatu ? (
                                                        <span className="status-badge active">AKTIVNO DO {new Date(user.subscription_expires_at).toLocaleDateString()}</span>
                                                    ) : (
                                                        <button onClick={() => navigate('/produzivanje')} className="status-btn-renew">OBNOVI</button>
                                                    )
                                                ) : (
                                                    <span className="status-badge lifetime">TRAJNI PRISTUP</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <FiClock />
                                    <p>Trenutno nemate aktivnih kurseva.</p>
                                    <button onClick={() => navigate('/paket')} className="browse-btn">Istraži kurseve</button>
                                </div>
                            )}
                        </div>

                        {subscriptionDetails && (
                            <div className="billing-section">
                                <div className="divider-line shadow-divider"></div>
                                <h4 className="section-small-title">Naplata & Pretplata</h4>

                                {subscriptionDetails.isActive ? (
                                    <div className="billing-glass-card active-sub">
                                        <div className="billing-row">
                                            <span>Sledeća naplata:</span>
                                            <strong>{new Date(subscriptionDetails.nextBillingDate).toLocaleDateString()}</strong>
                                        </div>
                                        <div className="billing-row">
                                            <span>Iznos:</span>
                                            <strong className="accent-color">{subscriptionDetails.amount} RSD</strong>
                                        </div>
                                        <button onClick={handleCancelSubscription} className="cancel-sub-btn" disabled={cancelLoading}>
                                            <FiX /> {cancelLoading ? 'Otkazivanje...' : 'OTKAŽI PRODUŽAVANJE'}
                                        </button>
                                    </div>
                                ) : imaAktivnuPretplatu ? (
                                    <div className="billing-glass-card cancelled-sub">
                                        <p className="notice-text">Automatsko produžavanje je otkazano. Pristup traje do: <strong>{new Date(user.subscription_expires_at).toLocaleDateString()}</strong></p>
                                        <button onClick={handleReactivateSubscription} className="reactivate-btn" disabled={cancelLoading}>
                                            PONOVO AKTIVIRAJ
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </motion.div>
                </div>

                <motion.button
                    onClick={logout}
                    className="profil-logout-main-btn"
                    whileHover={{ x: 5 }}
                >
                    <span>ODJAVI SE</span>
                    <FiLogOut />
                </motion.button>
            </div>
        </div>
    );
};

export default MojProfil;
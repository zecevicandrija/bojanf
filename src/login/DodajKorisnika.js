import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiUserPlus,
    FiUser,
    FiMail,
    FiLock,
    FiShield,
    FiCalendar,
    FiBookOpen,
    FiCheckCircle,
    FiAlertCircle,
    FiLoader
} from 'react-icons/fi';
import api from '../login/api';
import styles from './DodajKorisnika.module.css';

const DodajKorisnika = () => {
    const navigate = useNavigate();
    const [kursevi, setKursevi] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const [form, setForm] = useState({
        ime: '',
        prezime: '',
        email: '',
        sifra: '',
        uloga: 'korisnik',
        subscription_expires_at: '',
        kurs_id: '1',
    });

    useEffect(() => {
        const fetchKursevi = async () => {
            try {
                const response = await api.get('/api/kursevi');
                setKursevi(response.data);
                if (response.data.length > 0 && !form.kurs_id) {
                    setForm(prev => ({ ...prev, kurs_id: String(response.data[0].id) }));
                }
            } catch (err) {
                console.error('Greška pri dohvatanju kurseva:', err);
            }
        };
        fetchKursevi();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });

        if (!form.ime || !form.prezime || !form.email || !form.sifra) {
            setFeedback({ type: 'error', message: 'Molimo popunite sva obavezna polja.' });
            return;
        }

        if (!form.subscription_expires_at) {
            setFeedback({ type: 'error', message: 'Molimo unesite datum isteka pretplate.' });
            return;
        }

        setIsSubmitting(true);

        try {
            const korisnikResponse = await api.post('/api/korisnici', {
                ime: form.ime,
                prezime: form.prezime,
                email: form.email,
                sifra: form.sifra,
                uloga: form.uloga,
                subscription_expires_at: form.subscription_expires_at,
                subscription_status: 'active',
            });

            const noviKorisnikId = korisnikResponse.data.userId;

            if (form.kurs_id) {
                await api.post('/api/kupovina', {
                    korisnik_id: noviKorisnikId,
                    kurs_id: parseInt(form.kurs_id),
                    popust_id: null,
                });
            }

            setFeedback({
                type: 'success',
                message: `Korisnik "${form.ime} ${form.prezime}" uspešno dodat i upisan u kurs.`,
            });

            setForm({
                ime: '',
                prezime: '',
                email: '',
                sifra: '',
                uloga: 'korisnik',
                subscription_expires_at: '',
                kurs_id: kursevi.length > 0 ? String(kursevi[0].id) : '1',
            });
        } catch (error) {
            console.error('Greška pri dodavanju korisnika:', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'Došlo je do greške na serveru.';
            setFeedback({ type: 'error', message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.dkPage}>
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.dkContainer}>
                <motion.button
                    className={styles.dkBackBtn}
                    onClick={() => navigate('/instruktor')}
                    whileHover={{ x: -5 }}
                >
                    <FiArrowLeft /> NAZAD NA DASHBOARD
                </motion.button>

                <div className={styles.dkHeader}>
                    <motion.div
                        className={styles.dkHeaderIcon}
                        initial={{ rotate: -10 }}
                        animate={{ rotate: 0 }}
                    >
                        <FiUserPlus />
                    </motion.div>
                    <h1>Novi Korisnik</h1>
                    <p>Brzo kreirajte nalog za novog studenta i dodelite mu pristup odabranom kursu.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <form className={styles.dkForm} onSubmit={handleSubmit}>
                        <div className={styles.dkFormGrid}>
                            {/* Ime */}
                            <div className={styles.dkField}>
                                <label htmlFor="ime"><FiUser /> IME *</label>
                                <input
                                    id="ime"
                                    name="ime"
                                    type="text"
                                    placeholder="Npr. Marko"
                                    value={form.ime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Prezime */}
                            <div className={styles.dkField}>
                                <label htmlFor="prezime"><FiUser /> PREZIME *</label>
                                <input
                                    id="prezime"
                                    name="prezime"
                                    type="text"
                                    placeholder="Npr. Marković"
                                    value={form.prezime}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className={`${styles.dkField} ${styles.dkFullWidth}`}>
                                <label htmlFor="email"><FiMail /> EMAIL ADRESA *</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="student@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Šifra */}
                            <div className={styles.dkField}>
                                <label htmlFor="sifra"><FiLock /> PRIVREMENA ŠIFRA *</label>
                                <input
                                    id="sifra"
                                    name="sifra"
                                    type="password"
                                    placeholder="••••••••"
                                    value={form.sifra}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Uloga */}
                            <div className={styles.dkField}>
                                <label htmlFor="uloga"><FiShield /> NIVO PRISTUPA</label>
                                <select id="uloga" name="uloga" value={form.uloga} onChange={handleChange}>
                                    <option value="korisnik">Korisnik (Student)</option>
                                    <option value="instruktor">Instruktor</option>
                                    <option value="admin">Administrator</option>
                                </select>
                            </div>

                            {/* Pretplata */}
                            <div className={styles.dkField}>
                                <label htmlFor="subscription_expires_at"><FiCalendar /> PRISTUP DO *</label>
                                <input
                                    id="subscription_expires_at"
                                    name="subscription_expires_at"
                                    type="datetime-local"
                                    value={form.subscription_expires_at}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Kurs */}
                            <div className={styles.dkField}>
                                <label htmlFor="kurs_id"><FiBookOpen /> DODELI KURS</label>
                                <select id="kurs_id" name="kurs_id" value={form.kurs_id} onChange={handleChange}>
                                    {kursevi.map(k => (
                                        <option key={k.id} value={k.id}>{k.naziv}</option>
                                    ))}
                                    {kursevi.length === 0 && <option value="1">Motion Akademija</option>}
                                </select>
                            </div>
                        </div>

                        <AnimatePresence>
                            {feedback.message && (
                                <motion.div
                                    className={`${styles.dkFeedback} ${feedback.type === 'success' ? styles.success : styles.error}`}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    {feedback.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
                                    {feedback.message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button type="submit" className={styles.dkSubmitBtn} disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <FiLoader className={styles.dkSpin} /> PROCESUIRANJE...
                                </>
                            ) : (
                                <>
                                    <FiUserPlus /> KREIRAJ KORISNIKA
                                </>
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default DodajKorisnika;
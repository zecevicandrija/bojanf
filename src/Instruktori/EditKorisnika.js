import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowLeft,
    FiUsers,
    FiSearch,
    FiEdit,
    FiTrash2,
    FiX,
    FiMail,
    FiLock,
    FiCalendar,
    FiSave,
    FiAlertTriangle,
    FiUser
} from 'react-icons/fi';
import api from '../login/api';
import styles from './EditKorisnika.module.css';

const EditKorisnika = () => {
    const navigate = useNavigate();
    const [sviKorisnici, setSviKorisnici] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Edit modal states
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [editUserForm, setEditUserForm] = useState({ email: '', sifra: '', pretplata: '' });
    const [editFeedback, setEditFeedback] = useState({ type: '', message: '' });

    // Delete modal states
    const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [deleteFeedback, setDeleteFeedback] = useState({ type: '', message: '' });

    const fetchKorisnici = async () => {
        try {
            const response = await api.get('/api/korisnici');
            setSviKorisnici(response.data);
        } catch (error) {
            console.error('Greška pri dohvatanju korisnika:', error);
        }
    };

    useEffect(() => {
        fetchKorisnici();
    }, []);

    // Filter by email
    const filteredKorisnici = sviKorisnici.filter(k =>
        k.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // --- Edit Logic ---
    const openEditUserModal = (k) => {
        setUserToEdit(k);
        let pt = '';
        if (k.subscription_expires_at) {
            try {
                pt = new Date(k.subscription_expires_at.replace(' ', 'T')).toISOString().split('T')[0];
            } catch (e) { }
        }
        setEditUserForm({ email: k.email, sifra: '', pretplata: pt });
        setEditFeedback({ type: '', message: '' });
        setIsEditUserModalOpen(true);
    };

    const handleEditUserChange = (e) => setEditUserForm({ ...editUserForm, [e.target.name]: e.target.value });

    const handleEditUserSubmit = async (e) => {
        e.preventDefault();
        setEditFeedback({ type: '', message: '' });

        try {
            const body = {};
            if (editUserForm.email !== userToEdit.email) body.email = editUserForm.email;
            if (editUserForm.sifra) body.sifra = editUserForm.sifra;

            let currentPt = '';
            if (userToEdit.subscription_expires_at) {
                try {
                    currentPt = new Date(userToEdit.subscription_expires_at.replace(' ', 'T')).toISOString().split('T')[0];
                } catch (e) { }
            }

            if (editUserForm.pretplata !== currentPt) {
                body.subscription_expires_at = editUserForm.pretplata ? `${editUserForm.pretplata} 23:59:59` : null;
                if (editUserForm.pretplata) body.subscription_status = 'active';
            }

            if (Object.keys(body).length > 0) {
                await api.put(`/api/korisnici/${userToEdit.id}`, body);
                await fetchKorisnici();
            }
            setIsEditUserModalOpen(false);
            setUserToEdit(null);
        } catch (error) {
            console.error('Greška pri ažuriranju korisnika:', error);
            const msg = error.response?.data?.message || error.response?.data?.error || 'Greška pri ažuriranju korisnika';
            setEditFeedback({ type: 'error', message: msg });
        }
    };

    // --- Delete Logic ---
    const openDeleteUserModal = (k) => {
        setUserToDelete(k);
        setDeleteFeedback({ type: '', message: '' });
        setIsDeleteUserModalOpen(true);
    };

    const confirmDeleteUser = async () => {
        setDeleteFeedback({ type: '', message: '' });
        try {
            await api.delete(`/api/korisnici/${userToDelete.id}`);
            await fetchKorisnici();
            setIsDeleteUserModalOpen(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Greška pri brisanju korisnika:', error);
            const msg = error.response?.data?.message || 'Greška pri brisanju korisnika';
            setDeleteFeedback({ type: 'error', message: msg });
        }
    };

    return (
        <div className={styles.ekPage}>
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            <div className={styles.ekContainer}>
                <motion.button
                    className={styles.ekBackBtn}
                    onClick={() => navigate('/instruktor')}
                    whileHover={{ x: -5 }}
                >
                    <FiArrowLeft /> Nazad na Dashboard
                </motion.button>

                <div className={styles.ekHeader}>
                    <div className={styles.ekHeaderIcon}>
                        <FiUsers />
                    </div>
                    <h1>Upravljaj Korisnicima</h1>
                    <p>Pregledajte bazu klijenata, upravljajte pretplatama i pristupima platformi.</p>
                </div>

                <div className={styles.ekSearchContainer}>
                    <div className={styles.ekSearchBox}>
                        <FiSearch className={styles.ekSearchIcon} />
                        <input
                            type="text"
                            placeholder="Pretraži po email adresi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={styles.ekSearchInput}
                        />
                    </div>
                </div>

                <motion.div
                    className={styles.ekTableResponsive}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <table className={styles.ekTable}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ime i Prezime</th>
                                <th>Email</th>
                                <th>Uloga</th>
                                <th>Pretplata Do</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Akcije</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredKorisnici.length > 0 ? filteredKorisnici.map((k, idx) => (
                                <motion.tr
                                    key={k.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <td style={{ color: '#ff0033', fontWeight: 800 }}>#{k.id}</td>
                                    <td style={{ fontWeight: 600 }}>{k.ime} {k.prezime}</td>
                                    <td style={{ fontFamily: 'Outfit', fontSize: '0.8rem' }}>{k.email}</td>
                                    <td style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: '#666' }}>{k.uloga}</td>
                                    <td style={{ fontFamily: 'Outfit' }}>{k.subscription_expires_at ? new Date(k.subscription_expires_at.replace(' ', 'T')).toLocaleDateString() : '—'}</td>
                                    <td>
                                        <span className={`${styles.ekStatusBadge} ${k.subscription_status === 'active' ? styles.active : styles.inactive}`}>
                                            {k.subscription_status || 'N/A'}
                                        </span>
                                    </td>
                                    <td className={styles.ekActions}>
                                        <button className={`${styles.ekActionBtn} ${styles.ekEditBtn}`} onClick={() => openEditUserModal(k)} title="Izmeni">
                                            <FiEdit />
                                        </button>
                                        <button className={`${styles.ekActionBtn} ${styles.ekDeleteBtn}`} onClick={() => openDeleteUserModal(k)} title="Obriši">
                                            <FiTrash2 />
                                        </button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan="7" className={styles.ekNoResults}>Nema pronađenih korisnika.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </motion.div>
            </div>

            <AnimatePresence>
                {isEditUserModalOpen && userToEdit && (
                    <div className={styles.ekModalOverlay}>
                        <motion.div
                            className={styles.ekModalContent}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button className={styles.ekCloseBtn} onClick={() => setIsEditUserModalOpen(false)}><FiX /></button>
                            <h2>Izmeni Korisnika</h2>

                            <div className={styles.ekModalHeaderInfo}>
                                <div className={styles.ekAvatar}><FiUser /></div>
                                <div>
                                    <h3>{userToEdit.ime} {userToEdit.prezime}</h3>
                                    <span>Kupac #{userToEdit.id}</span>
                                </div>
                            </div>

                            {editFeedback.message && (
                                <div className={`${styles.ekFeedback} ${styles.error}`}>
                                    <FiAlertTriangle /> {editFeedback.message}
                                </div>
                            )}

                            <form onSubmit={handleEditUserSubmit}>
                                <div className={styles.ekField}>
                                    <label><FiMail /> Email Adresa</label>
                                    <input type="email" name="email" value={editUserForm.email} onChange={handleEditUserChange} required />
                                </div>
                                <div className={styles.ekField}>
                                    <label><FiLock /> Nova Šifra (Ostavi prazno za istu)</label>
                                    <input type="password" name="sifra" value={editUserForm.sifra} onChange={handleEditUserChange} placeholder="••••••••" />
                                </div>
                                <div className={styles.ekField}>
                                    <label><FiCalendar /> Pretplata Važi Do</label>
                                    <input type="date" name="pretplata" value={editUserForm.pretplata} onChange={handleEditUserChange} />
                                </div>
                                <button type="submit" className={styles.ekSubmitBtn}>
                                    <FiSave /> Sačuvaj Podatke
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isDeleteUserModalOpen && userToDelete && (
                    <div className={styles.ekModalOverlay}>
                        <motion.div
                            className={`${styles.ekModalContent} ${styles.ekDeleteModal}`}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className={styles.ekWarningIcon}>
                                <FiAlertTriangle />
                            </div>
                            <h2>Brisanje Naloga</h2>
                            <p>Ova akcija je nepovratna. Brišete korisnika:</p>
                            <h3 className={styles.ekDeleteName}>{userToDelete.ime} {userToDelete.prezime}</h3>

                            <div className={styles.ekWarningBox}>
                                <strong>PAŽNJA:</strong> Korisnik će odmah izgubiti pristup svim kupljenim kursevima i masterclass edukacijama.
                            </div>

                            {deleteFeedback.message && (
                                <div className={`${styles.ekFeedback} ${styles.error}`}>
                                    <FiAlertTriangle /> {deleteFeedback.message}
                                </div>
                            )}

                            <div className={styles.ekModalActions}>
                                <button onClick={() => setIsDeleteUserModalOpen(false)} className={styles.ekCancelBtn}>Zatvori</button>
                                <button onClick={confirmDeleteUser} className={styles.ekConfirmDeleteBtn}>
                                    <FiTrash2 /> Potvrdi Brisanje
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EditKorisnika;

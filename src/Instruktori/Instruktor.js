import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../login/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiList, FiUsers, FiBarChart2, FiTrash2, FiUserPlus, FiPlus, FiX, FiCheck, FiUsers as FiGroup, FiPercent } from 'react-icons/fi';
import api from '../login/api';
import './Instruktor.css';

const Instruktor = () => {
    const [kursevi, setKursevi] = useState([]);
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [editingCourse, setEditingCourse] = useState(null);
    const [courseToDelete, setCourseToDelete] = useState(null);

    const [editCourseForm, setEditCourseForm] = useState({ naziv: '', opis: '', cena: '', slika: '' });

    const { user } = useAuth();
    const instructorId = user ? user.id : null;
    const navigate = useNavigate();

    const fetchKursevi = useCallback(async () => {
        if (user) {
            try {
                const endpoint = user.uloga === 'admin'
                    ? `/api/kursevi?t=${new Date().getTime()}`
                    : `/api/kursevi/instruktor/${instructorId}?t=${new Date().getTime()}`;

                const response = await api.get(endpoint);
                setKursevi(response.data);
            } catch (error) {
                console.error('Greška pri dohvatanju kurseva:', error);
            }
        }
    }, [user, instructorId]);

    useEffect(() => {
        fetchKursevi();
    }, [fetchKursevi]);

    const openEditCourseModal = (course) => {
        setEditingCourse(course);
        setEditCourseForm({ naziv: course.naziv, opis: course.opis, cena: course.cena, slika: course.slika || '' });
        setIsEditCourseModalOpen(true);
    };

    const handleEditCourseChange = (e) => setEditCourseForm({ ...editCourseForm, [e.target.name]: e.target.value });

    const handleEditCourseSubmit = async (e) => {
        e.preventDefault();
        if (!editingCourse) return;

        const originalInstructorId = user.uloga === 'admin' ? editingCourse.instruktor_id : instructorId;

        const payload = {
            naziv: editCourseForm.naziv,
            opis: editCourseForm.opis
        };

        const parsedCena = parseFloat(editCourseForm.cena);
        if (!isNaN(parsedCena)) {
            payload.cena = parsedCena;
        }

        const parsedInstrId = parseInt(originalInstructorId, 10);
        if (!isNaN(parsedInstrId)) {
            payload.instruktor_id = parsedInstrId;
        }

        if (editCourseForm.slika && editCourseForm.slika.trim() !== '') {
            payload.slika = editCourseForm.slika;
        }

        try {
            await api.put(`/api/kursevi/${editingCourse.id}`, payload);
            await fetchKursevi();
            setIsEditCourseModalOpen(false);
        } catch (error) {
            console.error('Greška pri ažuriranju kursa:', error);
            if (error.response && error.response.data) {
                console.error('Detalji greške (backend):', error.response.data);
                const errorMsg = error.response.data.detalji
                    ? JSON.stringify(error.response.data.detalji, null, 2)
                    : error.response.data.error;
                alert('Greška pri izmeni:\n' + errorMsg);
            } else {
                alert('Greška pri izmeni. Proveri konzolu za detalje.');
            }
        }
    };

    const openDeleteModal = (course) => {
        setCourseToDelete(course);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;

        try {
            await api.delete(`/api/kursevi/${courseToDelete.id}`);
            setKursevi(kursevi.filter(kurs => kurs.id !== courseToDelete.id));
        } catch (error) {
            console.error('Greška pri brisanju kursa:', error);
        } finally {
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
        }
    };

    return (
        <div className="instruktor-wrapper">
            <div className="noise-overlay"></div>
            <div className="grid-overlay"></div>

            <div className="instruktor-container">
                {/* Header Section */}
                <header className="dashboard-header">
                    <motion.div
                        className="dashboard-badge"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="badge-text">CONTROL PANEL</span>
                    </motion.div>

                    <div className="headline-wrapper">
                        <span className="solid-text">INSTRUKTORSKA</span>
                        <span className="outline-text">TABLA</span>
                    </div>

                    <p className="dashboard-subtitle">Dobrodošli nazad, {user?.ime}. Upravljajte svojom akademijom i pratite napredak.</p>

                    {/* Admin Actions Group */}
                    <div className="admin-actions-group">
                        <motion.button
                            className="admin-action-btn primary"
                            onClick={() => navigate('/dodajkorisnika')}
                            whileHover={{ y: -3 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FiUserPlus /> <span>DODAJ KORISNIKA</span>
                            <div className="btn-shine" />
                        </motion.button>

                        {user?.uloga === 'admin' && (
                            <>
                                <motion.button
                                    className="admin-action-btn secondary"
                                    onClick={() => navigate('/edit-korisnika')}
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiGroup /> <span>UPRAVLJAJ KORISNICIMA</span>
                                </motion.button>
                                <motion.button
                                    className="admin-action-btn accent"
                                    onClick={() => navigate('/popusti')}
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiPercent /> <span>UPRAVLJAJ POPUSTIMA</span>
                                </motion.button>
                                <motion.button
                                    className="admin-action-btn secondary"
                                    onClick={() => navigate('/zarada')}
                                    whileHover={{ y: -3 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <FiBarChart2 /> <span>ZARADA SISTEMA</span>
                                </motion.button>
                            </>
                        )}
                    </div>
                </header>

                <div className="dashboard-main-grid-full">
                    {/* Main Section - Courses */}
                    <div className="dashboard-courses-section">
                        <div className="section-header-box">
                            <h2 className="section-title-kursevi">MOJI KURSEVI</h2>
                            <div className="section-divider"></div>
                        </div>

                        <div className="kurs-grid">
                            {kursevi.length > 0 ? kursevi.map((kurs, idx) => (
                                <motion.div
                                    className="kurs-card-premium"
                                    key={kurs.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="card-image-box">
                                        <img src={kurs.slika} alt={kurs.naziv} />
                                        <div className="card-image-overlay"></div>
                                        <div className="card-price-badge">{kurs.cena}€</div>
                                    </div>

                                    <div className="card-content">
                                        <h3>{kurs.naziv}</h3>
                                        <div className="card-actions-grid">
                                            <button onClick={() => openEditCourseModal(kurs)} className="action-btn edit" title="Izmeni Kurs">
                                                <FiEdit2 /> <span>IZMENI</span>
                                            </button>
                                            <button onClick={() => navigate(`/edit-kurs/${kurs.id}`)} className="action-btn lessons" title="Uredi Lekcije">
                                                <FiList /> <span>LEKCIJE</span>
                                            </button>
                                            <button onClick={() => navigate(`/studenti/${kurs.id}`)} className="action-btn students" title="Pregled Studenata">
                                                <FiUsers /> <span>STUDENTI</span>
                                            </button>
                                            <button onClick={() => openDeleteModal(kurs)} className="action-btn delete" title="Obriši Kurs">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="empty-courses-state">
                                    <p>Trenutno nemate kreiranih kurseva.</p>
                                    <button className="create-first-btn"><FiPlus /> Kreiraj svoj prvi kurs</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isEditCourseModalOpen && (
                    <div className="modal-overlay-blur">
                        <motion.div
                            className="modal-content-glass"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button className="close-modal-x" onClick={() => setIsEditCourseModalOpen(false)}><FiX /></button>
                            <div className="modal-header">
                                <FiEdit2 /> <h2>Izmeni Kurs</h2>
                            </div>
                            <form onSubmit={handleEditCourseSubmit} className="modal-form-premium">
                                <div className="input-group-premium">
                                    <label>NAZIV KURSA</label>
                                    <input type="text" name="naziv" value={editCourseForm.naziv} onChange={handleEditCourseChange} required />
                                </div>
                                <div className="input-group-premium">
                                    <label>OPIS</label>
                                    <textarea name="opis" value={editCourseForm.opis} onChange={handleEditCourseChange} required rows="4"></textarea>
                                </div>
                                <div className="form-row-premium">
                                    <div className="input-group-premium">
                                        <label>CENA (€)</label>
                                        <input type="number" name="cena" value={editCourseForm.cena} onChange={handleEditCourseChange} required />
                                    </div>
                                    <div className="input-group-premium">
                                        <label>SLIKA (URL)</label>
                                        <input type="text" name="slika" value={editCourseForm.slika} onChange={handleEditCourseChange} placeholder="https://primer.com/slika.jpg" />
                                    </div>
                                </div>
                                <button type="submit" className="modal-save-btn">
                                    <span>SAČUVAJ IZMENE</span>
                                    <FiCheck />
                                    <div className="btn-shine" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {isDeleteModalOpen && (
                    <div className="modal-overlay-blur">
                        <motion.div
                            className="modal-content-glass delete-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <div className="delete-icon-box"><FiTrash2 /></div>
                            <h2>Potvrda Brisanja</h2>
                            <p>Da li ste sigurni da želite trajno obrisati kurs <strong>{courseToDelete?.naziv}</strong>? Ova akcija se ne može poništiti.</p>
                            <div className="modal-actions-premium">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="cancel-btn">ODUSTANI</button>
                                <button onClick={confirmDeleteCourse} className="confirm-delete-btn">OBRIŠI KURS</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Instruktor;
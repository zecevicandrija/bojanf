import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPercent, FiArrowLeft, FiPlus, FiSearch, FiEdit2, FiTrash2, FiCalendar, FiCheck, FiX, FiAlertTriangle, FiClock } from 'react-icons/fi';
import api from '../login/api';
import './PopustDashboard.css';

const PopustDashboard = () => {
    const navigate = useNavigate();
    const [popusti, setPopusti] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Kreiranje
    const [newDiscountCode, setNewDiscountCode] = useState('');
    const [newDiscountPercent, setNewDiscountPercent] = useState('');
    const [newDiscountExpires, setNewDiscountExpires] = useState('');
    const [newDiscountStatus, setNewDiscountStatus] = useState('aktivan');

    // Edit modali
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [discountToEdit, setDiscountToEdit] = useState(null);
    const [editForm, setEditForm] = useState({ code: '', discountPercent: '', datum_isteka: '', status: 'aktivan' });

    // Delete modali
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState(null);

    // Feedback
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const fetchPopusti = useCallback(async () => {
        try {
            const response = await api.get('/api/popusti');
            setPopusti(response.data);
        } catch (error) {
            console.error('Greška pri dohvatanju popusta:', error);
            showFeedback('error', 'Greška pri učitavanju popusta.');
        }
    }, []);

    useEffect(() => {
        fetchPopusti();
    }, [fetchPopusti]);

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
    };

    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        setFeedback({ type: '', message: '' });

        try {
            await api.post('/api/popusti/create', {
                code: newDiscountCode,
                discountPercent: Number(newDiscountPercent),
                datum_isteka: newDiscountExpires || null,
                status: newDiscountStatus
            });
            showFeedback('success', 'Promo kod je uspešno kreiran!');
            setNewDiscountCode('');
            setNewDiscountPercent('');
            setNewDiscountExpires('');
            setNewDiscountStatus('aktivan');
            fetchPopusti();
        } catch (error) {
            showFeedback('error', error.response?.data?.message || 'Greška prilikom kreiranja koda.');
        }
    };

    const openEditModal = (p) => {
        setDiscountToEdit(p);
        setEditForm({
            code: p.kod,
            discountPercent: p.procenat,
            datum_isteka: p.datum_isteka ? p.datum_isteka.split('T')[0] : '',
            status: p.status || 'aktivan'
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/api/popusti/${discountToEdit.id}`, {
                code: editForm.code,
                discountPercent: Number(editForm.discountPercent),
                datum_isteka: editForm.datum_isteka || null,
                status: editForm.status
            });
            showFeedback('success', 'Popust je uspešno izmenjen.');
            fetchPopusti();
            setIsEditModalOpen(false);
        } catch (error) {
            showFeedback('error', error.response?.data?.message || 'Greška pri ažuriranju.');
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/api/popusti/${discountToDelete.id}`);
            showFeedback('success', 'Popust je trajno obrisan.');
            fetchPopusti();
            setIsDeleteModalOpen(false);
        } catch (error) {
            showFeedback('error', error.response?.data?.message || 'Greška pri brisanju.');
            setIsDeleteModalOpen(false);
        }
    };

    const filteredPopusti = popusti.filter(p => p.kod.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="pd-wrapper">
            <div className="noise-overlay"></div>
            <div className="grid-overlay"></div>

            <div className="pd-container">
                {/* Header */}
                <header className="pd-header">
                    <motion.button
                        className="pd-back-btn"
                        onClick={() => navigate('/instruktor')}
                        whileHover={{ x: -5 }}
                    >
                        <FiArrowLeft /> <span>NAZAD NA TABLU</span>
                    </motion.button>

                    <div className="headline-wrapper2">
                        <span className="solid-text2">UPRAVLJAJ</span>
                        <span className="outline-text2">POPUSTIMA</span>
                    </div>
                </header>

                {/* Feedback Toast */}
                <AnimatePresence>
                    {feedback.message && (
                        <motion.div
                            className={`pd-toast ${feedback.type}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            {feedback.type === 'error' ? <FiAlertTriangle /> : <FiCheck />}
                            <span>{feedback.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="pd-main-grid">
                    {/* Create Form Section */}
                    <motion.div
                        className="pd-card-glass sticky-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="card-header-simple">
                            <FiPlus /> <h3>Novi Promo Kod</h3>
                        </div>
                        <form onSubmit={handleCreateDiscount} className="pd-form">
                            <div className="pd-input-group">
                                <label>KOD (PROMO KOD)</label>
                                <input
                                    type="text"
                                    placeholder="Npr. BOJAN20"
                                    value={newDiscountCode}
                                    onChange={e => setNewDiscountCode(e.target.value.toUpperCase())}
                                    required
                                />
                            </div>
                            <div className="pd-input-group">
                                <label>PROCENAT POPUSTA (%)</label>
                                <input
                                    type="number"
                                    placeholder="0-100"
                                    value={newDiscountPercent}
                                    onChange={e => setNewDiscountPercent(e.target.value)}
                                    min="1" max="100"
                                    required
                                />
                            </div>
                            <div className="pd-input-group">
                                <label>DATUM ISTEKA (OPCIONO)</label>
                                <input
                                    type="date"
                                    value={newDiscountExpires}
                                    onChange={e => setNewDiscountExpires(e.target.value)}
                                />
                            </div>
                            <div className="pd-input-group">
                                <label>STATUS</label>
                                <select value={newDiscountStatus} onChange={e => setNewDiscountStatus(e.target.value)}>
                                    <option value="aktivan">AKTIVAN</option>
                                    <option value="neaktivan">NEAKTIVAN</option>
                                </select>
                            </div>
                            <button type="submit" className="pd-create-btn">
                                <span>KREIRAJ KOD</span>
                                <FiPlus />
                                <div className="btn-shine" />
                            </button>
                        </form>
                    </motion.div>

                    {/* Table Section */}
                    <motion.div
                        className="pd-card-glass"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <div className="table-top-actions">
                            <div className="card-header-simple">
                                <FiPercent /> <h3>Aktivni Popusti</h3>
                            </div>
                            <div className="pd-search-box">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Pretraži kodove..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pd-table-wrapper">
                            <table className="pd-table">
                                <thead>
                                    <tr>
                                        <th>KOD</th>
                                        <th>POPUST</th>
                                        <th>ISTIČE</th>
                                        <th>STATUS</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPopusti.length > 0 ? filteredPopusti.map((p, idx) => (
                                        <motion.tr
                                            key={p.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                        >
                                            <td className="kod-cell"><strong>{p.kod}</strong></td>
                                            <td className="proc-cell">{p.procenat}%</td>
                                            <td className="date-cell">
                                                {p.datum_isteka ? (
                                                    <><FiCalendar /> {new Date(p.datum_isteka).toLocaleDateString()}</>
                                                ) : <span className="forever">ZAUVEK</span>}
                                            </td>
                                            <td>
                                                <span className={`pd-status-pill ${p.status}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="actions-cell">
                                                <button className="pd-icon-btn edit" onClick={() => openEditModal(p)}><FiEdit2 /></button>
                                                <button className="pd-icon-btn delete" onClick={() => { setDiscountToDelete(p); setIsDeleteModalOpen(true); }}><FiTrash2 /></button>
                                            </td>
                                        </motion.tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="pd-empty-cell">Nema pronađenih kodova.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="modal-overlay-blur">
                        <motion.div
                            className="modal-content-glass"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                        >
                            <button className="close-modal-x" onClick={() => setIsEditModalOpen(false)}><FiX /></button>
                            <div className="modal-header2"><FiEdit2 /> <h2>Izmeni Popust</h2></div>
                            <form onSubmit={handleEditSubmit} className="modal-form-premium">
                                <div className="input-group-premium">
                                    <label>KOD POPUSTA</label>
                                    <input type="text" value={editForm.code} onChange={e => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })} required />
                                </div>
                                <div className="form-row-premium">
                                    <div className="input-group-premium">
                                        <label>POPUST (%)</label>
                                        <input type="number" value={editForm.discountPercent} onChange={e => setEditForm({ ...editForm, discountPercent: e.target.value })} required min="1" max="100" />
                                    </div>
                                    <div className="input-group-premium">
                                        <label>STATUS</label>
                                        <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                                            <option value="aktivan">AKTIVAN</option>
                                            <option value="neaktivan">NEAKTIVAN</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="input-group-premium">
                                    <label>DATUM ISTEKA</label>
                                    <input type="date" value={editForm.datum_isteka} onChange={e => setEditForm({ ...editForm, datum_isteka: e.target.value })} />
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
                            <h2>Brisanje Popusta</h2>
                            <p>Da li ste sigurni da želite trajno obrisati kod <strong>{discountToDelete?.kod}</strong>?</p>
                            <div className="modal-actions-premium">
                                <button onClick={() => setIsDeleteModalOpen(false)} className="cancel-btn">ODUSTANI</button>
                                <button onClick={confirmDelete} className="confirm-delete-btn">OBRIŠI KOD</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PopustDashboard;

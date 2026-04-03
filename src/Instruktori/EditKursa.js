import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as tus from 'tus-js-client';
import { FiArrowLeft, FiPlus, FiEdit2, FiTrash2, FiArrowUp, FiArrowDown, FiX, FiSave } from 'react-icons/fi';
import api from '../login/api';
import './EditKursa.css';

const EditKursa = () => {
    const { kursId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [sekcije, setSekcije] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', content: '', sekcija_id: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    // Stanja za izmenu sekcije
    const [editingSekcijaId, setEditingSekcijaId] = useState(null);
    const [noviNazivSekcije, setNoviNazivSekcije] = useState('');
    const [noviThumbnailUrl, setNoviThumbnailUrl] = useState('');
    const [originalOrder, setOriginalOrder] = useState([]);

    // Stanja za dodavanje nove sekcije
    const [isAddingSekcija, setIsAddingSekcija] = useState(false);
    const [novaSekcijaNaziv, setNovaSekcijaNaziv] = useState('');
    const [novaSekcijaThumbnailUrl, setNovaSekcijaThumbnailUrl] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [courseResponse, lessonsResponse, sekcijeResponse] = await Promise.all([
                api.get(`/api/kursevi/${kursId}`),
                api.get(`/api/lekcije/course/${kursId}`),
                api.get(`/api/lekcije/sections/${kursId}`)
            ]);
            setCourse(courseResponse.data);
            setLessons(lessonsResponse.data);
            setSekcije(sekcijeResponse.data);
            setOriginalOrder(sekcijeResponse.data.map(s => s.id));
        } catch (error) {
            console.error("Greška pri dohvatanju podataka:", error);
        } finally {
            setIsLoading(false);
        }
    }, [kursId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- LOGIKA ZA SEKCIJE ---

    const handleAddNewSekcija = async (e) => {
        e.preventDefault();
        if (!novaSekcijaNaziv.trim()) {
            alert("Naziv sekcije ne može biti prazan.");
            return;
        }
        try {
            await api.post('/api/sekcije', {
                kurs_id: kursId,
                naziv: novaSekcijaNaziv,
                thumbnail: novaSekcijaThumbnailUrl
            });
            setNovaSekcijaNaziv('');
            setNovaSekcijaThumbnailUrl('');
            setIsAddingSekcija(false);
            fetchData();
        } catch (error) {
            console.error("Greška pri dodavanju nove sekcije:", error);
            alert("Neuspešno dodavanje sekcije.");
        }
    };

    const handleEditSekcijaClick = (sekcija) => {
        setEditingSekcijaId(sekcija.id);
        setNoviNazivSekcije(sekcija.naziv);
        setNoviThumbnailUrl(sekcija.thumbnail || '');
    };

    const handleSaveSekcija = async (sekcijaId) => {
        try {
            await api.put(`/api/sekcije/${sekcijaId}`, {
                naziv: noviNazivSekcije,
                thumbnail: noviThumbnailUrl
            });
            setEditingSekcijaId(null);
            fetchData();
        } catch (error) {
            console.error("Greška pri izmeni naziva sekcije:", error);
            alert("Neuspešna izmena naziva.");
        }
    };

    const handleDeleteSekcija = async (sekcijaId) => {
        if (window.confirm('Da li ste sigurni? Brisanje sekcije će otkačiti sve lekcije iz nje.')) {
            try {
                await api.delete(`/api/sekcije/${sekcijaId}`);
                fetchData();
            } catch (error) {
                console.error("Greška pri brisanju sekcije:", error);
            }
        }
    };

    const handleMoveSekcija = (index, direction) => {
        const newSekcije = [...sekcije];
        const [movedItem] = newSekcije.splice(index, 1);
        newSekcije.splice(index + direction, 0, movedItem);
        setSekcije(newSekcije);
    };

    const handleSaveOrder = async () => {
        const orderedIds = sekcije.map(s => s.id);
        try {
            await api.put('/api/sekcije/order', { orderedIds });
            setOriginalOrder(orderedIds);
            alert('Redosled je sačuvan!');
        } catch (error) {
            console.error("Greška pri čuvanju redosleda:", error);
        }
    };

    const isOrderChanged = JSON.stringify(originalOrder) !== JSON.stringify(sekcije.map(s => s.id));

    // --- LOGIKA ZA LEKCIJE ---
    const handleDeleteLesson = async (lessonId) => {
        if (window.confirm('Da li ste sigurni da želite da obrišete ovu lekciju?')) {
            try {
                await api.delete(`/api/lekcije/${lessonId}`);
                setLessons(prevLessons => prevLessons.filter(l => l.id !== lessonId));
            } catch (error) {
                console.error("Greška pri brisanju lekcije:", error);
            }
        }
    };

    const handleOpenEditModal = (lesson) => {
        setEditingLesson(lesson);
        setEditForm({
            title: lesson.title,
            content: lesson.content,
            sekcija_id: lesson.sekcija_id || ''
        });
        setVideoFile(null);
        setIsEditModalOpen(true);
    };

    const handleEditFormChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });
    const handleVideoChange = (e) => setVideoFile(e.target.files[0]);

    // TUS direktan upload na Bunny CDN
    const uploadVideoDirectly = (file, credentials) => {
        return new Promise((resolve, reject) => {
            const upload = new tus.Upload(file, {
                endpoint: 'https://video.bunnycdn.com/tusupload',
                retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
                headers: {
                    AuthorizationSignature: credentials.authorizationSignature,
                    AuthorizationExpire: credentials.authorizationExpire,
                    VideoId: credentials.videoId,
                    LibraryId: credentials.libraryId,
                },
                metadata: {
                    filetype: file.type,
                    title: editForm.title,
                },
                onError: (error) => {
                    console.error('TUS upload error:', error);
                    reject(error);
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
                    setUploadProgress(percentage);
                    setUploadStatus(`Upload videa: ${percentage}%`);
                },
                onSuccess: () => {
                    setUploadStatus('Video uspešno uploadovan!');
                    resolve(credentials.videoId);
                }
            });

            upload.findPreviousUploads().then((previousUploads) => {
                if (previousUploads.length) {
                    upload.resumeFromPreviousUpload(previousUploads[0]);
                }
                upload.start();
            });
        });
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus('');

        try {
            let videoGuid = null;

            // Ako je izabran novi video, uploaduj ga direktno na Bunny
            if (videoFile) {
                setUploadStatus('Priprema uploada...');
                const credentialsResponse = await api.post('/api/lekcije/prepare-upload', {
                    title: editForm.title
                });
                const credentials = credentialsResponse.data;

                setUploadStatus('Započinjem upload videa...');
                videoGuid = await uploadVideoDirectly(videoFile, credentials);
            }

            // Šaljemo JSON umesto FormData
            setUploadStatus('Čuvanje izmena...');
            await api.put(`/api/lekcije/${editingLesson.id}`, {
                title: editForm.title,
                content: editForm.content,
                course_id: editingLesson.course_id,
                sekcija_id: editForm.sekcija_id,
                video_guid: videoGuid // null ako nema novog videa — backend zadržava stari
            });

            setIsEditModalOpen(false);
            setUploadStatus('');
            setUploadProgress(0);
            setVideoFile(null);
            await fetchData();
        } catch (error) {
            console.error("Greška pri ažuriranju lekcije:", error);
            alert(`Greška: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="ek-loader-container">
                <div className="ek-spinner"></div> UČITAVANJE KURSA...
            </div>
        );
    }

    return (
        <div className="ek-full-page-container">
            <div className="ek-noise-overlay"></div>
            <div className="ek-grid-overlay"></div>

            <div className="ek-inner">
                {/* Header Section */}
                <div className="ek-top-nav">
                    <button onClick={() => navigate('/instruktor')} className="ek-back-btn">
                        <FiArrowLeft /> NAZAD NA TABLU
                    </button>
                    <div className="ek-page-title-box">
                        <span className="ek-badge">CONTROL PANEL</span>
                        <h1 className="ek-main-title">UREĐIVANJE: {course?.naziv}</h1>
                    </div>
                </div>

                <div className="ek-grid">
                    {/* Panel za Sekcije */}
                    <div className="ek-glass-panel">
                        <div className="ek-section-header">
                            <h2 className="ek-section-title">UPRAVLJANJE SEKCIJAMA</h2>
                            {isOrderChanged && (
                                <button onClick={handleSaveOrder} className="ek-primary-btn" style={{backgroundColor: '#00ff66', color: '#000'}}>
                                    <FiSave /> SAČUVAJ REDOSLED
                                </button>
                            )}
                        </div>

                        <div className="ek-list-container">
                            {sekcije.map((sekcija, index) => (
                                <div key={sekcija.id} className="ek-item-card">
                                    {editingSekcijaId === sekcija.id ? (
                                        <div className="ek-inline-form">
                                            <div className="ek-input-group">
                                                <label>Naziv sekcije</label>
                                                <input
                                                    type="text"
                                                    value={noviNazivSekcije}
                                                    onChange={(e) => setNoviNazivSekcije(e.target.value)}
                                                    className="ek-input"
                                                />
                                            </div>
                                            <div className="ek-input-group">
                                                <label>URL slike (Thumbnail)</label>
                                                <input
                                                    type="text"
                                                    placeholder="https://..."
                                                    value={noviThumbnailUrl}
                                                    onChange={(e) => setNoviThumbnailUrl(e.target.value)}
                                                    className="ek-input"
                                                />
                                            </div>
                                            <div className="ek-inline-actions">
                                                <button onClick={() => handleSaveSekcija(sekcija.id)} className="ek-primary-btn" style={{padding: '12px'}} title="Sačuvaj">
                                                    <FiSave />
                                                </button>
                                                <button onClick={() => setEditingSekcijaId(null)} className="ek-secondary-btn" style={{padding: '12px'}} title="Odustani">
                                                    <FiX />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="ek-order-controls">
                                                <button onClick={() => handleMoveSekcija(index, -1)} disabled={index === 0} className="ek-icon-btn">
                                                    <FiArrowUp />
                                                </button>
                                                <button onClick={() => handleMoveSekcija(index, 1)} disabled={index === sekcije.length - 1} className="ek-icon-btn">
                                                    <FiArrowDown />
                                                </button>
                                            </div>
                                            <div className="ek-item-info">
                                                <h4 className="ek-item-title">{sekcija.redosled}. {sekcija.naziv}</h4>
                                                <p className="ek-item-meta">{sekcija.thumbnail ? 'Sadrži slikovni thumbnail' : 'Nema thumbnail'}</p>
                                            </div>
                                            <div className="ek-item-actions">
                                                <button onClick={() => handleEditSekcijaClick(sekcija)} className="ek-secondary-btn">
                                                    <FiEdit2 /> IZMENI
                                                </button>
                                                <button onClick={() => handleDeleteSekcija(sekcija.id)} className="ek-danger-btn">
                                                    <FiTrash2 /> OBRIŠI
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Dodavanje nove sekcije */}
                            {isAddingSekcija ? (
                                <form onSubmit={handleAddNewSekcija} className="ek-item-card" style={{borderLeftColor: '#ff0033'}}>
                                    <div className="ek-inline-form" style={{marginRight: 0}}>
                                         <div className="ek-input-group">
                                            <label>Nova Sekcija</label>
                                            <input
                                                type="text"
                                                placeholder="Unesite naziv..."
                                                value={novaSekcijaNaziv}
                                                onChange={(e) => setNovaSekcijaNaziv(e.target.value)}
                                                className="ek-input"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="ek-input-group">
                                            <label>Slika (Opciono)</label>
                                            <input
                                                type="text"
                                                placeholder="https://..."
                                                value={novaSekcijaThumbnailUrl}
                                                onChange={(e) => setNovaSekcijaThumbnailUrl(e.target.value)}
                                                className="ek-input"
                                            />
                                        </div>
                                        <div className="ek-inline-actions">
                                            <button type="submit" className="ek-primary-btn">DODAJ</button>
                                            <button type="button" onClick={() => setIsAddingSekcija(false)} className="ek-secondary-btn">ODUSTANI</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <button onClick={() => setIsAddingSekcija(true)} className="ek-secondary-btn" style={{marginTop: '1rem', borderStyle: 'dashed', width: '100%', padding: '15px'}}>
                                    <FiPlus /> DODAJ NOVU SEKCIJU
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Panel za Lekcije */}
                    <div className="ek-glass-panel">
                        <div className="ek-section-header">
                            <h2 className="ek-section-title">LEKCIJE</h2>
                        </div>
                        
                        <div className="ek-lessons-grid">
                            {lessons.map(lesson => (
                                <div className="ek-lesson-card" key={lesson.id}>
                                    <h4 className="ek-lesson-title">{lesson.title}</h4>
                                    <p className="ek-lesson-meta">SEKCIJA: {sekcije.find(s => s.id === lesson.sekcija_id)?.naziv || 'NIJE DODELJENA'}</p>
                                    <p className="ek-lesson-desc">{lesson.content.substring(0, 80)}...</p>
                                    <div className="ek-lesson-actions">
                                        <button onClick={() => handleOpenEditModal(lesson)} className="ek-secondary-btn">
                                            <FiEdit2 /> IZMENI
                                        </button>
                                        <button onClick={() => handleDeleteLesson(lesson.id)} className="ek-danger-btn">
                                            <FiTrash2 /> OBRIŠI
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="ek-add-lesson-btn" onClick={() => navigate(`/lekcije`)}>
                                <FiPlus className="ek-add-lesson-icon" />
                                <span>DODAJ LEKCIJE U KURS</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal za izmenu lekcije */}
            {isEditModalOpen && (
                <div className="ek-modal-overlay">
                    <div className="ek-modal-glass">
                        <button className="ek-modal-close" onClick={() => setIsEditModalOpen(false)}><FiX /></button>
                        <h2 className="ek-modal-title">IZMENI LEKCIJU</h2>
                        
                        <form onSubmit={handleEditSubmit} className="ek-modal-form">
                            <div className="ek-input-group">
                                <label>NASLOV LEKCIJE</label>
                                <input type="text" name="title" value={editForm.title} onChange={handleEditFormChange} className="ek-input" required />
                            </div>
                            
                            <div className="ek-input-group">
                                <label>SADRŽAJ (OPIS)</label>
                                <textarea name="content" value={editForm.content} onChange={handleEditFormChange} className="ek-input ek-textarea" required></textarea>
                            </div>
                            
                            <div className="ek-input-group">
                                <label>PRIPADA SEKCIJI</label>
                                <select name="sekcija_id" value={editForm.sekcija_id} onChange={handleEditFormChange} className="ek-input ek-select">
                                    <option value="">-- NIJE DODELJENA --</option>
                                    {sekcije.map(s => (
                                        <option key={s.id} value={s.id}>{s.naziv}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="ek-input-group">
                                <label>ZAMENI VIDEO (OPCIONO)</label>
                                <input type="file" accept="video/*" onChange={handleVideoChange} className="ek-input ek-file-input" />
                            </div>
                            
                            {isUploading && (
                                <div className="ek-progress-container">
                                    <div className="ek-progress-bg">
                                        <div className="ek-progress-fill" style={{ width: `${uploadProgress}%` }} />
                                    </div>
                                    <p className="ek-progress-text">{uploadStatus}</p>
                                </div>
                            )}
                            
                            <button type="submit" className="ek-primary-btn" disabled={isUploading} style={{width: '100%', marginTop: '1rem'}}>
                                {isUploading ? (
                                    <><div className="ek-spinner"></div> ČUVANJE...</>
                                ) : (
                                    <><FiSave /> SAČUVAJ IZMENE</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditKursa;
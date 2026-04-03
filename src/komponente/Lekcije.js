import React, { useEffect, useState } from 'react';
import * as tus from 'tus-js-client';
import api from '../login/api';
import { useAuth } from '../login/auth';
import { motion } from 'framer-motion';
import { FiPlus, FiCheck, FiVideo, FiLayers, FiFileText } from 'react-icons/fi';
import './Lekcije.css';

const Lekcije = () => {
    const [lekcije, setLekcije] = useState([]);
    const [courses, setCourses] = useState([]);
    const [sections, setSections] = useState([]);

    const [newLekcija, setNewLekcija] = useState({
        course_id: '',
        title: '',
        content: '',
        sekcija_id: ''
    });

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user || !user.id) return;
            try {
                const endpoint = user.uloga === 'admin'
                    ? '/api/kursevi'
                    : `/api/kursevi/instruktor/${user.id}`;

                const response = await api.get(endpoint);
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();
    }, [user]);

    const fetchSections = async (courseId) => {
        if (!courseId) {
            setSections([]);
            return;
        }
        try {
            const response = await api.get(`/api/lekcije/sections/${courseId}`);
            setSections(response.data);
        } catch (error) {
            console.error('Error fetching sections:', error);
            setSections([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLekcija({ ...newLekcija, [name]: value });

        if (name === 'course_id') {
            setNewLekcija(prev => ({ ...prev, course_id: value, sekcija_id: '' }));
            fetchSections(value);
        }
    };

    const handleVideoChange = (e) => {
        setVideo(e.target.files[0]);
    };

    // Funkcija za direktan upload na Bunny putem TUS protokola
    const uploadVideoDirectly = (file, credentials) => {
        console.log('=== TUS UPLOAD DEBUG ===');
        console.log('File name:', file.name, 'File size:', file.size, 'File type:', file.type);
        console.log('Credentials:', JSON.stringify(credentials));

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
                    title: newLekcija.title,
                },
                onBeforeRequest: (req) => {
                    console.log(`TUS Request: ${req._method} ${req._url}`);
                    console.log('TUS Request headers:', JSON.stringify(req._headers));
                },
                onAfterResponse: (req, res) => {
                    console.log(`TUS Response: ${res.getStatus()} for ${req._method} ${req._url}`);
                    console.log('TUS Response headers - Upload-Offset:', res.getHeader('Upload-Offset'));
                    console.log('TUS Response headers - Location:', res.getHeader('Location'));
                },
                onError: (error) => {
                    console.error('TUS upload error:', error);
                    reject(error);
                },
                onProgress: (bytesUploaded, bytesTotal) => {
                    const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
                    console.log(`TUS Progress: ${bytesUploaded}/${bytesTotal} (${percentage}%)`);
                    setUploadProgress(percentage);
                    setUploadStatus(`Uploading video: ${percentage}%`);
                },
                onSuccess: () => {
                    console.log('Video upload successful! Upload URL:', upload.url);
                    setUploadStatus('Video uspešno uploadovan!');
                    resolve(credentials.videoId);
                }
            });

            // Direktno započni upload (svaki upload ima novi video ID,
            // pa nema smisla tražiti prethodne uploadove)
            upload.start();
        });
    };

    const handleAddLekcija = async (e) => {
        e.preventDefault();

        // Validacija
        if (!newLekcija.course_id || !newLekcija.sekcija_id || !newLekcija.title || !newLekcija.content || !video) {
            alert('Sva polja i video su obavezni, uključujući i odabir sekcije.');
            return;
        }

        setLoading(true);
        setUploadProgress(0);

        try {
            // FAZA 1: Dobij kredencijale za direktan upload
            setUploadStatus('Priprema uploada...');
            const credentialsResponse = await api.post('/api/lekcije/prepare-upload', {
                title: newLekcija.title
            });
            const credentials = credentialsResponse.data;

            // FAZA 2: Direktan upload videa na Bunny
            setUploadStatus('Započinjem upload videa...');
            const videoGuid = await uploadVideoDirectly(video, credentials);

            // FAZA 3: Sačuvaj metadata u bazu
            setUploadStatus('Čuvanje lekcije...');
            await api.post('/api/lekcije', {
                course_id: newLekcija.course_id,
                title: newLekcija.title,
                content: newLekcija.content,
                sekcija_id: newLekcija.sekcija_id,
                video_guid: videoGuid
            });

            alert('Lekcija uspešno dodata!');

            // Resetovanje forme
            setNewLekcija({ course_id: '', title: '', content: '', sekcija_id: '' });
            setVideo(null);
            setSections([]);
            setUploadProgress(0);
            setUploadStatus('');

            // Reset file input
            const fileInput = document.getElementById('video');
            if (fileInput) fileInput.value = '';

        } catch (error) {
            console.error('Error adding lesson:', error);
            alert(`Greška pri dodavanju lekcije: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
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
                        <span className="badge-text">CONTENT CREATOR</span>
                    </motion.div>

                    <div className="headline-wrapper">
                        <span className="solid-text">DODAVANJE</span>
                        <span className="outline-text">LEKCIJA</span>
                    </div>

                    <p className="dashboard-subtitle">
                        Proširite svoju bazu znanja. Otpremanjem novih lekcija pružate vrednost svojim studentima.
                    </p>
                </header>

                <div className="dashboard-main-grid-full">
                    <motion.div
                        className="modal-content-glass lesson-form-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="modal-header">
                            <FiPlus /> <h2>Nova Lekcija</h2>
                        </div>

                        <form onSubmit={handleAddLekcija} className="modal-form-premium">
                            <div className="form-row-premium">
                                <div className="input-group-premium">
                                    <label htmlFor="course_id">IZABERITE KURS</label>
                                    <select
                                        id="course_id"
                                        name="course_id"
                                        value={newLekcija.course_id}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">-- Izaberite --</option>
                                        {courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.naziv}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="input-group-premium">
                                    <label htmlFor="sekcija_id">SEKCIJA KURSA</label>
                                    <select
                                        id="sekcija_id"
                                        name="sekcija_id"
                                        value={newLekcija.sekcija_id}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!newLekcija.course_id || sections.length === 0}
                                    >
                                        <option value="">-- Izaberite --</option>
                                        {sections.map((sekcija) => (
                                            <option key={sekcija.id} value={sekcija.id}>
                                                {sekcija.naziv}
                                            </option>
                                        ))}
                                    </select>
                                    {newLekcija.course_id && sections.length === 0 && (
                                        <small className="error-hint">Ovaj kurs nema definisane sekcije.</small>
                                    )}
                                </div>
                            </div>

                            <div className="input-group-premium">
                                <label htmlFor="title">NASLOV LEKCIJE</label>
                                <div className="input-with-icon">
                                    <FiFileText className="field-icon" />
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={newLekcija.title}
                                        onChange={handleInputChange}
                                        placeholder="npr. Uvod u napredne tehnike"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group-premium">
                                <label htmlFor="content">OPIS / SADRŽAJ</label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={newLekcija.content}
                                    onChange={handleInputChange}
                                    placeholder="Unesite detaljan opis lekcije..."
                                    required
                                    rows="5"
                                />
                            </div>

                            <div className="input-group-premium">
                                <label htmlFor="video">VIDEO FAJL</label>
                                <div className="custom-file-upload">
                                    <input
                                        type="file"
                                        id="video"
                                        name="video"
                                        accept="video/*"
                                        onChange={handleVideoChange}
                                        required
                                        className="hidden-file-input"
                                    />
                                    <label htmlFor="video" className="file-upload-label">
                                        <FiVideo />
                                        <span>{video ? video.name : 'Izaberi video lekciju'}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Progress bar za upload */}
                            {loading && (
                                <div className="upload-progress-wrapper-premium">
                                    <div className="progress-info">
                                        <span>{uploadStatus}</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="upload-progress-bar-premium">
                                        <motion.div
                                            className="upload-progress-fill-premium"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <button type="submit" className="modal-save-btn" disabled={loading}>
                                <span>{loading ? 'U TOKU...' : 'DODAJ LEKCIJU'}</span>
                                {loading ? null : <FiCheck />}
                                <div className="btn-shine" />
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Lekcije;
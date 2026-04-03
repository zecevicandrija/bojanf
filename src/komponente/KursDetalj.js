// src/components/KursDetalj.js
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../login/api.js';
import { useAuth } from '../login/auth.js';
import styles from './KursDetalj.module.css';
import Komentari from '../Instruktori/Komentari.js';
import Editor from '@monaco-editor/react';
import Hls from 'hls.js';

if (typeof window !== "undefined" && !window.Hls) {
    window.Hls = Hls;
}

const PlayIcon = () => <i className="ri-play-fill"></i>;
const AssignmentIcon = () => <i className="ri-terminal-box-fill"></i>;

const KursDetalj = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const [kurs, setKurs] = useState(null);
    const [lekcije, setLekcije] = useState([]);
    const [sekcije, setSekcije] = useState([]);
    const [otvorenaLekcija, setOtvorenaLekcija] = useState(null);

    const [kupioKurs, setKupioKurs] = useState(false);
    const [completedLessons, setCompletedLessons] = useState(new Set());
    const [completedLessonsLoaded, setCompletedLessonsLoaded] = useState(false);
    const [code, setCode] = useState('// Unesite svoj kod ovde');
    const [language, setLanguage] = useState('javascript');
    const [showEditor, setShowEditor] = useState(false);
    const [savedCodes, setSavedCodes] = useState({});
    const [reviewFeedback, setReviewFeedback] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [currentStreamUrl, setCurrentStreamUrl] = useState('');
    const [searchParams] = useSearchParams();

    const imaAktivnuPretplatu = user &&
        user.subscription_expires_at &&
        new Date(user.subscription_expires_at) > new Date() &&
        user.subscription_status !== 'expired' &&
        user.subscription_status !== 'payment_failed';

    const isCourseAccessible = kurs ? (kupioKurs && (!kurs.is_subscription || imaAktivnuPretplatu)) : false;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [kursResponse, lekcijeResponse, sekcijeResponse] = await Promise.all([
                    api.get(`/api/kursevi/${id}`),
                    api.get(`/api/lekcije/course/${id}`),
                    api.get(`/api/lekcije/sections/${id}`)
                ]);

                setKurs(kursResponse.data);
                setLekcije(lekcijeResponse.data);
                setSekcije(sekcijeResponse.data);

                const sekcijaIdFromUrl = searchParams.get('sekcija');

                if (sekcijaIdFromUrl) {
                    const secId = parseInt(sekcijaIdFromUrl, 10);
                    setActiveSection(secId);
                } else if (sekcijeResponse.data.length > 0) {
                    setActiveSection(sekcijeResponse.data[0].id);
                }

                if (user) {
                    const [
                        _subscriptionRes,
                        kupovinaResponse,
                        completedResponse
                    ] = await Promise.allSettled([
                        api.get('/api/subscription/status').catch(() => null),
                        api.get(`/api/kupovina/user/${user.id}`),
                        api.get(`/api/kompletirane_lekcije/user/${user.id}/course/${id}`)
                    ]);

                    if (kupovinaResponse.status === 'fulfilled') {
                        const purchased = kupovinaResponse.value.data.some(c => c.id === parseInt(id));
                        setKupioKurs(purchased);
                    }

                    if (completedResponse.status === 'fulfilled') {
                        setCompletedLessons(new Set(completedResponse.value.data));
                        setCompletedLessonsLoaded(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id, user?.id, searchParams]);

    const totalProgress = useMemo(() => {
        if (lekcije.length === 0) return 0;
        const progress = (completedLessons.size / lekcije.length) * 100;
        return Math.round(progress);
    }, [completedLessons, lekcije]);

    const handleLessonClick = async (lekcijaId) => {
        if (!isCourseAccessible) return;
        const lekcija = lekcije.find(l => l.id === lekcijaId);
        if (!lekcija) return;

        setOtvorenaLekcija(lekcija);
        setCurrentStreamUrl('');
        setReviewFeedback(null);

        if (lekcija.video_url) {
            try {
                const response = await api.get(`/api/lekcije/${lekcija.id}/stream`);
                setCurrentStreamUrl(response.data.url);
            } catch (error) {
                console.error("Greška pri dohvatanju video linka:", error);
                if (error.response?.status === 403) {
                    setCurrentStreamUrl('subscription_expired');
                } else {
                    alert("Nije moguće učitati video.");
                    setCurrentStreamUrl('error');
                }
            }
        }

        if (lekcija.assignment) {
            setShowEditor(true);
            determineLanguage(lekcija.assignment);
            setCode(savedCodes[lekcijaId] || getDefaultCode(language));
        } else {
            setShowEditor(false);
        }
    };

    useEffect(() => {
        const sekcijaIdFromUrl = searchParams.get('sekcija');
        if (sekcijaIdFromUrl && lekcije.length > 0 && !otvorenaLekcija && user && completedLessonsLoaded) {
            const sekcijaId = parseInt(sekcijaIdFromUrl, 10);
            const lekcijeUSekciji = lekcije.filter(l => l.sekcija_id === sekcijaId);

            if (lekcijeUSekciji.length > 0) {
                const prvaNezavrsena = lekcijeUSekciji.find(l => !completedLessons.has(l.id));
                const lekcijaZaPustanje = prvaNezavrsena || lekcijeUSekciji[0];

                if (lekcijaZaPustanje && isCourseAccessible) {
                    handleLessonClick(lekcijaZaPustanje.id);
                }
            }
        }
    }, [lekcije, completedLessons, completedLessonsLoaded, searchParams, user, isCourseAccessible]);

    const handleNextLesson = () => {
        if (!otvorenaLekcija) return;
        const currentIndex = lekcije.findIndex(l => l.id === otvorenaLekcija.id);
        if (currentIndex !== -1 && currentIndex < lekcije.length - 1) {
            handleLessonClick(lekcije[currentIndex + 1].id);
        }
    };

    const handlePrevLesson = () => {
        if (!otvorenaLekcija) return;
        const currentIndex = lekcije.findIndex(l => l.id === otvorenaLekcija.id);
        if (currentIndex > 0) {
            handleLessonClick(lekcije[currentIndex - 1].id);
        }
    };

    const handleCompletionToggle = async (lessonId) => {
        if (!user) return;

        const isCompleted = completedLessons.has(lessonId);
        const updatedCompletedLessons = new Set(completedLessons);

        try {
            if (isCompleted) {
                await api.delete('/api/kompletirane_lekcije', {
                    data: {
                        korisnik_id: parseInt(user.id, 10),
                        lekcija_id: lessonId
                    }
                });
                updatedCompletedLessons.delete(lessonId);
            } else {
                await api.post('/api/kompletirane_lekcije', {
                    korisnik_id: parseInt(user.id, 10),
                    kurs_id: parseInt(id, 10),
                    lekcija_id: lessonId
                });
                updatedCompletedLessons.add(lessonId);
            }
            setCompletedLessons(updatedCompletedLessons);
        } catch (err) {
            console.error("Greška pri ažuriranju statusa lekcije:", err);
        }
    };

    const determineLanguage = (assignment) => {
        const text = assignment.toLowerCase();
        if (text.includes('react') || text.includes('jsx')) setLanguage('javascript');
        else if (text.includes('html')) setLanguage('html');
        else if (text.includes('css')) setLanguage('css');
        else setLanguage('javascript');
    };

    const getDefaultCode = (lang) => {
        switch (lang) {
            case 'html': return '<!DOCTYPE html>\n<html>\n<head>\n  <title>Page Title</title>\n</head>\n<body>\n\n</body>\n</html>';
            case 'css': return '/* Add your CSS here */\nbody {\n  margin: 0;\n  padding: 0;\n}';
            default: return '// Unesite svoj JavaScript kod ovde';
        }
    };

    const handleSaveCode = async () => {
        if (!otvorenaLekcija?.id || !user) return;
        try {
            await api.post('/api/saved-codes', {
                user_id: user.id,
                lesson_id: otvorenaLekcija.id,
                code,
                language
            });
            setSavedCodes({ ...savedCodes, [otvorenaLekcija.id]: code });
            alert('Kod je uspešno sačuvan!');
        } catch {
            alert('Došlo je do greške pri čuvanju koda');
        }
    };

    const handleAddToCart = () => {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (!cart.find(c => c.id === kurs.id)) {
            localStorage.setItem('cart', JSON.stringify([...cart, kurs]));
            window.dispatchEvent(new Event('cart-updated'));
        }
        navigate('/korpa');
    };

    const handleReviewCode = async () => {
        try {
            const { data } = await api.post('/api/lekcije/deepseek-review', { code, language });
            if (data.success) setReviewFeedback({ message: data.message });
            else setReviewFeedback({ message: 'AI nije vratio validan odgovor.', error: data.error });
        } catch (error) {
            setReviewFeedback({ message: 'Greška pri proveri koda.', error: error.message });
        }
    };

    if (!kurs) return <div style={{ color: 'white', padding: '2rem' }}>Učitavanje...</div>;

    const renderContentWithLinks = (text) => {
        if (!text) return null;
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return parts.map((part, index) => {
            if (part.match(urlRegex)) {
                return (
                    <a key={index} href={part} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    // Helper to format index to two digits "01", "02"
    const formatNumber = (num) => num.toString().padStart(2, '0');

    return (
        <div className={styles.workstationContainer}>
            {/* Bočni Meni (The Syllabus) */}
            <aside className={styles.sidebar}>
                {kupioKurs && (
                    <div className={styles.progressWrapper}>
                        <span className={styles.progressLabel}>
                            PROGRESS: {totalProgress}% [{completedLessons.size}/{lekcije.length}]
                        </span>
                        <div className={styles.progressBarTrack}>
                            <div
                                className={styles.progressBarFill}
                                style={{ width: `${totalProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                <div className={styles.syllabusContainer}>
                    {sekcije.map((sekcija, index) => (
                        <div key={sekcija.id}>
                            <div
                                className={`${styles.sectionHeader} ${styles.sharpText}`}
                                onClick={() => setActiveSection(activeSection === sekcija.id ? null : sekcija.id)}
                            >
                                <span>{formatNumber(index + 1)} // {sekcija.naziv}</span>
                                <span>{activeSection === sekcija.id ? '-' : '+'}</span>
                            </div>

                            {activeSection === sekcija.id && (
                                <ul className={styles.lessonList}>
                                    {lekcije
                                        .filter(l => l.sekcija_id === sekcija.id)
                                        .map((lekcija, lIndex) => {
                                            const isActive = otvorenaLekcija?.id === lekcija.id;
                                            const isCompleted = completedLessons.has(lekcija.id);

                                            // Format for mono right side. Defaulting duration if missing.
                                            const displayIndex = formatNumber(lIndex + 1);

                                            return (
                                                <li
                                                    key={lekcija.id}
                                                    className={`${styles.lessonItem} ${isActive ? styles.lessonItemActive : ''} ${!isCourseAccessible ? styles.disabled : ''}`}
                                                    onClick={() => isCourseAccessible && handleLessonClick(lekcija.id)}
                                                >
                                                    <div className={styles.activeIndicator}></div>

                                                    <div className={styles.lessonTitleWrapper}>
                                                        <div className={styles.lessonIcon}>
                                                            {lekcija.assignment ? <AssignmentIcon /> : <PlayIcon />}
                                                        </div>
                                                        <span>{lekcija.title}</span>
                                                    </div>

                                                    {isCourseAccessible && (
                                                        <div className={styles.lessonMeta}>
                                                            <span className={`${styles.monoText} ${styles.lessonDuration}`}>{displayIndex}</span>
                                                            <div
                                                                className={`${styles.checkIcon} ${isCompleted ? styles.checkIconCompleted : ''}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCompletionToggle(lekcija.id);
                                                                }}
                                                            ></div>
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Video Plejer & Content (The Cinema) */}
            <main className={styles.mainContent}>
                {!kupioKurs ? (
                    <div className={styles.stateContainer}>
                        <h2 className={`${styles.stateHeading} ${styles.sharpText}`}>PRISTUP ODBIJEN</h2>
                        <p className={styles.stateSubText}>Ovaj modul je zaštićen. Dodajte ga u korpu i započnite prenos znanja.</p>
                        <button onClick={handleAddToCart} className={styles.ctaButton}>Kupi Pristup // {kurs.cena} €</button>
                    </div>
                ) : !isCourseAccessible ? (
                    <div className={styles.stateContainer}>
                        <h2 className={`${styles.stateHeading} ${styles.sharpText}`} style={{ color: '#ff0033' }}>VEZA PREKINUTA</h2>
                        <p className={styles.stateSubText}>Vaša licenca je istekla. Obnovite pretplatu za povratak u sistem.</p>
                        <button onClick={() => navigate('/produzivanje')} className={styles.ctaButton}>Obnovi Autentifikaciju</button>
                    </div>
                ) : !otvorenaLekcija ? (
                    <div className={styles.stateContainer}>
                        <h2 className={`${styles.stateHeading} ${styles.sharpText}`}>SISTEM SPREMAN</h2>
                        <p className={styles.stateSubText}>Izaberite modul na levoj strani da biste uspostavili link.</p>
                    </div>
                ) : (
                    <>
                        <div className={`${styles.topBar} ${styles.hideMobile}`}>
                            <div className={styles.moduleTitleInfo}>
                                <div className={`${styles.moduleTitleText} ${styles.sharpText}`}>
                                    {otvorenaLekcija.title}
                                </div>
                            </div>

                            <div className={styles.navigationControls}>
                                <button
                                    className={`${styles.navTextBtn} ${styles.sharpText}`}
                                    onClick={handlePrevLesson}
                                    disabled={lekcije.findIndex(l => l.id === otvorenaLekcija.id) <= 0}
                                >
                                    &lt; PRET
                                </button>
                                <button
                                    className={`${styles.navTextBtn} ${styles.sharpText}`}
                                    onClick={handleNextLesson}
                                    disabled={lekcije.findIndex(l => l.id === otvorenaLekcija.id) >= lekcije.length - 1}
                                >
                                    SLED &gt;
                                </button>
                            </div>
                        </div>

                        {/* Mobile Title - Above Video */}
                        <div className={`${styles.showMobileOnly} ${styles.mobileTitleWrapper}`}>
                            <div className={`${styles.moduleTitleText} ${styles.sharpText} ${styles.mobileTitle}`}>
                                {otvorenaLekcija.title}
                            </div>
                        </div>

                        <div className={styles.videoStage}>
                            {otvorenaLekcija.video_url && (
                                <div className={styles.videoWrapper}>
                                    {!currentStreamUrl && <div className={styles.videoPlaceholder}>POVEZIVANJE...</div>}
                                    {currentStreamUrl === 'error' && <div className={styles.videoPlaceholder} style={{ color: '#ff0033' }}>GREŠKA U PRENOSU SIGNALA.</div>}
                                    {currentStreamUrl === 'subscription_expired' && (
                                        <div className={styles.videoPlaceholder} style={{ color: '#ff0033' }}>PRISTUP ODBIJEN. LICENCA ISTEKLA.</div>
                                    )}
                                    {currentStreamUrl && currentStreamUrl !== 'error' && currentStreamUrl !== 'subscription_expired' && (
                                        <iframe
                                            className={styles.videoIframe}
                                            src={currentStreamUrl}
                                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                            allowFullScreen={true}
                                        ></iframe>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Navigation - Below Video */}
                        <div className={`${styles.navigationControls} ${styles.showMobileOnly} ${styles.mobileNavSpacer}`}>
                            <button
                                className={`${styles.navTextBtn} ${styles.sharpText}`}
                                onClick={handlePrevLesson}
                                disabled={lekcije.findIndex(l => l.id === otvorenaLekcija.id) <= 0}
                            >
                                &lt; PRET
                            </button>
                            <button
                                className={`${styles.navTextBtn} ${styles.sharpText}`}
                                onClick={handleNextLesson}
                                disabled={lekcije.findIndex(l => l.id === otvorenaLekcija.id) >= lekcije.length - 1}
                            >
                                SLED &gt;
                            </button>
                        </div>

                        <div className={styles.contentArea}>
                            <div className={styles.contentText}>
                                {renderContentWithLinks(otvorenaLekcija.content)}
                            </div>

                            {otvorenaLekcija.assignment && (
                                <div className={styles.editorSection}>
                                    <h3 className={styles.sharpText}>ZADATAK // TERMINAL</h3>
                                    <p className={styles.assignmentDesc}>{otvorenaLekcija.assignment}</p>

                                    {showEditor && (
                                        <div className={styles.codeBox}>
                                            <div className={styles.codeHeader}>
                                                <h4>// EDITOR</h4>
                                                <select
                                                    className={styles.codeSelect}
                                                    value={language}
                                                    onChange={e => setLanguage(e.target.value)}
                                                >
                                                    <option value="javascript">JAVASCRIPT</option>
                                                    <option value="html">HTML</option>
                                                    <option value="css">CSS</option>
                                                </select>
                                            </div>
                                            <Editor
                                                height="400px"
                                                language={language}
                                                theme="vs-dark"
                                                value={code}
                                                onChange={setCode}
                                                options={{
                                                    minimap: { enabled: false },
                                                    fontSize: 14,
                                                    wordWrap: 'on',
                                                    padding: { top: 16 }
                                                }}
                                            />
                                            <div className={styles.codeActions}>
                                                <button className={`${styles.btnHollow} ${styles.sharpText}`} onClick={handleSaveCode}>SAČUVAJ KOD</button>
                                                <button className={`${styles.btnHollow} ${styles.sharpText}`} onClick={handleReviewCode} style={{ borderColor: '#ff0033', color: '#ff0033' }}>AI VALIDACIJA</button>
                                            </div>
                                            {reviewFeedback && (
                                                <div className={styles.aiFeedbackBox}>
                                                    <h4>// AI ODGOVOR</h4>
                                                    <pre>{reviewFeedback.message}</pre>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default KursDetalj;
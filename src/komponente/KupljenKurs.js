import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../login/api";
import { useAuth } from "../login/auth";
import styles from "./KupljenKurs.module.css";
import reactkurs from '../images/bojanslike/slika1.webp';

const KupljenKurs = () => {
    const [sviKupljeniKursevi, setSviKupljeniKursevi] = useState([]);
    const [selektovaniKursId, setSelektovaniKursId] = useState("");
    const [progresPoSekcijama, setProgresPoSekcijama] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSekcija, setIsLoadingSekcija] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();

    // Dohvatanje kupljenih kurseva
    useEffect(() => {
        const fetchKupljeneKurseve = async () => {
            if (user?.id) {
                try {
                    setIsLoading(true);
                    const response = await api.get(`/api/kupovina/user/${user.id}`);
                    const kursevi = response.data;
                    setSviKupljeniKursevi(kursevi);

                    if (kursevi && kursevi.length > 0) {
                        setSelektovaniKursId(kursevi[0].id);
                    }
                } catch (error) {
                    console.error("Greška pri dohvatanju kupljenih kurseva:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
            }
        };
        fetchKupljeneKurseve();
    }, [user?.id]);

    // Dohvatanje progresa po sekcijama
    useEffect(() => {
        const fetchProgresPoSekcijama = async () => {
            if (selektovaniKursId && user?.id) {
                try {
                    setIsLoadingSekcija(true);
                    setProgresPoSekcijama([]);
                    const response = await api.get(
                        `/api/kursevi/progres-sekcija/${selektovaniKursId}/korisnik/${user.id}`
                    );
                    setProgresPoSekcijama(response.data);
                } catch (error) {
                    console.error("Greška pri dohvatanju progresa:", error);
                } finally {
                    setIsLoadingSekcija(false);
                }
            }
        };
        fetchProgresPoSekcijama();
    }, [selektovaniKursId, user?.id]);

    // Proveravamo da li je status u progresu ili sve na 0
    const hasProgress = progresPoSekcijama.some(s => (s.progres || 0) > 0);
    const totalProgress = progresPoSekcijama.length > 0
        ? Math.round(progresPoSekcijama.reduce((acc, s) => acc + (s.progres || 0), 0) / progresPoSekcijama.length)
        : 0;

    if (isLoading) {
        return (
            <section className={styles.sectionWrapper}>
                <div className={styles.emptyState}>
                    <p>Učitavanje masterclass-a...</p>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.sectionWrapper}>
            {/* Background Texture */}
            <div className={styles.noiseOverlay}></div>
            <div className={styles.gridOverlay}></div>

            {/* Arhitektura Zaglavlja (The Command Center) */}
            <div className={styles.commandCenter}>
                <div className={styles.headerFlex}>
                    <div className={styles.titleGroup}>
                        <h1 className={styles.mainTitle}>LEKCIJE</h1>
                    </div>
                    <div className={styles.metaData}>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>MODULI:</span>
                            <span className={styles.metaValue}>{progresPoSekcijama.length || 0}</span>
                        </div>
                        <div className={styles.metaDivider}></div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>STATUS:</span>
                            <span className={`${styles.metaValue} ${hasProgress ? styles.statusActive : ''}`}>
                                {hasProgress ? 'U PROGRESU' : 'NIJE ZAPOČETO'}
                            </span>
                        </div>
                        <div className={styles.metaDivider}></div>
                        <div className={styles.metaItem}>
                            <span className={styles.metaLabel}>UKUPNO:</span>
                            <span className={styles.metaValue}>{totalProgress}%</span>
                        </div>
                    </div>
                </div>
                <div className={styles.separatorLine}></div>
            </div>

            {isLoadingSekcija && (
                <div className={styles.emptyState}>
                    <p>Priprema modula...</p>
                </div>
            )}

            {!isLoadingSekcija && progresPoSekcijama.length > 0 && (
                <div className={styles.verticalGrid}>
                    {progresPoSekcijama.map((sekcija, index) => {
                        const progres = sekcija.progres || 0;
                        const serialNum = String(index + 1).padStart(2, '0');

                        return (
                            <article
                                key={sekcija.sekcija_id}
                                className={styles.antiCardGroup}
                                onClick={() => navigate(`/kurs/${selektovaniKursId}?sekcija=${sekcija.sekcija_id}`)}
                            >
                                <div className={styles.imageContainer}>
                                    <img
                                        src={sekcija.thumbnail || reactkurs}
                                        alt={sekcija.naziv_sekcije}
                                        className={styles.thumbnail}
                                        loading="lazy"
                                    />
                                </div>

                                <div className={styles.cardInfo}>
                                    <div className={styles.microMeta}>
                                        {progres > 0 ? 'NASTAVI UČENJE' : 'ZAPOČNI'}
                                    </div>

                                    <h3 className={styles.lessonTitle}>
                                        {sekcija.naziv_sekcije}
                                        <span className={styles.hoverArrow}>&rarr;</span>
                                    </h3>

                                    <div className={styles.progressSection}>
                                        <div className={styles.progressBarBg}>
                                            <div
                                                className={styles.progressBarFill}
                                                style={{ width: `${progres}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {!isLoading && !isLoadingSekcija && selektovaniKursId && progresPoSekcijama.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Ovaj masterclass trenutno nema definisanih modula.</p>
                </div>
            )}

            {!isLoading && sviKupljeniKursevi.length === 0 && (
                <div className={styles.emptyState}>
                    <p>Nemate pristup ovom masterclass-u. Kontaktirajte podršku.</p>
                </div>
            )}
        </section>
    );
};

export default KupljenKurs;
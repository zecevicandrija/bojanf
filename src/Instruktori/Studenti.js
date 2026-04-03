import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import api from '../login/api'; // Koristimo naš centralizovani API klijent
import './Studenti.css';

const Studenti = () => {
    const [studenti, setStudenti] = useState([]);
    const [kursNaziv, setKursNaziv] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { kursId } = useParams();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [studentiResponse, kursResponse] = await Promise.all([
                api.get(`/api/kupovina/studenti/${kursId}`),
                api.get(`/api/kursevi/${kursId}`)
            ]);

            setStudenti(studentiResponse.data);
            setKursNaziv(kursResponse.data.naziv);

        } catch (error) {
            console.error('Greška pri dohvatanju podataka:', error);
        } finally {
            setIsLoading(false);
        }
    }, [kursId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredStudenti = studenti.filter(student =>
        student.ime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.prezime.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="st-loader-container">
                <div className="st-spinner"></div> UČITAVANJE STUDENATA...
            </div>
        );
    }

    return (
        <div className="st-full-page-container">
            <div className="st-noise-overlay"></div>
            <div className="st-grid-overlay"></div>

            <div className="st-inner">
                {/* Header Section */}
                <div className="st-top-nav">
                    <button onClick={() => navigate('/instruktor')} className="st-back-btn">
                        <FiArrowLeft /> NAZAD NA TABLU
                    </button>
                    <div className="st-page-title-box">
                        <span className="st-badge">POLAZNICI KURSA</span>
                        <h1 className="st-main-title">
                            {kursNaziv}
                        </h1>
                    </div>
                </div>

                <div className="st-glass-panel">
                    <div className="st-search-section">
                        <div className="st-search-wrapper">
                            <FiSearch className="st-search-icon" />
                            <input 
                                type="text"
                                placeholder="Pretraži polaznike po imenu ili email-u..."
                                className="st-search-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {filteredStudenti.length > 0 ? (
                        <div className="st-table-container">
                            <div className="st-table-header">
                                <span>IME I PREZIME</span>
                                <span>EMAIL ADRESA</span>
                                <span style={{textAlign: 'right'}}>DATUM KUPOVINE</span>
                            </div>
                            <div className="st-list">
                                {filteredStudenti.map(student => (
                                    <div key={student.student_id} className="st-row">
                                        <div className="st-cell-name">
                                            {student.ime} {student.prezime}
                                        </div>
                                        <div className="st-cell-email">
                                            {student.email}
                                        </div>
                                        <div className="st-cell-date">
                                            {new Date(student.datum_kupovine).toLocaleDateString('sr-RS', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="st-empty">
                            Trenutno nema polaznika koji odgovaraju pretrazi.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Studenti;
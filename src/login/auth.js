import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      // Pozovi backend da obriše refresh token iz baze i cookie-ja
      await api.post('/api/auth/logout');
    } catch (error) {
      // Čak i ako server nije dostupan, nastavljamo sa lokalnom odjavom
      console.error("Greška prilikom odjave sa servera:", error);
    }
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const verifyUserSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          const freshUser = response.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          // api.js interceptor će automatski pokušati refresh ako je TOKEN_EXPIRED
          // Ako i refresh propadne, interceptor će redirect-ovati na /login
          // Ovde stižemo samo ako je i refresh propao
          console.error("Sesija nije validna, odjavljivanje:", error);
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    // OPTIMIZACIJA: Throttle — max 1 poziv na 30 sekundi pri focus eventu
    let lastFocusCheck = 0;
    const throttledVerify = () => {
      const now = Date.now();
      if (now - lastFocusCheck > 30000) {
        lastFocusCheck = now;
        verifyUserSession();
      }
    };

    verifyUserSession();
    window.addEventListener('focus', throttledVerify);
    return () => {
      window.removeEventListener('focus', throttledVerify);
    };
  }, [logout]);

  const login = async (email, sifra) => {
    try {
      const response = await api.post("/api/auth/login", { email, sifra });
      if (response.status === 200) {
        const { user: loggedInUser, accessToken } = response.data;
        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        localStorage.setItem("token", accessToken);
        // Refresh token je automatski čuvan kao HttpOnly cookie od strane servera
        navigate("/");
      }
    } catch (error) {
      setModalMessage("Došlo je do greške prilikom prijave. Proverite kredencijale.");
      setShowModal(true);
      console.error("Error logging in:", error);
      throw error;
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const updateUser = async (userData) => { /* ... */ };

  const value = React.useMemo(
    () => ({ user, setUser, loading, login, logout, updateUser }),
    [user, loading, logout]
  );

  return (
    <>
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          backdropFilter: 'blur(10px)', color: '#fff', padding: '20px'
        }}>
          <div style={{
            background: '#111', padding: '30px', borderRadius: '14px', maxWidth: '400px',
            width: '100%', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>Proruka</h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '25px' }}>{modalMessage}</p>
            <button
              onClick={closeModal}
              style={{
                background: '#ff0033', color: '#fff', border: 'none', padding: '12px 30px',
                borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              U redu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const useAuth = () => useContext(AuthContext);
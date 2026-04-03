import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Pocetna from './komponente/Pocetna';
import { AuthProvider } from './login/auth';
import Navbar from './Navigacija/Navbar';
import ProtectedRoute from './komponente/ProtectedRoutes';
import { ThemeProvider } from './komponente/ThemeContext';
import './App.css';

// LAZY LOADING ZA SVE OSTALE RUTE - Browser skida kod tek kad mu zatreba
const Footer = lazy(() => import('./pocetna/Footer'));
const KursLista = lazy(() => import('./komponente/KursLista'));
const DodajKurs = lazy(() => import('./komponente/DodajKurs'));
const LoginPage = lazy(() => import('./login/LoginPage'));
const DodajKorisnika = lazy(() => import('./login/DodajKorisnika'));
const KursDetalj = lazy(() => import('./komponente/KursDetalj'));
const Lekcije = lazy(() => import('./komponente/Lekcije'));
const MojProfil = lazy(() => import('./login/MojProfil'));
const KupljenKurs = lazy(() => import('./komponente/KupljenKurs'));
const Instruktor = lazy(() => import('./Instruktori/Instruktor'));
const Studenti = lazy(() => import('./Instruktori/Studenti'));
const Korpa = lazy(() => import('./Kupovina/Korpa'));
const Kviz = lazy(() => import('./Instruktori/Kviz'));
const Checkout = lazy(() => import('./Kupovina/Checkout'));
const PaymentResult = lazy(() => import('./Kupovina/PaymentResult'));
const EditKursa = lazy(() => import('./Instruktori/EditKursa'));
const Paket = lazy(() => import('./komponente/Paket'));
const Produzivanje = lazy(() => import('./komponente/Produzivanje'));
const Informacije = lazy(() => import('./komponente/Informacije'));
const Tos = lazy(() => import('./komponente/Tos'));
const RefundPolicy = lazy(() => import('./komponente/RefundPolicy'));
const PrivacyPolicy = lazy(() => import('./komponente/PrivacyPolicy'));
const PopustDashboard = lazy(() => import('./Instruktori/PopustDashboard'));
const EditKorisnika = lazy(() => import('./Instruktori/EditKorisnika'));
const Zarada = lazy(() => import('./Instruktori/Zarada'));
const Nepostojeca = lazy(() => import('./komponente/Nepostojeca'));

const App = () => {

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Navbar />
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Pocetna />} />
              <Route path="/kursevi" element={<KursLista />} />
              <Route path="/dodajkurs" element={<ProtectedRoute element={<DodajKurs />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dodajkorisnika" element={<ProtectedRoute element={<DodajKorisnika />} allowedRoles={['admin']} />} />
              <Route path="/kurs/:id" element={<KursDetalj />} />
              <Route path="/lekcije" element={<ProtectedRoute element={<Lekcije />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/profil" element={<MojProfil />} />
              <Route path="/kupljenkurs" element={<KupljenKurs />} />
              <Route path="/studenti/:kursId" element={<ProtectedRoute element={<Studenti />} allowedRoles={['admin', 'instruktor']} />} />
              <Route
                path="/instruktor"
                element={<ProtectedRoute element={<Instruktor />} allowedRoles={['admin', 'instruktor']} />}
              />
              <Route path="/popusti" element={<ProtectedRoute element={<PopustDashboard />} allowedRoles={['admin']} />} />
              <Route path="/korpa" element={<Korpa />} />
              <Route path="/napravikviz" element={<ProtectedRoute element={<Kviz />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/placanje/rezultat" element={<PaymentResult />} />
              <Route path="/edit-kurs/:kursId" element={<ProtectedRoute element={<EditKursa />} allowedRoles={['admin', 'instruktor']} />} />
              <Route path="/zarada" element={<ProtectedRoute element={<Zarada />} allowedRoles={['admin']} />} />
              <Route path="/edit-korisnika" element={<ProtectedRoute element={<EditKorisnika />} allowedRoles={['admin']} />} />
              <Route path="/paket" element={<Paket />} />
              <Route path="/produzivanje" element={<Produzivanje />} />
              <Route path="/informacije" element={<Informacije />} />
              <Route path="/tos" element={<Tos />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/nevazeca" element={<Nepostojeca />} />
            </Routes>
          </Suspense>
          <Footer />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { useAuth } from '../login/auth';
import { useNavigate } from 'react-router-dom';
import "./Paket.css";

import Footer from '../pocetna/Footer.js';

// Logotipi
import visaSecure from '../images/logotipi/visa-secure_blu_72dpi.jpg';
import mcIdCheck from '../images/logotipi/mc_idcheck_hrz_rgb_pos.png';
import maestro from '../images/logotipi/ms_acc_opt_70_1x.png';
import mastercard from '../images/logotipi/mc_acc_opt_70_1x.png';
import dina from '../images/logotipi/DinaCard znak.jpg';
import visa from '../images/logotipi/Visa_Brandmark_Blue_RGB_2021.png';
import chipcard from '../images/logotipi/ChipCard LOGO 2021_rgb.jpg';

const Paket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const plans = [
    {
      title: "DIGITAL MASTERCLASS",
      price: "150€",
      priceNumeric: 17550,
      period: "JEDNOKRATNO",
      highlight: false,
      packageId: "BARBER_STANDARD",
      description: "Savršen start za berbere koji žele da nauče moderne tehnike fade-a i unaprede veštine.",
      features: [
        "Kompletan video kurs (Step-by-step)",
        "Sve tehnike modernog fade-a",
        "Pravilno korišćenje mašinice i makaza",
        "Pristup platformi zauvek",
        "Ekskluzivna barber zajednica"
      ]
    },
    {
      title: "MENTORSHIP PRO",
      price: "450€",
      priceNumeric: 52650,
      period: "POZOVITE NAS",
      highlight: true,
      packageId: "BARBER_PRO",
      description: "Najbrži put do uspeha uz 1-na-1 rad i detaljno vođenje kroz tehnike i biznis.",
      features: [
        "Sve iz Digital Masterclass paketa",
        "1-na-1 online i uživo konsultacije",
        "Detaljna analiza i korekcija tvojih radova",
        "Marketing i saveti za vođenje salona",
        "Internacionalno priznat sertifikat"
      ]
    }
  ];

  const handlePurchaseClick = (plan) => {
    navigate('/informacije', {
      state: {
        packageData: {
          id: plan.packageId,
          code: plan.packageId,
          name: `${plan.title} Paket - ${plan.period}`,
          title: plan.title,
          description: plan.description,
          amount: plan.priceNumeric,
          price: plan.price,
          period: plan.period
        }
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      <section className="paket-section" ref={ref}>
        {/* Background Overlays matching Hero */}
        <div className="noise-overlay"></div>
        <div className="grid-overlay"></div>

        <div className="paket-container">
          <motion.div
            className="paket-header"
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div className="paket-badge" variants={itemVariants}>
              <span className="badge-text">
                CENOVNIK
              </span>
            </motion.div>

            <motion.div className="headline-wrapper" variants={itemVariants}>
              <span className="solid-text">INVESTIRAJ</span>
              <span className="outline-text">U ZNANJE</span>
            </motion.div>

            <motion.p className="paket-subtitle" variants={itemVariants}>
              Izaberi paket koji odgovara tvojim ambicijama. Od online lekcija za osnove, do 1-na-1 mentorstva
              za one koji žele maksimalno da podignu kvalitet svog barber biznisa.
            </motion.p>
          </motion.div>

          <motion.div
            className="paket-grid"
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                className={`paket-card ${plan.highlight ? 'paket-card-highlight' : ''}`}
                variants={itemVariants}
                whileHover={{ y: plan.highlight ? -15 : -5, transition: { duration: 0.3 } }}
              >
                {plan.highlight && (
                  <div className="card-popular">
                    NAJPOPULARNIJE
                  </div>
                )}

                <div className="card-header">
                  <h3 className="card-title">{plan.title}</h3>
                  <p className="card-desc">{plan.description}</p>
                </div>

                <div className="card-price-box">
                  <span className="card-price">{plan.price}</span>
                  <span className="card-period">{plan.period}</span>
                </div>

                <div className="card-divider" />

                <ul className="card-features">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="card-feature-item">
                      <span className="feature-check"><FiCheck /></span>
                      {feat}
                    </li>
                  ))}
                </ul>

                <button
                  className={`card-btn ${plan.highlight ? 'btn-highlight' : ''}`}
                  onClick={() => handlePurchaseClick(plan)}
                >
                  <span>{plan.highlight ? 'ZAPOČNI MENTORSTVO' : 'KUPITE KURS'}</span>
                  <FiArrowRight />
                </button>
              </motion.div>
            ))}
          </motion.div>

          {/* Payment & Security Logos */}
          <motion.div
            className="paket-logos-wrapper"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="paket-logos-container">
              <div className="logos-group security-group">
                <a href="https://rs.visa.com/pay-withvisa/security-and-assistance/protected-everywhere.html" target="_blank" rel="noopener noreferrer">
                  <img src={visaSecure} alt="Visa Secure" className="logo-img" />
                </a>
                <a href="http://www.mastercard.com/rs/consumer/credit-cards.html" target="_blank" rel="noopener noreferrer">
                  <img src={mcIdCheck} alt="Mastercard ID Check" className="logo-img" />
                </a>
              </div>

              <div className="logos-group payment-group">
                <img src={maestro} alt="Maestro" className="logo-img" />
                <img src={mastercard} alt="Mastercard" className="logo-img" />
                <img src={dina} alt="DinaCard" className="logo-img" />
                <img src={visa} alt="Visa" className="logo-img" />
                <a href="https://chipcard.rs/ecommerce/" target="_blank" rel="noopener noreferrer">
                  <img src={chipcard} alt="ChipCard" className="logo-img" style={{ height: '35px' }} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Paket;
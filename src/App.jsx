
// ============================================================
// FLEISSIG — Iteration 1: Skeleton + Nav + Config
// ============================================================
// ANALYTICS PLACEHOLDERS — заменить перед деплоем
//
// GA4:
// В index.html добавить в <head>:
// <!-- Google Analytics -->
// <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
// <script>
//   window.dataLayer = window.dataLayer || [];
//   function gtag(){dataLayer.push(arguments);}
//   gtag('js', new Date());
//   gtag('config', 'G-XXXXXXXXXX');
// </script>
//
// META PIXEL:
// В index.html добавить в <head>:
// <!-- Meta Pixel -->
// <script>
//   !function(f,b,e,v,n,t,s){...}(window,document,'script',
//   'https://connect.facebook.net/en_US/fbevents.js');
//   fbq('init', 'XXXXXXXXXXXXXXXX');
//   fbq('track', 'PageView');
// </script>
//
// СОБЫТИЯ (вставить рядом с кнопками ниже по коду):
// WhatsApp click:  fbq('track', 'Lead', {content_name: 'whatsapp_[service]'})
// Форма отправлена: fbq('track', 'Lead', {content_name: 'form_submit'})
// Калькулятор открыт: gtag('event', 'calculator_open')
// Калькулятор завершён: gtag('event', 'calculator_complete', {value: total})
// ============================================================

import { useState, useEffect } from "react";
import { useForm } from "@formspree/react";
import {
  Menu, X, MessageCircle, ChevronDown, ChevronRight,
  MapPin, Shield, Star, Clock, Check, Phone, Mail,
  Scissors, Home, Leaf, Building, Wrench, Eye
} from "lucide-react";

// ============================================================
// КОНФИГ — единый источник цен и настроек
// Менять только здесь, везде обновится автоматически
// ============================================================
export const CONFIG = {
  WA_NUMBER: "41779588526",
  OFFER_END: new Date("2026-06-30T23:59:59"),
  COMPANY_NAME: "Fleissig",
  TAGLINE: "Reinigung & Gartenpflege im Kanton Aargau",
  EMAIL: "fleissig.reinigungen@gmail.com",
  PHONE: "+41 77 958 85 26",
  ADDRESS: "Seengen, Kanton Aargau",
  UID: "CHE-461.009.759",
};

export const PRICES = {
  endreinigung: {
    "2.5": { basic: 690,  komplett: 890  },
    "3.5": { basic: 890,  komplett: 1090 },
    "4.5": { basic: 1090, komplett: 1390 },
    "5.5": { basic: 1390, komplett: 1690 },
    "EFH": { basic: 1690, komplett: 2090 },
  },
  extras: { entsorgung: 120, teppich: 180 },
  unterhalt: {
    einmalig: 75,   // CHF/Std
    basis:   396,   // CHF/Monat
    komfort: 780,
    premium: 1530,
  },
  garten: {
    stunde_abo: 65,
    stunde_einmalig: 80,
    fruehling: 490,
    herbst: 390,
    abo_monat: 390,
  },
  fenster: { pauschal_25zi: 320 },
};

export const PAKETE = [
  {
    name: "Umzug komplett 3.5-Zi",
    items: "Endreinigung Komplett + Entsorgung",
    einzeln: 1210, paket: 1090,
  },
  {
    name: "Umzug komplett 4.5-Zi",
    items: "Endreinigung Komplett + Entsorgung",
    einzeln: 1510, paket: 1350,
  },
  {
    name: "Frühjahrsputz 3.5-Zi",
    items: "Grundreinigung + Fenster",
    einzeln: 850, paket: 690,
  },
  {
    name: "Frühjahrsputz 4.5-Zi",
    items: "Grundreinigung + Fenster",
    einzeln: 1090, paket: 890,
  },
];

// ============================================================
// ХЕЛПЕРЫ
// ============================================================
export const formatPrice = (val) =>
  val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");

export const isOfferActive = () => new Date() < CONFIG.OFFER_END;

export const getOfferDiscount = (roomSize) =>
  isOfferActive() ? (roomSize === "2.5" ? 50 : 100) : 0;

export const buildWaLink = (service) => {
  const texts = {
    general:      "Grüezi Fleissig, ich interessiere mich für Ihre Dienstleistungen. Kurz zu mir: ",
    endreinigung: "Grüezi, ich brauche eine Umzugsreinigung. Wohnung: X-Zimmer, ca. Y m². Ich schicke Ihnen 3 Fotos.",
    unterhalt:    "Grüezi, ich interessiere mich für regelmässige Reinigung. Ich schicke Details.",
    garten:       "Grüezi, ich brauche Gartenpflege. Kurz zum Garten: ",
    fenster:      "Grüezi, ich möchte die Fenster reinigen lassen. Wohnung X-Zimmer, mit/ohne Storen.",
  };
  const text = encodeURIComponent(texts[service] || texts.general);
  return `https://wa.me/${CONFIG.WA_NUMBER}?text=${text}`;
};

// ============================================================
// НАВИГАЦИЯ
// ============================================================
export const PAGES = [
  { id: "home",              label: "Start"           },
  { id: "umzugsreinigung",   label: "Umzugsreinigung" },
  { id: "unterhaltsreinigung",label: "Unterhalt"      },
  { id: "gartenpflege",      label: "Garten"          },
  { id: "preise",            label: "Preise"          },
  { id: "faq",               label: "FAQ"             },
  { id: "kontakt",           label: "Kontakt"         },
];

export function Nav({ currentPage, setPage }) {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(255,255,255,0.97)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid #e8e8e8",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 20px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        height: 60,
      }}>
        {/* Logo */}
        <button
          onClick={() => { setPage("home"); setOpen(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "none", cursor: "pointer",
            padding: 0,
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "#3D7B4F",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>F</span>
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 700, fontSize: 18, color: "#1a1a1a",
            letterSpacing: "-0.3px",
          }}>
            Fleissig
          </span>
        </button>

        {/* Desktop nav */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }} className="desktop-nav">
          {PAGES.slice(1, 6).map(p => (
            <button key={p.id}
              onClick={() => setPage(p.id)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                padding: "6px 12px", borderRadius: 6,
                fontSize: 14, fontWeight: 500,
                color: currentPage === p.id ? "#3D7B4F" : "#4A4A4A",
                background: currentPage === p.id ? "#f0f7f2" : "transparent",
                transition: "all 0.15s",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* CTA + burger */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <a
            href={buildWaLink("general")}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#25D366", color: "#fff",
              padding: "8px 16px", borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              textDecoration: "none",
              // GA4 + Pixel event — добавить onClick:
              // onClick={() => fbq('track','Lead',{content_name:'whatsapp_nav'})
            }}
          >
            <MessageCircle size={14} />
            WhatsApp
          </a>
          <button
            onClick={() => setOpen(!open)}
            data-testid="burger-btn"
            style={{
              background: "none", border: "1px solid #e0e0e0",
              borderRadius: 6, padding: "6px 8px", cursor: "pointer",
              display: "flex", alignItems: "center",
            }}
            className="burger-btn"
          >
            {open ? <X size={18} color="#4A4A4A" /> : <Menu size={18} color="#4A4A4A" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: "#fff", borderTop: "1px solid #f0f0f0",
          padding: "12px 20px 20px",
        }}>
          {PAGES.map(p => (
            <button key={p.id}
              onClick={() => { setPage(p.id); setOpen(false); }}
              style={{
                display: "block", width: "100%", textAlign: "left",
                background: currentPage === p.id ? "#f0f7f2" : "none",
                border: "none", cursor: "pointer",
                padding: "10px 12px", borderRadius: 6,
                fontSize: 15, fontWeight: currentPage === p.id ? 600 : 400,
                color: currentPage === p.id ? "#3D7B4F" : "#4A4A4A",
                marginBottom: 2,
              }}
            >
              {p.label}
            </button>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #f0f0f0" }}>
            <a href={buildWaLink("general")}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "#25D366", color: "#fff",
                padding: "12px", borderRadius: 8,
                fontSize: 15, fontWeight: 600, textDecoration: "none",
              }}
            >
              <MessageCircle size={16} />
              Offerte per WhatsApp anfordern
            </a>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; color: #4A4A4A; }
        .desktop-nav { display: flex !important; }
        .burger-btn { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .burger-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

// ============================================================
// КОМПОНЕНТЫ ПЕРЕИСПОЛЬЗОВАНИЯ
// ============================================================

function WhatsAppButton({ service = "general", label = "Offerte per WhatsApp", size = "normal" }) {
  const small = size === "small";
  return (
    <a
      href={buildWaLink(service)}
      target="_blank" rel="noopener noreferrer"
      // TODO: onClick → fbq('track','Lead',{content_name:`whatsapp_${service}`})
      style={{
        display: "inline-flex", alignItems: "center", gap: small ? 6 : 8,
        background: "#25D366", color: "#fff",
        padding: small ? "8px 14px" : "12px 22px",
        borderRadius: 8, textDecoration: "none",
        fontSize: small ? 13 : 15, fontWeight: 600,
        transition: "transform 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,211,102,0.35)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <MessageCircle size={small ? 14 : 16} />
      {label}
    </a>
  );
}

function OfferBanner() {
  if (!isOfferActive()) return null;
  return (
    <div style={{
      background: "linear-gradient(135deg, #3D7B4F 0%, #2d5c3a 100%)",
      color: "#fff", textAlign: "center",
      padding: "10px 20px", fontSize: 13, fontWeight: 500,
    }}>
      🎉 <strong>Eröffnungsangebot bis 30. Juni 2026:</strong>{" "}
      CHF 100 Rabatt auf Ihre erste Umzugsreinigung · CHF 50 auf Gartenpakete · 10% auf das erste Abo
    </div>
  );
}

function TrustBadges() {
  const items = [
    { icon: <Shield size={20} color="#3D7B4F" />, title: "Legal & versichert", text: "Offizielle Rechnung, Betriebshaftpflicht bis CHF 5 Mio." },
    { icon: <Star size={20} color="#3D7B4F" />,   title: "Festpreise",         text: "Was in der Offerte steht, zahlen Sie. Nie mehr." },
    { icon: <Check size={20} color="#3D7B4F" />,  title: "Abgabegarantie",    text: "Kostenlose Nachreinigung in 48h — schriftlich." },
    { icon: <MapPin size={20} color="#3D7B4F" />, title: "Lokales Team",       text: "Wir leben hier, im Kanton Aargau." },
  ];
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
      gap: 20, padding: "40px 0",
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: "flex", gap: 14, alignItems: "flex-start",
          padding: "20px", background: "#f9fdf9",
          borderRadius: 12, border: "1px solid #e8f2eb",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "#e8f5ec", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {item.icon}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: "#1a1a1a" }}>
              {item.title}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>
              {item.text}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 800,
        color: "#1a1a1a", letterSpacing: "-0.5px", marginBottom: sub ? 10 : 0,
      }}>
        {children}
      </h2>
      {sub && <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 520 }}>{sub}</p>}
    </div>
  );
}

function Container({ children, style = {} }) {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", ...style }}>
      {children}
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================
function Footer({ setPage }) {
  return (
    <footer style={{ background: "#1a1a1a", color: "#9ca3af", marginTop: 80 }}>
      {/* CTA полоса */}
      <div style={{ background: "#3D7B4F", padding: "36px 20px", textAlign: "center" }}>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: "#fff", fontSize: 22, fontWeight: 800, marginBottom: 8,
        }}>
          Bereit für eine saubere Wohnung?
        </h3>
        <p style={{ color: "#c8e6d0", marginBottom: 20, fontSize: 14 }}>
          Senden Sie 3 Fotos — Offerte in 2 Stunden.
        </p>
        <WhatsAppButton service="general" label="Offerte per WhatsApp" />
      </div>

      <Container style={{ padding: "40px 20px" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 32, marginBottom: 32,
        }}>
          <div>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              marginBottom: 12,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 6,
                background: "#3D7B4F",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 12 }}>F</span>
              </div>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Fleissig</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.7 }}>
              Reinigung und Gartenpflege<br />im Kanton Aargau.<br />
              Offizielle Rechnung · Versichert · Legal.
            </p>
          </div>

          <div>
            <div style={{ color: "#fff", fontWeight: 600, marginBottom: 12, fontSize: 13 }}>
              DIENSTLEISTUNGEN
            </div>
            {[
              ["umzugsreinigung", "Umzugsreinigung"],
              ["unterhaltsreinigung", "Unterhaltsreinigung"],
              ["gartenpflege", "Gartenpflege"],
              ["preise", "Preise & Pakete"],
            ].map(([id, label]) => (
              <button key={id}
                onClick={() => setPage(id)}
                style={{
                  display: "block", background: "none", border: "none",
                  cursor: "pointer", color: "#9ca3af", fontSize: 13,
                  padding: "3px 0", textAlign: "left",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <div style={{ color: "#fff", fontWeight: 600, marginBottom: 12, fontSize: 13 }}>
              RECHTLICHES
            </div>
            {[
              ["impressum", "Impressum"],
              ["datenschutz", "Datenschutz"],
              ["agb", "AGB"],
              ["faq", "FAQ"],
              ["über-uns", "Über uns"],
            ].map(([id, label]) => (
              <button key={id}
                onClick={() => setPage(id)}
                style={{
                  display: "block", background: "none", border: "none",
                  cursor: "pointer", color: "#9ca3af", fontSize: 13,
                  padding: "3px 0", textAlign: "left",
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                onMouseLeave={e => e.currentTarget.style.color = "#9ca3af"}
              >
                {label}
              </button>
            ))}
          </div>

          <div>
            <div style={{ color: "#fff", fontWeight: 600, marginBottom: 12, fontSize: 13 }}>
              KONTAKT
            </div>
            <div style={{ fontSize: 13, lineHeight: 2 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <MapPin size={13} color="#3D7B4F" /> {CONFIG.ADDRESS}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Phone size={13} color="#3D7B4F" /> {CONFIG.PHONE}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Mail size={13} color="#3D7B4F" /> {CONFIG.EMAIL}
              </div>
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 12 }}>
                Werktags 8:00–18:00
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: "1px solid #2d2d2d",
          paddingTop: 20,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 10,
          fontSize: 12,
        }}>
          <span>© 2026 {CONFIG.COMPANY_NAME} · {CONFIG.UID} · Swiss SMM Balian Einzelunternehmen</span>
          <span style={{ color: "#4b5563" }}>Werktags 8–18 Uhr · Antwort ≤15 Min.</span>
        </div>
      </Container>
    </footer>
  );
}

// ============================================================
// СТРАНИЦЫ — ЗАГЛУШКИ (заполняются в следующих итерациях)
// ============================================================

function PagePlaceholder({ title, nextPage }) {
  return (
    <Container style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{
        maxWidth: 500, margin: "0 auto",
        padding: 48, borderRadius: 16,
        background: "#f9fdf9", border: "2px dashed #c8e6d0",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 24, fontWeight: 800, color: "#1a1a1a", marginBottom: 8,
        }}>
          {title}
        </h2>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>
          Эта страница разрабатывается в следующей итерации.<br />
          Структура и навигация уже работают.
        </p>
        <WhatsAppButton service="general" label="WhatsApp — пока прямая связь" size="small" />
      </div>
    </Container>
  );
}

// ============================================================
// ГЛАВНАЯ СТРАНИЦА
// ============================================================
function HomePage({ setPage }) {
  const services = [
    {
      icon: <Home size={22} color="#3D7B4F" />,
      title: "Umzugsreinigung",
      desc: "Mit 100% Abgabegarantie. Festpreis.",
      price: `ab CHF ${formatPrice(PRICES.endreinigung["2.5"].basic)}`,
      service: "endreinigung",
      page: "umzugsreinigung",
    },
    {
      icon: <Scissors size={22} color="#3D7B4F" />,
      title: "Unterhaltsreinigung",
      desc: "Regelmässig oder einmalig.",
      price: `Abo ab CHF ${formatPrice(PRICES.unterhalt.basis)}/Mt.`,
      service: "unterhalt",
      page: "unterhaltsreinigung",
    },
    {
      icon: <Eye size={22} color="#3D7B4F" />,
      title: "Fensterreinigung",
      desc: "Inkl. Storen und Rahmen.",
      price: `ab CHF ${formatPrice(PRICES.fenster.pauschal_25zi)} pauschal`,
      service: "fenster",
      page: "fensterreinigung",
    },
    {
      icon: <Wrench size={22} color="#3D7B4F" />,
      title: "Baureinigung",
      desc: "Nach Renovation, gründlich.",
      price: "ab CHF 13/m²",
      service: "general",
      page: "baureinigung",
    },
    {
      icon: <Building size={22} color="#3D7B4F" />,
      title: "Büroreinigung",
      desc: "Abends, 2–3× pro Woche.",
      price: "Offerte nach Mass",
      service: "general",
      page: "bueroreinigung",
    },
    {
      icon: <Leaf size={22} color="#3D7B4F" />,
      title: "Gartenpflege",
      desc: "Rasen, Hecken, Unkraut.",
      price: `ab CHF ${PRICES.garten.stunde_abo}/Std. im Abo`,
      service: "garten",
      page: "gartenpflege",
    },
  ];

  const steps = [
    { n: "1", title: "Fotos senden", text: "WhatsApp, 2–3 Bilder Ihrer Wohnung. Das ersetzt einen Besichtigungstermin." },
    { n: "2", title: "Festpreis erhalten", text: "Innerhalb von 2 Stunden: verbindliche Offerte, keine versteckten Kosten." },
    { n: "3", title: "Termin bestätigen", text: "Wir kommen pünktlich und liefern Qualität mit Abgabegarantie." },
  ];

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 60%)",
        padding: "64px 20px 72px",
        borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
            <div>
          {isOfferActive() && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "#fff9f0", border: "1px solid #f5d9c0",
              color: "#c2611a", padding: "5px 12px", borderRadius: 20,
              fontSize: 12, fontWeight: 600, marginBottom: 20,
            }}>
              🎉 Eröffnungsangebot: CHF 100 Rabatt auf die erste Umzugsreinigung
            </div>
          )}

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(28px, 5vw, 52px)",
            fontWeight: 800, color: "#1a1a1a",
            letterSpacing: "-1px", lineHeight: 1.15,
            maxWidth: 640, marginBottom: 18,
          }}>
            Reinigung und Gartenpflege<br />
            <span style={{ color: "#3D7B4F" }}>im Aargau</span> —<br />
            Festpreise, keine Anrufe.
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)", color: "#5a6472",
            maxWidth: 480, lineHeight: 1.65, marginBottom: 28,
          }}>
            Senden Sie uns 3 Fotos per WhatsApp.<br />
            Sie bekommen eine verbindliche Offerte innerhalb von 2 Stunden.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <a
              href={buildWaLink("general")}
              target="_blank" rel="noopener noreferrer"
              // TODO: onClick → fbq('track','Lead',{content_name:'whatsapp_hero'})
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#E87D3E", color: "#fff",
                padding: "14px 26px", borderRadius: 10,
                fontSize: 15, fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(232,125,62,0.35)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = ""}
            >
              <MessageCircle size={16} />
              Offerte per WhatsApp
            </a>
            <button
              onClick={() => setPage("preise")}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "transparent", border: "1.5px solid #d0d8e0",
                color: "#4A4A4A", padding: "14px 22px", borderRadius: 10,
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3D7B4F"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#d0d8e0"}
            >
              Preise ansehen <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ marginTop: 20, fontSize: 12, color: "#8a95a0", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>✓ Antwort innerhalb von 15 Minuten</span>
            <span>✓ Werktags 8:00–18:00</span>
            <span>✓ Offizielle Rechnung</span>
            <span>✓ Versichert bis CHF 5 Mio.</span>
          </div>
          </div>
        </div>
        </Container>
      </div>
      <style>{`@media(min-width:900px){.hero-img{display:block !important;}}`}</style>

      {/* 3 ШАГА */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="So einfach funktioniert es — ohne Termine, ohne Anrufe.">
          Drei Schritte zur sauberen Wohnung
        </SectionTitle>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 20,
        }}>
          {steps.map((s, i) => (
            <div key={i} style={{
              padding: "28px 24px", borderRadius: 14,
              border: "1px solid #e8e8e8",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -10, right: -10,
                fontSize: 80, fontWeight: 900, color: "#f0f0f0",
                lineHeight: 1, userSelect: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {s.n}
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: "#3D7B4F", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 16, marginBottom: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {s.n}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: "#1a1a1a" }}>
                {s.title}
              </div>
              <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>
                {s.text}
              </div>
            </div>
          ))}
        </div>
      </Container>

      {/* УСЛУГИ */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <SectionTitle sub="Festpreise — keine versteckten Kosten.">
            Unsere Dienstleistungen
          </SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 16,
          }}>
            {services.map((s, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 14,
                border: "1px solid #e8f2eb",
                padding: "24px",
                display: "flex", flexDirection: "column", gap: 12,
                transition: "box-shadow 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(61,123,79,0.1)"}
                onMouseLeave={e => e.currentTarget.style.boxShadow = ""}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "#e8f5ec",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 4 }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>{s.desc}</div>
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: "#3D7B4F",
                  padding: "6px 0", borderTop: "1px solid #f0f0f0",
                }}>
                  {s.price}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button
                    onClick={() => setPage(s.page)}
                    style={{
                      flex: 1, background: "none", border: "1px solid #d0d8e0",
                      borderRadius: 7, padding: "7px 12px", cursor: "pointer",
                      fontSize: 12, fontWeight: 600, color: "#4A4A4A",
                    }}
                  >
                    Mehr erfahren
                  </button>
                  <WhatsAppButton service={s.service} label="WhatsApp" size="small" />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* ПАКЕТЫ */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="Kombinierte Leistungen mit echten Ersparnissen.">
          Sparen mit Paketen
        </SectionTitle>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {PAKETE.map((p, i) => {
            const saving = p.einzeln - p.paket;
            const pct = Math.round(saving / p.einzeln * 100);
            return (
              <div key={i} style={{
                padding: "24px", borderRadius: 14,
                border: "1.5px solid #e8f2eb", background: "#fff",
              }}>
                <div style={{
                  display: "inline-block",
                  background: "#e8f5ec", color: "#3D7B4F",
                  fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                  marginBottom: 10,
                }}>
                  Sie sparen {pct}%
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 12 }}>{p.items}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#1a1a1a" }}>
                    CHF {formatPrice(p.paket)}
                  </span>
                  <span style={{ fontSize: 13, color: "#9ca3af", textDecoration: "line-through" }}>
                    CHF {formatPrice(p.einzeln)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <button
            onClick={() => setPage("preise")}
            style={{
              background: "none", border: "1.5px solid #3D7B4F",
              color: "#3D7B4F", padding: "10px 24px", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Alle Pakete ansehen →
          </button>
        </div>
      </Container>

      {/* ДОВЕРИЕ */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <SectionTitle>Warum Fleissig?</SectionTitle>
          <TrustBadges />
        </Container>
      </div>

      {/* ЗОНА РАБОТ */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="Seengen ist unsere Basis — wir kommen überall im Aargau hin.">
          Wir arbeiten im Kanton Aargau
        </SectionTitle>
        <div style={{
          background: "#f5f5f5", borderRadius: 16, height: 200,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexDirection: "column", gap: 10, color: "#9ca3af",
          border: "1px solid #e8e8e8",
        }}>
          <MapPin size={32} color="#3D7B4F" />
          <div style={{ fontSize: 14, fontWeight: 500 }}>
            Seengen · Lenzburg · Aarau · Wohlen · Baden · Brugg · Zofingen
          </div>
          <div style={{ fontSize: 12 }}>Weiter entfernt? Fragen Sie — oft geht es trotzdem.</div>
        </div>
      </Container>
    </div>
  );
}

// ============================================================
// ФИКСИРОВАННАЯ КНОПКА WhatsApp (мобильная)
// ============================================================
function FloatingWA() {
  return (
    <a
      href={buildWaLink("general")}
      target="_blank" rel="noopener noreferrer"
      // TODO: onClick → fbq('track','Lead',{content_name:'whatsapp_floating'})
      style={{
        position: "fixed", bottom: 20, right: 20, zIndex: 999,
        width: 56, height: 56, borderRadius: "50%",
        background: "#25D366", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(37,211,102,0.45)",
        textDecoration: "none",
      }}
      className="floating-wa"
    >
      <MessageCircle size={24} />
      <style>{`
        .floating-wa { display: none !important; }
        @media (max-width: 768px) { .floating-wa { display: flex !important; } }
      `}</style>
    </a>
  );
}

// ============================================================
// СТРАНИЦА UMZUGSREINIGUNG — главная посадочная для FB Ads
// ============================================================

export function Calculator() {
  const rooms = [
    { id: "2.5", label: "2.5-Zi", sub: "~55 m²" },
    { id: "3.5", label: "3.5-Zi", sub: "~75 m²" },
    { id: "4.5", label: "4.5-Zi", sub: "~95 m²" },
    { id: "5.5", label: "5.5-Zi", sub: "~120 m²" },
    { id: "EFH", label: "EFH",    sub: "~160 m²" },
  ];

  const [roomSize, setRoomSize] = useState("3.5");
  const [variant, setVariant]   = useState("komplett");
  const [extras, setExtras]     = useState({ entsorgung: false, teppich: false });
  const [submitted, setSubmitted] = useState(false);

  const base     = PRICES.endreinigung[roomSize][variant];
  const extraSum = (extras.entsorgung ? PRICES.extras.entsorgung : 0)
                 + (extras.teppich    ? PRICES.extras.teppich    : 0);
  const discount = getOfferDiscount(roomSize);
  const total    = base + extraSum - discount;

  const waText = () => {
    const lines = [
      `Grüezi, ich brauche eine Umzugsreinigung.`,
      `Wohnung: ${roomSize}-Zimmer, Paket: ${variant === "basic" ? "Basic" : "Komplett"}.`,
      extras.entsorgung ? "+ Grüngutentsorgung" : "",
      extras.teppich    ? "+ Teppichreinigung"  : "",
      `Preis laut Kalkulator: CHF ${formatPrice(total)}${discount > 0 ? ` (inkl. Eröffnungsrabatt CHF ${discount})` : ""}.`,
      `Ich schicke 3 Fotos.`,
    ].filter(Boolean).join(" ");
    return `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(lines)}`;
  };

  return (
    <div style={{
      background: "#fff", border: "2px solid #3D7B4F",
      borderRadius: 16, padding: "32px",
      boxShadow: "0 8px 40px rgba(61,123,79,0.12)",
    }}>
      <div style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800, fontSize: 18, color: "#1a1a1a", marginBottom: 24,
      }}>
        🧮 Preis berechnen
      </div>

      {/* Размер квартиры */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4A4A4A", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Wohnungsgrösse
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {rooms.map(r => (
            <button key={r.id}
              onClick={() => setRoomSize(r.id)}
              style={{
                padding: "10px 16px", borderRadius: 10, cursor: "pointer",
                border: roomSize === r.id ? "2px solid #3D7B4F" : "2px solid #e8e8e8",
                background: roomSize === r.id ? "#f0f7f2" : "#fff",
                color: roomSize === r.id ? "#3D7B4F" : "#4A4A4A",
                fontWeight: roomSize === r.id ? 700 : 500,
                fontSize: 13, transition: "all 0.15s",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}
            >
              <span style={{ fontWeight: 700 }}>{r.label}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{r.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Вариант */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4A4A4A", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Paket
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { id: "basic",    label: "Basic",    sub: "Küche, Bad, Zimmer" },
            { id: "komplett", label: "Komplett", sub: "+ Fenster, Balkon, Keller", badge: "Empfohlen" },
          ].map(v => (
            <button key={v.id}
              onClick={() => setVariant(v.id)}
              style={{
                padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                border: variant === v.id ? "2px solid #3D7B4F" : "2px solid #e8e8e8",
                background: variant === v.id ? "#f0f7f2" : "#fff",
                textAlign: "left", transition: "all 0.15s",
                position: "relative",
              }}
            >
              {v.badge && (
                <span style={{
                  position: "absolute", top: -8, right: 10,
                  background: "#E87D3E", color: "#fff",
                  fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 6,
                }}>
                  {v.badge}
                </span>
              )}
              <div style={{
                fontWeight: 700, fontSize: 14,
                color: variant === v.id ? "#3D7B4F" : "#1a1a1a", marginBottom: 3,
              }}>
                {v.label}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{v.sub}</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: "#3D7B4F", marginTop: 6 }}>
                CHF {formatPrice(PRICES.endreinigung[roomSize][v.id])}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Доп. услуги */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#4A4A4A", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Zusatzleistungen (optional)
        </div>
        {[
          { key: "entsorgung", label: "Grüngutentsorgung / Müllentsorgung", price: PRICES.extras.entsorgung },
          { key: "teppich",    label: "Teppichreinigung",                    price: PRICES.extras.teppich    },
        ].map(e => (
          <label key={e.key} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 8, cursor: "pointer",
            background: extras[e.key] ? "#f0f7f2" : "#f9f9f9",
            border: `1px solid ${extras[e.key] ? "#c8e6d0" : "#e8e8e8"}`,
            marginBottom: 8, transition: "all 0.15s",
          }}>
            <input
              type="checkbox"
              checked={extras[e.key]}
              onChange={ev => setExtras(prev => ({ ...prev, [e.key]: ev.target.checked }))}
              style={{ accentColor: "#3D7B4F", width: 16, height: 16, cursor: "pointer" }}
            />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{e.label}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#4A4A4A" }}>
              +CHF {e.price}
            </span>
          </label>
        ))}
        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "#fff8f5", border: "1px solid #f5d9c0",
          fontSize: 12, color: "#c2611a",
        }}>
          ⚠️ Starke Verschmutzung — wir melden uns nach Fotoprüfung mit einer separaten Offerte.
        </div>
      </div>

      {/* Итог */}
      <div style={{
        background: "#f0f7f2", borderRadius: 12,
        padding: "20px 24px", marginBottom: 20,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, color: "#6b7280" }}>
          <span>Basispreis ({roomSize}-Zi, {variant === "basic" ? "Basic" : "Komplett"})</span>
          <span>CHF {formatPrice(base)}</span>
        </div>
        {extras.entsorgung && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, color: "#6b7280" }}>
            <span>Grüngutentsorgung</span>
            <span>+CHF {PRICES.extras.entsorgung}</span>
          </div>
        )}
        {extras.teppich && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, color: "#6b7280" }}>
            <span>Teppichreinigung</span>
            <span>+CHF {PRICES.extras.teppich}</span>
          </div>
        )}
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14, color: "#3D7B4F", fontWeight: 600 }}>
            <span>🎉 Eröffnungsrabatt</span>
            <span>−CHF {discount}</span>
          </div>
        )}
        <div style={{
          borderTop: "1px solid #c8e6d0", marginTop: 10, paddingTop: 10,
          display: "flex", justifyContent: "space-between", alignItems: "baseline",
        }}>
          <span style={{ fontWeight: 800, fontSize: 15, color: "#1a1a1a" }}>Ihr Festpreis</span>
          <span style={{ fontWeight: 900, fontSize: 28, color: "#3D7B4F", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            CHF {formatPrice(total)}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
          Keine versteckten Kosten · Verbindliche Offerte nach Fotoprüfung
        </div>
      </div>

      {/* CTA */}
      {!submitted ? (
        <a
          href={waText()}
          target="_blank" rel="noopener noreferrer"
          onClick={() => {
            setSubmitted(true);
            // TODO: fbq('track','Lead',{content_name:'calculator_whatsapp',value:total})
            // TODO: gtag('event','calculator_complete',{value:total})
            setTimeout(() => setSubmitted(false), 5000);
          }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            background: "#25D366", color: "#fff",
            padding: "16px", borderRadius: 10, textDecoration: "none",
            fontSize: 16, fontWeight: 700,
            boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = ""}
        >
          <MessageCircle size={18} />
          Offerte per WhatsApp bestätigen — CHF {formatPrice(total)}
        </a>
      ) : (
        <div style={{
          background: "#f0f7f2", border: "1px solid #c8e6d0",
          borderRadius: 10, padding: "16px", textAlign: "center",
          fontSize: 14, color: "#3D7B4F", fontWeight: 600,
        }}>
          ✓ WhatsApp geöffnet — wir antworten innerhalb von 15 Minuten!
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
        Kein Konto nötig · Werktags 8:00–18:00 · Antwort ≤15 Min.
      </div>
    </div>
  );
}

export function FAQAccordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden",
        }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%", textAlign: "left",
              padding: "16px 20px", background: open === i ? "#f0f7f2" : "#fff",
              border: "none", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              fontSize: 14, fontWeight: 600, color: "#1a1a1a",
              transition: "background 0.15s",
            }}
          >
            {item.q}
            <ChevronDown size={16} color="#6b7280"
              style={{ transform: open === i ? "rotate(180deg)" : "", transition: "transform 0.2s", flexShrink: 0 }}
            />
          </button>
          {open === i && (
            <div style={{
              padding: "0 20px 16px", fontSize: 13, color: "#6b7280", lineHeight: 1.7,
              background: "#f0f7f2",
            }}>
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function UmzugsreinigungPage({ setPage }) {
  const [fs, handleFsSubmit] = useForm("xrerozyb");
  const [formState, setFormState] = useState({ name: "", contact: "", desc: "" });

  const faqItems = [
    { q: "Muss ich zuhause sein?", a: "Nein. Schlüsselübergabe ist möglich — wir besprechen das bei der Offerte." },
    { q: "Was wenn die Verwaltung etwas beanstandet?", a: "Wir kommen kostenlos zurück — innerhalb von 48 Stunden. Das ist Teil unserer Abgabegarantie, schriftlich festgehalten." },
    { q: "Wie schnell können Sie kommen?", a: "Meistens 3–7 Tage Vorlauf. In dringenden Fällen auch 24h — bitte direkt per WhatsApp fragen." },
    { q: "Was ist bei starker Verschmutzung?", a: "Wir besichtigen vor Ort oder prüfen anhand von Fotos. Danach erhalten Sie eine separate Offerte." },
    { q: "Kann ich per Rechnung zahlen?", a: "Ja. Sie erhalten immer eine offizielle Rechnung. Zahlung auch per TWINT möglich." },
    { q: "Kommen Sie nach [Ort] im Aargau?", a: "Wir arbeiten im gesamten Kanton Aargau: Lenzburg, Aarau, Wohlen, Baden, Brugg, Zofingen und weitere. Einfach fragen." },
    { q: "Was ist der Unterschied zwischen Basic und Komplett?", a: "Basic umfasst Küche, Bad und Wohnräume nach Checkliste. Komplett beinhaltet zusätzlich Fenster und Storen beidseitig, Balkon/Terrasse, Keller/Estrich und Backofen-Tiefenreinigung." },
    { q: "Bezahle ich vor oder nach der Abgabe?", a: "Nach der erfolgreichen Abgabe. Sie zahlen erst, wenn die Wohnungsübergabe geklappt hat." },
  ];

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 50%)",
        padding: "56px 20px 64px",
        borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <div style={{ display: "flex", gap: 48, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Левая колонка */}
            <div style={{ flex: "1 1 340px" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "#f0f7f2", border: "1px solid #c8e6d0",
                color: "#3D7B4F", padding: "5px 12px", borderRadius: 20,
                fontSize: 12, fontWeight: 600, marginBottom: 18,
              }}>
                ✓ 100% Abgabegarantie
              </div>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: "clamp(26px, 4vw, 44px)",
                fontWeight: 800, color: "#1a1a1a",
                letterSpacing: "-0.8px", lineHeight: 1.15, marginBottom: 16,
              }}>
                Umzugsreinigung im Aargau —{" "}
                <span style={{ color: "#3D7B4F" }}>Festpreis, keine Überraschungen.</span>
              </h1>
              <p style={{ fontSize: 16, color: "#5a6472", lineHeight: 1.65, marginBottom: 24 }}>
                Sie sind bei der Abgabe nicht allein. Wir reinigen nach Checkliste,
                sind bei der Wohnungsübergabe dabei und kommen kostenlos zurück,
                falls die Verwaltung etwas beanstandet.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                <WhatsAppButton service="endreinigung" label="Offerte in 2 Stunden" />
              </div>
              <div style={{ fontSize: 12, color: "#8a95a0", display: "flex", flexDirection: "column", gap: 5 }}>
                <span>✓ Zahlung erst nach erfolgreicher Abgabe</span>
                <span>✓ Kostenlose Nachreinigung in 48h — schriftlich garantiert</span>
                <span>✓ Offizielle Rechnung · Versichert bis CHF 5 Mio.</span>
              </div>
            </div>
            {/* Калькулятор */}
            <div style={{ flex: "1 1 340px" }}>
              <Calculator />
            </div>
          </div>
        </Container>
      </div>

      {/* ABGABEGARANTIE */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="So läuft Ihre Umzugsreinigung ab — Schritt für Schritt.">
          Abgabegarantie — so funktioniert sie
        </SectionTitle>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}>
          {[
            { n: "1", title: "Reinigung nach Checkliste", text: "Wir arbeiten systematisch — jeder Punkt wird abgehakt. Küche, Bad, Zimmer, Böden, Armaturen." },
            { n: "2", title: "Teamleiter ist dabei", text: "Bei der Wohnungsabgabe ist unser Teamleiter anwesend. Sie müssen das nicht alleine durchstehen." },
            { n: "3", title: "Beanstandung? Wir kommen zurück", text: "Falls die Verwaltung etwas moniert, kommen wir innerhalb von 48 Stunden kostenlos zurück." },
            { n: "4", title: "Zahlung nach Abgabe", text: "Sie zahlen erst, wenn die Abgabe geklappt hat. Kein Risiko für Sie." },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "24px", borderRadius: 14,
              background: i === 3 ? "#f0f7f2" : "#fff",
              border: `1px solid ${i === 3 ? "#c8e6d0" : "#e8e8e8"}`,
              position: "relative",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "#3D7B4F", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, marginBottom: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {s.n}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{s.text}</div>
            </div>
          ))}
        </div>
      </Container>

      {/* ЧЕКЛИСТ */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <SectionTitle sub="Diese Liste erhalten Sie mit der Offerte und bei der Wohnungsabnahme.">
            Unsere Abgabe-Checkliste
          </SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {[
              {
                title: "🍳 Küche",
                items: ["Backofen innen und Backbleche", "Kühlschrank abtauen, innen/aussen", "Dampfabzug inkl. Filter", "Armaturen entkalkt"],
              },
              {
                title: "🚿 Bad / Toilette",
                items: ["Dusche, Wanne, WC entkalkt", "Armaturen, Spiegel, Fliesen", "Kalkentfernung gründlich"],
              },
              {
                title: "🛋 Wohnräume",
                items: ["Böden gesaugt und nass gewischt", "Heizkörper, Lichtschalter", "Türen und Rahmen"],
              },
              {
                title: "🪟 Fenster & Storen (Komplett)",
                items: ["Fenster beidseitig", "Storen innen und aussen", "Fensterrahmen und Simse"],
              },
              {
                title: "✅ Abschluss (Komplett)",
                items: ["Balkon / Terrasse", "Keller / Estrich", "Kontrolle gemeinsam mit Kunden"],
              },
            ].map((cat, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 12,
                border: "1px solid #e8f2eb", padding: "20px",
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{cat.title}</div>
                {cat.items.map((item, j) => (
                  <div key={j} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    fontSize: 13, color: "#4A4A4A", marginBottom: 6,
                  }}>
                    <Check size={13} color="#3D7B4F" style={{ flexShrink: 0, marginTop: 2 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* До/после фото */}
          <div style={{ marginTop: 32, borderRadius: 16, overflow: "hidden", maxHeight: 360 }}>
            <img
              src="https://i.ibb.co/84GQ71m8/a122fcea-22e5-4670-bf48-183b9f5bc805.png"
              alt="Küche Vorher Nachher — Umzugsreinigung Aargau"
              style={{ width: "100%", objectFit: "cover", display: "block" }}
            />
          </div>
        </Container>
      </div>

      {/* FAQ */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="Die häufigsten Fragen zur Umzugsreinigung.">
          Häufige Fragen
        </SectionTitle>
        <div style={{ maxWidth: 700 }}>
          <FAQAccordion items={faqItems} />
        </div>
      </Container>

      {/* ФИНАЛЬНЫЙ CTA + Формa */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32, alignItems: "start",
          }}>
            {/* CTA */}
            <div>
              <SectionTitle sub="Senden Sie uns 3 Fotos — in 2 Stunden haben Sie die Offerte.">
                Jetzt Offerte anfragen
              </SectionTitle>
              <WhatsAppButton service="endreinigung" label="Offerte per WhatsApp anfordern" />
              <div style={{ marginTop: 16, fontSize: 12, color: "#8a95a0", lineHeight: 1.8 }}>
                <div>📸 Küche · Bad · ein Wohnraum</div>
                <div>⏱ Antwort innerhalb von 15 Minuten</div>
                <div>📅 Werktags 8:00–18:00</div>
              </div>
            </div>

            {/* Форма fallback */}
            <div style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid #e8e8e8", padding: "28px",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#1a1a1a" }}>
                Kein WhatsApp?
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                Formular ausfüllen — wir melden uns innerhalb von 2 Stunden.
              </div>
              {!fs.succeeded ? (
                <form onSubmit={handleFsSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input name="name" type="text" placeholder="Ihr Name" required
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <input name="contact" type="text" placeholder="Telefon oder E-Mail" required
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <textarea name="beschreibung" placeholder="z.B. Umzugsreinigung 3.5-Zi in Lenzburg, Termin nächste Woche" rows={3}
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", resize: "vertical", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <input type="hidden" name="seite" value="Umzugsreinigung" />
                  <button type="submit" disabled={fs.submitting}
                    style={{ background: "#E87D3E", color: "#fff", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}
                  >
                    {fs.submitting ? "Wird gesendet..." : "Offerte anfordern"}
                  </button>
                  <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center" }}>
                    Keine Anrufe — wir schreiben Ihnen zurück.
                  </div>
                </form>
              ) : (
                <div style={{ background: "#f0f7f2", border: "1px solid #c8e6d0", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  <div style={{ fontWeight: 700, color: "#3D7B4F", marginBottom: 4 }}>Merci für Ihre Anfrage!</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Wir melden uns innerhalb von 2 Stunden.</div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

// ============================================================
// СТРАНИЦА UNTERHALTSREINIGUNG — абонементы и разовые уборки
// ============================================================
function UnterhaltsreinigungPage({ setPage }) {
  const [fs, handleFsSubmit] = useForm("xrerozyb");
  const [formState, setFormState] = useState({ name: "", contact: "", desc: "" });

  const abos = [
    {
      id: "basis",
      label: "Basis",
      freq: "Alle 2 Wochen · 3 Std.",
      hours: "6 Std./Monat",
      price: PRICES.unterhalt.basis,
      unit: "/Monat",
      badge: null,
      color: "#f9fdf9",
      border: "#e8f2eb",
      items: [
        "Böden saugen und wischen",
        "Küche reinigen",
        "Bad und WC",
        "Oberflächen abstauben",
        "Mülleimer leeren",
      ],
    },
    {
      id: "komfort",
      label: "Komfort",
      freq: "1× pro Woche · 3 Std.",
      hours: "12 Std./Monat",
      price: PRICES.unterhalt.komfort,
      unit: "/Monat",
      badge: "Beliebteste Wahl",
      color: "#f0f7f2",
      border: "#3D7B4F",
      items: [
        "Alles aus Basis",
        "Fenster innen monatlich",
        "Kühlschrank monatlich",
        "Backofen nach Bedarf",
        "Wäsche falten (auf Wunsch)",
        "Feste Reinigungsperson",
      ],
    },
    {
      id: "premium",
      label: "Premium",
      freq: "2× pro Woche · 3 Std.",
      hours: "24 Std./Monat",
      price: PRICES.unterhalt.premium,
      unit: "/Monat",
      badge: null,
      color: "#fff",
      border: "#e8e8e8",
      extra: "Fensterreinigung 1× pro Quartal inkl.",
      items: [
        "Alles aus Komfort",
        "Priorität bei Terminwünschen",
        "Fenster komplett 1×/Quartal",
        "Bügelservice auf Anfrage",
        "Persönliche Ansprechperson",
      ],
    },
  ];

  const faqItems = [
    { q: "Kann ich jederzeit kündigen?", a: "Ja. Das Abo läuft monatlich — Kündigung jederzeit mit 2 Wochen Vorlauf. Keine Mindestlaufzeit." },
    { q: "Kommt immer dieselbe Person?", a: "Im Abo versuchen wir maximale Kontinuität. Bei Krankheit oder Urlaub schicken wir eine Vertretung, die eingewiesen wurde." },
    { q: "Was wenn mir die Reinigung nicht gefällt?", a: "Wir kommen kostenlos nach und machen es richtig. Ihre Zufriedenheit ist unser Massstab." },
    { q: "Muss ich Reinigungsmittel bereitstellen?", a: "Nein. Wir bringen alles mit. Auf Wunsch arbeiten wir auch mit Ihren Produkten oder bio-Mitteln (gegen kleinen Aufpreis)." },
    { q: "Kann ich Haustiere haben?", a: "Kein Problem. Bitte einfach beim ersten Kontakt erwähnen." },
    { q: "Gibt es einen Vertrag?", a: "Ja — eine einfache Auftragsbestätigung per E-Mail. Kein Kleindruck, keine versteckten Klauseln." },
  ];

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)",
        padding: "56px 20px 64px",
        borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#fff9f0", border: "1px solid #f5d9c0",
            color: "#c2611a", padding: "5px 12px", borderRadius: 20,
            fontSize: 12, fontWeight: 600, marginBottom: 18,
          }}>
            ✓ Legal · Offizielle Rechnung · Kein Schwarzgeld
          </div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800,
            color: "#1a1a1a", letterSpacing: "-0.8px",
            lineHeight: 1.15, maxWidth: 620, marginBottom: 16,
          }}>
            Regelmässige Reinigung im Aargau —{" "}
            <span style={{ color: "#3D7B4F" }}>legal, zuverlässig, bezahlbar.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#5a6472", lineHeight: 1.65, maxWidth: 520, marginBottom: 28 }}>
            Keine Schwarzarbeit. Kein Risiko bei der Steuerkontrolle.
            Wir stellen eine offizielle Rechnung — und Ihre Reinigungsperson
            ist versichert und angemeldet.
          </p>
          <WhatsAppButton service="unterhalt" label="Abo anfragen per WhatsApp" />
          <div style={{ marginTop: 16, fontSize: 12, color: "#8a95a0", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>✓ Monatlich kündbar</span>
            <span>✓ Feste Reinigungsperson</span>
            <span>✓ Antwort ≤15 Min.</span>
          </div>
        </Container>
      </div>

      {/* СРАВНЕНИЕ разовая vs абонемент */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="Wer regelmässig bucht, zahlt weniger — und hat immer Ordnung.">
          Einmalig oder Abo?
        </SectionTitle>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, maxWidth: 700,
        }}>
          {[
            {
              label: "Einmalig",
              price: `CHF ${PRICES.unterhalt.einmalig}`,
              unit: "/Std.",
              sub: "Flexibel, kein Abo",
              highlight: false,
            },
            {
              label: "Abo Komfort",
              price: `CHF ${PRICES.unterhalt.komfort / 12}`,
              unit: "/Std.",
              sub: `CHF ${formatPrice(PRICES.unterhalt.komfort)}/Monat — Sie sparen CHF ${(PRICES.unterhalt.einmalig - PRICES.unterhalt.komfort / 12) * 12}/Monat`,
              highlight: true,
              badge: "Günstiger",
            },
          ].map((o, i) => (
            <div key={i} style={{
              padding: "28px 24px", borderRadius: 14,
              border: `2px solid ${o.highlight ? "#3D7B4F" : "#e8e8e8"}`,
              background: o.highlight ? "#f0f7f2" : "#fff",
              position: "relative",
            }}>
              {o.badge && (
                <div style={{
                  position: "absolute", top: -11, left: 20,
                  background: "#E87D3E", color: "#fff",
                  fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                }}>
                  {o.badge}
                </div>
              )}
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>{o.label}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 36, fontWeight: 900, color: o.highlight ? "#3D7B4F" : "#1a1a1a",
                }}>
                  {o.price}
                </span>
                <span style={{ fontSize: 14, color: "#6b7280" }}>{o.unit}</span>
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>{o.sub}</div>
            </div>
          ))}
        </div>
      </Container>

      {/* АБО КАРТОЧКИ */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <SectionTitle sub="Wählen Sie, was zu Ihrem Alltag passt.">
            Unsere Abo-Pakete
          </SectionTitle>
          {isOfferActive() && (
            <div style={{
              background: "#fff9f0", border: "1px solid #f5d9c0",
              borderRadius: 10, padding: "12px 20px",
              fontSize: 13, color: "#c2611a", fontWeight: 600,
              marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 8,
            }}>
              🎉 Eröffnungsangebot: 10% Rabatt im ersten Monat — automatisch in der Offerte.
            </div>
          )}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16, alignItems: "start",
          }}>
            {abos.map((abo) => (
              <div key={abo.id} style={{
                background: abo.color,
                border: `2px solid ${abo.border}`,
                borderRadius: 16, padding: "28px",
                position: "relative",
                boxShadow: abo.badge ? "0 8px 32px rgba(61,123,79,0.12)" : "none",
              }}>
                {abo.badge && (
                  <div style={{
                    position: "absolute", top: -12, left: "50%",
                    transform: "translateX(-50%)",
                    background: "#3D7B4F", color: "#fff",
                    fontSize: 11, fontWeight: 700,
                    padding: "4px 14px", borderRadius: 20,
                    whiteSpace: "nowrap",
                  }}>
                    {abo.badge}
                  </div>
                )}

                <div style={{ fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 4,
                  fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {abo.label}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>
                  {abo.freq} · {abo.hours}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 38, fontWeight: 900,
                    color: abo.badge ? "#3D7B4F" : "#1a1a1a",
                  }}>
                    CHF {formatPrice(abo.price)}
                  </span>
                  <span style={{ fontSize: 14, color: "#6b7280" }}>{abo.unit}</span>
                </div>

                {isOfferActive() && (
                  <div style={{
                    fontSize: 12, color: "#3D7B4F", fontWeight: 600, marginBottom: 16,
                  }}>
                    Erster Monat: CHF {formatPrice(Math.round(abo.price * 0.9))} (−10%)
                  </div>
                )}

                <div style={{
                  borderTop: "1px solid #e8e8e8", paddingTop: 16, marginBottom: 20,
                }}>
                  {abo.items.map((item, j) => (
                    <div key={j} style={{
                      display: "flex", gap: 8, alignItems: "flex-start",
                      fontSize: 13, color: "#4A4A4A", marginBottom: 7,
                    }}>
                      <Check size={13} color="#3D7B4F" style={{ flexShrink: 0, marginTop: 2 }} />
                      {item}
                    </div>
                  ))}
                  {abo.extra && (
                    <div style={{
                      marginTop: 10, padding: "6px 10px",
                      background: "#e8f5ec", borderRadius: 6,
                      fontSize: 12, color: "#3D7B4F", fontWeight: 600,
                    }}>
                      + {abo.extra}
                    </div>
                  )}
                </div>

                <WhatsAppButton
                  service="unterhalt"
                  label={`${abo.label} anfragen`}
                  size={abo.badge ? "normal" : "small"}
                />
              </div>
            ))}
          </div>

          {/* Einmalig */}
          <div style={{
            marginTop: 24, padding: "20px 24px", borderRadius: 12,
            background: "#fff", border: "1px solid #e8e8e8",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 16,
          }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Einmalige Reinigung</span>
              <span style={{ fontSize: 13, color: "#6b7280", marginLeft: 10 }}>
                Ohne Abo · CHF {PRICES.unterhalt.einmalig}/Std. · Termin nach Absprache
              </span>
            </div>
            <WhatsAppButton service="unterhalt" label="Einmalig anfragen" size="small" />
          </div>
        </Container>
      </div>

      {/* RUNDUM-SORGLOS */}
      <Container style={{ padding: "60px 20px" }}>
        <div style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d3a2e 100%)",
          borderRadius: 20, padding: "40px",
          display: "flex", gap: 32, alignItems: "center",
          flexWrap: "wrap",
        }}>
          <div style={{ flex: "1 1 300px" }}>
            <div style={{
              display: "inline-block",
              background: "#E87D3E", color: "#fff",
              fontSize: 11, fontWeight: 700, padding: "3px 10px",
              borderRadius: 6, marginBottom: 14,
            }}>
              RUNDUM-SORGLOS
            </div>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#fff", fontSize: 22, fontWeight: 800,
              marginBottom: 10, letterSpacing: "-0.3px",
            }}>
              Alles aus einer Hand — CHF 890/Monat
            </h3>
            <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
              Wöchentliche Reinigung + Fensterreinigung 2× pro Jahr +
              Frühjahrsputz inklusive. Sie sparen 18% gegenüber Einzelbuchungen.
            </p>
          </div>
          <div style={{ flexShrink: 0 }}>
            <a
              href={buildWaLink("unterhalt")}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#E87D3E", color: "#fff",
                padding: "14px 24px", borderRadius: 10,
                fontSize: 14, fontWeight: 700, textDecoration: "none",
              }}
            >
              <MessageCircle size={16} />
              Paket anfragen
            </a>
          </div>
        </div>
      </Container>

      {/* ЧТО ВХОДИТ */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <SectionTitle sub="Bei jeder regulären Reinigung inbegriffen.">
            Was bei jeder Reinigung gemacht wird
          </SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 10,
          }}>
            {[
              "Böden saugen und nass wischen",
              "Küche: Oberflächen, Herd, Armatur",
              "Bad und WC reinigen und entkalken",
              "Spiegel und Glasflächen",
              "Staubwischen (Möbel, Regale, Sockelleisten)",
              "Lichtschalter und Türgriffe",
              "Mülleimer leeren",
              "Betten beziehen (auf Wunsch)",
              "Einräumen nach Absprache",
              "Abschlussrundgang mit Checkliste",
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "flex-start",
                padding: "12px 14px", background: "#fff",
                borderRadius: 8, border: "1px solid #e8f2eb",
                fontSize: 13, color: "#4A4A4A",
              }}>
                <Check size={13} color="#3D7B4F" style={{ flexShrink: 0, marginTop: 2 }} />
                {item}
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* FAQ */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="Die häufigsten Fragen zum Abo.">
          Häufige Fragen
        </SectionTitle>
        <div style={{ maxWidth: 700 }}>
          <FAQAccordion items={faqItems} />
        </div>
      </Container>

      {/* CTA + Форма */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32, alignItems: "start",
          }}>
            <div>
              <SectionTitle sub="Kurz beschreiben, was Sie brauchen — wir machen einen Vorschlag.">
                Abo starten
              </SectionTitle>
              <WhatsAppButton service="unterhalt" label="Abo anfragen per WhatsApp" />
              <div style={{ marginTop: 16, fontSize: 12, color: "#8a95a0", lineHeight: 1.9 }}>
                <div>📋 Wohnfläche + Ort + Wunschtag</div>
                <div>⏱ Antwort innerhalb von 15 Minuten</div>
                <div>📅 Erste Reinigung innerhalb einer Woche</div>
              </div>
            </div>

            <div style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid #e8e8e8", padding: "28px",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: "#1a1a1a" }}>
                Kein WhatsApp?
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                Formular — wir melden uns innerhalb von 2 Stunden.
              </div>
              {!fs.succeeded ? (
                <form onSubmit={handleFsSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input name="name" type="text" placeholder="Ihr Name" required
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <input name="contact" type="text" placeholder="Telefon oder E-Mail" required
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <textarea name="beschreibung" placeholder="z.B. 3.5-Zi in Wohlen, 1× pro Woche, ab Mai" rows={3}
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", resize: "vertical", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <input type="hidden" name="seite" value="Unterhaltsreinigung" />
                  <button type="submit" disabled={fs.submitting}
                    style={{ background: "#E87D3E", color: "#fff", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}
                  >
                    {fs.submitting ? "Wird gesendet..." : "Abo anfragen"}
                  </button>
                </form>
              ) : (
                <div style={{ background: "#f0f7f2", border: "1px solid #c8e6d0", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  <div style={{ fontWeight: 700, color: "#3D7B4F", marginBottom: 4 }}>Merci für Ihre Anfrage!</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Wir melden uns innerhalb von 2 Stunden.</div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

// ============================================================
// СТРАНИЦА GARTENPFLEGE
// ============================================================
function GartenpflegePage() {
  const [fs, handleFsSubmit] = useForm("xrerozyb");
  const [formState, setFormState] = useState({ name: "", contact: "", desc: "" });

  const pakete = [
    {
      id: "fruehling",
      season: "🌱 Frühjahr",
      title: "Garten-Komplett Frühjahr",
      price: PRICES.garten.fruehling,
      priceNote: "ab CHF",
      items: [
        "Rasenmähen und Kantenstechen",
        "Hecken- und Strauchschnitt",
        "Unkraut jäten (Beete und Wege)",
        "Laub- und Schnittgutentsorgung",
        "Erste Saisonkontrolle",
      ],
      badge: null,
      color: "#f0f7f2",
      border: "#3D7B4F",
    },
    {
      id: "herbst",
      season: "🍂 Herbst",
      title: "Garten-Komplett Herbst",
      price: PRICES.garten.herbst,
      priceNote: "ab CHF",
      items: [
        "Laubrechen und Entsorgung",
        "Letzter Rasenschnitt der Saison",
        "Stauden zurückschneiden",
        "Beete winterfest machen",
        "Gartenmöbel einräumen (auf Wunsch)",
      ],
      badge: null,
      color: "#fff",
      border: "#e8e8e8",
    },
    {
      id: "abo",
      season: "📅 März–Oktober",
      title: "Garten-Abo Saison",
      price: PRICES.garten.abo_monat,
      priceNote: "ab CHF",
      unit: "/Monat",
      items: [
        "Monatlich 1–2 Einsätze",
        "Rasen, Hecken, Unkraut laufend",
        "Feste Ansprechperson",
        "Priorität bei Terminen",
        "Frühjahrs- und Herbstpaket inkl.",
      ],
      badge: "Beliebteste Wahl",
      color: "#fff",
      border: "#e8e8e8",
    },
  ];

  const faqItems = [
    { q: "Macht ihr auch Neugestaltung oder Baumpfege?", a: "Nein — wir übernehmen Unterhalt und kleinere Arbeiten. Für Neugestaltung, Baumfällungen oder Landschaftsbau empfehlen wir Fachbetriebe. Das sagen wir ehrlich." },
    { q: "Wie kommt ihr zum Preis — ich weiss nicht wie viel Arbeit es ist?", a: "Schicken Sie uns 3–4 Fotos aus verschiedenen Ecken. Wir sehen darauf meistens genug für eine verbindliche Offerte. Sonst vereinbaren wir einen kurzen Besichtigungstermin." },
    { q: "Könnt ihr das Schnittgut entsorgen?", a: "Ja — Entsorgung ist auf Wunsch inbegriffen oder als Zusatz buchbar." },
    { q: "Ab wann und bis wann läuft die Gartensaison?", a: "Wir starten je nach Wetter ab Mitte März und arbeiten bis Ende Oktober. Das Abo läuft über 8 Monate." },
    { q: "Muss ich dabei sein?", a: "Nein. Viele Kunden sind bei der Arbeit. Wir schliessen nach dem Einsatz ab und schicken ein kurzes Foto-Update." },
    { q: "Habt ihr eigene Maschinen?", a: "Ja — wir kommen mit allem, was wir brauchen. Sie müssen nichts bereitstellen." },
  ];

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)",
        padding: "56px 20px 64px",
        borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "center" }}>
            <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#f0f7f2", border: "1px solid #c8e6d0",
            color: "#3D7B4F", padding: "5px 12px", borderRadius: 20,
            fontSize: 12, fontWeight: 600, marginBottom: 18,
          }}>
            🌿 Gartenpflege im Kanton Aargau
          </div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800,
            color: "#1a1a1a", letterSpacing: "-0.8px",
            lineHeight: 1.15, maxWidth: 620, marginBottom: 16,
          }}>
            Gärtner im Aargau kosten{" "}
            <span style={{ textDecoration: "line-through", color: "#9ca3af" }}>80–120</span>{" "}
            <span style={{ color: "#3D7B4F" }}>65 CHF/Std.</span> im Abo.
          </h1>
          <p style={{
            fontSize: 16, color: "#5a6472", lineHeight: 1.65,
            maxWidth: 500, marginBottom: 28,
          }}>
            Rasen, Hecken, Unkraut — zuverlässig, saisonal oder als Abo.
            Schicken Sie uns Fotos Ihres Gartens, wir schicken eine
            verbindliche Offerte noch am selben Tag.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <WhatsAppButton service="garten" label="Fotos senden & Offerte erhalten" />
          </div>
          <div style={{ marginTop: 16, fontSize: 12, color: "#8a95a0", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>✓ Offerte nach Fotoprüfung — noch heute</span>
            <span>✓ Eigene Maschinen</span>
            <span>✓ Entsorgung auf Wunsch</span>
          </div>
            </div>
            <div style={{ borderRadius: 16, overflow: "hidden", width: 340, height: 280, flexShrink: 0, display: "none" }} className="garten-img">
              <img
                src="https://i.ibb.co/LDTVC0Sj/c99c4965-4e82-4ea4-a4c8-ac9c95a16e1f.png"
                alt="Gartenpflege Aargau — Heckenschnitt"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </Container>
      </div>
      <style>{`@media(min-width:900px){.garten-img{display:block !important;}}`}</style>

      {/* ПАКЕТЫ */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="Einmalig saisonal oder das ganze Jahr als Abo.">
          Unsere Gartenpakete
        </SectionTitle>
        {isOfferActive() && (
          <div style={{
            background: "#fff9f0", border: "1px solid #f5d9c0",
            borderRadius: 10, padding: "12px 20px",
            fontSize: 13, color: "#c2611a", fontWeight: 600,
            marginBottom: 24, display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            🎉 Eröffnungsangebot: CHF 50 Rabatt auf jedes Gartenpaket — automatisch.
          </div>
        )}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 16, alignItems: "start",
        }}>
          {pakete.map(p => (
            <div key={p.id} style={{
              background: p.color, border: `2px solid ${p.border}`,
              borderRadius: 16, padding: "28px",
              position: "relative",
              boxShadow: p.badge ? "0 8px 32px rgba(61,123,79,0.12)" : "none",
            }}>
              {p.badge && (
                <div style={{
                  position: "absolute", top: -12, left: "50%",
                  transform: "translateX(-50%)",
                  background: "#3D7B4F", color: "#fff",
                  fontSize: 11, fontWeight: 700,
                  padding: "4px 14px", borderRadius: 20, whiteSpace: "nowrap",
                }}>
                  {p.badge}
                </div>
              )}
              <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>
                {p.season}
              </div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 17, color: "#1a1a1a", marginBottom: 16,
              }}>
                {p.title}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{p.priceNote}</span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 36, fontWeight: 900,
                  color: p.badge ? "#3D7B4F" : "#1a1a1a",
                }}>
                  {formatPrice(isOfferActive() && p.id !== "abo" ? p.price - 50 : p.price)}
                </span>
                {p.unit && <span style={{ fontSize: 14, color: "#6b7280" }}>{p.unit}</span>}
              </div>
              {isOfferActive() && p.id !== "abo" && (
                <div style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", marginBottom: 12 }}>
                  CHF {formatPrice(p.price)} (regulär)
                </div>
              )}
              <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 16, marginBottom: 20 }}>
                {p.items.map((item, j) => (
                  <div key={j} style={{
                    display: "flex", gap: 8, alignItems: "flex-start",
                    fontSize: 13, color: "#4A4A4A", marginBottom: 7,
                  }}>
                    <Check size={13} color="#3D7B4F" style={{ flexShrink: 0, marginTop: 2 }} />
                    {item}
                  </div>
                ))}
              </div>
              <WhatsAppButton service="garten" label="Offerte anfragen" size="small" />
            </div>
          ))}
        </div>
      </Container>

      {/* ПРЕИМУЩЕСТВА */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <SectionTitle sub="Warum Hausbesitzer im Aargau uns wählen.">
            Was uns unterscheidet
          </SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {[
              { icon: "💰", title: "Faire Preise", text: `CHF ${PRICES.garten.stunde_abo}/Std. im Abo — deutlich unter dem Marktschnitt von 80–120 CHF.` },
              { icon: "📸", title: "Offerte per Foto", text: "Kein Besichtigungstermin nötig. Fotos per WhatsApp genügen für eine verbindliche Offerte." },
              { icon: "🔧", title: "Eigene Maschinen", text: "Wir kommen ausgerüstet. Sie brauchen nichts bereitstellen oder ausleihen." },
              { icon: "📅", title: "Zuverlässiger Rhythmus", text: "Im Abo kommen wir regelmässig — Sie müssen nicht jedes Mal neu anfragen." },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "24px", background: "#fff",
                borderRadius: 12, border: "1px solid #e8f2eb",
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 6 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                  {item.text}
                </div>
              </div>
            ))}
          </div>

          {/* Честное уточнение */}
          <div style={{
            marginTop: 28, padding: "20px 24px", borderRadius: 12,
            background: "#fff8f5", border: "1px solid #f5d9c0",
            fontSize: 14, color: "#92400e", lineHeight: 1.7,
          }}>
            <strong>Was wir nicht machen:</strong> Neugestaltung, Baumfällungen,
            Landschaftsbau. Dafür empfehlen wir Fachbetriebe — das sagen wir
            lieber ehrlich, als eine Arbeit schlecht zu machen.
          </div>
        </Container>
      </div>

      {/* FAQ */}
      <Container style={{ padding: "60px 20px" }}>
        <SectionTitle sub="Die häufigsten Fragen zur Gartenpflege.">
          Häufige Fragen
        </SectionTitle>
        <div style={{ maxWidth: 700 }}>
          <FAQAccordion items={faqItems} />
        </div>
      </Container>

      {/* CTA */}
      <div style={{ background: "#f9fdf9", padding: "60px 0" }}>
        <Container>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32, alignItems: "start",
          }}>
            <div>
              <SectionTitle sub="3–4 Fotos aus verschiedenen Ecken — wir schicken noch heute eine Offerte.">
                Garten-Offerte anfragen
              </SectionTitle>
              <WhatsAppButton service="garten" label="Fotos senden per WhatsApp" />
              <div style={{ marginTop: 16, fontSize: 12, color: "#8a95a0", lineHeight: 1.9 }}>
                <div>📸 Rasen · Hecken · Beete · Terrasse</div>
                <div>⏱ Offerte noch heute</div>
                <div>📅 Einsatz innerhalb von 5–7 Tagen</div>
              </div>
            </div>

            <div style={{
              background: "#fff", borderRadius: 14,
              border: "1px solid #e8e8e8", padding: "28px",
            }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                Kein WhatsApp?
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 20 }}>
                Formular — wir antworten innerhalb von 2 Stunden.
              </div>
              {!fs.succeeded ? (
                <form onSubmit={handleFsSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input name="name" type="text" placeholder="Ihr Name" required
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <input name="contact" type="text" placeholder="Telefon oder E-Mail" required
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <textarea name="beschreibung" placeholder="z.B. Kleiner Garten in Seengen, Rasen + Hecke, einmalig" rows={3}
                    style={{ padding: "12px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", resize: "vertical", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  />
                  <input type="hidden" name="seite" value="Gartenpflege" />
                  <button type="submit" disabled={fs.submitting}
                    style={{ background: "#E87D3E", color: "#fff", padding: "13px", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", border: "none" }}
                  >
                    {fs.submitting ? "Wird gesendet..." : "Offerte anfordern"}
                  </button>
                </form>
              ) : (
                <div style={{ background: "#f0f7f2", border: "1px solid #c8e6d0", borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
                  <div style={{ fontWeight: 700, color: "#3D7B4F", marginBottom: 4 }}>Merci für Ihre Anfrage!</div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Wir melden uns innerhalb von 2 Stunden.</div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

// ============================================================
// СТРАНИЦА /preise — полный прайс + расширенный калькулятор
// ============================================================
function PreisePage({ setPage }) {
  const [activeService, setActiveService] = useState("endreinigung");
  const [roomSize, setRoomSize]   = useState("3.5");
  const [variant, setVariant]     = useState("komplett");
  const [extras, setExtras]       = useState({ entsorgung: false, teppich: false });
  const [aboType, setAboType]     = useState("komfort");
  const [gartenType, setGartenType] = useState("fruehling");
  const [calcDone, setCalcDone]   = useState(false);

  const services = [
    { id: "endreinigung",  label: "Umzugsreinigung" },
    { id: "unterhalt",     label: "Unterhaltsreinigung" },
    { id: "garten",        label: "Gartenpflege" },
    { id: "fenster",       label: "Fensterreinigung" },
  ];

  // Расчёт итога по активной услуге
  const calcTotal = () => {
    if (activeService === "endreinigung") {
      const base = PRICES.endreinigung[roomSize][variant];
      const ex   = (extras.entsorgung ? PRICES.extras.entsorgung : 0)
                 + (extras.teppich    ? PRICES.extras.teppich    : 0);
      const disc = getOfferDiscount(roomSize);
      return { base, ex, disc, total: base + ex - disc };
    }
    if (activeService === "unterhalt") {
      const base = PRICES.unterhalt[aboType];
      const disc = isOfferActive() ? Math.round(base * 0.1) : 0;
      return { base, ex: 0, disc, total: base - disc, note: "erster Monat" };
    }
    if (activeService === "garten") {
      const base = gartenType === "abo"
        ? PRICES.garten.abo_monat
        : PRICES.garten[gartenType];
      const disc = isOfferActive() && gartenType !== "abo" ? 50 : 0;
      return { base, ex: 0, disc, total: base - disc };
    }
    if (activeService === "fenster") {
      return { base: PRICES.fenster.pauschal_25zi, ex: 0, disc: 0, total: PRICES.fenster.pauschal_25zi, note: "2.5-Zi pauschal" };
    }
    return { base: 0, ex: 0, disc: 0, total: 0 };
  };

  const result = calcTotal();

  const waTextFull = () => {
    const svc = services.find(s => s.id === activeService)?.label;
    let detail = "";
    if (activeService === "endreinigung")
      detail = `${roomSize}-Zi, ${variant === "basic" ? "Basic" : "Komplett"}${extras.entsorgung ? " + Entsorgung" : ""}${extras.teppich ? " + Teppich" : ""}`;
    if (activeService === "unterhalt")
      detail = `Abo ${aboType.charAt(0).toUpperCase() + aboType.slice(1)}`;
    if (activeService === "garten")
      detail = gartenType === "abo" ? "Saison-Abo" : gartenType === "fruehling" ? "Frühjahrspaket" : "Herbstpaket";
    if (activeService === "fenster")
      detail = "Fensterreinigung";
    const msg = `Grüezi, ich habe den Kalkulator auf fleissig.ch genutzt. Leistung: ${svc} (${detail}), Preis laut Kalkulator: CHF ${formatPrice(result.total)}. Ich bitte um eine verbindliche Offerte.`;
    return `https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent(msg)}`;
  };

  const endrRow = (label, basic, komplett) => (
    <tr key={label} style={{ borderBottom: "1px solid #f0f0f0" }}>
      <td style={{ padding: "12px 16px", fontSize: 14, color: "#4A4A4A", fontWeight: 500 }}>{label}</td>
      <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "center", fontWeight: 600 }}>CHF {formatPrice(basic)}</td>
      <td style={{ padding: "12px 16px", fontSize: 14, textAlign: "center", fontWeight: 600, color: "#3D7B4F" }}>CHF {formatPrice(komplett)}</td>
    </tr>
  );

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)",
        padding: "48px 20px 56px", borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800,
            color: "#1a1a1a", letterSpacing: "-0.8px", marginBottom: 12,
          }}>
            Preise & Pakete
          </h1>
          <p style={{ fontSize: 16, color: "#5a6472", maxWidth: 500, lineHeight: 1.6 }}>
            Alle Preise sind Festpreise — was in der Offerte steht, zahlen Sie.
            Kalkulator für alle Leistungen unten.
          </p>
        </Container>
      </div>

      <Container style={{ padding: "56px 20px" }}>

        {/* ERÖFFNUNGSANGEBOT */}
        {isOfferActive() && (
          <div style={{
            background: "linear-gradient(135deg, #3D7B4F 0%, #2d5c3a 100%)",
            borderRadius: 14, padding: "24px 28px", marginBottom: 48,
            display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap",
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#c8e6d0", fontSize: 12, fontWeight: 700, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Eröffnungsangebot — bis 30. Juni 2026
              </div>
              <div style={{ color: "#fff", fontSize: 14, lineHeight: 1.7 }}>
                CHF 100 Rabatt auf alle Umzugsreinigungen (2.5-Zi: CHF 50) ·
                CHF 50 Rabatt auf Gartenpakete ·
                10% Rabatt auf das erste Unterhalt-Abo
              </div>
              <div style={{ color: "#a8d5b5", fontSize: 12, marginTop: 6 }}>
                Kein Code nötig — der Rabatt wird automatisch in der Offerte abgezogen.
              </div>
            </div>
          </div>
        )}

        {/* КАЛЬКУЛЯТОР */}
        <div style={{ marginBottom: 64 }}>
          <SectionTitle sub="Wählen Sie eine Leistung — der Preis wird sofort berechnet.">
            Kalkulator
          </SectionTitle>

          {/* Табы услуг */}
          <div style={{
            display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24,
          }}>
            {services.map(s => (
              <button key={s.id}
                onClick={() => { setActiveService(s.id); setCalcDone(false); }}
                style={{
                  padding: "9px 18px", borderRadius: 8, cursor: "pointer",
                  border: activeService === s.id ? "2px solid #3D7B4F" : "2px solid #e8e8e8",
                  background: activeService === s.id ? "#3D7B4F" : "#fff",
                  color: activeService === s.id ? "#fff" : "#4A4A4A",
                  fontWeight: 600, fontSize: 13,
                  transition: "all 0.15s",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24, alignItems: "start",
          }}>
            {/* Левая: параметры */}
            <div style={{
              background: "#f9fdf9", borderRadius: 14,
              border: "1px solid #e8f2eb", padding: "28px",
            }}>
              {/* UMZUGSREINIGUNG */}
              {activeService === "endreinigung" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Grösse</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[["2.5","~55 m²"],["3.5","~75 m²"],["4.5","~95 m²"],["5.5","~120 m²"],["EFH","~160 m²"]].map(([id, sub]) => (
                        <button key={id} onClick={() => setRoomSize(id)} style={{
                          padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                          border: roomSize === id ? "2px solid #3D7B4F" : "2px solid #e0e0e0",
                          background: roomSize === id ? "#f0f7f2" : "#fff",
                          color: roomSize === id ? "#3D7B4F" : "#4A4A4A",
                          fontWeight: roomSize === id ? 700 : 500, fontSize: 12,
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                        }}>
                          <span style={{ fontWeight: 700 }}>{id}</span>
                          <span style={{ fontSize: 10, opacity: 0.7 }}>{sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Paket</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {[["basic","Basic","Küche, Bad, Zimmer"],["komplett","Komplett","+ Fenster, Balkon, Keller"]].map(([id, label, sub]) => (
                        <button key={id} onClick={() => setVariant(id)} style={{
                          padding: "12px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                          border: variant === id ? "2px solid #3D7B4F" : "2px solid #e0e0e0",
                          background: variant === id ? "#f0f7f2" : "#fff",
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: variant === id ? "#3D7B4F" : "#1a1a1a" }}>{label}</div>
                          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{sub}</div>
                          <div style={{ fontWeight: 800, fontSize: 14, color: "#3D7B4F", marginTop: 6 }}>
                            CHF {formatPrice(PRICES.endreinigung[roomSize][id])}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Extras (optional)</div>
                    {[["entsorgung","Grüngutentsorgung",PRICES.extras.entsorgung],["teppich","Teppichreinigung",PRICES.extras.teppich]].map(([key, label, price]) => (
                      <label key={key} style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                        background: extras[key] ? "#f0f7f2" : "#fff",
                        border: `1px solid ${extras[key] ? "#c8e6d0" : "#e8e8e8"}`,
                        marginBottom: 8, fontSize: 13,
                      }}>
                        <input type="checkbox" checked={extras[key]}
                          onChange={e => setExtras(p => ({ ...p, [key]: e.target.checked }))}
                          style={{ accentColor: "#3D7B4F", width: 15, height: 15 }}
                        />
                        <span style={{ flex: 1 }}>{label}</span>
                        <span style={{ fontWeight: 700 }}>+CHF {price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* UNTERHALT */}
              {activeService === "unterhalt" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Abo-Typ</div>
                  {[
                    ["basis",   "Basis",   "6 Std./Monat", PRICES.unterhalt.basis],
                    ["komfort", "Komfort", "12 Std./Monat", PRICES.unterhalt.komfort],
                    ["premium", "Premium", "24 Std./Monat", PRICES.unterhalt.premium],
                    ["einmalig","Einmalig","ohne Abo, pro Std.", PRICES.unterhalt.einmalig],
                  ].map(([id, label, sub, price]) => (
                    <button key={id} onClick={() => setAboType(id)} style={{
                      padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                      border: aboType === id ? "2px solid #3D7B4F" : "2px solid #e0e0e0",
                      background: aboType === id ? "#f0f7f2" : "#fff",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: aboType === id ? "#3D7B4F" : "#1a1a1a" }}>{label}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{sub}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#3D7B4F" }}>
                        CHF {formatPrice(price)}{id === "einmalig" ? "/Std." : "/Mt."}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* GARTEN */}
              {activeService === "garten" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Leistung</div>
                  {[
                    ["fruehling", "🌱 Frühjahrspaket", "Einmalig", PRICES.garten.fruehling],
                    ["herbst",    "🍂 Herbstpaket",    "Einmalig", PRICES.garten.herbst],
                    ["abo",       "📅 Saison-Abo",     "März–Oktober", PRICES.garten.abo_monat],
                  ].map(([id, label, sub, price]) => (
                    <button key={id} onClick={() => setGartenType(id)} style={{
                      padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                      border: gartenType === id ? "2px solid #3D7B4F" : "2px solid #e0e0e0",
                      background: gartenType === id ? "#f0f7f2" : "#fff",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: gartenType === id ? "#3D7B4F" : "#1a1a1a" }}>{label}</div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>{sub}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#3D7B4F" }}>
                        ab CHF {formatPrice(price)}{id === "abo" ? "/Mt." : ""}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* FENSTER */}
              {activeService === "fenster" && (
                <div style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#1a1a1a", marginBottom: 12 }}>Fensterreinigung</div>
                  <div>Pauschalpreis je nach Wohnungsgrösse:</div>
                  {[
                    ["2.5-Zi", 320], ["3.5-Zi", 420], ["4.5-Zi", 520],
                  ].map(([size, price]) => (
                    <div key={size} style={{
                      display: "flex", justifyContent: "space-between",
                      padding: "8px 0", borderBottom: "1px solid #f0f0f0",
                    }}>
                      <span>{size}</span>
                      <span style={{ fontWeight: 700 }}>CHF {price}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>
                    Inkl. Storen innen/aussen und Fensterrahmen. Offerte nach Fotoprüfung.
                  </div>
                </div>
              )}
            </div>

            {/* Правая: итог */}
            <div style={{
              background: "#fff", border: "2px solid #3D7B4F",
              borderRadius: 14, padding: "28px",
              boxShadow: "0 8px 32px rgba(61,123,79,0.10)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 20 }}>
                Ihr Preis
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280" }}>
                  <span>Basispreis</span>
                  <span>CHF {formatPrice(result.base)}</span>
                </div>
                {result.ex > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#6b7280" }}>
                    <span>Extras</span>
                    <span>+CHF {formatPrice(result.ex)}</span>
                  </div>
                )}
                {result.disc > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#3D7B4F", fontWeight: 600 }}>
                    <span>🎉 Eröffnungsrabatt{result.note ? ` (${result.note})` : ""}</span>
                    <span>−CHF {formatPrice(result.disc)}</span>
                  </div>
                )}
              </div>

              <div style={{
                borderTop: "2px solid #e8f2eb", paddingTop: 16, marginBottom: 24,
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
              }}>
                <span style={{ fontWeight: 800, fontSize: 16, color: "#1a1a1a" }}>Festpreis</span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 36, fontWeight: 900, color: "#3D7B4F",
                }}>
                  CHF {formatPrice(result.total)}
                  {activeService === "unterhalt" && aboType !== "einmalig" && <span style={{ fontSize: 14, fontWeight: 600 }}>/Mt.</span>}
                  {activeService === "garten" && gartenType === "abo" && <span style={{ fontSize: 14, fontWeight: 600 }}>/Mt.</span>}
                  {activeService === "unterhalt" && aboType === "einmalig" && <span style={{ fontSize: 14, fontWeight: 600 }}>/Std.</span>}
                </span>
              </div>

              {!calcDone ? (
                <a href={waTextFull()} target="_blank" rel="noopener noreferrer"
                  onClick={() => {
                    setCalcDone(true);
                    // TODO: fbq('track','Lead',{content_name:'preise_calculator'})
                    // TODO: gtag('event','calculator_complete')
                    setTimeout(() => setCalcDone(false), 5000);
                  }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#25D366", color: "#fff",
                    padding: "15px", borderRadius: 10, textDecoration: "none",
                    fontSize: 14, fontWeight: 700,
                    boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
                  }}
                >
                  <MessageCircle size={16} />
                  Offerte per WhatsApp anfragen
                </a>
              ) : (
                <div style={{
                  background: "#f0f7f2", border: "1px solid #c8e6d0",
                  borderRadius: 10, padding: "14px", textAlign: "center",
                  fontSize: 14, color: "#3D7B4F", fontWeight: 600,
                }}>
                  ✓ WhatsApp geöffnet — Antwort in ≤15 Min.
                </div>
              )}

              <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 10 }}>
                Verbindliche Offerte nach Fotoprüfung
              </div>

              {/* Was beeinflusst den Preis */}
              <div style={{
                marginTop: 20, padding: "14px", borderRadius: 8,
                background: "#f9f9f9", border: "1px solid #e8e8e8",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#4A4A4A", marginBottom: 8 }}>
                  Was den Preis beeinflusst:
                </div>
                {[
                  "Grösse und Zustand des Objekts",
                  "Verschmutzungsgrad (normal / stark / extrem)",
                  "Anfahrt ausserhalb 20 km von Seengen",
                  "Bio-Reinigungsmittel auf Wunsch (+Aufpreis)",
                ].map((item, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#6b7280", marginBottom: 4, display: "flex", gap: 6 }}>
                    <span>·</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ТАБЛИЦА ENDREINIGUNG */}
        <div style={{ marginBottom: 56 }}>
          <SectionTitle sub="Festpreise für alle Wohnungsgrössen — Basic und Komplett.">
            Umzugsreinigung — Preistabelle
          </SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden",
              fontSize: 14,
            }}>
              <thead>
                <tr style={{ background: "#f0f7f2" }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontWeight: 700, color: "#1a1a1a" }}>Wohnung</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 700, color: "#4A4A4A" }}>Basic</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontWeight: 700, color: "#3D7B4F" }}>Komplett ✓</th>
                </tr>
              </thead>
              <tbody>
                {endrRow("2.5-Zi (~55 m²)", PRICES.endreinigung["2.5"].basic, PRICES.endreinigung["2.5"].komplett)}
                {endrRow("3.5-Zi (~75 m²)", PRICES.endreinigung["3.5"].basic, PRICES.endreinigung["3.5"].komplett)}
                {endrRow("4.5-Zi (~95 m²)", PRICES.endreinigung["4.5"].basic, PRICES.endreinigung["4.5"].komplett)}
                {endrRow("5.5-Zi (~120 m²)", PRICES.endreinigung["5.5"].basic, PRICES.endreinigung["5.5"].komplett)}
                {endrRow("EFH 5.5-Zi (~160 m²)", PRICES.endreinigung["EFH"].basic, PRICES.endreinigung["EFH"].komplett)}
              </tbody>
            </table>
          </div>
          <div style={{
            marginTop: 16, display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12,
          }}>
            {[
              { label: "Basic beinhaltet", items: ["Küche, Bad, Wohnräume nach Checkliste", "Böden, Oberflächen, Armaturen", "Abgabegarantie mit kostenloser Nachreinigung"] },
              { label: "Komplett beinhaltet zusätzlich", items: ["Fenster und Storen beidseitig", "Balkon / Terrasse · Keller / Estrich", "Backofen-Tiefenreinigung · Kalkentfernung", "Teamleiter bei der Wohnungsabnahme"] },
            ].map((col, i) => (
              <div key={i} style={{
                padding: "16px 20px", borderRadius: 10,
                background: i === 1 ? "#f0f7f2" : "#f9f9f9",
                border: `1px solid ${i === 1 ? "#c8e6d0" : "#e8e8e8"}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: i === 1 ? "#3D7B4F" : "#1a1a1a" }}>
                  {col.label}
                </div>
                {col.items.map((item, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, fontSize: 13, color: "#4A4A4A", marginBottom: 5 }}>
                    <Check size={12} color="#3D7B4F" style={{ flexShrink: 0, marginTop: 2 }} />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* COMBO ПАКЕТЫ */}
        <div style={{ marginBottom: 56 }}>
          <SectionTitle sub="Kombinierte Leistungen — echte Ersparnis.">
            Kombipakete
          </SectionTitle>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%", borderCollapse: "collapse",
              border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden",
            }}>
              <thead>
                <tr style={{ background: "#f9f9f9" }}>
                  {["Paket", "Leistungen", "Einzeln", "Paketpreis", "Ersparnis"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: h === "Paket" || h === "Leistungen" ? "left" : "center",
                      fontWeight: 700, fontSize: 13, color: "#4A4A4A",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAKETE.map((p, i) => {
                  const save = p.einzeln - p.paket;
                  const pct  = Math.round(save / p.einzeln * 100);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: 13 }}>{p.name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{p.items}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: "#9ca3af", textDecoration: "line-through" }}>
                        CHF {formatPrice(p.einzeln)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, fontSize: 14, color: "#3D7B4F" }}>
                        CHF {formatPrice(p.paket)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{
                          background: "#f0f7f2", color: "#3D7B4F",
                          fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
                        }}>
                          −{pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ПРОЧИЕ УСЛУГИ */}
        <div>
          <SectionTitle sub="Überblick aller weiteren Leistungen.">
            Weitere Preise
          </SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}>
            {[
              {
                title: "Unterhaltsreinigung",
                rows: [
                  ["Einmalig", `CHF ${PRICES.unterhalt.einmalig}/Std.`],
                  ["Abo Basis (6 Std./Mt.)", `CHF ${formatPrice(PRICES.unterhalt.basis)}/Mt.`],
                  ["Abo Komfort (12 Std./Mt.)", `CHF ${formatPrice(PRICES.unterhalt.komfort)}/Mt.`],
                  ["Abo Premium (24 Std./Mt.)", `CHF ${formatPrice(PRICES.unterhalt.premium)}/Mt.`],
                ],
              },
              {
                title: "Gartenpflege",
                rows: [
                  ["Einmalig", `CHF ${PRICES.garten.stunde_einmalig}/Std.`],
                  ["Abo (März–Oktober)", `CHF ${PRICES.garten.stunde_abo}/Std.`],
                  ["Frühjahrspaket", `ab CHF ${formatPrice(PRICES.garten.fruehling)}`],
                  ["Herbstpaket", `ab CHF ${formatPrice(PRICES.garten.herbst)}`],
                  ["Saison-Abo", `ab CHF ${formatPrice(PRICES.garten.abo_monat)}/Mt.`],
                ],
              },
              {
                title: "Fensterreinigung",
                rows: [
                  ["2.5-Zi", "CHF 320 pauschal"],
                  ["3.5-Zi", "CHF 420 pauschal"],
                  ["4.5-Zi", "CHF 520 pauschal"],
                  ["Inkl.", "Storen, Rahmen, Simse"],
                ],
              },
              {
                title: "Extras & Zuschläge",
                rows: [
                  ["Grüngutentsorgung", "+CHF 120"],
                  ["Teppichreinigung", "+CHF 180"],
                  ["Notfall <24h", "+25%"],
                  ["Anfahrt >20 km", "nach Offerte"],
                  ["Bio-Reinigungsmittel", "+Aufpreis"],
                ],
              },
            ].map((card, i) => (
              <div key={i} style={{
                background: "#fff", borderRadius: 12,
                border: "1px solid #e8e8e8", padding: "20px",
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 12 }}>
                  {card.title}
                </div>
                {card.rows.map(([label, val], j) => (
                  <div key={j} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "7px 0", borderBottom: j < card.rows.length - 1 ? "1px solid #f5f5f5" : "none",
                    fontSize: 13,
                  }}>
                    <span style={{ color: "#6b7280" }}>{label}</span>
                    <span style={{ fontWeight: 600, color: "#1a1a1a" }}>{val}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

      </Container>
    </div>
  );
}

// ============================================================
// СТРАНИЦА /faq
// ============================================================
function FAQPage() {
  const categories = [
    {
      title: "Bestellung & Ablauf",
      icon: "📋",
      items: [
        { q: "Wie bestelle ich eine Reinigung?", a: "Am einfachsten per WhatsApp — schicken Sie uns 2–3 Fotos und eine kurze Beschreibung. Sie können auch das Formular auf der Kontaktseite nutzen oder eine E-Mail schreiben. Wir antworten innerhalb von 15 Minuten (werktags 8–18 Uhr)." },
        { q: "Wie schnell können Sie kommen?", a: "Meistens 3–7 Tage Vorlauf. In dringenden Fällen auch 24h — bitte direkt per WhatsApp fragen. Notfalleinsatz kostet einen Zuschlag von 25%." },
        { q: "Muss ich beim Termin zuhause sein?", a: "Nein. Viele Kunden übergeben uns einfach den Schlüssel. Wir besprechen das bei der Auftragsbestätigung — und schicken Ihnen nach dem Einsatz ein kurzes Foto-Update." },
        { q: "Wie läuft die Offerte ab?", a: "Sie schicken uns Fotos per WhatsApp oder füllen das Formular aus. Wir prüfen die Situation und schicken Ihnen innerhalb von 2 Stunden eine verbindliche Offerte. Keine versteckten Kosten — was draufsteht, zahlen Sie." },
        { q: "Kann ich per WhatsApp buchen?", a: "Ja — und das ist unser bevorzugter Kanal. Fotos per WhatsApp ersetzen den Besichtigungstermin. Die Buchungsbestätigung erhalten Sie ebenfalls per WhatsApp oder E-Mail." },
      ],
    },
    {
      title: "Preise & Zahlung",
      icon: "💳",
      items: [
        { q: "Sind die Preise auf der Website verbindlich?", a: "Ja — für normale Verschmutzung und die angegebene Wohnungsgrösse. Bei starker oder extremer Verschmutzung besprechen wir das vorher offen und passen die Offerte an." },
        { q: "Kommen Zusatzkosten?", a: "Nein — alles steht in der Offerte. Wir fügen nach dem Einsatz keine Positionen hinzu. Einzige Ausnahme: Sie wünschen vor Ort zusätzliche Arbeiten, die nicht besprochen waren — das rechnen wir separat." },
        { q: "Kann ich per Rechnung zahlen?", a: "Ja. Sie erhalten immer eine offizielle Rechnung. Zahlungsfrist 10 Tage nach Einsatz." },
        { q: "TWINT oder Barzahlung?", a: "TWINT ja, Barzahlung nein. So bleibt alles sauber dokumentiert — für Sie und für uns." },
        { q: "Gibt es einen Rabatt bei grösseren Aufträgen?", a: "Bei regelmässigen Abos und Kombipaketen sind die Rabatte bereits eingerechnet — bis 19%. Für Verwaltungen und Vermieter mit mehreren Objekten erstellen wir ein individuelles Angebot." },
      ],
    },
    {
      title: "Qualität & Garantie",
      icon: "✅",
      items: [
        { q: "Was ist die Abgabegarantie genau?", a: "Wir reinigen nach einer klaren Checkliste, sind bei der Wohnungsabnahme dabei und kommen kostenlos zurück — innerhalb von 48 Stunden — falls die Verwaltung etwas beanstandet. Das ist schriftlich in der Auftragsbestätigung festgehalten." },
        { q: "Was passiert bei Beanstandungen?", a: "Wir kommen kostenlos zurück und machen es richtig. Kein Diskutieren, keine versteckten Bedingungen. Das ist Teil unserer Garantie." },
        { q: "Was wenn etwas kaputtgeht?", a: "Wir sind über eine Betriebshaftpflicht bis CHF 5 Mio. versichert. Schäden melden wir sofort und regeln das unkompliziert." },
        { q: "Verwenden Sie umweltfreundliche Reinigungsmittel?", a: "Standardmässig professionelle Mittel — wirksam und sicher zugelassen. Auf Wunsch arbeiten wir mit bio-zertifizierten Produkten, das kostet einen kleinen Aufpreis." },
      ],
    },
    {
      title: "Personal & Legalität",
      icon: "👤",
      items: [
        { q: "Wer kommt zu mir nach Hause?", a: "Feste Teammitglieder, die wir persönlich kennen und eingewiesen haben. Im Abo versuchen wir maximale Kontinuität — dieselbe Person, damit Vertrauen entsteht." },
        { q: "Sind Ihre Mitarbeiter angemeldet?", a: "Ja — mit Arbeitsvertrag, AHV/SUVA-Anmeldung und nach GAV Reinigung (gültig ab 1.1.2026). Kein Schwarzgeld, kein Risiko für Sie bei einer Steuerkontrolle." },
        { q: "Darf ich dieselbe Reinigungsperson behalten?", a: "Im Abo ja — wir versuchen aktiv, Kontinuität herzustellen. Bei Krankheit oder Ferien schicken wir eine eingewiesene Vertretung." },
        { q: "Warum kein Schwarzgeld?", a: "Weil es für Sie als Auftraggeber ein Risiko ist — nicht nur für uns. Bei einer Betriebskontrolle oder Steuerkontrolle haften Sie mit. Wir bieten legalen Schutz: offizielle Rechnung, Versicherung, Nachweis." },
      ],
    },
    {
      title: "Spezielle Situationen",
      icon: "❓",
      items: [
        { q: "Was bei extremer Verschmutzung oder Messie-Wohnung?", a: "Wir besichtigen vor Ort oder schauen uns die Fotos genau an. Bei extremen Fällen holen wir wenn nötig eine Partnerfirma dazu und erstellen eine separate Offerte. Das sagen wir immer im Voraus." },
        { q: "Haustiere — kein Problem?", a: "Kein Problem. Bitte beim ersten Kontakt erwähnen, damit wir wissen, was uns erwartet." },
        { q: "Allergien oder besondere Anforderungen?", a: "Kein Problem — einfach bei der Anfrage angeben. Bio-Produkte auf Wunsch, Duftstofffrei auf Anfrage." },
        { q: "Können Sie auch Bau- oder Renovationsreinigung?", a: "Ja — Baureinigung nach Renovation ab CHF 13/m². Bitte Fotos schicken, damit wir den Aufwand einschätzen können." },
      ],
    },
    {
      title: "Geografisch",
      icon: "📍",
      items: [
        { q: "Welche Orte im Aargau decken Sie ab?", a: "Seengen (Basis), Lenzburg, Aarau, Wohlen, Baden, Brugg, Zofingen und Umgebung — der gesamte Kanton Aargau." },
        { q: "Was wenn ich weiter entfernt bin?", a: "Fragen Sie einfach — oft geht es trotzdem. Bei Anfahrt über 20 km von Seengen kommt ein kleiner Anfahrtszuschlag, den wir in der Offerte ausweisen." },
        { q: "Arbeiten Sie auch in anderen Kantonen?", a: "Im Moment konzentrieren wir uns auf den Kanton Aargau. Für Grenzfälle (z.B. Zürich, Solothurn, Luzern) fragen Sie uns direkt — je nach Lage finden wir eine Lösung." },
      ],
    },
  ];

  const [openCat, setOpenCat]   = useState(0);
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch]     = useState("");

  const filtered = search.trim().length > 1
    ? categories.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0)
    : categories;

  const totalQ = categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)",
        padding: "48px 20px 56px", borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800,
            color: "#1a1a1a", letterSpacing: "-0.8px", marginBottom: 12,
          }}>
            Häufige Fragen
          </h1>
          <p style={{ fontSize: 15, color: "#5a6472", marginBottom: 24, maxWidth: 480 }}>
            {totalQ} Antworten auf die häufigsten Fragen — oder schreiben Sie uns direkt.
          </p>
          {/* Поиск */}
          <div style={{ position: "relative", maxWidth: 440 }}>
            <input
              type="text"
              placeholder="Frage suchen..."
              value={search}
              onChange={e => { setSearch(e.target.value); setOpenItem(null); }}
              style={{
                width: "100%", padding: "12px 16px 12px 42px",
                borderRadius: 10, fontSize: 14,
                border: "1.5px solid #d0d8e0", outline: "none",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxSizing: "border-box",
              }}
            />
            <span style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", fontSize: 16, pointerEvents: "none",
            }}>🔍</span>
          </div>
        </Container>
      </div>

      <Container style={{ padding: "48px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32, alignItems: "start" }}>

          {/* Категории-навигация (только на десктопе) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }} className="faq-nav">
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
              Kategorien
            </div>
            {categories.map((cat, i) => (
              <button key={i}
                onClick={() => { setOpenCat(i); setOpenItem(null); setSearch(""); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", borderRadius: 8, cursor: "pointer", textAlign: "left",
                  background: openCat === i && !search ? "#f0f7f2" : "transparent",
                  border: openCat === i && !search ? "1px solid #c8e6d0" : "1px solid transparent",
                  color: openCat === i && !search ? "#3D7B4F" : "#4A4A4A",
                  fontWeight: openCat === i && !search ? 700 : 500,
                  fontSize: 13, transition: "all 0.15s",
                }}
              >
                <span>{cat.icon}</span>
                <span style={{ flex: 1 }}>{cat.title}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: openCat === i && !search ? "#3D7B4F" : "#9ca3af",
                }}>
                  {cat.items.length}
                </span>
              </button>
            ))}
            <div style={{ marginTop: 20, padding: "16px", background: "#f9fdf9", borderRadius: 10, border: "1px solid #e8f2eb" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", marginBottom: 6 }}>
                Keine Antwort gefunden?
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12 }}>
                Wir antworten innerhalb von 15 Minuten.
              </div>
              <WhatsAppButton service="general" label="Frage per WhatsApp" size="small" />
            </div>
            <style>{`.faq-nav { display: flex !important; } @media(max-width:640px){.faq-nav{display:none !important;}}`}</style>
          </div>

          {/* Аккордеон */}
          <div style={{ flex: 1 }}>
            {search.trim().length > 1 && (
              <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
                {filtered.reduce((s, c) => s + c.items.length, 0)} Ergebnisse für „{search}"
              </div>
            )}
            {filtered.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 28 }}>
                {(search || filtered.length > 1) && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontSize: 14, fontWeight: 700, color: "#1a1a1a",
                    marginBottom: 12, paddingBottom: 8,
                    borderBottom: "2px solid #e8f2eb",
                  }}>
                    <span>{cat.icon}</span>{cat.title}
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {cat.items.map((item, ii) => {
                    const key  = `${ci}-${ii}`;
                    const open = openItem === key;
                    return (
                      <div key={ii} style={{
                        border: `1px solid ${open ? "#c8e6d0" : "#e8e8e8"}`,
                        borderRadius: 10, overflow: "hidden",
                        transition: "border-color 0.15s",
                      }}>
                        <button
                          onClick={() => setOpenItem(open ? null : key)}
                          style={{
                            width: "100%", textAlign: "left",
                            padding: "14px 18px", background: open ? "#f0f7f2" : "#fff",
                            border: "none", cursor: "pointer",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            gap: 12, transition: "background 0.15s",
                          }}
                        >
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
                            {item.q}
                          </span>
                          <ChevronDown size={15} color="#6b7280" style={{
                            flexShrink: 0,
                            transform: open ? "rotate(180deg)" : "",
                            transition: "transform 0.2s",
                          }} />
                        </button>
                        {open && (
                          <div style={{
                            padding: "0 18px 16px",
                            fontSize: 13, color: "#4A4A4A",
                            lineHeight: 1.75, background: "#f0f7f2",
                          }}>
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{
                padding: "40px 20px", textAlign: "center",
                background: "#f9f9f9", borderRadius: 12, color: "#6b7280", fontSize: 14,
              }}>
                Keine Treffer für „{search}". <br />
                <a href={buildWaLink("general")}
                  style={{ color: "#3D7B4F", fontWeight: 600 }}>
                  Direkt per WhatsApp fragen →
                </a>
              </div>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
}

// ============================================================
// СТРАНИЦА /kontakt
// ============================================================
function KontaktPage() {
  const [fs, handleFsSubmit] = useForm("xrerozyb");
  const [form, setForm]   = useState({ name: "", contact: "", service: "", desc: "" });
  const [error, setError] = useState(false);

  const services = [
    "Umzugsreinigung", "Unterhaltsreinigung", "Gartenpflege",
    "Fensterreinigung", "Baureinigung", "Büroreinigung", "Anderes",
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim()) { setError(true); return; }
    setError(false);
    handleFsSubmit(e);
  };

  const waKontakt = buildWaLink("general");

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)",
        padding: "48px 20px 56px", borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800,
            color: "#1a1a1a", letterSpacing: "-0.8px", marginBottom: 12,
          }}>
            Kontakt
          </h1>
          <p style={{ fontSize: 15, color: "#5a6472", maxWidth: 460 }}>
            Am schnellsten per WhatsApp. Wir antworten innerhalb von 15 Minuten — werktags 8–18 Uhr.
          </p>
        </Container>
      </div>

      <Container style={{ padding: "48px 20px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 32, alignItems: "start",
        }}>

          {/* ЛЕВАЯ — контакты + WA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* WhatsApp блок */}
            <div style={{
              background: "linear-gradient(135deg, #25D366 0%, #1da851 100%)",
              borderRadius: 16, padding: "28px",
              boxShadow: "0 8px 32px rgba(37,211,102,0.25)",
            }}>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 18,
                fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 6 }}>
                WhatsApp — bevorzugter Kanal
              </div>
              <div style={{ color: "#c8f7d8", fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
                3 Fotos + kurze Beschreibung genügen.<br />
                Offerte innerhalb von 2 Stunden.
              </div>
              <a href={waKontakt} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#fff", color: "#1a8a40",
                  padding: "12px 22px", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, textDecoration: "none",
                  // TODO: onClick → fbq('track','Lead',{content_name:'whatsapp_kontakt'})
                }}
              >
                <MessageCircle size={16} />
                Chat öffnen
              </a>
            </div>

            {/* Контактные данные */}
            <div style={{
              background: "#fff", border: "1px solid #e8e8e8",
              borderRadius: 14, padding: "24px",
              display: "flex", flexDirection: "column", gap: 16,
            }}>
              {[
                { icon: <Phone size={16} color="#3D7B4F" />, label: "Telefon", value: CONFIG.PHONE,
                  href: `tel:${CONFIG.PHONE.replace(/\s/g,"")}` },
                { icon: <Mail size={16} color="#3D7B4F" />, label: "E-Mail", value: CONFIG.EMAIL,
                  href: `mailto:${CONFIG.EMAIL}` },
                { icon: <MapPin size={16} color="#3D7B4F" />, label: "Standort", value: CONFIG.ADDRESS, href: null },
                { icon: <Clock size={16} color="#3D7B4F" />, label: "Erreichbarkeit",
                  value: "Werktags 8:00–18:00", href: null },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: "#f0f7f2", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {row.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600,
                      textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 2 }}>
                      {row.label}
                    </div>
                    {row.href ? (
                      <a href={row.href} style={{
                        fontSize: 14, fontWeight: 600, color: "#1a1a1a",
                        textDecoration: "none",
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = "#3D7B4F"}
                        onMouseLeave={e => e.currentTarget.style.color = "#1a1a1a"}
                      >
                        {row.value}
                      </a>
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{row.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Карта-заглушка */}
            <div style={{
              background: "#f0f7f2", borderRadius: 14,
              border: "1px solid #c8e6d0", height: 180,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 8, color: "#3D7B4F",
            }}>
              <MapPin size={28} color="#3D7B4F" />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Kanton Aargau</div>
              <div style={{ fontSize: 12, color: "#6b7280", textAlign: "center", padding: "0 20px" }}>
                Seengen · Lenzburg · Aarau · Wohlen<br />Baden · Brugg · Zofingen
              </div>
            </div>
          </div>

          {/* ПРАВАЯ — форма */}
          <div style={{
            background: "#fff", border: "1px solid #e8e8e8",
            borderRadius: 16, padding: "32px",
          }}>
            {!fs.succeeded ? (
              <form onSubmit={handleSend}>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18, color: "#1a1a1a", marginBottom: 4 }}>
                  Formular
                </div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
                  Kein WhatsApp? Wir antworten innerhalb von 2 Stunden.
                </div>
                {error && (
                  <div style={{ background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#b91c1c", marginBottom: 16 }}>
                    Bitte Name und Kontakt (Telefon oder E-Mail) ausfüllen.
                  </div>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#4A4A4A", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Name *</label>
                    <input type="text" name="name" placeholder="Ihr Name" required
                      value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14, border: `1.5px solid ${error && !form.name ? "#fca5a5" : "#e0e0e0"}`, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#4A4A4A", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Telefon oder E-Mail *</label>
                    <input type="text" name="contact" placeholder="+41 79 ... oder name@mail.ch" required
                      value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14, border: `1.5px solid ${error && !form.contact ? "#fca5a5" : "#e0e0e0"}`, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#4A4A4A", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Leistung (optional)</label>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {services.map(s => (
                        <button type="button" key={s}
                          onClick={() => setForm(p => ({ ...p, service: p.service === s ? "" : s }))}
                          style={{ padding: "6px 12px", borderRadius: 20, cursor: "pointer", border: form.service === s ? "1.5px solid #3D7B4F" : "1.5px solid #e0e0e0", background: form.service === s ? "#f0f7f2" : "#fff", color: form.service === s ? "#3D7B4F" : "#4A4A4A", fontWeight: form.service === s ? 700 : 500, fontSize: 12 }}
                        >{s}</button>
                      ))}
                    </div>
                    <input type="hidden" name="leistung" value={form.service} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#4A4A4A", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" }}>Kurze Beschreibung</label>
                    <textarea name="beschreibung" placeholder="z.B. Umzugsreinigung 3.5-Zi in Lenzburg, Termin nächste Woche, Abgabe am 15. Mai"
                      value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} rows={4}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14, border: "1.5px solid #e0e0e0", outline: "none", resize: "vertical", fontFamily: "'Plus Jakarta Sans', sans-serif", boxSizing: "border-box" }}
                    />
                  </div>
                  <input type="hidden" name="seite" value="Kontakt" />
                  <button type="submit" disabled={fs.submitting}
                    style={{ background: "#E87D3E", color: "#fff", padding: "14px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", border: "none" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  >
                    {fs.submitting ? "Wird gesendet..." : "Offerte anfordern"}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#9ca3af", fontSize: 12 }}>
                    <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />oder
                    <div style={{ flex: 1, height: 1, background: "#e8e8e8" }} />
                  </div>
                  <a href={waKontakt} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#f0f7f2", border: "1.5px solid #c8e6d0", color: "#1a8a40", padding: "12px", borderRadius: 10, textDecoration: "none", fontSize: 14, fontWeight: 600 }}
                  >
                    <MessageCircle size={15} />
                    Direkt per WhatsApp schreiben
                  </a>
                  <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", lineHeight: 1.6 }}>
                    Ihre Daten werden nur zur Bearbeitung Ihrer Anfrage verwendet.<br />Keine Weitergabe an Dritte.
                  </div>
                </div>
              </form>            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "#f0f7f2", border: "2px solid #c8e6d0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <Check size={28} color="#3D7B4F" />
                </div>
                <div style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: 20, color: "#1a1a1a", marginBottom: 8,
                }}>
                  Merci für Ihre Anfrage!
                </div>
                <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, marginBottom: 24 }}>
                  Wir melden uns innerhalb von 2 Stunden.<br />
                  Werktags 8:00–18:00 Uhr.
                </div>
                <a href={waKontakt} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#25D366", color: "#fff",
                    padding: "12px 20px", borderRadius: 10, textDecoration: "none",
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  <MessageCircle size={14} />
                  Trotzdem per WhatsApp schreiben
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Рабочее время */}
        <div style={{
          marginTop: 40, padding: "24px 28px",
          background: "#f9fdf9", border: "1px solid #e8f2eb",
          borderRadius: 14,
          display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af",
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
              Erreichbarkeit
            </div>
            <div style={{ fontSize: 14, color: "#1a1a1a", fontWeight: 600 }}>
              Werktags 8:00–18:00 · Antwort ≤15 Min.
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
              Ausserhalb der Zeiten: automatische WhatsApp-Antwort, wir melden uns am nächsten Morgen 8–9 Uhr.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "WhatsApp", value: "Bevorzugt" },
              { label: "E-Mail", value: CONFIG.EMAIL },
              { label: "Telefon", value: CONFIG.PHONE },
            ].map((item, i) => (
              <div key={i} style={{
                padding: "10px 16px", background: "#fff",
                borderRadius: 8, border: "1px solid #e8e8e8",
                fontSize: 13,
              }}>
                <div style={{ fontWeight: 700, color: "#1a1a1a" }}>{item.label}</div>
                <div style={{ color: "#3D7B4F", fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}

// ============================================================
// СТРАНИЦА /über-uns
// ============================================================
function UeberUnsPage({ setPage }) {
  const values = [
    { icon: "🔍", title: "Transparenz", text: "Festpreise, klare Verträge, keine Überraschungen. Was in der Offerte steht, zahlen Sie." },
    { icon: "📍", title: "Lokalität",   text: "Wir leben und arbeiten im Kanton Aargau. Keine anonyme Plattform — ein lokales Team mit Gesicht." },
    { icon: "✅", title: "Legalität",   text: "Offizielle Rechnung, Versicherung, GAV-konforme Löhne. Kein Schwarzgeld — Ihr Schutz und unserer." },
    { icon: "🤝", title: "Verlässlichkeit", text: "Pünktlich, vollständig, mit Rückmeldefoto. Wenn etwas nicht stimmt, kommen wir zurück." },
  ];

  const registrations = [
    { label: "UID", value: CONFIG.UID },
    // MwSt-Nummer entfernt — noch nicht registriert
    { label: "Betriebshaftpflicht", value: "Versichert bis CHF 5 Mio." },
    { label: "AHV / SUVA", value: "Angemeldet" },
    { label: "GAV Reinigung", value: "Konform ab 1.1.2026" },
  ];

  return (
    <div>
      {/* HERO */}
      <div style={{
        background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)",
        padding: "48px 20px 56px", borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800,
            color: "#1a1a1a", letterSpacing: "-0.8px", marginBottom: 12,
          }}>
            Über Fleissig
          </h1>
          <p style={{ fontSize: 15, color: "#5a6472", maxWidth: 520, lineHeight: 1.7 }}>
            Ein lokales Unternehmen aus dem Kanton Aargau — mit dem Anspruch,
            Reinigung und Gartenpflege so zu machen, wie wir sie selbst
            für unser eigenes Zuhause erwarten würden.
          </p>
        </Container>
      </div>

      <Container style={{ padding: "48px 20px" }}>

        {/* ИСТОРИЯ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 40, marginBottom: 56, alignItems: "center",
        }}>
          <div>
            <SectionTitle>Wer wir sind</SectionTitle>
            <p style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.8, marginBottom: 16 }}>
              Fleissig ist ein Einzelunternehmen (Swiss SMM Balian), das im Kanton Aargau
              Reinigungsdienstleistungen und Gartenpflege anbietet. Wir arbeiten mit
              festen Teammitgliedern, nicht mit wechselndem Gelegenheitspersonal.
            </p>
            <p style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.8, marginBottom: 16 }}>
              Der Name ist Programm: Fleissig bedeutet auf Deutsch fleissig — und genau das
              erwarten unsere Kunden von uns. Kein Versprechen, das wir nicht halten.
            </p>
            <p style={{ fontSize: 14, color: "#4A4A4A", lineHeight: 1.8 }}>
              Unser Büro ist in Seengen — von dort decken wir den gesamten Kanton Aargau ab.
            </p>
          </div>
          {/* Фото команды */}
          <div style={{ borderRadius: 16, overflow: "hidden", height: 260 }}>
            <img
              src="https://i.ibb.co/yFpNH4M0/c1a22c8b-b221-4264-bfbe-35d9ab889670.png"
              alt="Fleissig Team — Reinigung Aargau"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* WERTE */}
        <div style={{ marginBottom: 56 }}>
          <SectionTitle sub="Was uns antreibt — und was Kunden von uns erwarten können.">
            Unsere Werte
          </SectionTitle>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}>
            {values.map((v, i) => (
              <div key={i} style={{
                padding: "24px", background: "#fff",
                borderRadius: 12, border: "1px solid #e8f2eb",
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>{v.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a1a", marginBottom: 6 }}>{v.title}</div>
                <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{v.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ПРОТИВ SCHWARZARBEIT */}
        <div style={{ marginBottom: 56 }}>
          <div style={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d3a2e 100%)",
            borderRadius: 16, padding: "36px 40px",
          }}>
            <div style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: "#fff", fontSize: 20, fontWeight: 800, marginBottom: 12,
            }}>
              Warum wir uns gegen Schwarzarbeit entscheiden
            </div>
            <div style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.8, maxWidth: 580 }}>
              Eine nicht angemeldete Reinigungsperson kostet Sie als Auftraggeber im
              Ernstfall mehr als die gesparten Franken. Bei einer Kontrolle haften
              Sie mit — nicht nur die Reinigungskraft.
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12, marginTop: 24,
            }}>
              {[
                { icon: "📄", text: "Offizielle Rechnung als Beleg" },
                { icon: "🛡", text: "Betriebshaftpflicht bis CHF 5 Mio." },
                { icon: "📋", text: "GAV-konforme Löhne" },
                { icon: "✅", text: "AHV / SUVA-Anmeldung" },
              ].map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "center",
                  background: "rgba(255,255,255,0.07)", borderRadius: 8,
                  padding: "12px 14px",
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 500 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* РЕГИСТРАЦИИ */}
        <div style={{ marginBottom: 56 }}>
          <SectionTitle sub="Alle Registrierungen und Versicherungen auf einen Blick.">
            Rechtliche Angaben
          </SectionTitle>
          <div style={{
            background: "#fff", border: "1px solid #e8e8e8",
            borderRadius: 14, overflow: "hidden",
          }}>
            {registrations.map((r, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between",
                padding: "14px 20px", alignItems: "center",
                borderBottom: i < registrations.length - 1 ? "1px solid #f5f5f5" : "none",
                background: i % 2 === 0 ? "#fff" : "#fafafa",
              }}>
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{r.value}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, fontSize: 12, color: "#9ca3af" }}>
            // UID уже заполнен в CONFIG
          </div>
        </div>

        {/* РЕФЕРАЛЬНАЯ ПРОГРАММА */}
        <div style={{
          background: "#fff9f0", border: "1.5px solid #f5d9c0",
          borderRadius: 16, padding: "32px",
        }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{
                display: "inline-block", background: "#E87D3E", color: "#fff",
                fontSize: 11, fontWeight: 700, padding: "3px 10px",
                borderRadius: 6, marginBottom: 12,
              }}>
                EMPFEHLUNGSPROGRAMM
              </div>
              <div style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 18, color: "#1a1a1a", marginBottom: 8,
              }}>
                Empfehlen Sie uns — und sparen Sie CHF 50
              </div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7 }}>
                Sie empfehlen Fleissig einem Bekannten. Sobald dieser einen Auftrag bucht,
                erhalten <strong>Sie</strong> CHF 50 Rabatt auf Ihre nächste Reinigung —
                und Ihr Bekannter ebenfalls CHF 50 auf seinen ersten Auftrag.
              </div>
            </div>
            <div style={{
              background: "#fff", border: "1px solid #f5d9c0",
              borderRadius: 12, padding: "20px", minWidth: 200,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af",
                textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 12 }}>
                So funktioniert es
              </div>
              {[
                "Ihr persönlicher Code: FL-XXXX",
                "Weitergeben an Bekannte",
                "Code bei Anfrage angeben",
                "Beide erhalten CHF 50",
              ].map((s, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, alignItems: "flex-start",
                  fontSize: 13, color: "#4A4A4A", marginBottom: 7,
                }}>
                  <span style={{
                    width: 20, height: 20, borderRadius: "50%",
                    background: "#E87D3E", color: "#fff",
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{i + 1}</span>
                  {s}
                </div>
              ))}
              <div style={{ marginTop: 14 }}>
                <a
                  href={`https://wa.me/${CONFIG.WA_NUMBER}?text=${encodeURIComponent("Grüezi Fleissig, ich möchte einen persönlichen Empfehlungscode erhalten. Mein Name: ")}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "#25D366", color: "#fff",
                    padding: "8px 14px", borderRadius: 8,
                    fontSize: 13, fontWeight: 600, textDecoration: "none",
                  }}
                >
                  <MessageCircle size={14} />
                  Code anfragen
                </a>
              </div>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}

// ============================================================
// ПРАВОВЫЕ СТРАНИЦЫ — один компонент, три варианта контента
// ============================================================
function LegalPage({ type }) {
  const content = {
    impressum: {
      title: "Impressum",
      sections: [
        {
          heading: "Anbieter",
          text: `Swiss SMM Balian\nEinzelunternehmen\n${CONFIG.ADDRESS}\nKanton Aargau, Schweiz`,
        },
        {
          heading: "Kontakt",
          text: `E-Mail: ${CONFIG.EMAIL}\nTelefon: ${CONFIG.PHONE}`,
        },
        {
          heading: "Handelsregister / UID",
          text: `${CONFIG.UID}`,
        },
        {
          heading: "Haftungsausschluss",
          text: "Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.",
        },
        {
          heading: "Urheberrecht",
          text: "Die auf dieser Website veröffentlichten Inhalte unterliegen dem schweizerischen Urheberrecht. Jede Art von Nutzung bedarf der Genehmigung des Rechtsinhabers.",
        },
      ],
    },
    datenschutz: {
      title: "Datenschutzerklärung",
      intro: "Gemäss revDSG (Schweiz, in Kraft seit 1. September 2023).",
      sections: [
        {
          heading: "Verantwortliche Stelle",
          text: `Swiss SMM Balian · ${CONFIG.ADDRESS}\n${CONFIG.EMAIL}`,
        },
        {
          heading: "Welche Daten wir erheben",
          text: "Name, Telefonnummer oder E-Mail-Adresse, die Sie uns freiwillig per Kontaktformular, WhatsApp oder E-Mail übermitteln. Fotos, die Sie uns zur Offertenerstellung schicken. Technische Daten (IP-Adresse, Browser) über Google Analytics 4 und Meta Pixel — nur mit Ihrer Einwilligung über den Cookie-Banner.",
        },
        {
          heading: "Zweck der Datenbearbeitung",
          text: "Bearbeitung von Anfragen und Aufträgen. Erstellung von Offerten. Kommunikation per WhatsApp, E-Mail oder Telefon. Analyse der Website-Nutzung zur Verbesserung unseres Angebots (nur mit Einwilligung).",
        },
        {
          heading: "Weitergabe an Dritte",
          text: "Ihre Daten werden nicht verkauft. Weitergabe nur an Dienstleister, die für die Auftragserfüllung notwendig sind (z.B. WhatsApp Business API, Google Analytics, Meta Pixel) — jeweils mit eigener Datenschutzerklärung.",
        },
        {
          heading: "Speicherdauer",
          text: "Anfragedaten werden nach Abschluss des Auftrags und Ablauf der gesetzlichen Aufbewahrungsfristen gelöscht (in der Regel 10 Jahre für Buchhaltungsunterlagen).",
        },
        {
          heading: "Ihre Rechte",
          text: "Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Bearbeitung Ihrer Daten. Wenden Sie sich dazu per E-Mail an uns.",
        },
        {
          heading: "Cookies",
          text: "Wir verwenden technisch notwendige Cookies sowie — nach Ihrer Einwilligung — Analyse-Cookies (Google Analytics 4) und Marketing-Cookies (Meta Pixel). Sie können Ihre Einwilligung jederzeit widerrufen.",
        },
      ],
    },
    agb: {
      title: "Allgemeine Geschäftsbedingungen (AGB)",
      intro: "Stand: 2026. Diese AGB gelten für alle Aufträge von Swiss SMM Balian (Fleissig).",
      sections: [
        {
          heading: "1. Geltungsbereich",
          text: "Diese AGB gelten für alle Reinigungsdienstleistungen und Gartenpflegeaufträge, die über die Website fleissig.ch, per WhatsApp, E-Mail oder Telefon erteilt werden.",
        },
        {
          heading: "2. Offerte und Vertragsabschluss",
          text: "Eine verbindliche Offerte wird nach Prüfung von Fotos oder Besichtigung erstellt. Der Vertrag kommt mit der schriftlichen Auftragsbestätigung (per WhatsApp oder E-Mail) zustande.",
        },
        {
          heading: "3. Preise und Zahlung",
          text: "Alle Preise sind Festpreise in CHF. Wir stellen offizielle Rechnungen aus. Zahlung per TWINT oder Banküberweisung innerhalb von 10 Tagen nach Rechnungsstellung. Barzahlung wird nicht akzeptiert.",
        },
        {
          heading: "4. Abgabegarantie (Endreinigung)",
          text: "Bei Umzugsreinigungen mit Abgabegarantie: Wird bei der Wohnungsabnahme eine Beanstandung festgestellt, kommen wir kostenlos zurück — innerhalb von 48 Stunden nach Meldung. Die Garantie erlischt, wenn der Kunde die Wohnung nach unserer Reinigung selbst benutzt hat.",
        },
        {
          heading: "5. Stornierung",
          text: "Stornierung bis 48 Stunden vor dem Termin: kostenlos. Stornierung weniger als 48 Stunden vorher: 50% des Auftragswertes. Stornierung am Einsatztag: 100%.",
        },
        {
          heading: "6. Haftung",
          text: "Wir haften für Schäden, die durch unser Team verursacht werden, im Rahmen unserer Betriebshaftpflichtversicherung bis CHF 5 Mio. Schäden sind umgehend — noch am Einsatztag — zu melden.",
        },
        {
          heading: "7. Datenschutz",
          text: "Es gilt unsere Datenschutzerklärung gemäss revDSG.",
        },
        {
          heading: "8. Anwendbares Recht und Gerichtsstand",
          text: "Es gilt Schweizer Recht. Gerichtsstand ist Kanton Aargau.",
        },
        {
          heading: "Hinweis",
          text: "Diese AGB wurden nach bestem Wissen erstellt. Vor der Nutzung für verbindliche Aufträge empfehlen wir eine Prüfung durch einen Treuhänder.",
        },
      ],
    },
  };

  const page = content[type];

  return (
    <div>
      <div style={{
        background: "#f9fdf9", padding: "40px 20px 48px",
        borderBottom: "1px solid #e8f2eb",
      }}>
        <Container>
          {page.intro && (
            <div style={{
              display: "inline-block", background: "#f0f7f2",
              border: "1px solid #c8e6d0", color: "#3D7B4F",
              fontSize: 12, fontWeight: 600, padding: "4px 12px",
              borderRadius: 6, marginBottom: 12,
            }}>
              {page.intro}
            </div>
          )}
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
            color: "#1a1a1a", letterSpacing: "-0.5px",
          }}>
            {page.title}
          </h1>
        </Container>
      </div>
      <Container style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: 720 }}>
          {page.sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              <div style={{
                fontWeight: 700, fontSize: 15, color: "#1a1a1a",
                marginBottom: 8, paddingBottom: 8,
                borderBottom: "1px solid #f0f0f0",
              }}>
                {s.heading}
              </div>
              <div style={{
                fontSize: 14, color: "#4A4A4A", lineHeight: 1.8,
                whiteSpace: "pre-line",
              }}>
                {s.text}
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 40, padding: "16px 20px",
            background: "#f9fdf9", border: "1px solid #e8f2eb",
            borderRadius: 10, fontSize: 13, color: "#6b7280",
          }}>
            Fragen? Schreiben Sie uns:{" "}
            <a href={`mailto:${CONFIG.EMAIL}`}
              style={{ color: "#3D7B4F", fontWeight: 600 }}>
              {CONFIG.EMAIL}
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}

// ============================================================
// СТРАНИЦА /fensterreinigung
// ============================================================
function FensterreinigungPage() {
  const preise = [
    { size: "2.5-Zi", price: 320 },
    { size: "3.5-Zi", price: 420 },
    { size: "4.5-Zi", price: 520 },
    { size: "5.5-Zi", price: 640 },
    { size: "EFH",    price: "nach Offerte" },
  ];
  const faqItems = [
    { q: "Was ist inbegriffen?", a: "Fenster beidseitig, Storen innen und aussen, Fensterrahmen und Simse. Auf Wunsch auch Rollläden und Velux-Fenster." },
    { q: "Wie oft sollte man Fenster reinigen?", a: "Empfohlen 2× pro Jahr — Frühjahr und Herbst. Im Abo günstiger." },
    { q: "Brauche ich Leitern oder Gerüste?", a: "Für normale Wohnungen nein. Bei hohen Fenstern (ab 4. Stock) bitte bei Anfrage erwähnen." },
    { q: "Kann ich Fensterreinigung mit Umzugsreinigung kombinieren?", a: "Ja — Fensterreinigung ist bereits im Paket Komplett enthalten. Separat buchbar ab den oben genannten Preisen." },
  ];
  return (
    <div>
      <div style={{ background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)", padding: "56px 20px 64px", borderBottom: "1px solid #e8f2eb" }}>
        <Container>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.8px", lineHeight: 1.15, maxWidth: 620, marginBottom: 16 }}>
            Fensterreinigung im Aargau —{" "}
            <span style={{ color: "#3D7B4F" }}>inkl. Storen und Rahmen.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#5a6472", lineHeight: 1.65, maxWidth: 500, marginBottom: 28 }}>
            Pauschalpreise je nach Wohnungsgrösse. Kein Aufmass, kein Besichtigungstermin — schicken Sie uns Fotos.
          </p>
          <WhatsAppButton service="fenster" label="Offerte per WhatsApp" />
        </Container>
      </div>
      <Container style={{ padding: "56px 20px" }}>
        <SectionTitle sub="Festpreise inkl. Storen, Rahmen und Simse.">Preise Fensterreinigung</SectionTitle>
        <div style={{ maxWidth: 500 }}>
          {preise.map((p, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", background: i % 2 === 0 ? "#f9fdf9" : "#fff", borderRadius: 8, marginBottom: 4, fontSize: 14 }}>
              <span style={{ fontWeight: 600 }}>{p.size}</span>
              <span style={{ fontWeight: 700, color: "#3D7B4F" }}>{typeof p.price === "number" ? `CHF ${p.price} pauschal` : p.price}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280", padding: "0 4px" }}>
            Inkl. Fenster beidseitig · Storen innen/aussen · Rahmen und Simse
          </div>
        </div>
        <div style={{ marginTop: 48 }}>
          <SectionTitle sub="Häufige Fragen zur Fensterreinigung.">Häufige Fragen</SectionTitle>
          <div style={{ maxWidth: 700 }}><FAQAccordion items={faqItems} /></div>
        </div>
        <div style={{ marginTop: 48, background: "#f9fdf9", borderRadius: 14, padding: "32px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1a1a1a", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Jetzt Offerte anfragen</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>3 Fotos Ihrer Fenster — Offerte innerhalb von 2 Stunden.</div>
          </div>
          <WhatsAppButton service="fenster" label="Offerte per WhatsApp" />
        </div>
      </Container>
    </div>
  );
}

// ============================================================
// СТРАНИЦА /baureinigung
// ============================================================
function BaureinigungPage() {
  const faqItems = [
    { q: "Was ist Baureinigung?", a: "Reinigung nach Renovation oder Neubau — Baustaub, Klebereste, Farbtupfer auf Böden und Fenstern, Mörtelreste. Intensiver als eine normale Reinigung." },
    { q: "Wie läuft die Preisfindung ab?", a: "Schicken Sie uns Fotos und die Fläche in m². Wir berechnen ab CHF 13/m² je nach Verschmutzungsgrad und machen Ihnen eine verbindliche Offerte." },
    { q: "Wie schnell können Sie?", a: "Meistens 3–7 Tage. Bei dringenden Abnahmeterminen bitte direkt fragen." },
    { q: "Kommen Sie auch zu grösseren Objekten?", a: "Ja — Mehrfamilienhäuser und Gewerbebauten auf Anfrage. Offerte nach Besichtigung oder Fotos." },
  ];
  return (
    <div>
      <div style={{ background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)", padding: "56px 20px 64px", borderBottom: "1px solid #e8f2eb" }}>
        <Container>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.8px", lineHeight: 1.15, maxWidth: 620, marginBottom: 16 }}>
            Baureinigung im Aargau —{" "}
            <span style={{ color: "#3D7B4F" }}>nach Renovation sauber.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#5a6472", lineHeight: 1.65, maxWidth: 500, marginBottom: 28 }}>
            Baustaub, Klebereste, Farbtupfer — wir machen das Objekt abnahmebereit.
            Ab CHF 13/m², Offerte nach Fotos.
          </p>
          <WhatsAppButton service="general" label="Fotos senden & Offerte erhalten" />
        </Container>
      </div>
      <Container style={{ padding: "56px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 48 }}>
          {[
            { icon: "🏗", title: "Nach Renovation", text: "Baustaub von allen Oberflächen, Böden, Decken, Fenstern." },
            { icon: "🪟", title: "Fenster & Rahmen", text: "Klebereste von Folien, Farbtupfer, Mörtelreste auf Glas." },
            { icon: "🧹", title: "Böden & Fliesen", text: "Grober Schmutz, Mörtelreste, Baustaub aus allen Ritzen." },
            { icon: "📋", title: "Abnahmebereit", text: "Wir bereiten das Objekt für Abnahme oder Einzug vor." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "24px", background: "#f9fdf9", borderRadius: 12, border: "1px solid #e8f2eb" }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{item.text}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#fff9f0", border: "1px solid #f5d9c0", borderRadius: 12, padding: "20px 24px", marginBottom: 48, fontSize: 14, color: "#92400e" }}>
          <strong>Preisindikation:</strong> ab CHF 13/m² je nach Verschmutzungsgrad. Starke Verschmutzung oder Sonderarbeiten werden separat offertiert.
        </div>
        <SectionTitle sub="Häufige Fragen zur Baureinigung.">Häufige Fragen</SectionTitle>
        <div style={{ maxWidth: 700 }}><FAQAccordion items={faqItems} /></div>
        <div style={{ marginTop: 48, background: "#f9fdf9", borderRadius: 14, padding: "32px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1a1a1a", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Offerte anfragen</div>
            <div style={{ fontSize: 14, color: "#6b7280" }}>Fotos + m² Angabe genügen für eine verbindliche Offerte.</div>
          </div>
          <WhatsAppButton service="general" label="Fotos senden per WhatsApp" />
        </div>
      </Container>
    </div>
  );
}

// ============================================================
// СТРАНИЦА /bueroreinigung
// ============================================================
function BueroreinigungPage() {
  const faqItems = [
    { q: "Wann kommen Sie?", a: "Abends ab 18 Uhr oder am Wochenende — damit Ihr Betrieb nicht gestört wird." },
    { q: "Wie oft?", a: "2–3× pro Woche ist Standard. Auch 1× wöchentlich oder täglich möglich." },
    { q: "Was wird gereinigt?", a: "Böden, Oberflächen, Küche/Kaffeeecke, WC, Eingangsbereich. Umfang nach Absprache." },
    { q: "Brauchen wir einen langen Vertrag?", a: "Nein — monatlich kündbar. Wir starten mit einer Probezeit von 4 Wochen." },
    { q: "Wie gross muss das Büro sein?", a: "Wir reinigen Büros ab 5 Mitarbeitern. Kleinstbüros auf Anfrage." },
  ];
  return (
    <div>
      <div style={{ background: "linear-gradient(160deg, #f0f7f2 0%, #fff 55%)", padding: "56px 20px 64px", borderBottom: "1px solid #e8f2eb" }}>
        <Container>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.8px", lineHeight: 1.15, maxWidth: 620, marginBottom: 16 }}>
            Büroreinigung im Aargau —{" "}
            <span style={{ color: "#3D7B4F" }}>abends, zuverlässig, legal.</span>
          </h1>
          <p style={{ fontSize: 16, color: "#5a6472", lineHeight: 1.65, maxWidth: 500, marginBottom: 28 }}>
            2–3× pro Woche, abends nach Büroschluss. Offizielle Rechnung, versichert, angemeldete Mitarbeiter. Offerte nach Mass.
          </p>
          <WhatsAppButton service="general" label="Offerte anfragen per WhatsApp" />
          <div style={{ marginTop: 16, fontSize: 12, color: "#8a95a0", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>✓ Monatlich kündbar</span>
            <span>✓ Offizielle Rechnung</span>
            <span>✓ Angemeldete Mitarbeiter</span>
          </div>
        </Container>
      </div>
      <Container style={{ padding: "56px 20px" }}>
        <SectionTitle sub="Was wir für Ihr Büro tun.">Leistungen</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, marginBottom: 48 }}>
          {[
            "Böden saugen und wischen",
            "Schreibtische und Oberflächen",
            "Küche / Kaffeeecke",
            "WC und Sanitäranlagen",
            "Eingangsbereich und Empfang",
            "Mülleimer leeren",
            "Fenster innen (auf Wunsch)",
            "Treppenhäuser",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 14px", background: "#f9fdf9", borderRadius: 8, border: "1px solid #e8f2eb", fontSize: 13 }}>
              <Check size={13} color="#3D7B4F" style={{ flexShrink: 0 }} />{item}
            </div>
          ))}
        </div>
        <SectionTitle sub="Häufige Fragen zur Büroreinigung.">Häufige Fragen</SectionTitle>
        <div style={{ maxWidth: 700 }}><FAQAccordion items={faqItems} /></div>
        <div style={{ marginTop: 48, background: "#1a1a1a", borderRadius: 14, padding: "32px", display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#fff", marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Offerte für Ihr Büro</div>
            <div style={{ fontSize: 14, color: "#9ca3af" }}>Fläche in m², Anzahl Mitarbeiter, gewünschte Häufigkeit — das reicht für eine Offerte.</div>
          </div>
          <WhatsAppButton service="general" label="Offerte anfragen" />
        </div>
      </Container>
    </div>
  );
}

// ============================================================
// РОУТЕР — переключение страниц
// ============================================================
export default function App() {
  const [page, setPage] = useState("home");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // TODO: gtag('event','page_view', {page_path: page})
    // TODO: fbq('track','PageView')
  }, [page]);

  const renderPage = () => {
    switch (page) {
      case "home":               return <HomePage setPage={setPage} />;
      case "umzugsreinigung":    return <UmzugsreinigungPage setPage={setPage} />;
      case "unterhaltsreinigung":return <UnterhaltsreinigungPage setPage={setPage} />;
      case "gartenpflege":       return <GartenpflegePage />;
      case "preise":             return <PreisePage setPage={setPage} />;
      case "fensterreinigung":   return <FensterreinigungPage />;
      case "baureinigung":       return <BaureinigungPage />;
      case "bueroreinigung":     return <BueroreinigungPage />;
      case "faq":                return <FAQPage />;
      case "kontakt":            return <KontaktPage />;
      case "über-uns":           return <UeberUnsPage setPage={setPage} />;
      case "impressum":          return <LegalPage type="impressum" />;
      case "datenschutz":        return <LegalPage type="datenschutz" />;
      case "agb":                return <LegalPage type="agb" />;
      default:                   return <HomePage setPage={setPage} />;
    }
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#fff", minHeight: "100vh" }}>
      <OfferBanner />
      <Nav currentPage={page} setPage={setPage} />
      <main>{renderPage()}</main>
      <Footer setPage={setPage} />
      <FloatingWA />
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  MessageCircle,
  Phone,
  ShieldCheck,
  ReceiptText,
  MapPin,
  Clock3,
  Home,
  Truck,
  Leaf,
  ChevronRight,
  Star,
} from "lucide-react";

const CONFIG = {
  whatsapp: "41779588526",
  phone: "+41 79 685 09 80",
  email: "fleissig.reinigungen@gmail.com",
};

const waLink = (service = "Reinigung") => {
  const text = `Grüezi! Ich interessiere mich für ${service}. Ich sende gleich Fotos oder ein kurzes Video und möchte eine unverbindliche Offerte erhalten.`;
  return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;
};

const trackLead = (name) => {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion_event_contact", { contact_type: name });
  }
  if (typeof window.fbq === "function") {
    window.fbq("track", "Lead", { content_name: name });
  }
};

function WhatsAppButton({ label = "Kostenlose Offerte per WhatsApp", service = "Reinigung", secondary = false }) {
  return (
    <a
      className={secondary ? "btn btn-secondary" : "btn btn-whatsapp"}
      href={waLink(service)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackLead(`whatsapp_${service.toLowerCase()}`)}
    >
      <MessageCircle size={19} />
      {label}
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Reinigung", "#leistungen"],
    ["Umzugsreinigung", "#umzug"],
    ["Gartenpflege", "#leistungen"],
    ["Über uns", "#vertrauen"],
    ["Kontakt", "#kontakt"],
  ];

  return (
    <header className="header">
      <div className="shell header-inner">
        <a href="#start" className="brand" aria-label="Fleissig Startseite">
          <img src="/logo.png" alt="Fleissig Reinigung" />
        </a>
        <nav className="desktop-links" aria-label="Hauptnavigation">
          {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <a className="header-wa" href={waLink()} target="_blank" rel="noopener noreferrer" onClick={() => trackLead("whatsapp_header")}> 
          <MessageCircle size={17} /> Offerte
        </a>
        <button className="menu-button" aria-label="Menü öffnen" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="mobile-menu">
          <div className="shell">
            {links.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>
            ))}
            <WhatsAppButton />
            <a className="btn btn-secondary" href={`tel:${CONFIG.phone.replace(/\s/g, "")}`} onClick={() => trackLead("phone_mobile_menu")}>
              <Phone size={18} /> Deutsch sprechen: {CONFIG.phone}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function TrustStrip() {
  const items = [
    [ShieldCheck, "Versichert bis CHF 2 Mio."],
    [ReceiptText, "Offizielle Rechnung"],
    [MapPin, "Lokales Team im Aargau"],
    [Clock3, "Schnelle Antwort"],
  ];
  return (
    <div className="trust-strip">
      <div className="shell trust-grid">
        {items.map(([Icon, text]) => (
          <div className="trust-item" key={text}><Icon size={20} /><span>{text}</span></div>
        ))}
      </div>
    </div>
  );
}

function BeforeAfter() {
  return (
    <section className="section proof" id="resultate">
      <div className="shell">
        <div className="section-heading compact">
          <span className="eyebrow">Echte Ergebnisse</span>
          <h2>Sauber, wo man den Unterschied sieht.</h2>
          <p>Keine Stockfotos. Diese Arbeiten haben wir selbst im Kanton Aargau ausgeführt.</p>
        </div>
        <div className="proof-grid">
          <img src="/photo_2026-05-08_11-04-40.jpg" alt="Duschkabine vor und nach der Reinigung" loading="lazy" />
          <img src="/photo_2026-05-08_11-04-40 (2).jpg" alt="Kochfeld vor und nach der Reinigung" loading="lazy" />
        </div>
      </div>
    </section>
  );
}

function Services() {
  const services = [
    {
      icon: Home,
      title: "Wohnungsreinigung",
      price: "CHF 55 / Std.",
      text: "Einmalig oder regelmässig. Reinigungsmittel inklusive.",
      detail: "2er-Team: CHF 100 pro Einsatzstunde",
      service: "Wohnungsreinigung",
    },
    {
      icon: Truck,
      title: "Umzugsreinigung",
      price: "Preisgarantie nach Fotos",
      text: "Verbindliche Offerte nach Video- oder Fotoprüfung.",
      detail: "Abgabegarantie auf Wunsch inklusive",
      service: "Umzugsreinigung",
      id: "umzug",
    },
    {
      icon: Leaf,
      title: "Gartenpflege",
      price: "CHF 65 / Mitarbeiterstunde",
      text: "Rasen, Hecken, Unkraut und saisonale Pflege.",
      detail: "Eigene Maschinen · Entsorgung nach Aufwand",
      service: "Gartenpflege",
    },
  ];

  return (
    <section className="section services" id="leistungen">
      <div className="shell">
        <div className="section-heading">
          <span className="eyebrow">Unsere Schwerpunkte</span>
          <h2>Was dürfen wir für Sie erledigen?</h2>
          <p>Klare Stundenpreise für laufende Arbeiten. Ein verbindlicher Preis nach Prüfung bei umfangreichen Aufträgen.</p>
        </div>
        <div className="service-grid">
          {services.map(({ icon: Icon, title, price, text, detail, service, id }) => (
            <article className="service-card" key={title} id={id}>
              <div className="service-icon"><Icon size={25} /></div>
              <h3>{title}</h3>
              <div className="service-price">{price}</div>
              <p>{text}</p>
              <div className="service-detail">{detail}</div>
              <WhatsAppButton label="Jetzt anfragen" service={service} />
            </article>
          ))}
        </div>
        <div className="other-services">
          Auch Fenster-, Büro- oder Baureinigung benötigt? <a href={waLink("einer weiteren Reinigungsleistung")} target="_blank" rel="noopener noreferrer">Kurz auf WhatsApp anfragen <ChevronRight size={15} /></a>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const benefits = [
    ["Schnell erreichbar", "WhatsApp für Offerten, deutschsprachige Beratung per Telefon."],
    ["Sauber kalkuliert", "Vor Beginn wissen Sie, ob nach Stunden oder zum bestätigten Preis abgerechnet wird."],
    ["Legal & versichert", "Offizielle Rechnung und Betriebshaftpflicht bis CHF 2 Mio."],
    ["Lokal im Aargau", "Basis in Seengen. Einsätze im ganzen Kanton Aargau."],
  ];
  return (
    <section className="section why" id="vertrauen">
      <div className="shell why-layout">
        <div className="section-heading compact">
          <span className="eyebrow">Warum Fleissig?</span>
          <h2>Einfach buchen. Zuverlässig erledigt.</h2>
          <p>Wir versprechen nicht alles. Wir antworten schnell, vereinbaren den Umfang klar und erledigen die Arbeit ordentlich.</p>
          <WhatsAppButton label="Fotos senden & Offerte erhalten" />
        </div>
        <div className="benefit-list">
          {benefits.map(([title, text], i) => (
            <div className="benefit" key={title}><span>{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Review() {
  return (
    <section className="section review-section">
      <div className="shell">
        <div className="review-card">
          <div className="stars" aria-label="5 von 5 Sternen">{[1,2,3,4,5].map(n => <Star key={n} size={20} fill="currentColor" />)}</div>
          <blockquote>«Herzlichen Dank 😍, ihr habt SUPER ARBEIT geleistet 👏🏼👏🏼👏🏼 Mache sehr gerne für Euch Werbung 🥰»</blockquote>
          <strong>Daniela & Martin</strong>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="section final-cta" id="kontakt">
      <div className="shell final-card">
        <div>
          <span className="eyebrow light">Kostenlose Anfrage</span>
          <h2>Schicken Sie uns Fotos.<br />Wir kümmern uns um den Rest.</h2>
          <p>WhatsApp für Fotos und schriftliche Offerten. Für ein Gespräch auf Deutsch erreichen Sie unseren Mitarbeiter telefonisch.</p>
        </div>
        <div className="final-actions">
          <WhatsAppButton label="Offerte per WhatsApp erhalten" />
          <a className="btn btn-call" href={`tel:${CONFIG.phone.replace(/\s/g, "")}`} onClick={() => trackLead("phone_final")}><Phone size={19} /> {CONFIG.phone}</a>
          <small>Werktags 8:00–18:00 · Antwort in der Regel innerhalb von 15 Minuten</small>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="shell footer-inner">
        <div><strong>Fleissig</strong><span>Reinigung & Gartenpflege im Kanton Aargau</span></div>
        <div><span>Swiss SMM Balian Einzelunternehmen</span><span>CHE-461.009.759</span><a href={`mailto:${CONFIG.email}`}>{CONFIG.email}</a></div>
      </div>
    </footer>
  );
}

export default function AppV2() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => { document.documentElement.style.scrollBehavior = ""; };
  }, []);

  return (
    <div id="start">
      <Header />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Reinigung im Kanton Aargau</span>
              <h1>Ihre Reinigung.<br /><em>Einfach per WhatsApp.</em></h1>
              <p>Wohnungsreinigung ab CHF 55 pro Stunde. Senden Sie Fotos oder ein kurzes Video und erhalten Sie schnell eine klare Offerte.</p>
              <div className="hero-actions">
                <WhatsAppButton label="Kostenlose Offerte erhalten" />
                <a className="btn btn-secondary" href={`tel:${CONFIG.phone.replace(/\s/g, "")}`} onClick={() => trackLead("phone_hero")}><Phone size={19} /> Deutsch sprechen</a>
              </div>
              <div className="hero-note"><Clock3 size={16} /> Antwort in der Regel innerhalb von 15 Minuten · werktags 8–18 Uhr</div>
            </div>
            <div className="hero-visual">
              <img src="/photo_2026-05-08_11-04-40.jpg" alt="Fleissig Reinigung vorher und nachher" />
              <div className="floating-card"><strong>CHF 55 / Std.</strong><span>Reinigungsmittel inklusive</span></div>
            </div>
          </div>
        </section>
        <TrustStrip />
        <BeforeAfter />
        <Services />
        <WhyUs />
        <Review />
        <Contact />
      </main>
      <Footer />
      <a className="floating-wa" href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp öffnen" onClick={() => trackLead("whatsapp_floating")}><MessageCircle size={25} /></a>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root { --green:#3d7b4f; --green-dark:#275c39; --pale:#f1f7f2; --ink:#171917; --muted:#68717d; --line:#e3e9e4; --wa:#25d366; }
*{box-sizing:border-box} body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;color:var(--ink);background:#fff}.shell{width:min(1120px,calc(100% - 40px));margin:0 auto}.header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.header-inner{height:72px;display:flex;align-items:center;gap:28px}.brand img{width:54px;height:54px;object-fit:contain;display:block}.desktop-links{display:flex;align-items:center;gap:24px;margin-left:auto}.desktop-links a{font-size:14px;color:#3f4742;text-decoration:none;font-weight:600}.desktop-links a:hover{color:var(--green)}.header-wa{display:inline-flex;align-items:center;gap:7px;background:var(--green);color:#fff;text-decoration:none;border-radius:10px;padding:10px 15px;font-weight:700;font-size:14px}.menu-button{display:none;border:1px solid var(--line);background:#fff;border-radius:10px;padding:9px;cursor:pointer}.mobile-menu{border-top:1px solid var(--line);background:#fff;padding:14px 0 22px}.mobile-menu .shell{display:flex;flex-direction:column;gap:8px}.mobile-menu a:not(.btn){padding:12px 4px;color:var(--ink);text-decoration:none;font-size:17px}.mobile-menu .btn{margin-top:6px}.hero{background:linear-gradient(145deg,#eef7f0 0%,#fff 68%);padding:74px 0 68px}.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:68px;align-items:center}.eyebrow{display:inline-block;color:var(--green);text-transform:uppercase;letter-spacing:.1em;font-size:12px;font-weight:800;margin-bottom:14px}.hero h1{font-size:clamp(42px,6vw,70px);line-height:1.04;letter-spacing:-.045em;margin:0 0 22px}.hero h1 em{font-style:normal;color:var(--green)}.hero-copy>p{font-size:18px;color:var(--muted);line-height:1.65;max-width:600px;margin:0 0 28px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:50px;padding:12px 20px;border-radius:11px;text-decoration:none;font-size:15px;font-weight:750;border:2px solid transparent;transition:.18s ease}.btn:hover{transform:translateY(-1px)}.btn-whatsapp{background:var(--wa);color:#fff;box-shadow:0 8px 22px rgba(37,211,102,.22)}.btn-secondary{color:var(--green);border-color:var(--green);background:#fff}.btn-call{background:#fff;color:var(--green-dark)}.hero-note{display:flex;align-items:center;gap:8px;color:#7a837f;font-size:12px;margin-top:18px}.hero-visual{position:relative}.hero-visual img{width:100%;display:block;border-radius:22px;box-shadow:0 18px 50px rgba(25,70,42,.16)}.floating-card{position:absolute;left:-24px;bottom:24px;background:#fff;border-radius:14px;padding:16px 20px;box-shadow:0 10px 28px rgba(0,0,0,.14);display:flex;flex-direction:column}.floating-card strong{font-size:20px;color:var(--green)}.floating-card span{font-size:12px;color:var(--muted);margin-top:3px}.trust-strip{border-top:1px solid var(--line);border-bottom:1px solid var(--line);background:#fff}.trust-grid{display:grid;grid-template-columns:repeat(4,1fr);padding:22px 0}.trust-item{display:flex;align-items:center;justify-content:center;gap:9px;font-size:13px;font-weight:650;color:#465048;border-right:1px solid var(--line)}.trust-item:last-child{border-right:0}.trust-item svg{color:var(--green)}.section{padding:82px 0}.section-heading{max-width:720px;margin-bottom:38px}.section-heading.compact{margin-bottom:30px}.section-heading h2{font-size:clamp(31px,4vw,48px);line-height:1.13;letter-spacing:-.035em;margin:0 0 13px}.section-heading p{color:var(--muted);font-size:16px;line-height:1.65;margin:0}.proof{background:#fff}.proof-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}.proof-grid img{width:100%;border-radius:18px;display:block;box-shadow:0 8px 28px rgba(0,0,0,.09)}.services{background:var(--pale)}.service-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.service-card{background:#fff;border:1px solid #dfe9e1;border-radius:18px;padding:26px;display:flex;flex-direction:column;min-height:390px}.service-icon{width:48px;height:48px;border-radius:13px;background:#e9f4ec;display:grid;place-items:center;color:var(--green);margin-bottom:22px}.service-card h3{font-size:21px;margin:0 0 10px}.service-price{font-size:21px;font-weight:800;color:var(--green);margin-bottom:12px}.service-card p{color:var(--muted);line-height:1.55;margin:0 0 12px}.service-detail{font-size:12px;color:#7c867f;border-top:1px solid var(--line);padding-top:14px;margin:0 0 22px}.service-card .btn{margin-top:auto;width:100%}.other-services{text-align:center;margin-top:26px;color:var(--muted);font-size:14px}.other-services a{display:inline-flex;align-items:center;color:var(--green);font-weight:700;text-decoration:none}.why{background:#fff}.why-layout{display:grid;grid-template-columns:.9fr 1.1fr;gap:70px;align-items:start}.benefit-list{display:flex;flex-direction:column;gap:13px}.benefit{display:flex;gap:18px;border:1px solid var(--line);border-radius:15px;padding:20px}.benefit>span{width:34px;height:34px;border-radius:10px;background:var(--green);color:#fff;display:grid;place-items:center;font-weight:800;flex:0 0 auto}.benefit h3{font-size:16px;margin:1px 0 5px}.benefit p{font-size:13px;color:var(--muted);line-height:1.55;margin:0}.review-section{background:#fafcfa;padding-top:62px;padding-bottom:62px}.review-card{max-width:780px;margin:0 auto;text-align:center}.stars{display:flex;justify-content:center;gap:3px;color:#e5a33f;margin-bottom:18px}.review-card blockquote{font-size:clamp(20px,3vw,30px);font-weight:600;line-height:1.45;margin:0 0 18px}.review-card strong{color:var(--green)}.final-cta{background:var(--green-dark);color:#fff}.final-card{display:grid;grid-template-columns:1fr .8fr;gap:60px;align-items:center}.eyebrow.light{color:#bfe4c9}.final-card h2{font-size:clamp(32px,4.5vw,52px);line-height:1.12;letter-spacing:-.035em;margin:0 0 16px}.final-card p{color:#d5e6da;line-height:1.65;margin:0}.final-actions{display:flex;flex-direction:column;gap:11px}.final-actions small{color:#bdd0c2;text-align:center;font-size:11px}footer{background:#17251c;color:#fff;padding:30px 0}.footer-inner{display:flex;justify-content:space-between;gap:30px}.footer-inner>div{display:flex;flex-direction:column;gap:5px}.footer-inner span,.footer-inner a{color:#aebbb2;font-size:12px;text-decoration:none}.floating-wa{position:fixed;right:18px;bottom:18px;width:58px;height:58px;border-radius:50%;background:var(--wa);color:#fff;display:none;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.22);z-index:45}
@media(max-width:900px){.desktop-links,.header-wa{display:none}.menu-button{display:flex;margin-left:auto}.hero{padding:46px 0 50px}.hero-grid{grid-template-columns:1fr;gap:34px}.hero-visual{max-width:620px}.floating-card{left:14px}.trust-grid{grid-template-columns:1fr 1fr}.trust-item{justify-content:flex-start;padding:12px 8px;border-right:0}.service-grid{grid-template-columns:1fr}.service-card{min-height:0}.why-layout,.final-card{grid-template-columns:1fr;gap:34px}.floating-wa{display:grid}}
@media(max-width:620px){.shell{width:min(100% - 30px,1120px)}.header-inner{height:68px}.brand img{width:50px;height:50px}.hero h1{font-size:42px}.hero-copy>p{font-size:16px}.hero-actions{flex-direction:column}.hero-actions .btn{width:100%}.hero-visual img{border-radius:16px}.floating-card{bottom:12px;padding:12px 15px}.floating-card strong{font-size:17px}.trust-grid{padding:12px 0}.trust-item{font-size:11px}.section{padding:62px 0}.section-heading{margin-bottom:28px}.proof-grid{grid-template-columns:1fr;gap:14px}.service-card{padding:22px}.footer-inner{flex-direction:column}.final-actions .btn{width:100%}}
`;

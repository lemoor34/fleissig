import { useEffect, useState } from "react";
import { Menu, X, MessageCircle, Phone, ShieldCheck, ReceiptText, MapPin, Clock3, Home, Truck, Leaf, Star } from "lucide-react";

const CONFIG = {
  whatsapp: "41779588526",
  phone: "+41 79 685 09 80",
  email: "fleissig.reinigungen@gmail.com",
  company: "Swiss SMM Balian Einzelunternehmen",
  location: "Seengen, Kanton Aargau",
  uid: "CHE-461.009.759",
};

const waText = {
  regular: "Grüezi! Ich interessiere mich für eine einmalige oder regelmässige Wohnungsreinigung und möchte einen Termin anfragen.",
  moving: "Grüezi! Ich benötige eine Umzugsreinigung. Ich sende Ihnen Fotos oder ein kurzes Video und bitte um eine verbindliche Offerte.",
  garden: "Grüezi! Ich interessiere mich für Gartenpflege und möchte einen Termin anfragen.",
};

const waLink = (type = "regular") => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(waText[type])}`;

function trackLead(name) {
  if (typeof window.gtag === "function") window.gtag("event", "conversion_event_contact", { contact_type: name });
  if (typeof window.fbq === "function") window.fbq("track", "Lead", { content_name: name });
}

function WhatsAppButton({ label, type = "regular", secondary = false }) {
  return <a className={`btn ${secondary ? "btn-secondary" : "btn-wa"}`} href={waLink(type)} target="_blank" rel="noopener noreferrer" onClick={() => trackLead(type)}><MessageCircle size={19} />{label}</a>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [["Leistungen", "#leistungen"], ["Ergebnisse", "#ergebnisse"], ["Kontakt", "#kontakt"]];
  return <header className="header"><div className="shell header-inner">
    <a href="#start" className="brand" aria-label="Fleissig Startseite"><img src="/logo.png" alt="Fleissig Reinigung" /></a>
    <nav className="desktop-nav">{links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</nav>
    <a className="header-cta" href={waLink("regular")} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /> Anfrage</a>
    <button className="menu-btn" aria-label="Menü öffnen" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
  </div>{open && <div className="mobile-nav"><div className="shell">{links.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}<WhatsAppButton label="Reinigungstermin anfragen" /></div></div>}</header>;
}

function TrustStrip() {
  const items = [[ShieldCheck, "Versichert bis CHF 2 Mio."], [ReceiptText, "Offizielle Rechnung"], [MapPin, "Team aus dem Aargau"], [Clock3, "Schnelle Antwort"]];
  return <div className="trust"><div className="shell trust-grid">{items.map(([Icon, text]) => <div key={text}><Icon size={20} /><span>{text}</span></div>)}</div></div>;
}

function Services() {
  const items = [
    { icon: Home, title: "Wohnungsreinigung", price: "Ab CHF 55 pro Stunde", detail: "Einmalig oder regelmässig. Reinigungsmittel inklusive.", cta: "Termin anfragen", type: "regular" },
    { icon: Truck, title: "Umzugsreinigung", price: "Verbindliche Offerte nach Prüfung", detail: "Fotos oder ein kurzes Video genügen. Abgabegarantie auf Wunsch.", cta: "Fotos senden", type: "moving" },
    { icon: Leaf, title: "Gartenpflege", price: "CHF 65 pro Mitarbeiterstunde", detail: "Rasen, Hecken, Unkraut und saisonale Pflege.", cta: "Termin anfragen", type: "garden" },
  ];
  return <section className="section services" id="leistungen"><div className="shell"><span className="eyebrow">Unsere Leistungen</span><h2>Welche Leistung benötigen Sie?</h2><div className="cards">{items.map(({ icon: Icon, ...item }) => <article className="card" key={item.title}><div className="icon"><Icon size={25} /></div><h3>{item.title}</h3><strong>{item.price}</strong><p>{item.detail}</p><WhatsAppButton label={item.cta} type={item.type} /></article>)}</div></div></section>;
}

function LegalPage({ type, onClose }) {
  const privacy = [
    ["Verantwortliche Stelle", `${CONFIG.company} · ${CONFIG.location} · ${CONFIG.email}`],
    ["Bearbeitete Daten", "Wir bearbeiten Kontaktdaten, Angaben zu Ihrer Anfrage sowie Fotos oder Videos, die Sie uns freiwillig übermitteln."],
    ["Zweck", "Wir verwenden diese Daten zur Bearbeitung von Anfragen, zur Erstellung von Offerten, zur Terminvereinbarung und zur Ausführung von Aufträgen."],
    ["Kommunikationsdienste", "Bei einer Kontaktaufnahme über WhatsApp gelten zusätzlich die Datenschutzbestimmungen von WhatsApp beziehungsweise Meta."],
    ["Analyse und Marketing", "Analyse- und Marketingdienste werden erst nach Ihrer Einwilligung aktiviert. Ihre Auswahl können Sie durch Löschen der Website-Daten im Browser zurücksetzen."],
    ["Weitergabe", "Wir verkaufen keine Personendaten. Eine Weitergabe erfolgt nur, wenn sie für die Leistungserbringung notwendig ist oder eine gesetzliche Pflicht besteht."],
    ["Aufbewahrung", "Wir bewahren Daten nur so lange auf, wie dies für den jeweiligen Zweck oder aufgrund gesetzlicher Aufbewahrungspflichten erforderlich ist."],
    ["Ihre Rechte", "Sie können Auskunft, Berichtigung oder Löschung Ihrer Personendaten verlangen. Kontaktieren Sie uns dazu per E-Mail."],
  ];
  const imprint = [
    ["Anbieter", CONFIG.company], ["Sitz", CONFIG.location], ["UID", CONFIG.uid], ["E-Mail", CONFIG.email], ["Telefon", CONFIG.phone],
    ["Haftung", "Wir prüfen die Inhalte dieser Website sorgfältig, übernehmen jedoch keine Gewähr für Vollständigkeit, Richtigkeit oder Aktualität. Für Inhalte externer Links sind ausschliesslich deren Betreiber verantwortlich."],
    ["Urheberrecht", "Die Inhalte und Bilder dieser Website dürfen ohne Zustimmung des Rechteinhabers nicht vervielfältigt oder weiterverwendet werden."],
  ];
  const data = type === "privacy" ? privacy : imprint;
  return <div className="legal-overlay" role="dialog" aria-modal="true"><div className="legal-page"><button className="legal-close" onClick={onClose} aria-label="Schliessen"><X /></button><span className="eyebrow">Rechtliches</span><h1>{type === "privacy" ? "Datenschutzerklärung" : "Impressum"}</h1>{type === "privacy" && <p className="legal-intro">Informationen zur Bearbeitung von Personendaten nach dem schweizerischen Datenschutzrecht.</p>}{data.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}</div></div>;
}

function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem("fleissig-consent"));
  const choose = (value) => { localStorage.setItem("fleissig-consent", value); setVisible(false); if (value === "accepted") window.location.reload(); };
  if (!visible) return null;
  return <div className="cookie"><div><strong>Datenschutzeinstellungen</strong><p>Optionale Analyse- und Marketingdienste werden nur mit Ihrer Einwilligung aktiviert.</p></div><div className="cookie-actions"><button onClick={() => choose("rejected")}>Nur notwendige</button><button className="accept" onClick={() => choose("accepted")}>Alle akzeptieren</button></div></div>;
}

function loadAnalyticsAfterConsent() {
  if (localStorage.getItem("fleissig-consent") !== "accepted") return;
  if (!document.getElementById("ga-script")) {
    const ga = document.createElement("script"); ga.id = "ga-script"; ga.async = true; ga.src = "https://www.googletagmanager.com/gtag/js?id=G-GY6PDS53F7"; document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || []; window.gtag = function(){ window.dataLayer.push(arguments); }; window.gtag("js", new Date()); window.gtag("config", "G-GY6PDS53F7", { anonymize_ip: true });
  }
  if (!window.fbq) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", "1607333053899638"); window.fbq("track", "PageView");
  }
}

export default function AppV4() {
  const [legal, setLegal] = useState(null);
  useEffect(() => { loadAnalyticsAfterConsent(); }, []);
  return <div id="start"><Header /><main>
    <section className="hero"><div className="shell hero-grid"><div><span className="eyebrow">Reinigung im Kanton Aargau</span><h1>Professionelle Reinigung im Aargau.</h1><p className="lead">Faire Stundenpreise ab CHF 55. Schnelle Antwort per WhatsApp oder Telefon — wir sprechen Deutsch.</p><div className="hero-actions"><WhatsAppButton label="Reinigungstermin anfragen" /><a className="btn btn-secondary" href={`tel:${CONFIG.phone.replace(/\s/g, "")}`} onClick={() => trackLead("phone")}><Phone size={19} /> Anrufen</a></div><small><Clock3 size={15} /> Antwort in der Regel innerhalb von 15 Minuten · werktags 8–18 Uhr</small></div><img className="hero-img" src="/hero-clean-bathroom.webp" alt="Sauber gereinigtes Badezimmer" /></div></section>
    <TrustStrip />
    <section className="section results" id="ergebnisse"><div className="shell"><span className="eyebrow">Vorher / Nachher</span><div className="result-grid"><img src="/photo_2026-05-08_11-04-40.jpg" alt="Duschkabine vor und nach der Reinigung" /><img src="/photo_2026-05-08_11-04-40 (2).jpg" alt="Kochfeld vor und nach der Reinigung" /></div></div></section>
    <Services />
    <section className="review"><div className="shell"><div className="stars">{[1,2,3,4,5].map(n => <Star key={n} size={20} fill="currentColor" />)}</div><blockquote>«Herzlichen Dank 😍, ihr habt SUPER ARBEIT geleistet 👏🏼👏🏼👏🏼 Mache sehr gerne für Euch Werbung 🥰»</blockquote><strong>Daniela & Martin</strong></div></section>
    <section className="section contact" id="kontakt"><div className="shell contact-grid"><div><span className="eyebrow light">Kontakt</span><h2>Schreiben Sie uns kurz.</h2><p>Für eine normale Reinigung genügt eine Nachricht. Bei einer Umzugsreinigung senden Sie uns zusätzlich Fotos oder ein kurzes Video.</p></div><div><WhatsAppButton label="WhatsApp öffnen" /><a className="btn btn-call" href={`tel:${CONFIG.phone.replace(/\s/g, "")}`}><Phone size={19} /> {CONFIG.phone}</a></div></div></section>
  </main><footer><div className="shell footer"><div><strong>Fleissig</strong><span>Reinigung & Gartenpflege im Kanton Aargau</span></div><div className="footer-links"><button onClick={() => setLegal("imprint")}>Impressum</button><button onClick={() => setLegal("privacy")}>Datenschutz</button><a href={`mailto:${CONFIG.email}`}>E-Mail</a></div></div></footer>{legal && <LegalPage type={legal} onClose={() => setLegal(null)} />}<CookieBanner /><a className="floating-wa" href={waLink("regular")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp öffnen"><MessageCircle size={25} /></a><style>{styles}</style></div>;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--green:#3d7b4f;--dark:#275c39;--pale:#f1f7f2;--ink:#171917;--muted:#69726d;--line:#e2e8e3;--wa:#25d366}*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;color:var(--ink)}.shell{width:min(1120px,calc(100% - 40px));margin:auto}.header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.97);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}.header-inner{height:72px;display:flex;align-items:center;gap:28px}.brand img{width:54px;height:54px;object-fit:contain}.desktop-nav{display:flex;gap:24px;margin-left:auto}.desktop-nav a{color:#404842;text-decoration:none;font-size:14px;font-weight:600}.header-cta{display:flex;align-items:center;gap:7px;background:var(--green);color:white;text-decoration:none;padding:10px 15px;border-radius:10px;font-weight:700;font-size:14px}.menu-btn{display:none;margin-left:auto;border:1px solid var(--line);background:white;border-radius:10px;padding:8px}.mobile-nav{border-top:1px solid var(--line);background:white;padding:12px 0 20px}.mobile-nav .shell{display:flex;flex-direction:column;gap:8px}.mobile-nav a:not(.btn){padding:11px 2px;text-decoration:none;color:var(--ink)}.hero{background:linear-gradient(145deg,#edf7ef,#fff 68%);padding:72px 0}.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center}.eyebrow{display:block;color:var(--green);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}.hero h1{font-size:clamp(42px,6vw,68px);line-height:1.05;letter-spacing:-.045em;margin:0 0 20px}.lead{font-size:18px;line-height:1.65;color:var(--muted);max-width:590px;margin:0 0 26px}.hero-actions{display:flex;gap:12px;flex-wrap:wrap}.hero small{display:flex;gap:7px;align-items:center;color:#78817c;margin-top:17px}.hero-img{width:100%;height:520px;object-fit:cover;border-radius:22px;box-shadow:0 18px 48px rgba(34,82,48,.16)}.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:50px;padding:12px 20px;border-radius:11px;text-decoration:none;font-size:15px;font-weight:750;border:2px solid transparent}.btn-wa{background:var(--wa);color:white}.btn-secondary{background:white;color:var(--green);border-color:var(--green)}.btn-call{background:white;color:var(--dark);margin-top:10px}.trust{border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.trust-grid{display:grid;grid-template-columns:repeat(4,1fr);padding:22px 0}.trust-grid>div{display:flex;align-items:center;justify-content:center;gap:9px;font-size:13px;font-weight:650;color:#465048;border-right:1px solid var(--line)}.trust-grid>div:last-child{border:0}.trust svg{color:var(--green)}.section{padding:78px 0}.results{background:white}.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.result-grid img{width:100%;border-radius:18px;box-shadow:0 8px 28px rgba(0,0,0,.09)}.services{background:var(--pale)}.services h2,.contact h2{font-size:clamp(31px,4vw,48px);line-height:1.12;letter-spacing:-.035em;margin:0 0 34px}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.card{background:white;border:1px solid #dfe8e1;border-radius:18px;padding:25px;display:flex;flex-direction:column}.icon{width:48px;height:48px;border-radius:13px;background:#e9f4ec;color:var(--green);display:grid;place-items:center;margin-bottom:20px}.card h3{font-size:21px;margin:0 0 10px}.card strong{color:var(--green);font-size:19px}.card p{color:var(--muted);line-height:1.55;margin:12px 0 22px}.card .btn{margin-top:auto}.review{padding:62px 0;text-align:center;background:#fafcfa}.stars{display:flex;justify-content:center;color:#e5a33f;gap:3px}.review blockquote{font-size:clamp(20px,3vw,29px);font-weight:600;line-height:1.45;max-width:800px;margin:18px auto}.review strong{color:var(--green)}.contact{background:var(--dark);color:white}.contact-grid{display:grid;grid-template-columns:1fr .7fr;gap:60px;align-items:center}.contact p{color:#d3e3d7;line-height:1.65}.contact-grid>div:last-child{display:flex;flex-direction:column}.light{color:#bfe4c9}footer{background:#17251c;color:white;padding:28px 0}.footer{display:flex;justify-content:space-between;gap:30px}.footer>div{display:flex;flex-direction:column;gap:5px}.footer span{color:#aebbb2;font-size:12px}.footer-links{align-items:flex-end}.footer-links button,.footer-links a{background:none;border:0;color:#c3cec6;font:inherit;font-size:12px;text-decoration:none;cursor:pointer;padding:2px}.floating-wa{display:none;position:fixed;right:18px;bottom:18px;width:58px;height:58px;border-radius:50%;background:var(--wa);color:white;place-items:center;box-shadow:0 8px 24px rgba(0,0,0,.22);z-index:45}.legal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.58);z-index:100;overflow:auto;padding:30px}.legal-page{position:relative;max-width:800px;margin:auto;background:white;border-radius:18px;padding:42px}.legal-close{position:absolute;right:18px;top:18px;background:white;border:1px solid var(--line);border-radius:10px;padding:7px;cursor:pointer}.legal-page h1{font-size:40px;margin:0 0 14px}.legal-page section{padding:18px 0;border-top:1px solid var(--line)}.legal-page section h2{font-size:18px;margin:0 0 8px}.legal-page p{color:var(--muted);line-height:1.65;margin:0}.legal-intro{margin-bottom:26px!important}.cookie{position:fixed;left:20px;right:20px;bottom:20px;z-index:90;max-width:920px;margin:auto;background:white;border:1px solid var(--line);box-shadow:0 14px 45px rgba(0,0,0,.18);border-radius:16px;padding:18px;display:flex;align-items:center;justify-content:space-between;gap:24px}.cookie p{margin:5px 0 0;color:var(--muted);font-size:13px}.cookie-actions{display:flex;gap:9px}.cookie button{border:1px solid var(--green);background:white;color:var(--green);border-radius:9px;padding:10px 13px;font-weight:700;cursor:pointer}.cookie .accept{background:var(--green);color:white}
@media(max-width:900px){.desktop-nav,.header-cta{display:none}.menu-btn{display:flex}.hero-grid,.contact-grid{grid-template-columns:1fr}.hero-img{height:auto;max-height:620px}.trust-grid{grid-template-columns:1fr 1fr}.trust-grid>div{justify-content:flex-start;padding:12px 8px;border:0}.cards{grid-template-columns:1fr}.floating-wa{display:grid}}
@media(max-width:620px){.shell{width:min(100% - 30px,1120px)}.header-inner{height:68px}.hero{padding:46px 0}.hero h1{font-size:42px}.lead{font-size:16px}.hero-actions{flex-direction:column}.hero-actions .btn{width:100%}.section{padding:58px 0}.result-grid{grid-template-columns:1fr}.footer{flex-direction:column}.footer-links{align-items:flex-start}.legal-overlay{padding:12px}.legal-page{padding:34px 20px}.legal-page h1{font-size:32px}.cookie{flex-direction:column;align-items:stretch}.cookie-actions{flex-direction:column}.cookie button{width:100%}}
`;
import { useEffect, useState } from "react";
import {
  Menu, X, MessageCircle, Phone, ShieldCheck, ReceiptText, MapPin,
  Clock3, Home, Truck, Leaf, Star, Sparkles, CheckCircle2
} from "lucide-react";

const CONFIG = {
  whatsapp: "41779588526",
  phone: "+41 79 685 09 80",
  email: "fleissig.reinigungen@gmail.com",
  company: "Swiss SMM Balian Einzelunternehmen",
  brand: "Fleissig Reinigung",
  location: "Seengen, Kanton Aargau",
  uid: "CHE-461.009.759",
};

const waText = {
  regular: "Grüezi! Ich interessiere mich für eine einmalige oder regelmässige Wohnungsreinigung und möchte einen Termin anfragen.",
  moving: "Grüezi! Ich benötige eine Umzugsreinigung und möchte eine verbindliche Offerte.",
  garden: "Grüezi! Ich interessiere mich für Gartenpflege und möchte einen Termin anfragen.",
  windows: "Grüezi! Ich möchte meine Fenster reinigen lassen und bitte um eine Offerte. Ich kann Ihnen Fotos senden.",
};

const waLink = (type = "regular") =>
  `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(waText[type] || waText.regular)}`;

function trackLead(name) {
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion_event_contact", { contact_type: name });
  }
  if (typeof window.fbq === "function") {
    window.fbq("track", "Lead", { content_name: name });
  }
}

function WhatsAppButton({ label, type = "regular", secondary = false }) {
  return (
    <a
      className={`btn ${secondary ? "btn-secondary" : "btn-wa"}`}
      href={waLink(type)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackLead(type)}
    >
      <MessageCircle size={19} />
      {label}
    </a>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["Leistungen", "#leistungen"],
    ["Ergebnisse", "#ergebnisse"],
    ["Aargau", "#aargau"],
    ["FAQ", "#faq"],
    ["Kontakt", "#kontakt"],
  ];

  return (
    <header className="header">
      <div className="shell header-inner">
        <a href="#start" className="brand" aria-label="Fleissig Reinigung Startseite">
          <img src="/favicon.svg" alt="Fleissig Reinigung" />
          <span>Fleissig</span>
        </a>
        <nav className="desktop-nav">
          {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
        </nav>
        <a
          className="header-cta"
          href={waLink("regular")}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackLead("header_whatsapp")}
        >
          <MessageCircle size={17} /> Anfrage
        </a>
        <button className="menu-btn" aria-label="Menü öffnen" onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="mobile-nav">
          <div className="shell">
            {links.map(([label, href]) => (
              <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>
            ))}
            <WhatsAppButton label="Reinigungstermin anfragen" />
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
    [MapPin, "Team aus dem Aargau"],
    [Clock3, "Schnelle Antwort"],
  ];
  return (
    <div className="trust">
      <div className="shell trust-grid">
        {items.map(([Icon, text]) => <div key={text}><Icon size={20} /><span>{text}</span></div>)}
      </div>
    </div>
  );
}

function Services() {
  const items = [
    {
      icon: Home,
      title: "Wohnungsreinigung",
      price: "Ab CHF 55 pro Stunde",
      detail: "Einmalig oder regelmässig. Für Wohnungen und Privathaushalte im Kanton Aargau.",
      cta: "Termin anfragen",
      type: "regular",
    },
    {
      icon: Truck,
      title: "Umzugsreinigung",
      price: "Preis direkt online berechnen",
      detail: "Mit Abgabegarantie. Nach dem Foto-Check erhalten Sie den verbindlichen Fixpreis.",
      cta: "Preis berechnen",
      href: "/umzugsreinigung-aargau",
    },
    {
      icon: Sparkles,
      title: "Fensterreinigung",
      price: "Offerte nach Fenstern und Storen",
      detail: "Fenster innen und aussen, Rahmen und auf Wunsch Storen oder Jalousien.",
      cta: "Fensterreinigung ansehen",
      href: "/fensterreinigung-aargau",
    },
    {
      icon: Leaf,
      title: "Gartenpflege",
      price: "CHF 65 pro Mitarbeiterstunde",
      detail: "Rasen, Hecken, Unkraut und saisonale Pflege im Kanton Aargau.",
      cta: "Termin anfragen",
      type: "garden",
    },
  ];

  return (
    <section className="section services" id="leistungen">
      <div className="shell">
        <span className="eyebrow">Unsere Leistungen</span>
        <h2>Reinigung und Gartenpflege aus einer Hand</h2>
        <p className="section-lead">
          Für Privathaushalte, Umzüge und einzelne Reinigungsarbeiten. Sie erhalten eine klare Offerte und direkten Kontakt mit unserem Team.
        </p>
        <div className="cards">
          {items.map(({ icon: Icon, ...item }) => (
            <article className="card" key={item.title}>
              <div className="icon"><Icon size={25} /></div>
              <h3>{item.title}</h3>
              <strong>{item.price}</strong>
              <p>{item.detail}</p>
              {item.href
                ? <a className="btn btn-wa" href={item.href}>{item.cta}</a>
                : <WhatsAppButton label={item.cta} type={item.type} />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocalArea() {
  const places = ["Seengen", "Lenzburg", "Aarau", "Wohlen", "Baden", "Brugg", "Zofingen"];
  return (
    <section className="section local" id="aargau">
      <div className="shell local-grid">
        <div>
          <span className="eyebrow">Lokal im Aargau</span>
          <h2>Reinigungsfirma im ganzen Kanton Aargau</h2>
          <p>
            Fleissig Reinigung ist in Seengen zuhause und übernimmt Reinigungsaufträge im ganzen Kanton Aargau.
            Dazu gehören Wohnungsreinigungen, Umzugsreinigungen und Fensterreinigungen für Privathaushalte.
          </p>
          <p>
            Bei einer Anfrage nennen Sie uns einfach Ort, gewünschte Leistung und Termin. Für grössere oder schwer einschätzbare Arbeiten
            bestätigen wir den Preis nach Fotos oder einem kurzen Video, damit Umfang und Offerte zusammenpassen.
          </p>
        </div>
        <div className="place-box">
          <strong>Regelmässige Einsatzgebiete</strong>
          <div className="place-list">
            {places.map(place => <span key={place}><MapPin size={16} />{place}</span>)}
          </div>
          <small>Weitere Orte im Kanton Aargau auf Anfrage.</small>
        </div>
      </div>
    </section>
  );
}

function SeoServiceDetails() {
  return (
    <section className="section detail-section">
      <div className="shell">
        <span className="eyebrow">Was wir reinigen</span>
        <h2>Passende Reinigung für Wohnung, Umzug und Fenster</h2>
        <div className="detail-grid">
          <article>
            <h3>Wohnungsreinigung</h3>
            <p>
              Für die einmalige Grundpflege oder regelmässige Reinigung Ihrer Wohnung. Küche, Bad, Böden und Oberflächen
              werden nach dem vereinbarten Umfang gereinigt. Reinigungsmittel sind bei normalen Aufträgen inklusive.
            </p>
            <WhatsAppButton label="Wohnungsreinigung anfragen" type="regular" secondary />
          </article>
          <article>
            <h3>Umzugsreinigung mit Abgabegarantie</h3>
            <p>
              Für die Wohnungsabgabe erhalten Sie nach dem Foto-Check einen verbindlichen Fixpreis. Unsere Abgabegarantie
              deckt die vereinbarten Reinigungsleistungen ab, falls bei der Übergabe eine Nachreinigung nötig wird.
            </p>
            <a className="text-link" href="/umzugsreinigung-aargau">Preis für Umzugsreinigung berechnen →</a>
          </article>
          <article>
            <h3>Fensterreinigung</h3>
            <p>
              Wir reinigen Fensterflächen innen und aussen sowie Rahmen. Storen und Jalousien können je nach Ausführung
              mit eingeplant werden. Für die Offerte reichen in vielen Fällen wenige Fotos.
            </p>
            <a className="text-link" href="/fensterreinigung-aargau">Fensterreinigung im Aargau ansehen →</a>
          </article>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    ["In welchen Orten im Aargau arbeiten Sie?", "Wir arbeiten von Seengen aus im ganzen Kanton Aargau, unter anderem in Lenzburg, Aarau, Wohlen, Baden, Brugg und Zofingen."],
    ["Wie erhalte ich eine Offerte?", "Am schnellsten per WhatsApp. Schreiben Sie uns Ort, gewünschte Leistung und Termin. Bei Bedarf bitten wir um Fotos oder ein kurzes Video."],
    ["Gibt es bei der Umzugsreinigung eine Abgabegarantie?", "Ja. Für bestätigte Umzugsreinigungen bieten wir eine Abgabegarantie für die vereinbarten Leistungen."],
    ["Kann ich per TWINT bezahlen?", "Ja, TWINT ist möglich. Je nach Auftrag ist auch Zahlung per Rechnung möglich."],
    ["Bringen Sie Reinigungsmittel mit?", "Bei normalen Reinigungsaufträgen bringen wir die notwendigen Reinigungsmittel mit, sofern nichts anderes vereinbart wurde."],
    ["Reinigen Sie auch Fenster und Storen?", "Ja. Fensterreinigung innen und aussen sowie Rahmen sind möglich. Storen oder Jalousien werden nach Art und Umfang in die Offerte aufgenommen."],
  ];
  return (
    <section className="section faq" id="faq">
      <div className="shell">
        <span className="eyebrow">Häufige Fragen</span>
        <h2>Fragen zur Reinigung im Kanton Aargau</h2>
        <div className="faq-grid">
          {items.map(([q, a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}
        </div>
      </div>
    </section>
  );
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
    ["Anbieter", CONFIG.company],
    ["Sitz", CONFIG.location],
    ["UID", CONFIG.uid],
    ["E-Mail", CONFIG.email],
    ["Telefon", CONFIG.phone],
    ["Haftung", "Wir prüfen die Inhalte dieser Website sorgfältig, übernehmen jedoch keine Gewähr für Vollständigkeit, Richtigkeit oder Aktualität. Für Inhalte externer Links sind ausschliesslich deren Betreiber verantwortlich."],
    ["Urheberrecht", "Die Inhalte und Bilder dieser Website dürfen ohne Zustimmung des Rechteinhabers nicht vervielfältigt oder weiterverwendet werden."],
  ];
  const data = type === "privacy" ? privacy : imprint;

  return (
    <div className="legal-overlay" role="dialog" aria-modal="true">
      <div className="legal-page">
        <button className="legal-close" onClick={onClose} aria-label="Schliessen"><X /></button>
        <span className="eyebrow">Rechtliches</span>
        <h1>{type === "privacy" ? "Datenschutzerklärung" : "Impressum"}</h1>
        {type === "privacy" && <p className="legal-intro">Informationen zur Bearbeitung von Personendaten nach dem schweizerischen Datenschutzrecht.</p>}
        {data.map(([title, text]) => <section key={title}><h2>{title}</h2><p>{text}</p></section>)}
      </div>
    </div>
  );
}

function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem("fleissig-consent"));
  const choose = (value) => {
    localStorage.setItem("fleissig-consent", value);
    setVisible(false);
    if (value === "accepted") window.location.reload();
  };
  if (!visible) return null;

  return (
    <div className="cookie">
      <div>
        <strong>Datenschutzeinstellungen</strong>
        <p>Optionale Analyse- und Marketingdienste werden nur mit Ihrer Einwilligung aktiviert.</p>
      </div>
      <div className="cookie-actions">
        <button onClick={() => choose("rejected")}>Nur notwendige</button>
        <button className="accept" onClick={() => choose("accepted")}>Alle akzeptieren</button>
      </div>
    </div>
  );
}

function loadAnalyticsAfterConsent() {
  if (localStorage.getItem("fleissig-consent") !== "accepted") return;

  if (!document.getElementById("ga-script")) {
    const ga = document.createElement("script");
    ga.id = "ga-script";
    ga.async = true;
    ga.src = "https://www.googletagmanager.com/gtag/js?id=G-GY6PDS53F7";
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-GY6PDS53F7", { anonymize_ip: true });
  }

  if (!window.fbq) {
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=true;n.version="2.0";n.queue=[];
      t=b.createElement(e);t.async=true;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)
    }(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", "1607333053899638");
    window.fbq("track", "PageView");
  }
}

export default function AppV4() {
  const [legal, setLegal] = useState(null);
  useEffect(() => { loadAnalyticsAfterConsent(); }, []);

  return (
    <div id="start">
      <Header />
      <main>
        <section className="hero">
          <div className="shell hero-grid">
            <div>
              <span className="eyebrow">Reinigungsfirma im Kanton Aargau</span>
              <h1>Reinigungsfirma im Kanton Aargau</h1>
              <p className="lead">
                Professionelle Wohnungs-, Umzugs- und Fensterreinigung. Faire Preise, direkte Kommunikation
                und ein Team aus dem Aargau.
              </p>
              <div className="hero-points">
                <span><CheckCircle2 size={17} /> Fixpreise nach bestätigtem Umfang</span>
                <span><CheckCircle2 size={17} /> Abgabegarantie bei Umzugsreinigung</span>
                <span><CheckCircle2 size={17} /> TWINT und Rechnung</span>
              </div>
              <div className="hero-actions">
                <WhatsAppButton label="Reinigung anfragen" />
                <a
                  className="btn btn-secondary"
                  href={`tel:${CONFIG.phone.replace(/\s/g, "")}`}
                  onClick={() => trackLead("phone")}
                >
                  <Phone size={19} /> Anrufen
                </a>
              </div>
              <small><Clock3 size={15} /> Persönliche Antwort · werktags 8–18 Uhr</small>
            </div>
            <img className="hero-img" src="/hero-clean-bathroom.webp" alt="Professionell gereinigtes Badezimmer im Kanton Aargau" />
          </div>
        </section>

        <TrustStrip />

        <section className="section results" id="ergebnisse">
          <div className="shell">
            <span className="eyebrow">Echte Arbeiten</span>
            <h2>Reinigungsergebnisse aus unseren Aufträgen</h2>
            <div className="result-grid">
              <img src="/photo_2026-05-08_11-04-40.jpg" alt="Duschkabine vor und nach professioneller Reinigung" loading="lazy" />
              <img src="/photo_2026-05-08_11-04-40 (2).jpg" alt="Kochfeld vor und nach professioneller Reinigung" loading="lazy" />
            </div>
          </div>
        </section>

        <Services />
        <LocalArea />
        <SeoServiceDetails />

        <section className="review">
          <div className="shell">
            <div className="stars">{[1,2,3,4,5].map(n => <Star key={n} size={20} fill="currentColor" />)}</div>
            <blockquote>«Herzlichen Dank 😍, ihr habt SUPER ARBEIT geleistet 👏🏼👏🏼👏🏼 Mache sehr gerne für Euch Werbung 🥰»</blockquote>
            <strong>Daniela & Martin</strong>
          </div>
        </section>

        <FAQ />

        <section className="section contact" id="kontakt">
          <div className="shell contact-grid">
            <div>
              <span className="eyebrow light">Kontakt</span>
              <h2>Offerte für Ihre Reinigung anfragen</h2>
              <p>
                Schreiben Sie uns Ort, gewünschte Leistung und Termin. Für Umzugsreinigungen können Sie den Preis
                zuerst online berechnen und anschliessend per Foto-Check bestätigen lassen.
              </p>
            </div>
            <div>
              <WhatsAppButton label="WhatsApp öffnen" />
              <a className="btn btn-call" href={`tel:${CONFIG.phone.replace(/\s/g, "")}`}><Phone size={19} /> {CONFIG.phone}</a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="shell footer">
          <div><strong>Fleissig Reinigung</strong><span>Reinigung & Gartenpflege im Kanton Aargau</span></div>
          <div className="footer-links">
            <a href="/umzugsreinigung-aargau">Umzugsreinigung</a>
            <a href="/fensterreinigung-aargau">Fensterreinigung</a>
            <button onClick={() => setLegal("imprint")}>Impressum</button>
            <button onClick={() => setLegal("privacy")}>Datenschutz</button>
            <a href={`mailto:${CONFIG.email}`}>E-Mail</a>
          </div>
        </div>
      </footer>

      {legal && <LegalPage type={legal} onClose={() => setLegal(null)} />}
      <CookieBanner />
      <a className="floating-wa" href={waLink("regular")} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp öffnen">
        <MessageCircle size={25} />
      </a>
      <style>{styles}</style>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--green:#3d7b4f;--dark:#275c39;--pale:#f1f7f2;--ink:#171917;--muted:#69726d;--line:#e2e8e3;--wa:#25d366}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:'Plus Jakarta Sans',sans-serif;color:var(--ink);background:#fff}
a{color:inherit}
.shell{width:min(1120px,calc(100% - 40px));margin:auto}
.header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.97);border-bottom:1px solid var(--line);backdrop-filter:blur(10px)}
.header-inner{height:72px;display:flex;align-items:center;gap:28px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;font-size:18px}
.brand img{width:46px;height:46px;object-fit:contain}
.desktop-nav{display:flex;gap:23px;margin-left:auto}
.desktop-nav a{color:#404842;text-decoration:none;font-size:14px;font-weight:600}
.desktop-nav a:hover,.text-link:hover{color:var(--green)}
.header-cta{display:flex;align-items:center;gap:7px;background:var(--green);color:white;text-decoration:none;padding:10px 15px;border-radius:10px;font-weight:700;font-size:14px}
.menu-btn{display:none;margin-left:auto;border:1px solid var(--line);background:white;border-radius:10px;padding:8px}
.mobile-nav{border-top:1px solid var(--line);background:white;padding:12px 0 20px}
.mobile-nav .shell{display:flex;flex-direction:column;gap:8px}
.mobile-nav a:not(.btn){padding:11px 2px;text-decoration:none;color:var(--ink)}
.hero{background:linear-gradient(145deg,#edf7ef,#fff 68%);padding:72px 0}
.hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center}
.eyebrow{display:block;color:var(--green);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px}
.hero h1{font-size:clamp(42px,6vw,66px);line-height:1.05;letter-spacing:-.045em;margin:0 0 20px}
.lead{font-size:18px;line-height:1.65;color:var(--muted);max-width:620px;margin:0 0 18px}
.hero-points{display:flex;flex-direction:column;gap:8px;margin:0 0 26px;color:#4c5850;font-size:14px}
.hero-points span{display:flex;gap:8px;align-items:center}
.hero-points svg{color:var(--green)}
.hero-actions{display:flex;gap:12px;flex-wrap:wrap}
.hero small{display:flex;gap:7px;align-items:center;color:#78817c;margin-top:17px}
.hero-img{width:100%;height:520px;object-fit:cover;border-radius:22px;box-shadow:0 18px 48px rgba(34,82,48,.16)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:50px;padding:12px 21px;border-radius:10px;text-decoration:none;font-size:15px;font-weight:750;border:0}
.btn-wa{background:var(--wa);color:#fff}
.btn-secondary{background:#fff;color:var(--dark);border:1px solid #b9cbbf}
.trust{border-block:1px solid var(--line);background:#fff}
.trust-grid{min-height:78px;display:grid;grid-template-columns:repeat(4,1fr);align-items:center}
.trust-grid>div{display:flex;align-items:center;justify-content:center;gap:9px;color:#4d5a51;font-size:13px;font-weight:650}
.trust-grid svg{color:var(--green)}
.section{padding:78px 0}
.section h2{font-size:clamp(31px,4vw,44px);letter-spacing:-.035em;line-height:1.12;margin:0 0 18px}
.section-lead{max-width:720px;color:var(--muted);line-height:1.7;margin:0 0 32px}
.results{background:#fff}
.result-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.result-grid img{display:block;width:100%;height:400px;object-fit:cover;border-radius:18px;border:1px solid var(--line)}
.services{background:#f8faf8}
.cards{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}
.card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:27px;display:flex;flex-direction:column;align-items:flex-start;box-shadow:0 8px 24px rgba(33,65,43,.04)}
.card .icon{width:46px;height:46px;border-radius:13px;background:var(--pale);color:var(--green);display:grid;place-items:center;margin-bottom:18px}
.card h3{font-size:21px;margin:0 0 8px}
.card>strong{color:var(--green);font-size:14px}
.card p{color:var(--muted);line-height:1.65;min-height:52px;margin:13px 0 22px}
.local{background:#fff}
.local-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:60px;align-items:start}
.local p,.detail-grid p,.faq p{color:var(--muted);line-height:1.75}
.place-box{background:var(--pale);border:1px solid #dbe9df;border-radius:18px;padding:26px}
.place-box>strong{display:block;margin-bottom:18px}
.place-list{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:16px}
.place-list span{display:flex;align-items:center;gap:7px;font-size:14px}
.place-list svg{color:var(--green)}
.place-box small{color:var(--muted)}
.detail-section{background:#f8faf8}
.detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.detail-grid article{background:#fff;border:1px solid var(--line);border-radius:16px;padding:24px}
.detail-grid h3{margin:0 0 10px;font-size:19px}
.text-link{color:var(--green);font-weight:750;text-decoration:none;font-size:14px}
.review{padding:72px 0;background:var(--dark);color:#fff;text-align:center}
.stars{display:flex;justify-content:center;gap:4px;color:#ffd65a}
.review blockquote{max-width:780px;margin:20px auto 16px;font-size:clamp(20px,3vw,29px);line-height:1.5;font-weight:650}
.review strong{font-size:14px;color:#cfe2d4}
.faq{background:#fff}
.faq-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.faq-grid article{border:1px solid var(--line);border-radius:15px;padding:22px}
.faq-grid h3{margin:0 0 8px;font-size:17px;line-height:1.4}
.faq-grid p{margin:0}
.contact{background:linear-gradient(130deg,#2e6840,#214e31);color:#fff}
.contact-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:50px;align-items:center}
.contact h2{margin-bottom:12px}
.contact p{color:#d9e8dd;line-height:1.7;margin:0}
.contact-grid>div:last-child{display:flex;flex-direction:column;gap:10px;align-items:stretch}
.contact .btn-call{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.45)}
.eyebrow.light{color:#bfe0c7}
footer{background:#101712;color:#d6ded8;padding:30px 0}
.footer{display:flex;justify-content:space-between;gap:30px;align-items:flex-start}
.footer>div:first-child{display:flex;flex-direction:column;gap:5px}
.footer>div:first-child span{font-size:13px;color:#9eaba2}
.footer-links{display:flex;gap:16px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
.footer-links a,.footer-links button{background:none;border:0;color:#cbd5ce;font:inherit;font-size:13px;text-decoration:none;cursor:pointer;padding:0}
.floating-wa{position:fixed;right:22px;bottom:22px;width:58px;height:58px;border-radius:50%;display:grid;place-items:center;background:var(--wa);color:#fff;box-shadow:0 10px 28px rgba(37,211,102,.32);z-index:40}
.cookie{position:fixed;left:20px;right:20px;bottom:20px;z-index:80;margin:auto;max-width:900px;background:#fff;border:1px solid var(--line);border-radius:15px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:20px;box-shadow:0 16px 45px rgba(0,0,0,.16)}
.cookie p{font-size:13px;color:var(--muted);margin:5px 0 0}
.cookie-actions{display:flex;gap:8px}
.cookie button{border:1px solid var(--line);background:#fff;padding:9px 13px;border-radius:8px;cursor:pointer}
.cookie .accept{background:var(--green);color:#fff;border-color:var(--green)}
.legal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:100;display:grid;place-items:center;padding:20px}
.legal-page{position:relative;width:min(760px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:18px;padding:34px}
.legal-close{position:absolute;right:18px;top:18px;border:0;background:#f2f5f3;border-radius:9px;padding:7px;cursor:pointer}
.legal-page h1{margin:0 0 22px}
.legal-page section{border-top:1px solid var(--line);padding:17px 0}
.legal-page section h2{font-size:16px;margin:0 0 7px}
.legal-page section p,.legal-intro{color:var(--muted);line-height:1.65;margin:0}
@media(max-width:850px){
  .desktop-nav,.header-cta{display:none}
  .menu-btn{display:block}
  .hero{padding:48px 0}
  .hero-grid,.local-grid,.contact-grid{grid-template-columns:1fr;gap:32px}
  .hero-img{height:360px}
  .trust-grid{grid-template-columns:1fr 1fr;padding:16px 0;gap:14px}
  .trust-grid>div{justify-content:flex-start}
  .detail-grid{grid-template-columns:1fr}
}
@media(max-width:620px){
  .shell{width:min(100% - 28px,1120px)}
  .header-inner{height:64px}
  .brand img{width:40px;height:40px}
  .brand span{font-size:16px}
  .hero h1{font-size:40px}
  .lead{font-size:16px}
  .hero-img{height:300px}
  .section{padding:58px 0}
  .cards,.result-grid,.faq-grid{grid-template-columns:1fr}
  .result-grid img{height:320px}
  .place-list{grid-template-columns:1fr}
  .footer{flex-direction:column}
  .footer-links{justify-content:flex-start}
  .cookie{flex-direction:column;align-items:stretch}
  .cookie-actions{justify-content:flex-end}
}
`;

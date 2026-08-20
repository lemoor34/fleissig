import { useEffect, useState } from "react";
import { Check, MessageCircle, ShieldCheck, Sparkles, MapPin, Camera, X, ReceiptText } from "lucide-react";

const CONFIG = {
  whatsapp: "41779588526",
  email: "fleissig.reinigungen@gmail.com",
  company: "Swiss SMM Balian Einzelunternehmen",
  uid: "CHE-461.009.759",
  location: "Seengen, Kanton Aargau",
};

const whatsappText = "Grüezi! Ich interessiere mich für eine Fensterreinigung im Kanton Aargau und möchte eine Offerte. Ich kann Ihnen Fotos der Fenster und Storen senden.";
const whatsappHref = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(whatsappText)}`;

function LegalModal({ type, onClose }) {
  const privacy = [
    ["Verantwortliche Stelle", `${CONFIG.company} · ${CONFIG.location} · ${CONFIG.email}`],
    ["Bearbeitete Daten", "Wir bearbeiten die Angaben aus Ihrer Anfrage sowie Fotos oder Videos, die Sie uns freiwillig übermitteln."],
    ["Zweck", "Wir verwenden diese Daten zur Erstellung einer Offerte, Terminvereinbarung und Ausführung des Auftrags."],
    ["WhatsApp", "Bei Kontakt über WhatsApp gelten zusätzlich die Datenschutzbestimmungen von WhatsApp beziehungsweise Meta."],
  ];
  const imprint = [["Anbieter", CONFIG.company], ["Sitz", CONFIG.location], ["UID", CONFIG.uid], ["E-Mail", CONFIG.email]];
  const rows = type === "privacy" ? privacy : imprint;
  return (
    <div className="fw-modal-bg">
      <div className="fw-modal">
        <button onClick={onClose} aria-label="Schliessen"><X /></button>
        <h2>{type === "privacy" ? "Datenschutzerklärung" : "Impressum"}</h2>
        {rows.map(([h,p]) => <section key={h}><strong>{h}</strong><p>{p}</p></section>)}
      </div>
    </div>
  );
}

export default function FensterreinigungLanding() {
  const [legal, setLegal] = useState(null);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Fensterreinigung Aargau | Fleissig Reinigung";
    return () => { document.title = oldTitle; };
  }, []);

  const places = ["Seengen", "Lenzburg", "Aarau", "Wohlen", "Baden", "Brugg", "Zofingen"];
  const faq = [
    ["Reinigen Sie Fenster innen und aussen?", "Ja. Die Offerte wird nach Zugänglichkeit und vereinbartem Umfang erstellt."],
    ["Sind Rahmen inbegriffen?", "Rahmen können in die Fensterreinigung aufgenommen werden. Der genaue Umfang wird vor dem Termin bestätigt."],
    ["Reinigen Sie auch Storen und Jalousien?", "Ja, je nach Art und Zustand. Fotos helfen uns, den Aufwand richtig einzuschätzen."],
    ["Wie wird der Preis berechnet?", "Entscheidend sind Anzahl, Grösse und Art der Fenster, Zugänglichkeit sowie zusätzliche Storen oder Jalousien."],
    ["Wie bekomme ich schnell eine Offerte?", "Senden Sie uns per WhatsApp einige Fotos der Fenster, die ungefähre Anzahl und Ihren Ort im Aargau."],
  ];

  return (
    <div className="fw-page">
      <header className="fw-header">
        <div className="fw-shell">
          <a href="/" aria-label="Fleissig Reinigung Startseite"><img src="/favicon.svg" alt="Fleissig Reinigung" /><strong>Fleissig</strong></a>
          <a className="fw-mini-cta" href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/> Offerte</a>
        </div>
      </header>

      <main>
        <section className="fw-hero">
          <div className="fw-shell fw-hero-grid">
            <div>
              <span className="fw-eyebrow">Fensterreinigung im Kanton Aargau</span>
              <h1>Fensterreinigung Aargau</h1>
              <p>
                Saubere Fenster innen und aussen, Rahmen sowie Storen oder Jalousien nach Vereinbarung.
                Für die Offerte reichen in vielen Fällen wenige Fotos.
              </p>
              <div className="fw-points">
                <span><Check size={17}/> Fenster innen und aussen</span>
                <span><Check size={17}/> Rahmen nach vereinbartem Umfang</span>
                <span><Check size={17}/> Storen und Jalousien auf Anfrage</span>
                <span><Check size={17}/> TWINT und Rechnung</span>
              </div>
              <a className="fw-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={20}/> Offerte per WhatsApp anfragen</a>
            </div>
            <div className="fw-visual">
              <Sparkles size={58}/>
              <strong>Klare Offerte vor dem Termin</strong>
              <span>Fotos + Anzahl + Ort genügen für die erste Einschätzung.</span>
            </div>
          </div>
        </section>

        <section className="fw-trust">
          <div className="fw-shell">
            <span><ShieldCheck size={18}/> Versichert bis CHF 2 Mio.</span>
            <span><ReceiptText size={18}/> Offizielle Rechnung</span>
            <span><MapPin size={18}/> Team aus dem Aargau</span>
          </div>
        </section>

        <section className="fw-section">
          <div className="fw-shell">
            <span className="fw-eyebrow">Leistungsumfang</span>
            <h2>Was wir bei der Fensterreinigung übernehmen</h2>
            <div className="fw-grid3">
              <article><h3>Glasflächen</h3><p>Reinigung der vereinbarten Fensterflächen innen und aussen, soweit sie sicher zugänglich sind.</p></article>
              <article><h3>Rahmen</h3><p>Fensterrahmen können passend zum Auftrag mitgereinigt werden. Zustand und Aufwand werden vorher berücksichtigt.</p></article>
              <article><h3>Storen & Jalousien</h3><p>Lamellen, Rollläden oder andere Systeme werden nach Typ und Verschmutzung separat eingeschätzt.</p></article>
            </div>
          </div>
        </section>

        <section className="fw-section fw-soft">
          <div className="fw-shell">
            <span className="fw-eyebrow">Preisfaktoren</span>
            <h2>Wovon der Preis für Fensterreinigung abhängt</h2>
            <div className="fw-grid2">
              <div className="fw-list">
                <span><Check size={17}/> Anzahl und Grösse der Fenster</span>
                <span><Check size={17}/> Normale oder grosse/Panoramafenster</span>
                <span><Check size={17}/> Zugänglichkeit innen und aussen</span>
                <span><Check size={17}/> Art der Storen oder Jalousien</span>
                <span><Check size={17}/> Stärke der Verschmutzung</span>
              </div>
              <div className="fw-photo-box">
                <Camera size={34}/>
                <h3>Fotos statt langer Besichtigung</h3>
                <p>Schicken Sie uns einige Fotos. So können wir den Aufwand meist schnell einschätzen und eine passende Offerte erstellen.</p>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer">Fotos per WhatsApp senden →</a>
              </div>
            </div>
          </div>
        </section>

        <section className="fw-section">
          <div className="fw-shell">
            <span className="fw-eyebrow">Einsatzgebiet</span>
            <h2>Fensterreinigung im ganzen Kanton Aargau</h2>
            <p className="fw-lead">Wir arbeiten von Seengen aus im ganzen Kanton. Weitere Orte sind selbstverständlich auf Anfrage möglich.</p>
            <div className="fw-places">{places.map(place => <span key={place}><MapPin size={15}/>{place}</span>)}</div>
          </div>
        </section>

        <section className="fw-section fw-soft">
          <div className="fw-shell">
            <span className="fw-eyebrow">FAQ</span>
            <h2>Häufige Fragen zur Fensterreinigung</h2>
            <div className="fw-faq">
              {faq.map(([q,a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}
            </div>
          </div>
        </section>

        <section className="fw-cta">
          <div className="fw-shell">
            <div><span className="fw-eyebrow light">Offerte</span><h2>Fensterreinigung anfragen</h2><p>Senden Sie Fotos, ungefähre Anzahl der Fenster und Ihren Ort im Aargau.</p></div>
            <a className="fw-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={20}/> WhatsApp öffnen</a>
          </div>
        </section>
      </main>

      <footer className="fw-footer">
        <div className="fw-shell">
          <span>Fleissig Reinigung · Kanton Aargau</span>
          <div>
            <a href="/">Startseite</a>
            <a href="/umzugsreinigung-aargau">Umzugsreinigung</a>
            <button onClick={() => setLegal("imprint")}>Impressum</button>
            <button onClick={() => setLegal("privacy")}>Datenschutz</button>
          </div>
        </div>
      </footer>

      {legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}
      <style>{styles}</style>
    </div>
  );
}

const styles = `
:root{--g:#39784b;--gd:#245b35;--soft:#f1f7f2;--ink:#171917;--muted:#68736c;--line:#dfe8e1;--wa:#25d366}
*{box-sizing:border-box}body{margin:0}.fw-page{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--ink);background:#fff}.fw-shell{width:min(1040px,calc(100% - 36px));margin:auto}
.fw-header{border-bottom:1px solid var(--line);background:rgba(255,255,255,.96);position:sticky;top:0;z-index:40}.fw-header .fw-shell{height:68px;display:flex;align-items:center;justify-content:space-between}.fw-header a:first-child{display:flex;align-items:center;gap:9px;text-decoration:none;color:var(--ink)}.fw-header img{width:45px;height:45px}.fw-mini-cta,.fw-wa{display:inline-flex;align-items:center;gap:8px;text-decoration:none;background:var(--wa);color:#fff;font-weight:800;border-radius:10px;padding:11px 15px}
.fw-hero{background:linear-gradient(145deg,#edf8ef,#fff);padding:75px 0}.fw-hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:70px;align-items:center}.fw-eyebrow{display:block;color:var(--g);text-transform:uppercase;letter-spacing:.1em;font-size:11px;font-weight:800;margin-bottom:12px}.fw-eyebrow.light{color:#bde0c5}.fw-hero h1{font-size:clamp(44px,6vw,67px);letter-spacing:-.045em;line-height:1.02;margin:0 0 18px}.fw-hero p,.fw-lead{color:var(--muted);font-size:17px;line-height:1.7}.fw-points{display:grid;gap:9px;margin:24px 0}.fw-points span,.fw-list span{display:flex;align-items:center;gap:8px;color:#4c5a50;font-size:14px}.fw-points svg,.fw-list svg{color:var(--g)}.fw-visual{background:var(--gd);color:#fff;border-radius:22px;padding:42px;min-height:320px;display:flex;flex-direction:column;justify-content:center}.fw-visual svg{color:#c5e9cc;margin-bottom:20px}.fw-visual strong{font-size:24px;line-height:1.3;margin-bottom:10px}.fw-visual span{color:#d2e5d7;line-height:1.6}
.fw-trust{border-block:1px solid var(--line)}.fw-trust .fw-shell{min-height:74px;display:flex;justify-content:center;gap:44px;align-items:center;flex-wrap:wrap}.fw-trust span{display:flex;align-items:center;gap:7px;font-size:13px;font-weight:650;color:#506057}.fw-trust svg{color:var(--g)}
.fw-section{padding:76px 0}.fw-section h2,.fw-cta h2{font-size:clamp(30px,4vw,43px);letter-spacing:-.035em;line-height:1.12;margin:0 0 18px}.fw-soft{background:#f8faf8}.fw-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.fw-grid3 article,.fw-faq article{border:1px solid var(--line);border-radius:16px;padding:23px;background:#fff}.fw-grid3 h3,.fw-faq h3{margin:0 0 9px;font-size:18px}.fw-grid3 p,.fw-faq p,.fw-photo-box p{color:var(--muted);line-height:1.7;margin:0}
.fw-grid2{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:stretch}.fw-list{display:flex;flex-direction:column;gap:12px;background:#fff;border:1px solid var(--line);border-radius:16px;padding:25px}.fw-photo-box{background:var(--gd);color:#fff;border-radius:16px;padding:26px}.fw-photo-box svg{color:#c6e9cd}.fw-photo-box h3{margin:13px 0 8px}.fw-photo-box p{color:#d5e5d9}.fw-photo-box a{display:inline-block;margin-top:15px;color:#fff;font-weight:750;text-decoration:none}
.fw-places{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}.fw-places span{display:flex;align-items:center;gap:6px;border:1px solid var(--line);border-radius:999px;padding:9px 12px;font-size:13px}.fw-places svg{color:var(--g)}.fw-faq{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.fw-cta{background:linear-gradient(130deg,#2d6740,#204d30);color:#fff;padding:65px 0}.fw-cta .fw-shell{display:grid;grid-template-columns:1.3fr .7fr;gap:45px;align-items:center}.fw-cta p{color:#d9e7dc;line-height:1.65}.fw-cta .fw-wa{justify-self:end}
.fw-footer{background:#101712;color:#d5ded7;padding:26px 0}.fw-footer .fw-shell{display:flex;justify-content:space-between;gap:20px}.fw-footer span{font-size:12px}.fw-footer div div{display:flex;gap:12px;flex-wrap:wrap}.fw-footer a,.fw-footer button{color:#c7d1ca;background:none;border:0;text-decoration:none;font:inherit;font-size:12px;padding:0;cursor:pointer}
.fw-cookie{position:fixed;left:18px;right:18px;bottom:18px;z-index:90;margin:auto;max-width:860px;background:#fff;border:1px solid var(--line);box-shadow:0 15px 45px rgba(0,0,0,.14);border-radius:14px;padding:16px 18px;display:flex;justify-content:space-between;gap:18px}.fw-cookie>div:first-child{display:flex;flex-direction:column;gap:4px}.fw-cookie span{font-size:12px;color:var(--muted)}.fw-cookie>div:last-child{display:flex;gap:7px}.fw-cookie button{border:1px solid var(--line);background:#fff;border-radius:8px;padding:8px 11px}.fw-cookie .primary{background:var(--g);color:#fff;border-color:var(--g)}
.fw-modal-bg{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.45);display:grid;place-items:center;padding:20px}.fw-modal{position:relative;width:min(650px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:16px;padding:28px}.fw-modal>button{position:absolute;right:14px;top:14px;border:0;background:#f0f4f1;padding:7px;border-radius:8px}.fw-modal section{border-top:1px solid var(--line);padding:14px 0}.fw-modal section p{color:var(--muted);line-height:1.6}
@media(max-width:760px){.fw-hero-grid,.fw-grid2,.fw-cta .fw-shell{grid-template-columns:1fr}.fw-grid3,.fw-faq{grid-template-columns:1fr}.fw-visual{min-height:240px}.fw-cta .fw-wa{justify-self:start}.fw-footer .fw-shell{flex-direction:column}.fw-cookie{flex-direction:column}}
`;

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, MessageCircle, ReceiptText, ShieldCheck, X } from "lucide-react";
import {
  buildWhatsAppMessage,
  calculateUmzugsreinigungEstimate,
  isEstimateFormComplete,
} from "./umzugsreinigungPriceEngine.js";

const CONFIG = {
  whatsapp: "41779588526",
  company: "Swiss SMM Balian Einzelunternehmen",
  location: "Seengen, Kanton Aargau",
  email: "fleissig.reinigungen@gmail.com",
  uid: "CHE-461.009.759",
};

const initialForm = {
  rooms: "",
  area: "",
  dirt: "",
  pets: "",
  windows: "",
  blinds: "",
  extras: [],
  handoverDate: "",
};

function track(name, params = {}) {
  if (typeof window.gtag === "function") window.gtag("event", name, params);
  if (typeof window.fbq === "function" && name === "umzug_whatsapp_click") {
    window.fbq("track", "Lead", { content_name: "Umzugsreinigung Landing" });
  }
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
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-GY6PDS53F7", { anonymize_ip: true });
  }

  if (!window.fbq) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=true;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=true;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", "1607333053899638");
    window.fbq("track", "PageView");
  }
}

function CookieBanner() {
  const [visible, setVisible] = useState(() => !localStorage.getItem("fleissig-consent"));
  if (!visible) return null;

  const choose = (value) => {
    localStorage.setItem("fleissig-consent", value);
    setVisible(false);
    if (value === "accepted") loadAnalyticsAfterConsent();
  };

  return (
    <div className="lp-cookie">
      <div><strong>Datenschutzeinstellungen</strong><span>Optionale Analyse- und Marketingdienste nur mit Ihrer Einwilligung.</span></div>
      <div className="lp-cookie-actions">
        <button onClick={() => choose("rejected")}>Nur notwendige</button>
        <button className="primary" onClick={() => choose("accepted")}>Alle akzeptieren</button>
      </div>
    </div>
  );
}

function LegalModal({ type, onClose }) {
  const privacy = [
    ["Verantwortliche Stelle", `${CONFIG.company} · ${CONFIG.location} · ${CONFIG.email}`],
    ["Bearbeitete Daten", "Wir bearbeiten die Angaben aus Ihrer Preisanfrage sowie Daten, Fotos oder Videos, die Sie uns freiwillig über WhatsApp übermitteln."],
    ["Zweck", "Wir verwenden diese Daten zur Preisschätzung, Erstellung einer Offerte, Terminvereinbarung und Ausführung des Auftrags."],
    ["WhatsApp", "Bei der Kontaktaufnahme über WhatsApp gelten zusätzlich die Datenschutzbestimmungen von WhatsApp beziehungsweise Meta."],
    ["Analyse und Marketing", "Optionale Analyse- und Marketingdienste werden erst nach Ihrer Einwilligung aktiviert."],
    ["Ihre Rechte", "Sie können Auskunft, Berichtigung oder Löschung Ihrer Personendaten verlangen. Kontaktieren Sie uns dazu per E-Mail."],
  ];
  const imprint = [
    ["Anbieter", CONFIG.company],
    ["Sitz", CONFIG.location],
    ["UID", CONFIG.uid],
    ["E-Mail", CONFIG.email],
  ];
  const rows = type === "privacy" ? privacy : imprint;

  return (
    <div className="lp-modal-backdrop" role="dialog" aria-modal="true">
      <div className="lp-modal">
        <button className="lp-close" onClick={onClose} aria-label="Schliessen"><X /></button>
        <h2>{type === "privacy" ? "Datenschutzerklärung" : "Impressum"}</h2>
        {rows.map(([title, text]) => <div className="lp-legal-row" key={title}><strong>{title}</strong><p>{text}</p></div>)}
      </div>
    </div>
  );
}

function Choice({ selected, onClick, children }) {
  return <button type="button" className={`lp-choice ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={onClick}>{children}</button>;
}

function Field({ number, title, hint, children }) {
  return (
    <fieldset className="lp-field">
      <legend><span>{number}</span><div>{title}{hint && <small>{hint}</small>}</div></legend>
      {children}
    </fieldset>
  );
}

export default function UmzugsreinigungLanding() {
  const [form, setForm] = useState(initialForm);
  const [legal, setLegal] = useState(null);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Umzugsreinigung Aargau – Preis berechnen | Fleissig";
    loadAnalyticsAfterConsent();
    return () => { document.title = oldTitle; };
  }, []);

  const complete = isEstimateFormComplete(form);
  const estimate = useMemo(() => complete ? calculateUmzugsreinigungEstimate(form) : null, [complete, form]);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleExtra = (key) => setForm((current) => ({
    ...current,
    extras: current.extras.includes(key) ? current.extras.filter((item) => item !== key) : [...current.extras, key],
  }));

  const whatsappHref = estimate
    ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage(form, estimate))}`
    : "#";

  const openWhatsApp = () => {
    if (!estimate) return;
    track("umzug_whatsapp_click", {
      estimate_low: estimate.lower,
      estimate_high: estimate.upper,
      rooms: form.rooms,
      area: Number(form.area),
    });
  };

  return (
    <div className="umzug-landing">
      <header className="lp-header">
        <div className="lp-shell lp-header-inner">
          <a href="/" aria-label="Fleissig Startseite"><img src="/logo.png" alt="Fleissig Reinigung" /></a>
          <span>Umzugsreinigung · Aargau</span>
        </div>
      </header>

      <main className="lp-shell lp-main">
        <section className="lp-intro">
          <div className="lp-badge"><BadgeCheck size={17} /> Mit Abgabegarantie</div>
          <h1>Was kostet Ihre Umzugsreinigung?</h1>
          <p>Beantworten Sie kurz die Fragen. Ihre vorläufige Preisschätzung erscheint direkt – ohne Registrierung und ohne Anruf.</p>
          <div className="lp-trust">
            <span><ShieldCheck size={18} /> Fixpreis nach Foto-Check</span>
            <span><ReceiptText size={18} /> Offizielle Rechnung</span>
          </div>
        </section>

        <section className="lp-card" aria-label="Preisrechner Umzugsreinigung">
          <Field number="1" title="Wie viele Zimmer hat die Wohnung?">
            <div className="lp-options rooms">
              {["1-1.5", "2-2.5", "3-3.5", "4-4.5", "5-5.5"].map((value) => (
                <Choice key={value} selected={form.rooms === value} onClick={() => set("rooms", value)}>{value.replace("-", "–")} Zi.</Choice>
              ))}
            </div>
          </Field>

          <Field number="2" title="Wie gross ist die Wohnfläche?" hint="Eine ungefähre Angabe genügt.">
            <div className="lp-area-wrap">
              <input
                type="number"
                inputMode="numeric"
                min="20"
                max="300"
                step="1"
                placeholder="z. B. 78"
                value={form.area}
                onChange={(event) => set("area", event.target.value)}
                aria-label="Wohnfläche in Quadratmetern"
              />
              <span>m²</span>
            </div>
          </Field>

          <Field number="3" title="Wie stark ist die Wohnung verschmutzt?">
            <div className="lp-options three">
              <Choice selected={form.dirt === "light"} onClick={() => set("dirt", "light")}><strong>Leicht</strong><small>regelmässig gereinigt</small></Choice>
              <Choice selected={form.dirt === "normal"} onClick={() => set("dirt", "normal")}><strong>Normal</strong><small>übliche Verschmutzung</small></Choice>
              <Choice selected={form.dirt === "strong"} onClick={() => set("dirt", "strong")}><strong>Stark</strong><small>viel Fett, Kalk oder Schmutz</small></Choice>
            </div>
          </Field>

          <Field number="4" title="Gab es Haustiere in der Wohnung?">
            <div className="lp-options two">
              <Choice selected={form.pets === "no"} onClick={() => set("pets", "no")}>Nein</Choice>
              <Choice selected={form.pets === "yes"} onClick={() => set("pets", "yes")}>Ja</Choice>
            </div>
          </Field>

          <Field number="5" title="Welche Fenster hat die Wohnung überwiegend?">
            <div className="lp-options three">
              <Choice selected={form.windows === "small"} onClick={() => set("windows", "small")}>Klein</Choice>
              <Choice selected={form.windows === "normal"} onClick={() => set("windows", "normal")}>Normal</Choice>
              <Choice selected={form.windows === "panorama"} onClick={() => set("windows", "panorama")}>Panorama</Choice>
            </div>
          </Field>

          <Field number="6" title="Welche Storen oder Jalousien gibt es?">
            <div className="lp-options four">
              <Choice selected={form.blinds === "none"} onClick={() => set("blinds", "none")}>Keine</Choice>
              <Choice selected={form.blinds === "roller"} onClick={() => set("blinds", "roller")}>Rollläden</Choice>
              <Choice selected={form.blinds === "lamella"} onClick={() => set("blinds", "lamella")}>Lamellen</Choice>
              <Choice selected={form.blinds === "other"} onClick={() => set("blinds", "other")}>Andere</Choice>
            </div>
          </Field>

          <Field number="7" title="Was soll zusätzlich gereinigt werden?" hint="Mehrfachauswahl möglich.">
            <div className="lp-options three checks">
              {[["balcony", "Balkon"], ["cellar", "Keller"], ["garage", "Garage"]].map(([key, label]) => (
                <Choice key={key} selected={form.extras.includes(key)} onClick={() => toggleExtra(key)}><Check size={17} />{label}</Choice>
              ))}
            </div>
          </Field>

          <Field number="8" title="Wann ist die Wohnungsabgabe?">
            <input className="lp-date" type="date" value={form.handoverDate} onChange={(event) => set("handoverDate", event.target.value)} />
          </Field>

          <div className={`lp-result ${estimate ? "ready" : ""}`} aria-live="polite">
            {estimate ? (
              <>
                <span className="lp-result-label">Ihre vorläufige Preisschätzung</span>
                <strong>CHF {estimate.lower}–{estimate.upper}</strong>
                <p>Unverbindliche Vorabschätzung auf Basis Ihrer Angaben. Nach einem kurzen Foto-Check bestätigen wir Ihnen den verbindlichen Fixpreis.</p>
                <a className="lp-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer" onClick={openWhatsApp}>
                  <MessageCircle size={21} /> Fixpreis per WhatsApp bestätigen
                </a>
                <small>Ihre Angaben und die Preisspanne werden automatisch in die WhatsApp-Nachricht übernommen. Sie müssen nur noch auf „Senden“ tippen.</small>
              </>
            ) : (
              <p className="lp-incomplete">Füllen Sie alle Angaben aus – Ihre Preisschätzung erscheint automatisch.</p>
            )}
          </div>
        </section>

        <div className="lp-bottom-trust">
          <span><Check size={17} /> Abgabegarantie</span>
          <span><Check size={17} /> Verbindlicher Fixpreis nach Foto-Check</span>
          <span><Check size={17} /> Keine Zusatzkosten für bestätigte Leistungen</span>
          <span><Check size={17} /> Versichert</span>
        </div>
      </main>

      <footer className="lp-footer">
        <div className="lp-shell"><span>Fleissig · Reinigung im Kanton Aargau</span><div><button onClick={() => setLegal("imprint")}>Impressum</button><button onClick={() => setLegal("privacy")}>Datenschutz</button></div></div>
      </footer>

      {legal && <LegalModal type={legal} onClose={() => setLegal(null)} />}
      <CookieBanner />
      <style>{styles}</style>
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--lp-green:#357a49;--lp-dark:#215633;--lp-pale:#f1f7f2;--lp-ink:#171917;--lp-muted:#66716a;--lp-line:#dfe7e1;--lp-wa:#25d366}
*{box-sizing:border-box}.umzug-landing{min-height:100vh;background:linear-gradient(155deg,#eef8f0 0,#fff 42%,#f8faf8 100%);font-family:'Plus Jakarta Sans',sans-serif;color:var(--lp-ink)}
.lp-shell{width:min(780px,calc(100% - 32px));margin:auto}.lp-header{background:rgba(255,255,255,.94);border-bottom:1px solid var(--lp-line);backdrop-filter:blur(9px)}.lp-header-inner{height:68px;display:flex;align-items:center;justify-content:space-between;gap:18px}.lp-header img{width:51px;height:51px;object-fit:contain}.lp-header span{font-size:13px;font-weight:700;color:#526159}
.lp-main{padding:52px 0 44px}.lp-intro{text-align:center;margin-bottom:28px}.lp-badge{display:inline-flex;align-items:center;gap:7px;background:#e6f5e9;color:var(--lp-dark);border:1px solid #cfe8d4;border-radius:999px;padding:7px 12px;font-size:13px;font-weight:800;margin-bottom:16px}.lp-intro h1{font-size:clamp(34px,7vw,52px);line-height:1.08;letter-spacing:-.04em;margin:0 auto 14px;max-width:680px}.lp-intro>p{font-size:16px;line-height:1.65;color:var(--lp-muted);max-width:650px;margin:0 auto}.lp-trust{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;margin-top:20px;color:#526159;font-size:13px;font-weight:650}.lp-trust span{display:flex;align-items:center;gap:7px}
.lp-card{background:#fff;border:1px solid var(--lp-line);border-radius:24px;box-shadow:0 20px 55px rgba(32,76,45,.11);padding:10px 30px 30px}.lp-field{border:0;border-bottom:1px solid #edf1ed;margin:0;padding:24px 0}.lp-field legend{width:100%;display:flex;align-items:flex-start;gap:11px;font-size:15px;font-weight:800;margin-bottom:15px;padding:0}.lp-field legend>span{display:grid;place-items:center;flex:0 0 27px;height:27px;border-radius:50%;background:var(--lp-pale);color:var(--lp-green);font-size:12px}.lp-field legend div{display:flex;flex-direction:column;gap:3px;padding-top:3px}.lp-field legend small{font-weight:500;color:#89918c;font-size:12px}.lp-options{display:grid;gap:9px}.lp-options.rooms{grid-template-columns:repeat(5,1fr)}.lp-options.two{grid-template-columns:repeat(2,1fr)}.lp-options.three{grid-template-columns:repeat(3,1fr)}.lp-options.four{grid-template-columns:repeat(4,1fr)}.lp-choice{appearance:none;border:1.5px solid #dce4de;background:#fff;border-radius:11px;padding:12px 9px;min-height:48px;font:inherit;font-size:13px;font-weight:700;color:#414942;cursor:pointer;transition:.15s ease;display:flex;align-items:center;justify-content:center;gap:6px}.lp-choice:hover{border-color:#9fc4aa}.lp-choice.selected{border-color:var(--lp-green);background:#edf7ef;color:var(--lp-dark);box-shadow:inset 0 0 0 1px var(--lp-green)}.lp-choice strong{font-size:13px}.lp-choice small{display:block;font-size:10px;font-weight:500;color:#718078}.lp-options.three:not(.checks) .lp-choice{flex-direction:column}.lp-area-wrap{position:relative;max-width:220px}.lp-area-wrap input,.lp-date{width:100%;height:50px;border:1.5px solid #dce4de;border-radius:11px;background:#fff;padding:0 15px;font:inherit;font-size:15px;outline:none}.lp-area-wrap input{padding-right:50px}.lp-area-wrap input:focus,.lp-date:focus{border-color:var(--lp-green);box-shadow:0 0 0 3px rgba(53,122,73,.1)}.lp-area-wrap span{position:absolute;right:15px;top:50%;transform:translateY(-50%);font-size:14px;color:#7e8982;font-weight:700}.lp-date{max-width:280px}
.lp-result{margin-top:28px;border-radius:18px;background:#f5f7f5;padding:22px;text-align:center}.lp-result.ready{background:linear-gradient(145deg,#eaf6ec,#f8fcf9);border:1px solid #cde6d2}.lp-result-label{display:block;text-transform:uppercase;letter-spacing:.08em;color:var(--lp-green);font-size:11px;font-weight:800;margin-bottom:6px}.lp-result>strong{display:block;font-size:clamp(35px,7vw,48px);letter-spacing:-.04em;color:var(--lp-dark);margin-bottom:8px}.lp-result p{max-width:580px;margin:0 auto 18px;color:#5f6c64;font-size:13px;line-height:1.55}.lp-result .lp-incomplete{margin:0;color:#78827c}.lp-wa{display:inline-flex;align-items:center;justify-content:center;gap:9px;min-height:54px;padding:13px 20px;background:var(--lp-wa);color:#fff;text-decoration:none;border-radius:12px;font-size:15px;font-weight:800;box-shadow:0 8px 20px rgba(37,211,102,.2)}.lp-result>small{display:block;max-width:540px;margin:12px auto 0;color:#7b867f;font-size:11px;line-height:1.5}.lp-bottom-trust{display:grid;grid-template-columns:1fr 1fr;gap:8px 18px;margin:22px 10px 0;color:#5d6861;font-size:12px}.lp-bottom-trust span{display:flex;align-items:flex-start;gap:7px}.lp-bottom-trust svg{flex:none;color:var(--lp-green);margin-top:1px}
.lp-footer{border-top:1px solid var(--lp-line);background:#fff;padding:22px 0;color:#808982;font-size:11px}.lp-footer .lp-shell{display:flex;justify-content:space-between;gap:16px;align-items:center}.lp-footer div div{display:flex;gap:12px}.lp-footer button{border:0;background:none;padding:0;color:#707a73;font:inherit;text-decoration:underline;cursor:pointer}
.lp-cookie{position:fixed;z-index:100;left:18px;right:18px;bottom:18px;margin:auto;max-width:760px;background:#fff;border:1px solid var(--lp-line);box-shadow:0 16px 45px rgba(0,0,0,.18);border-radius:14px;padding:16px;display:flex;justify-content:space-between;gap:18px;align-items:center}.lp-cookie div:first-child{display:flex;flex-direction:column;gap:4px}.lp-cookie strong{font-size:13px}.lp-cookie span{font-size:11px;color:#727d76}.lp-cookie-actions{display:flex;gap:8px;flex:none}.lp-cookie button{border:1px solid var(--lp-line);background:#fff;border-radius:9px;padding:9px 11px;font-size:11px;font-weight:700;cursor:pointer}.lp-cookie button.primary{background:var(--lp-green);color:#fff;border-color:var(--lp-green)}
.lp-modal-backdrop{position:fixed;inset:0;z-index:120;background:rgba(12,18,14,.58);padding:25px;display:grid;place-items:center}.lp-modal{position:relative;background:#fff;border-radius:18px;max-width:650px;width:100%;max-height:85vh;overflow:auto;padding:30px}.lp-modal h2{margin:0 0 22px;font-size:28px}.lp-close{position:absolute;right:16px;top:16px;border:1px solid var(--lp-line);background:#fff;border-radius:9px;width:38px;height:38px;display:grid;place-items:center;cursor:pointer}.lp-legal-row{border-top:1px solid var(--lp-line);padding:16px 0}.lp-legal-row strong{font-size:13px}.lp-legal-row p{font-size:13px;color:#616c65;line-height:1.55;margin:5px 0 0}
@media(max-width:680px){.lp-shell{width:min(100% - 22px,780px)}.lp-main{padding:34px 0}.lp-header-inner{height:61px}.lp-header img{width:45px;height:45px}.lp-intro{margin-bottom:20px}.lp-intro h1{font-size:34px}.lp-intro>p{font-size:14px}.lp-trust{gap:10px 15px;margin-top:16px}.lp-card{border-radius:18px;padding:4px 16px 20px}.lp-field{padding:21px 0}.lp-options.rooms{grid-template-columns:repeat(3,1fr)}.lp-options.four{grid-template-columns:repeat(2,1fr)}.lp-options.three{grid-template-columns:1fr}.lp-options.three.checks{grid-template-columns:repeat(3,1fr)}.lp-options.three:not(.checks) .lp-choice{min-height:58px}.lp-bottom-trust{grid-template-columns:1fr;margin-left:6px}.lp-footer .lp-shell{flex-direction:column;align-items:flex-start}.lp-cookie{flex-direction:column;align-items:stretch}.lp-cookie-actions{justify-content:flex-end}.lp-wa{width:100%}}
@media(max-width:420px){.lp-options.rooms{grid-template-columns:repeat(2,1fr)}.lp-options.three.checks{grid-template-columns:1fr}.lp-header span{font-size:11px}}
`;

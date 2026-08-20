import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Check, MessageCircle, ReceiptText, ShieldCheck, X, MapPin, Camera, KeyRound } from "lucide-react";
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

function SeoSection() {
  const places = ["Seengen", "Lenzburg", "Aarau", "Wohlen", "Baden", "Brugg", "Zofingen"];
  const faq = [
    ["Was bedeutet Abgabegarantie?", "Wenn bei der Wohnungsübergabe eine Reinigung der vereinbarten Leistungen beanstandet wird, kümmern wir uns um die notwendige Nachreinigung im Rahmen der bestätigten Offerte."],
    ["Ist die Online-Preisschätzung verbindlich?", "Nein. Sie ist eine schnelle Vorabschätzung. Der verbindliche Fixpreis wird nach einem kurzen Foto- oder Video-Check bestätigt."],
    ["Was beeinflusst den Preis?", "Wohnfläche, Zimmerzahl, Verschmutzung, Fenster, Storen sowie zusätzliche Bereiche wie Balkon, Keller oder Garage beeinflussen den Aufwand."],
    ["Muss ich bei der Reinigung zuhause sein?", "Nein. Eine Schlüsselübergabe kann individuell vereinbart werden."],
    ["In welchen Regionen reinigen Sie?", "Wir arbeiten von Seengen aus im ganzen Kanton Aargau."],
  ];

  return (
    <div className="lp-seo">
      <section>
        <span className="lp-eyebrow">Leistungsumfang</span>
        <h2>Was gehört zur Umzugsreinigung?</h2>
        <p>
          Die Umzugsreinigung wird auf Ihre Wohnung abgestimmt. Typischerweise gehören Küche, Bad, Böden,
          Oberflächen und die vereinbarten Fensterflächen dazu. Storen, Balkon, Keller oder Garage werden
          berücksichtigt, wenn sie in der Offerte bestätigt sind.
        </p>
        <div className="lp-feature-grid">
          <div><Check size={18} /><span>Küche und Bad gründlich reinigen</span></div>
          <div><Check size={18} /><span>Böden und Oberflächen</span></div>
          <div><Check size={18} /><span>Fenster nach vereinbartem Umfang</span></div>
          <div><Check size={18} /><span>Storen und Extras nach Offerte</span></div>
        </div>
      </section>

      <section className="lp-how">
        <span className="lp-eyebrow">So funktioniert es</span>
        <h2>Vom Online-Preis zum verbindlichen Fixpreis</h2>
        <div className="lp-steps">
          <article><div><BadgeCheck size={22} /></div><h3>1. Preis berechnen</h3><p>Sie beantworten die Fragen zur Wohnung und sehen direkt eine vorläufige Preisspanne.</p></article>
          <article><div><Camera size={22} /></div><h3>2. Foto-Check</h3><p>Sie senden uns einige Fotos oder ein kurzes Video. Wir prüfen den tatsächlichen Aufwand.</p></article>
          <article><div><KeyRound size={22} /></div><h3>3. Fixpreis & Termin</h3><p>Nach der Prüfung bestätigen wir den verbindlichen Umfang und den Preis für den vereinbarten Termin.</p></article>
        </div>
      </section>

      <section>
        <span className="lp-eyebrow">Kanton Aargau</span>
        <h2>Umzugsreinigung in Seengen und im ganzen Aargau</h2>
        <p>
          Unser Team ist in Seengen zuhause und übernimmt Umzugsreinigungen im ganzen Kanton Aargau.
          Dazu gehören unter anderem Lenzburg, Aarau, Wohlen, Baden, Brugg und Zofingen.
        </p>
        <div className="lp-places">{places.map(place => <span key={place}><MapPin size={15} />{place}</span>)}</div>
      </section>

      <section>
        <span className="lp-eyebrow">FAQ</span>
        <h2>Häufige Fragen zur Umzugsreinigung</h2>
        <div className="lp-faq">
          {faq.map(([q,a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}
        </div>
      </section>
    </div>
  );
}

export default function UmzugsreinigungLanding() {
  const [form, setForm] = useState(initialForm);
  const [legal, setLegal] = useState(null);

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Umzugsreinigung Aargau mit Abgabegarantie | Fleissig";
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

  return (
    <div className="umzug-landing">
      <header className="lp-header">
        <div className="lp-shell lp-header-inner">
          <a href="/" aria-label="Fleissig Reinigung Startseite"><img src="/favicon.svg" alt="Fleissig Reinigung" /></a>
          <span>Umzugsreinigung · Aargau</span>
        </div>
      </header>

      <main className="lp-shell lp-main">
        <section className="lp-intro">
          <div className="lp-badge"><BadgeCheck size={17} /> Mit Abgabegarantie</div>
          <h1>Umzugsreinigung Aargau mit Abgabegarantie – Preis berechnen</h1>
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
              <Choice selected={form.windows === "panorama"} onClick={() => set("windows", "panorama")}>Normal + grosse/Panoramafenster</Choice>
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
                <a className="lp-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer">
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

        <SeoSection />
      </main>

      <footer className="lp-footer">
        <div className="lp-shell">
          <span>Fleissig Reinigung · Kanton Aargau</span>
          <div>
            <a href="/">Startseite</a>
            <a href="/fensterreinigung-aargau">Fensterreinigung</a>
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
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
:root{--lp-green:#357a49;--lp-dark:#215633;--lp-pale:#f1f7f2;--lp-ink:#171917;--lp-muted:#66716a;--lp-line:#dfe7e1;--lp-wa:#25d366}
*{box-sizing:border-box}
body{margin:0}
.umzug-landing{min-height:100vh;background:linear-gradient(155deg,#eef8f0 0,#fff 42%,#f8faf8 100%);font-family:'Plus Jakarta Sans',sans-serif;color:var(--lp-ink)}
.lp-shell{width:min(800px,calc(100% - 32px));margin:auto}
.lp-header{background:rgba(255,255,255,.94);border-bottom:1px solid var(--lp-line);backdrop-filter:blur(9px)}
.lp-header-inner{height:68px;display:flex;align-items:center;justify-content:space-between;gap:18px}
.lp-header img{width:47px;height:47px;object-fit:contain}
.lp-header span{font-size:13px;font-weight:700;color:#526159}
.lp-main{padding:52px 0 44px}
.lp-intro{text-align:center;margin-bottom:28px}
.lp-badge{display:inline-flex;align-items:center;gap:7px;background:#e5f4e9;color:var(--lp-dark);padding:8px 12px;border-radius:999px;font-size:13px;font-weight:800;margin-bottom:18px}
.lp-intro h1{font-size:clamp(34px,5vw,51px);line-height:1.08;letter-spacing:-.04em;margin:0 auto 16px;max-width:780px}
.lp-intro>p{color:var(--lp-muted);font-size:17px;line-height:1.65;max-width:680px;margin:0 auto 18px}
.lp-trust{display:flex;justify-content:center;gap:20px;flex-wrap:wrap;color:#536057;font-size:13px;font-weight:650}
.lp-trust span{display:flex;align-items:center;gap:6px}
.lp-card{background:#fff;border:1px solid var(--lp-line);border-radius:20px;box-shadow:0 18px 46px rgba(35,83,50,.09);overflow:hidden}
.lp-field{border:0;border-bottom:1px solid var(--lp-line);margin:0;padding:27px}
.lp-field legend{display:flex;gap:12px;align-items:flex-start;font-size:16px;font-weight:800;padding:0;margin-bottom:17px}
.lp-field legend>span{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:var(--lp-pale);color:var(--lp-green);font-size:12px;flex:0 0 auto}
.lp-field legend small{display:block;font-weight:500;color:var(--lp-muted);font-size:12px;margin-top:3px}
.lp-options{display:grid;gap:9px}
.lp-options.rooms{grid-template-columns:repeat(5,1fr)}
.lp-options.two{grid-template-columns:repeat(2,1fr)}
.lp-options.three{grid-template-columns:repeat(3,1fr)}
.lp-options.four{grid-template-columns:repeat(4,1fr)}
.lp-choice{min-height:49px;border:1px solid #cfdad2;border-radius:10px;background:#fff;color:#334039;padding:10px 11px;font:inherit;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;flex-direction:column}
.lp-choice small{font-size:10px;color:var(--lp-muted)}
.lp-choice.selected{border-color:var(--lp-green);background:var(--lp-pale);color:var(--lp-dark);box-shadow:inset 0 0 0 1px var(--lp-green)}
.lp-area-wrap{position:relative;max-width:230px}
.lp-area-wrap input,.lp-date{width:100%;height:50px;border:1px solid #cfdad2;border-radius:10px;padding:0 42px 0 13px;font:inherit;font-size:16px}
.lp-area-wrap span{position:absolute;right:13px;top:15px;color:var(--lp-muted)}
.lp-result{padding:28px;text-align:center;background:#f7faf7}
.lp-result.ready{background:linear-gradient(145deg,#eff9f1,#f9fcfa)}
.lp-result-label{display:block;color:var(--lp-muted);font-size:12px;font-weight:750;margin-bottom:7px}
.lp-result>strong{display:block;font-size:37px;color:var(--lp-dark);letter-spacing:-.03em;margin-bottom:10px}
.lp-result p{color:var(--lp-muted);line-height:1.6;max-width:600px;margin:0 auto 16px}
.lp-wa{display:inline-flex;align-items:center;gap:8px;background:var(--lp-wa);color:#fff;text-decoration:none;padding:13px 19px;border-radius:10px;font-weight:800}
.lp-result small{display:block;max-width:590px;margin:11px auto 0;color:#79837d;font-size:11px;line-height:1.5}
.lp-incomplete{margin:0!important}
.lp-bottom-trust{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:19px 0 0}
.lp-bottom-trust span{display:flex;align-items:center;gap:7px;color:#556159;font-size:12px}
.lp-bottom-trust svg{color:var(--lp-green)}
.lp-seo{margin-top:70px}
.lp-seo section{padding:50px 0;border-top:1px solid var(--lp-line)}
.lp-eyebrow{display:block;color:var(--lp-green);text-transform:uppercase;letter-spacing:.1em;font-size:11px;font-weight:800;margin-bottom:10px}
.lp-seo h2{font-size:clamp(27px,4vw,37px);letter-spacing:-.035em;margin:0 0 16px;line-height:1.15}
.lp-seo>section>p{color:var(--lp-muted);line-height:1.75;font-size:15px}
.lp-feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}
.lp-feature-grid div{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--lp-line);padding:13px;border-radius:10px;font-size:13px}
.lp-feature-grid svg{color:var(--lp-green)}
.lp-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.lp-steps article{background:#fff;border:1px solid var(--lp-line);padding:20px;border-radius:14px}
.lp-steps article>div{color:var(--lp-green)}
.lp-steps h3{font-size:15px;margin:10px 0 7px}
.lp-steps p,.lp-faq p{color:var(--lp-muted);font-size:13px;line-height:1.65;margin:0}
.lp-places{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}
.lp-places span{display:flex;align-items:center;gap:5px;background:#fff;border:1px solid var(--lp-line);border-radius:999px;padding:8px 11px;font-size:12px}
.lp-places svg{color:var(--lp-green)}
.lp-faq{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.lp-faq article{background:#fff;border:1px solid var(--lp-line);border-radius:13px;padding:18px}
.lp-faq h3{font-size:14px;margin:0 0 7px;line-height:1.4}
.lp-footer{border-top:1px solid var(--lp-line);background:#fff;padding:24px 0}
.lp-footer .lp-shell{display:flex;justify-content:space-between;gap:18px;align-items:center}
.lp-footer span{font-size:12px;color:var(--lp-muted)}
.lp-footer div div{display:flex;gap:12px;flex-wrap:wrap}
.lp-footer a,.lp-footer button{border:0;background:none;color:#526159;text-decoration:none;font:inherit;font-size:12px;cursor:pointer;padding:0}
.lp-cookie{position:fixed;left:18px;right:18px;bottom:18px;z-index:100;margin:auto;max-width:880px;background:#fff;border:1px solid var(--lp-line);box-shadow:0 15px 45px rgba(0,0,0,.14);border-radius:14px;padding:16px 18px;display:flex;justify-content:space-between;align-items:center;gap:18px}
.lp-cookie>div:first-child{display:flex;flex-direction:column;gap:4px}
.lp-cookie span{font-size:12px;color:var(--lp-muted)}
.lp-cookie-actions{display:flex;gap:7px}
.lp-cookie button{padding:8px 11px;border-radius:8px;border:1px solid var(--lp-line);background:#fff;cursor:pointer}
.lp-cookie .primary{background:var(--lp-green);color:#fff;border-color:var(--lp-green)}
.lp-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.44);z-index:110;display:grid;place-items:center;padding:20px}
.lp-modal{position:relative;background:#fff;border-radius:17px;padding:28px;width:min(650px,100%);max-height:88vh;overflow:auto}
.lp-close{position:absolute;right:14px;top:14px;border:0;background:#f1f4f2;border-radius:8px;padding:7px}
.lp-legal-row{border-top:1px solid var(--lp-line);padding:14px 0}
.lp-legal-row p{color:var(--lp-muted);line-height:1.6;margin:6px 0 0}
@media(max-width:650px){
  .lp-main{padding-top:36px}
  .lp-options.rooms{grid-template-columns:repeat(2,1fr)}
  .lp-options.three,.lp-options.four{grid-template-columns:1fr}
  .lp-bottom-trust,.lp-feature-grid,.lp-faq{grid-template-columns:1fr}
  .lp-steps{grid-template-columns:1fr}
  .lp-footer .lp-shell{align-items:flex-start;flex-direction:column}
  .lp-cookie{flex-direction:column;align-items:stretch}
  .lp-cookie-actions{justify-content:flex-end}
}
`;

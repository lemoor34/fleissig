import { useEffect, useMemo, useState } from "react";
import {
  Check, Home, MapPin, MessageCircle, ReceiptText, ShieldCheck, Sparkles, X,
} from "lucide-react";

const CONFIG = {
  whatsapp: "41779588526",
  company: "Swiss SMM Balian Einzelunternehmen",
  location: "Seengen, Kanton Aargau",
  email: "fleissig.reinigungen@gmail.com",
  uid: "CHE-461.009.759",
};

const FREQUENCIES = ["Einmalig", "Wöchentlich", "Alle 2 Wochen", "Monatlich", "Individuell"];
const EXTRAS = ["Fenster", "Backofen", "Kühlschrank", "Balkon"];

function LegalModal({ type, onClose }) {
  const privacy = [
    ["Verantwortliche Stelle", `${CONFIG.company} · ${CONFIG.location} · ${CONFIG.email}`],
    ["Bearbeitete Daten", "Wir bearbeiten die Angaben aus Ihrer Anfrage sowie Daten, Fotos oder Videos, die Sie uns freiwillig über WhatsApp übermitteln."],
    ["Zweck", "Wir verwenden diese Daten zur Bearbeitung Ihrer Anfrage, Terminvereinbarung und Ausführung des Auftrags."],
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
    <div className="wr-modal-backdrop" role="dialog" aria-modal="true">
      <div className="wr-modal">
        <button className="wr-close" onClick={onClose} aria-label="Schliessen"><X /></button>
        <h2>{type === "privacy" ? "Datenschutzerklärung" : "Impressum"}</h2>
        {rows.map(([title, text]) => <div className="wr-legal-row" key={title}><strong>{title}</strong><p>{text}</p></div>)}
      </div>
    </div>
  );
}

function Choice({ selected, onClick, children }) {
  return <button type="button" className={`wr-choice ${selected ? "selected" : ""}`} aria-pressed={selected} onClick={onClick}>{children}</button>;
}

function Field({ number, title, hint, children }) {
  return (
    <fieldset className="wr-field">
      <legend><span>{number}</span><div>{title}{hint && <small>{hint}</small>}</div></legend>
      {children}
    </fieldset>
  );
}

function buildWhatsAppMessage(form) {
  const extras = form.extras.length ? form.extras.join(", ") : "keine zusätzlichen Angaben";
  return [
    "Grüezi! Ich interessiere mich für eine Wohnungsreinigung.",
    "",
    `Häufigkeit: ${form.frequency}`,
    `Wohnfläche: ca. ${form.area} m²`,
    `Zimmer: ${form.rooms}`,
    `Badezimmer: ${form.bathrooms}`,
    `Ort / PLZ: ${form.location}`,
    `Zusätzlich: ${extras}`,
    form.date ? `Wunschtermin: ${form.date}` : null,
    form.notes ? `Hinweis: ${form.notes}` : null,
    "",
    "Neukundenpreis laut Website: CHF 50.–/Std. (danach CHF 55.–/Std.)",
  ].filter(Boolean).join("\n");
}

export default function WohnungsreinigungLanding() {
  const [legal, setLegal] = useState(null);
  const [form, setForm] = useState({
    frequency: "",
    area: "",
    rooms: "",
    bathrooms: "",
    location: "",
    extras: [],
    date: "",
    notes: "",
  });

  useEffect(() => {
    const oldTitle = document.title;
    document.title = "Wohnungsreinigung Aargau | Fleissig Reinigung";
    return () => { document.title = oldTitle; };
  }, []);

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleExtra = (value) => setForm((current) => ({
    ...current,
    extras: current.extras.includes(value)
      ? current.extras.filter((item) => item !== value)
      : [...current.extras, value],
  }));

  const complete = Boolean(form.frequency && form.area && form.rooms && form.bathrooms && form.location.trim());
  const whatsappHref = useMemo(() => complete
    ? `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage(form))}`
    : "#", [complete, form]);

  return (
    <div className="wohnungsreinigung-landing">
      <header className="wr-header">
        <div className="wr-shell wr-header-inner">
          <a href="/" aria-label="Fleissig Reinigung Startseite"><img src="/favicon.svg" alt="Fleissig Reinigung" /></a>
          <span>Wohnungsreinigung · Aargau</span>
        </div>
      </header>

      <main>
        <section className="wr-hero">
          <div className="wr-shell wr-hero-grid">
            <div>
              <span className="wr-eyebrow">Einmalig oder regelmässig</span>
              <h1>Wohnungsreinigung im Aargau</h1>
              <p>Professionelle Reinigung für Privathaushalte im ganzen Kanton Aargau – unkompliziert, zuverlässig und mit klarer Stundenpauschale.</p>
              <div className="wr-trust">
                <span><ShieldCheck size={18} /> Versichert bis CHF 2 Mio.</span>
                <span><Sparkles size={18} /> Reinigungsmittel inklusive</span>
                <span><ReceiptText size={18} /> TWINT oder Rechnung</span>
              </div>
              <a className="wr-primary" href="#anfrage">Reinigung anfragen</a>
            </div>
            <aside className="wr-price-card" aria-label="Neukundenpreis">
              <span>Neukundenpreis</span>
              <strong>CHF 50.–</strong>
              <b>pro Stunde</b>
              <p>Für Ihre erste Reinigung. Danach CHF 55.–/Std.</p>
            </aside>
          </div>
        </section>

        <section className="wr-shell wr-content">
          <div className="wr-intro-block">
            <span className="wr-eyebrow">Für Ihren Haushalt</span>
            <h2>Was wir bei der Wohnungsreinigung übernehmen</h2>
            <p>Der genaue Umfang wird vor dem Termin abgestimmt. Typische Arbeiten sind Küche, Badezimmer, Böden, Staub und Oberflächen. Zusätzliche Arbeiten können Sie direkt in der Anfrage angeben.</p>
            <div className="wr-feature-grid">
              <div><Check size={18} /><span>Küche und Badezimmer</span></div>
              <div><Check size={18} /><span>Böden und Oberflächen</span></div>
              <div><Check size={18} /><span>Einmalige Reinigung</span></div>
              <div><Check size={18} /><span>Regelmässige Reinigung</span></div>
            </div>
          </div>

          <section className="wr-form-card" id="anfrage" aria-label="Anfrage Wohnungsreinigung">
            <div className="wr-form-head">
              <span className="wr-eyebrow">Kurze Anfrage</span>
              <h2>Was dürfen wir für Sie reinigen?</h2>
              <p>Füllen Sie die wichtigsten Angaben aus. Am Ende sehen Sie Ihren Neukundenpreis und können die Anfrage direkt per WhatsApp senden.</p>
            </div>

            <Field number="1" title="Wie oft wünschen Sie die Reinigung?">
              <div className="wr-options frequency">
                {FREQUENCIES.map((value) => <Choice key={value} selected={form.frequency === value} onClick={() => set("frequency", value)}>{value}</Choice>)}
              </div>
            </Field>

            <Field number="2" title="Wie gross ist die Wohnfläche?" hint="Eine ungefähre Angabe genügt.">
              <div className="wr-area-wrap">
                <input type="number" inputMode="numeric" min="20" max="500" step="1" placeholder="z. B. 85" value={form.area} onChange={(event) => set("area", event.target.value)} aria-label="Wohnfläche in Quadratmetern" />
                <span>m²</span>
              </div>
            </Field>

            <Field number="3" title="Wie viele Zimmer hat die Wohnung?">
              <div className="wr-options rooms">
                {["1–1.5", "2–2.5", "3–3.5", "4–4.5", "5+"] .map((value) => <Choice key={value} selected={form.rooms === value} onClick={() => set("rooms", value)}>{value} Zi.</Choice>)}
              </div>
            </Field>

            <Field number="4" title="Wie viele Badezimmer gibt es?">
              <div className="wr-options bathrooms">
                {["1", "2", "3+"] .map((value) => <Choice key={value} selected={form.bathrooms === value} onClick={() => set("bathrooms", value)}>{value}</Choice>)}
              </div>
            </Field>

            <Field number="5" title="Was soll zusätzlich berücksichtigt werden?" hint="Optional, Mehrfachauswahl möglich.">
              <div className="wr-options extras">
                {EXTRAS.map((value) => <Choice key={value} selected={form.extras.includes(value)} onClick={() => toggleExtra(value)}><Check size={16} />{value}</Choice>)}
              </div>
            </Field>

            <Field number="6" title="Wo findet die Reinigung statt?">
              <input className="wr-input" type="text" placeholder="PLZ / Ort, z. B. 5707 Seengen" value={form.location} onChange={(event) => set("location", event.target.value)} aria-label="PLZ und Ort" />
            </Field>

            <Field number="7" title="Wunschtermin" hint="Optional.">
              <input className="wr-input" type="date" value={form.date} onChange={(event) => set("date", event.target.value)} />
            </Field>

            <Field number="8" title="Weitere Wünsche" hint="Optional.">
              <textarea className="wr-textarea" rows="4" placeholder="z. B. Fokus auf Küche oder Bad" value={form.notes} onChange={(event) => set("notes", event.target.value)} />
            </Field>

            <div className={`wr-result ${complete ? "ready" : ""}`} aria-live="polite">
              {complete ? (
                <>
                  <span>Ihr Neukundenpreis</span>
                  <strong>CHF 50.–/Std.</strong>
                  <p>Für Ihre erste Reinigung. Danach CHF 55.–/Std. Reinigungsmittel sind inklusive.</p>
                  <a className="wr-wa" href={whatsappHref} target="_blank" rel="noopener noreferrer"><MessageCircle size={21} /> Anfrage per WhatsApp senden</a>
                  <small>Ihre Angaben werden automatisch in die WhatsApp-Nachricht übernommen.</small>
                </>
              ) : <p className="wr-incomplete">Füllen Sie die Pflichtangaben aus – danach erscheint Ihr Neukundenpreis.</p>}
            </div>
          </section>

          <section className="wr-seo-section">
            <span className="wr-eyebrow">Flexibel buchbar</span>
            <h2>Einmalige oder regelmässige Wohnungsreinigung</h2>
            <p>Sie können Fleissig Reinigung einmalig, wöchentlich, alle zwei Wochen, monatlich oder nach individueller Absprache buchen. Damit eignet sich der Service sowohl für eine einzelne gründliche Reinigung als auch für die laufende Unterhaltsreinigung im Privathaushalt.</p>
          </section>

          <section className="wr-seo-section">
            <span className="wr-eyebrow">Lokal im Aargau</span>
            <h2>Wohnungsreinigung in Seengen und im ganzen Kanton Aargau</h2>
            <p>Unser Team ist in Seengen zuhause und übernimmt Wohnungsreinigungen im ganzen Kanton Aargau, unter anderem in Lenzburg, Aarau, Wohlen, Baden, Brugg und Zofingen.</p>
            <div className="wr-places">{["Seengen", "Lenzburg", "Aarau", "Wohlen", "Baden", "Brugg", "Zofingen"].map((place) => <span key={place}><MapPin size={15} />{place}</span>)}</div>
          </section>

          <section className="wr-seo-section">
            <span className="wr-eyebrow">FAQ</span>
            <h2>Häufige Fragen zur Wohnungsreinigung</h2>
            <div className="wr-faq">
              <article><h3>Kann ich auch nur eine einmalige Reinigung buchen?</h3><p>Ja. Neben regelmässigen Terminen können Sie auch eine einmalige Wohnungsreinigung anfragen.</p></article>
              <article><h3>Wie hoch ist der Preis?</h3><p>Neue Kunden bezahlen für die erste Reinigung CHF 50.– pro Stunde. Danach beträgt der Preis CHF 55.– pro Stunde.</p></article>
              <article><h3>Sind Reinigungsmittel inklusive?</h3><p>Ja, die notwendigen Reinigungsmittel sind bei der normalen Wohnungsreinigung inklusive.</p></article>
              <article><h3>In welchen Regionen arbeiten Sie?</h3><p>Wir arbeiten von Seengen aus im ganzen Kanton Aargau.</p></article>
            </div>
          </section>
        </section>
      </main>

      <footer className="wr-footer">
        <div className="wr-shell">
          <span>Fleissig Reinigung · Kanton Aargau</span>
          <div>
            <a href="/">Startseite</a>
            <a href="/umzugsreinigung-aargau">Umzugsreinigung</a>
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
:root{--wr-green:#357a49;--wr-dark:#215633;--wr-pale:#f1f7f2;--wr-ink:#171917;--wr-muted:#66716a;--wr-line:#dfe7e1;--wr-wa:#25d366}
*{box-sizing:border-box}
body{margin:0}
.wohnungsreinigung-landing{min-height:100vh;background:#fff;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--wr-ink)}
.wr-shell{width:min(900px,calc(100% - 32px));margin:auto}
.wr-header{background:rgba(255,255,255,.96);border-bottom:1px solid var(--wr-line);backdrop-filter:blur(9px)}
.wr-header-inner{height:68px;display:flex;align-items:center;justify-content:space-between;gap:18px}
.wr-header img{width:47px;height:47px;object-fit:contain}
.wr-header span{font-size:13px;font-weight:700;color:#526159}
.wr-hero{background:linear-gradient(150deg,#edf7ef,#fff 70%);padding:66px 0 60px}
.wr-hero-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:54px;align-items:center}
.wr-eyebrow{display:block;color:var(--wr-green);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;margin-bottom:11px}
.wr-hero h1{font-size:clamp(39px,6vw,58px);line-height:1.06;letter-spacing:-.045em;margin:0 0 18px}
.wr-hero p{font-size:17px;line-height:1.7;color:var(--wr-muted);margin:0 0 20px}
.wr-trust{display:flex;gap:10px 18px;flex-wrap:wrap;color:#526159;font-size:13px;font-weight:650;margin-bottom:25px}
.wr-trust span{display:flex;align-items:center;gap:6px}.wr-trust svg{color:var(--wr-green)}
.wr-primary,.wr-wa{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:10px;text-decoration:none;font-weight:800}
.wr-primary{background:var(--wr-green);color:#fff;padding:13px 20px}
.wr-price-card{background:#fff;border:1px solid #d8e6dc;border-radius:20px;padding:30px;box-shadow:0 18px 46px rgba(35,83,50,.10)}
.wr-price-card>span{display:block;color:var(--wr-green);font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.wr-price-card>strong{display:block;color:var(--wr-dark);font-size:46px;letter-spacing:-.04em;margin-top:8px}
.wr-price-card>b{font-size:14px}.wr-price-card p{font-size:13px;margin:12px 0 0}
.wr-content{padding:68px 0 54px}
.wr-intro-block,.wr-seo-section{padding:16px 0 54px}
.wr-intro-block h2,.wr-seo-section h2,.wr-form-head h2{font-size:clamp(28px,4vw,39px);letter-spacing:-.035em;line-height:1.15;margin:0 0 14px}
.wr-intro-block>p,.wr-seo-section>p,.wr-form-head p{color:var(--wr-muted);line-height:1.75}
.wr-feature-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}
.wr-feature-grid div{display:flex;align-items:center;gap:8px;border:1px solid var(--wr-line);border-radius:11px;padding:13px;background:#fff;font-size:13px}.wr-feature-grid svg{color:var(--wr-green)}
.wr-form-card{background:#fff;border:1px solid var(--wr-line);border-radius:20px;box-shadow:0 18px 46px rgba(35,83,50,.08);overflow:hidden;scroll-margin-top:20px}
.wr-form-head{padding:28px;border-bottom:1px solid var(--wr-line);background:#fbfdfb}.wr-form-head p{margin-bottom:0}
.wr-field{border:0;border-bottom:1px solid var(--wr-line);margin:0;padding:27px}
.wr-field legend{display:flex;gap:12px;align-items:flex-start;font-size:16px;font-weight:800;padding:0;margin-bottom:17px}
.wr-field legend>span{width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:var(--wr-pale);color:var(--wr-green);font-size:12px;flex:0 0 auto}
.wr-field legend small{display:block;font-weight:500;color:var(--wr-muted);font-size:12px;margin-top:3px}
.wr-options{display:grid;gap:9px}.wr-options.frequency{grid-template-columns:repeat(5,1fr)}.wr-options.rooms{grid-template-columns:repeat(5,1fr)}.wr-options.bathrooms{grid-template-columns:repeat(3,1fr)}.wr-options.extras{grid-template-columns:repeat(4,1fr)}
.wr-choice{min-height:49px;border:1px solid #cfdad2;border-radius:10px;background:#fff;color:#334039;padding:10px 11px;font:inherit;font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px}
.wr-choice.selected{border-color:var(--wr-green);background:var(--wr-pale);color:var(--wr-dark);box-shadow:inset 0 0 0 1px var(--wr-green)}
.wr-area-wrap{position:relative;max-width:230px}.wr-area-wrap input,.wr-input,.wr-textarea{width:100%;border:1px solid #cfdad2;border-radius:10px;font:inherit;background:#fff}.wr-area-wrap input,.wr-input{height:50px;padding:0 13px}.wr-area-wrap input{padding-right:42px}.wr-area-wrap span{position:absolute;right:13px;top:15px;color:var(--wr-muted)}.wr-textarea{padding:13px;resize:vertical}
.wr-result{padding:30px;text-align:center;background:#f7faf7}.wr-result.ready{background:linear-gradient(145deg,#eff9f1,#f9fcfa)}
.wr-result>span{display:block;color:var(--wr-muted);font-size:12px;font-weight:750;margin-bottom:7px}.wr-result>strong{display:block;font-size:38px;color:var(--wr-dark);letter-spacing:-.03em;margin-bottom:9px}.wr-result p{color:var(--wr-muted);line-height:1.6;max-width:590px;margin:0 auto 16px}.wr-wa{background:var(--wr-wa);color:#fff;padding:13px 19px}.wr-result small{display:block;margin-top:10px;color:#79837d;font-size:11px}.wr-incomplete{margin:0!important}
.wr-seo-section{margin-top:44px;border-top:1px solid var(--wr-line);padding-top:52px}.wr-places{display:flex;gap:8px;flex-wrap:wrap;margin-top:18px}.wr-places span{display:flex;align-items:center;gap:5px;border:1px solid var(--wr-line);border-radius:999px;padding:8px 11px;font-size:12px}.wr-places svg{color:var(--wr-green)}
.wr-faq{display:grid;grid-template-columns:1fr 1fr;gap:12px}.wr-faq article{border:1px solid var(--wr-line);border-radius:13px;padding:18px}.wr-faq h3{font-size:14px;margin:0 0 7px;line-height:1.4}.wr-faq p{color:var(--wr-muted);font-size:13px;line-height:1.65;margin:0}
.wr-footer{border-top:1px solid var(--wr-line);background:#fff;padding:24px 0}.wr-footer .wr-shell{display:flex;justify-content:space-between;gap:18px;align-items:center}.wr-footer span{font-size:12px;color:var(--wr-muted)}.wr-footer div div{display:flex;gap:12px;flex-wrap:wrap}.wr-footer a,.wr-footer button{border:0;background:none;color:#526159;text-decoration:none;font:inherit;font-size:12px;cursor:pointer;padding:0}
.wr-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.44);z-index:110;display:grid;place-items:center;padding:20px}.wr-modal{position:relative;background:#fff;border-radius:17px;padding:28px;width:min(650px,100%);max-height:88vh;overflow:auto}.wr-close{position:absolute;right:14px;top:14px;border:0;background:#f1f4f2;border-radius:8px;padding:7px}.wr-legal-row{border-top:1px solid var(--wr-line);padding:14px 0}.wr-legal-row p{color:var(--wr-muted);line-height:1.6;margin:6px 0 0}
@media(max-width:760px){.wr-hero-grid{grid-template-columns:1fr;gap:28px}.wr-options.frequency,.wr-options.rooms{grid-template-columns:repeat(2,1fr)}.wr-options.extras{grid-template-columns:repeat(2,1fr)}.wr-faq{grid-template-columns:1fr}}
@media(max-width:560px){.wr-hero{padding:46px 0}.wr-content{padding-top:48px}.wr-feature-grid,.wr-options.bathrooms,.wr-options.extras{grid-template-columns:1fr}.wr-field{padding:22px 19px}.wr-form-head{padding:23px 19px}.wr-footer .wr-shell{align-items:flex-start;flex-direction:column}}
`;

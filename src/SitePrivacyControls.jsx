import { useEffect, useState } from 'react'
import { getConsentChoice, setConsentChoice } from './privacyConsent.js'

const COMPANY = 'Swiss SMM Balian Einzelunternehmen'
const BRAND = 'Fleissig Reinigung'
const LOCATION = 'Seengen, Kanton Aargau'
const EMAIL = 'fleissig.reinigungen@gmail.com'

const PRIVACY_SECTIONS = [
  [
    'Verantwortliche Stelle',
    `${COMPANY} (${BRAND}), ${LOCATION}. Kontakt für Datenschutzanfragen: ${EMAIL}.`,
  ],
  [
    'Welche Daten wir bearbeiten',
    'Wir bearbeiten Daten, die Sie uns bei einer Anfrage freiwillig mitteilen, insbesondere Kontaktangaben, Angaben zur gewünschten Reinigung, Termin- und Objektinformationen sowie Fotos oder Videos. Zusätzlich können nach Ihrer Einwilligung technische Nutzungs- und Kampagnendaten verarbeitet werden, zum Beispiel besuchte Seiten, Referrer, Geräte-/Browserinformationen, Interaktionen mit dem Preisrechner sowie Kampagnen- und Werbeklick-Kennungen.',
  ],
  [
    'Anfragen, Offerten und Aufträge',
    'Daten aus Kundenanfragen verwenden wir zur Bearbeitung Ihrer Anfrage, zur Erstellung und Nachverfolgung von Offerten, zur Terminplanung, zur Durchführung des Auftrags, zur Rechnungsstellung und zur internen Erfolgskontrolle. Vertrags- und Geschäftsdaten können entsprechend gesetzlichen Aufbewahrungspflichten länger gespeichert werden.',
  ],
  [
    'WhatsApp und Kommunikation',
    'Wenn Sie uns über WhatsApp kontaktieren, werden die von Ihnen übermittelten Inhalte durch WhatsApp beziehungsweise Meta verarbeitet. Es gelten zusätzlich die Datenschutzbestimmungen des jeweiligen Anbieters. Freie WhatsApp-Nachrichten werden von unserer Website nicht als Analytics-Parameter an Google Analytics gesendet.',
  ],
  [
    'Google Analytics 4 und Google Ads',
    'Nach Ihrer Einwilligung verwenden wir Google Analytics 4 zur Messung der Website-Nutzung und Google Ads zur Messung des Werbeerfolgs. Dabei können unter anderem Seitenaufrufe, Interaktionen, Referrer, Kampagnenparameter sowie Werbeklick-Kennungen wie GCLID, GBRAID oder WBRAID verarbeitet werden. Anbieter ist insbesondere Google Ireland Limited; eine Verarbeitung durch verbundene Google-Unternehmen ausserhalb der Schweiz beziehungsweise des EWR kann nicht ausgeschlossen werden. Google verwendet dafür die in seinen Bedingungen vorgesehenen vertraglichen und technischen Schutzmechanismen.',
  ],
  [
    'Skвозная Zuordnung von Werbekanälen',
    'Damit wir erkennen können, welcher Werbekanal tatsächlich zu einer Anfrage oder einem Auftrag geführt hat, speichern wir nach Ihrer Einwilligung im Browser eine zufällige Journey-ID sowie Informationen zum ersten und letzten bekannten Kontakt, zur Einstiegsseite und zu Kampagnenparametern. Diese Zuordnungsdaten enthalten nach unserer Implementierung keine Namen, Telefonnummern oder freien Nachrichtentexte. Sie werden für die interne CRM-Zuordnung und die Auswertung von Leads, Aufträgen und Werbekosten verwendet.',
  ],
  [
    'Google Consent Mode v2',
    'Analyse- und Marketingdienste von Google werden auf dieser Website erst nach Ihrer Einwilligung aktiviert. Vor Ihrer Entscheidung stehen ad_storage, analytics_storage, ad_user_data und ad_personalization auf „denied“. Bei „Alle akzeptieren“ werden diese Signale auf „granted“ gesetzt und die optionalen Messdienste geladen. Bei „Nur notwendige“ bleiben sie deaktiviert.',
  ],
  [
    'Offline-Conversion-Messung',
    'Wenn eine Anfrage einem Google-Ads-Klick zugeordnet werden kann, können wir für die Erfolgsmessung Daten wie Werbeklick-ID, Conversion-Zeitpunkt, Auftragsstatus, Wert und Währung an Google Ads zurückmelden. Dies dient dazu, Werbung anhand realer Aufträge statt nur anhand von Klicks zu bewerten. Zusätzliche Kundendaten für Enhanced Conversions werden nicht allein durch diese Website-Funktion übertragen; eine solche Funktion würde separat aktiviert und entsprechend ausgewiesen.',
  ],
  [
    'Meta / Facebook Pixel',
    'Nach Ihrer Einwilligung kann das Meta Pixel geladen werden, um Seitenaufrufe und Lead-Interaktionen zu messen. Anbieter ist Meta Platforms Ireland Limited. Eine Verarbeitung durch verbundene Unternehmen ausserhalb der Schweiz beziehungsweise des EWR kann nicht ausgeschlossen werden. Ohne Einwilligung wird das Meta Pixel nicht geladen.',
  ],
  [
    'Cookies und Local Storage',
    'Für die Speicherung Ihrer Datenschutzauswahl verwenden wir technisch notwendigen Browser-Speicher. Erst nach Ihrer Einwilligung speichern wir zusätzlich die für die Werbezuordnung erforderlichen First-Party-Attributionsdaten im Local Storage. Sie können Ihre Auswahl jederzeit über „Datenschutz“ im Footer ändern.',
  ],
  [
    'Weitergabe und Auftragsbearbeiter',
    'Wir verkaufen keine Personendaten. Daten können an Dienstleister weitergegeben werden, soweit dies für Hosting, Kommunikation, Analyse, Werbung, Buchhaltung oder Auftragsabwicklung erforderlich ist. Dazu gehören je nach Nutzung insbesondere Google, Meta/WhatsApp sowie unsere Hosting- und Cloud-Dienstleister.',
  ],
  [
    'Aufbewahrung',
    'Wir bewahren Personendaten nur so lange auf, wie dies für den jeweiligen Zweck, die Kundenbeziehung oder gesetzliche Pflichten erforderlich ist. Die Speicherdauer in Google Analytics richtet sich zusätzlich nach den dort von uns festgelegten Aufbewahrungseinstellungen und den Bedingungen von Google.',
  ],
  [
    'Ihre Rechte und Widerruf',
    `Sie können im Rahmen des anwendbaren schweizerischen Datenschutzrechts Auskunft, Berichtigung oder Löschung Ihrer Personendaten verlangen. Eine erteilte Einwilligung für Analyse und Marketing können Sie jederzeit mit Wirkung für die Zukunft ändern. Schreiben Sie uns dazu an ${EMAIL} oder öffnen Sie über den Footer erneut die Datenschutzeinstellungen.`,
  ],
  [
    'Stand',
    '20. August 2026. Wir passen diese Datenschutzerklärung an, wenn sich unsere Dienste, Tracking-Verfahren oder rechtlichen Anforderungen ändern.',
  ],
]

function ConsentButtons({ onChoice }) {
  return (
    <div className="fpc-actions">
      <button type="button" className="fpc-btn fpc-secondary" onClick={() => onChoice('rejected')}>
        Nur notwendige
      </button>
      <button type="button" className="fpc-btn fpc-primary" onClick={() => onChoice('accepted')}>
        Alle akzeptieren
      </button>
    </div>
  )
}

export default function SitePrivacyControls() {
  const [choice, setChoice] = useState(() => getConsentChoice())
  const [privacyOpen, setPrivacyOpen] = useState(false)

  useEffect(() => {
    const openCentralPrivacy = (event) => {
      const control = event.target.closest?.('button, a')
      if (!control) return
      const label = (control.textContent || '').trim().toLowerCase()
      if (label !== 'datenschutz' && label !== 'datenschutzerklärung') return

      event.preventDefault()
      event.stopPropagation()
      setPrivacyOpen(true)
    }

    document.addEventListener('click', openCentralPrivacy, true)
    return () => document.removeEventListener('click', openCentralPrivacy, true)
  }, [])

  const choose = (value) => {
    const saved = setConsentChoice(value)
    setChoice(saved)
  }

  return (
    <>
      <style>{styles}</style>

      {!choice && (
        <div className="fpc-banner" role="dialog" aria-label="Datenschutzeinstellungen" aria-live="polite">
          <div className="fpc-banner-copy">
            <strong>Datenschutzeinstellungen</strong>
            <p>
              Wir verwenden optionale Dienste von Google und Meta, um die Nutzung unserer Website und den Erfolg unserer Werbung zu messen.
              Diese Dienste werden erst nach Ihrer Einwilligung aktiviert.
            </p>
            <button type="button" className="fpc-link" onClick={() => setPrivacyOpen(true)}>Datenschutzerklärung</button>
          </div>
          <ConsentButtons onChoice={choose} />
        </div>
      )}

      {privacyOpen && (
        <div className="fpc-overlay" role="dialog" aria-modal="true" aria-labelledby="fpc-title">
          <div className="fpc-modal">
            <button type="button" className="fpc-close" aria-label="Schliessen" onClick={() => setPrivacyOpen(false)}>×</button>
            <span className="fpc-eyebrow">Datenschutz</span>
            <h1 id="fpc-title">Datenschutzerklärung</h1>
            <p className="fpc-intro">
              Diese Erklärung beschreibt, welche Daten Fleissig Reinigung verarbeitet und wie Analyse, Werbung und unsere interne Zuordnung von Leads zu Werbekanälen funktionieren.
            </p>

            {PRIVACY_SECTIONS.map(([title, text]) => (
              <section key={title}>
                <h2>{title}</h2>
                <p>{text}</p>
              </section>
            ))}

            <section className="fpc-settings">
              <h2>Ihre aktuelle Auswahl</h2>
              <p>
                {choice === 'accepted'
                  ? 'Analyse und Marketing sind aktuell erlaubt.'
                  : choice === 'rejected'
                    ? 'Es sind aktuell nur notwendige Dienste erlaubt.'
                    : 'Sie haben noch keine Auswahl getroffen.'}
              </p>
              <ConsentButtons onChoice={choose} />
            </section>
          </div>
        </div>
      )}
    </>
  )
}

const styles = `
/* The page components still contain their historical cookie banners. The
   central controls below replace them so every route uses one consent model. */
.cookie,.lp-cookie,.fw-cookie{display:none!important}
.fpc-banner{position:fixed;left:18px;right:18px;bottom:18px;z-index:10000;max-width:1120px;margin:0 auto;background:#fff;color:#182019;border:1px solid #dce7de;border-radius:18px;box-shadow:0 18px 55px rgba(17,37,22,.18);padding:20px 22px;display:flex;align-items:center;justify-content:space-between;gap:24px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.fpc-banner-copy{max-width:720px}.fpc-banner strong{display:block;font-size:17px;margin-bottom:5px}.fpc-banner p{margin:0;color:#5d6b61;line-height:1.55;font-size:14px}.fpc-link{border:0;background:none;padding:7px 0 0;color:#2f6f43;text-decoration:underline;cursor:pointer;font:inherit;font-size:13px;font-weight:700}.fpc-actions{display:flex;gap:10px;flex-wrap:wrap}.fpc-btn{border-radius:10px;padding:11px 16px;font-weight:800;cursor:pointer;border:1px solid #347348;font-size:14px}.fpc-primary{background:#347348;color:#fff}.fpc-secondary{background:#fff;color:#2d5f3b}.fpc-overlay{position:fixed;inset:0;z-index:10001;background:rgba(10,20,13,.58);backdrop-filter:blur(4px);padding:24px;overflow:auto;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.fpc-modal{width:min(860px,100%);margin:20px auto;background:#fff;color:#1b211c;border-radius:20px;padding:34px 36px 42px;position:relative;box-shadow:0 24px 70px rgba(0,0,0,.28)}.fpc-close{position:absolute;right:18px;top:15px;width:38px;height:38px;border:0;border-radius:50%;background:#eef4ef;color:#23442d;font-size:27px;line-height:1;cursor:pointer}.fpc-eyebrow{display:block;text-transform:uppercase;letter-spacing:.1em;color:#39784b;font-size:11px;font-weight:800;margin-bottom:8px}.fpc-modal h1{font-size:38px;line-height:1.08;margin:0 50px 12px 0;letter-spacing:-.03em}.fpc-intro{font-size:16px;line-height:1.65;color:#5c685f;margin:0 0 28px}.fpc-modal section{padding:18px 0;border-top:1px solid #e6ece7}.fpc-modal section h2{font-size:18px;margin:0 0 8px}.fpc-modal section p{margin:0;color:#56635a;line-height:1.7;font-size:14px}.fpc-settings{margin-top:8px;background:#f5f8f5;padding:20px!important;border-radius:14px;border-top:0!important}.fpc-settings .fpc-actions{margin-top:14px}
@media(max-width:700px){.fpc-banner{align-items:stretch;flex-direction:column;padding:18px}.fpc-actions{width:100%}.fpc-actions .fpc-btn{flex:1}.fpc-overlay{padding:10px}.fpc-modal{margin:8px auto;padding:28px 20px 32px;border-radius:16px}.fpc-modal h1{font-size:30px}.fpc-close{right:12px;top:10px}}
`

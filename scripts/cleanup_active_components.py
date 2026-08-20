from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly 1 match, found {count}")
    return text.replace(old, new, 1)


def update(path: str, transform):
    file = Path(path)
    original = file.read_text(encoding="utf-8")
    updated = transform(original)
    if updated == original:
        raise RuntimeError(f"{path}: codemod made no changes")
    file.write_text(updated, encoding="utf-8")


def cleanup_tracking(text: str) -> str:
    old = """export function trackEvent(name, params = {}) {\n  if (!hasAnalyticsConsent()) return false\n  if (typeof window.gtag !== 'function') return false\n\n  window.gtag('event', name, compactParams({\n    ...eventAttributionParams(params),\n    ...params,\n  }))\n  return true\n}\n"""
    new = """export function trackEvent(name, params = {}) {\n  if (!hasAnalyticsConsent()) return false\n  if (typeof window.gtag !== 'function') return false\n\n  const payload = compactParams({\n    ...eventAttributionParams(params),\n    ...params,\n  })\n  window.gtag('event', name, payload)\n\n  if ((name === 'whatsapp_click' || name === 'phone_click') && typeof window.fbq === 'function') {\n    window.fbq('track', 'Lead', {\n      content_name: params.service || serviceFromPath(),\n    })\n  }\n\n  return true\n}\n"""
    return replace_once(text, old, new, "tracking canonical Meta lead")


def cleanup_appv4(text: str) -> str:
    text = replace_once(text, 'import { useEffect, useState } from "react";\n', 'import { useState } from "react";\n', 'AppV4 import')
    text = replace_once(text, """function trackLead(name) {\n  if (typeof window.gtag === \"function\") {\n    window.gtag(\"event\", \"conversion_event_contact\", { contact_type: name });\n  }\n  if (typeof window.fbq === \"function\") {\n    window.fbq(\"track\", \"Lead\", { content_name: name });\n  }\n}\n\n""", '', 'AppV4 trackLead')
    text = replace_once(text, '      onClick={() => trackLead(type)}\n', '', 'AppV4 WhatsApp onClick')
    text = replace_once(text, '          onClick={() => trackLead("header_whatsapp")}\n', '', 'AppV4 header onClick')
    text = replace_once(text, '                  onClick={() => trackLead("phone")}\n', '', 'AppV4 phone onClick')
    text = replace_once(text, """function CookieBanner() {\n  const [visible, setVisible] = useState(() => !localStorage.getItem(\"fleissig-consent\"));\n  const choose = (value) => {\n    localStorage.setItem(\"fleissig-consent\", value);\n    setVisible(false);\n    if (value === \"accepted\") window.location.reload();\n  };\n  if (!visible) return null;\n\n  return (\n    <div className=\"cookie\">\n      <div>\n        <strong>Datenschutzeinstellungen</strong>\n        <p>Optionale Analyse- und Marketingdienste werden nur mit Ihrer Einwilligung aktiviert.</p>\n      </div>\n      <div className=\"cookie-actions\">\n        <button onClick={() => choose(\"rejected\")}>Nur notwendige</button>\n        <button className=\"accept\" onClick={() => choose(\"accepted\")}>Alle akzeptieren</button>\n      </div>\n    </div>\n  );\n}\n\n""", '', 'AppV4 CookieBanner')
    text = replace_once(text, """function loadAnalyticsAfterConsent() {\n  if (localStorage.getItem(\"fleissig-consent\") !== \"accepted\") return;\n\n  if (!document.getElementById(\"ga-script\")) {\n    const ga = document.createElement(\"script\");\n    ga.id = \"ga-script\";\n    ga.async = true;\n    ga.src = \"https://www.googletagmanager.com/gtag/js?id=G-GY6PDS53F7\";\n    document.head.appendChild(ga);\n    window.dataLayer = window.dataLayer || [];\n    window.gtag = function(){ window.dataLayer.push(arguments); };\n    window.gtag(\"js\", new Date());\n    window.gtag(\"config\", \"G-GY6PDS53F7\", { anonymize_ip: true });\n  }\n\n  if (!window.fbq) {\n    !function(f,b,e,v,n,t,s){\n      if(f.fbq)return;\n      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};\n      if(!f._fbq)f._fbq=n;\n      n.push=n;n.loaded=true;n.version=\"2.0\";n.queue=[];\n      t=b.createElement(e);t.async=true;t.src=v;\n      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)\n    }(window,document,\"script\",\"https://connect.facebook.net/en_US/fbevents.js\");\n    window.fbq(\"init\", \"1607333053899638\");\n    window.fbq(\"track\", \"PageView\");\n  }\n}\n\n""", '', 'AppV4 local analytics loader')
    text = replace_once(text, '  useEffect(() => { loadAnalyticsAfterConsent(); }, []);\n', '', 'AppV4 analytics effect')
    text = replace_once(text, '      <CookieBanner />\n', '', 'AppV4 CookieBanner render')
    return text


def cleanup_umzug(text: str) -> str:
    text = replace_once(text, """function track(name, params = {}) {\n  if (typeof window.gtag === \"function\") window.gtag(\"event\", name, params);\n  if (typeof window.fbq === \"function\" && name === \"umzug_whatsapp_click\") {\n    window.fbq(\"track\", \"Lead\", { content_name: \"Umzugsreinigung Landing\" });\n  }\n}\n\n""", '', 'Umzug legacy track')
    text = replace_once(text, """function loadAnalyticsAfterConsent() {\n  if (localStorage.getItem(\"fleissig-consent\") !== \"accepted\") return;\n  if (!document.getElementById(\"ga-script\")) {\n    const ga = document.createElement(\"script\");\n    ga.id = \"ga-script\";\n    ga.async = true;\n    ga.src = \"https://www.googletagmanager.com/gtag/js?id=G-GY6PDS53F7\";\n    document.head.appendChild(ga);\n    window.dataLayer = window.dataLayer || [];\n    window.gtag = function gtag(){ window.dataLayer.push(arguments); };\n    window.gtag(\"js\", new Date());\n    window.gtag(\"config\", \"G-GY6PDS53F7\", { anonymize_ip: true });\n  }\n}\n\n""", '', 'Umzug local analytics loader')
    text = replace_once(text, """function CookieBanner() {\n  const [visible, setVisible] = useState(() => !localStorage.getItem(\"fleissig-consent\"));\n  if (!visible) return null;\n\n  const choose = (value) => {\n    localStorage.setItem(\"fleissig-consent\", value);\n    setVisible(false);\n    if (value === \"accepted\") loadAnalyticsAfterConsent();\n  };\n\n  return (\n    <div className=\"lp-cookie\">\n      <div><strong>Datenschutzeinstellungen</strong><span>Optionale Analyse- und Marketingdienste nur mit Ihrer Einwilligung.</span></div>\n      <div className=\"lp-cookie-actions\">\n        <button onClick={() => choose(\"rejected\")}>Nur notwendige</button>\n        <button className=\"primary\" onClick={() => choose(\"accepted\")}>Alle akzeptieren</button>\n      </div>\n    </div>\n  );\n}\n\n""", '', 'Umzug CookieBanner')
    text = replace_once(text, '    loadAnalyticsAfterConsent();\n', '', 'Umzug analytics effect call')
    text = replace_once(text, """  const openWhatsApp = () => {\n    if (!estimate) return;\n    track(\"umzug_whatsapp_click\", {\n      estimate_low: estimate.lower,\n      estimate_high: estimate.upper,\n      rooms: form.rooms,\n      area: Number(form.area),\n    });\n  };\n\n""", '', 'Umzug legacy WhatsApp handler')
    text = replace_once(text, ' onClick={openWhatsApp}', '', 'Umzug WhatsApp onClick')
    text = replace_once(text, '      <CookieBanner />\n', '', 'Umzug CookieBanner render')
    return text


def cleanup_fenster(text: str) -> str:
    text = replace_once(text, """function loadAnalyticsAfterConsent() {\n  if (localStorage.getItem(\"fleissig-consent\") !== \"accepted\") return;\n  if (!document.getElementById(\"ga-script\")) {\n    const ga = document.createElement(\"script\");\n    ga.id = \"ga-script\";\n    ga.async = true;\n    ga.src = \"https://www.googletagmanager.com/gtag/js?id=G-GY6PDS53F7\";\n    document.head.appendChild(ga);\n    window.dataLayer = window.dataLayer || [];\n    window.gtag = function(){ window.dataLayer.push(arguments); };\n    window.gtag(\"js\", new Date());\n    window.gtag(\"config\", \"G-GY6PDS53F7\", { anonymize_ip: true });\n  }\n}\n\n""", '', 'Fenster local analytics loader')
    text = replace_once(text, """function CookieBanner() {\n  const [visible, setVisible] = useState(() => !localStorage.getItem(\"fleissig-consent\"));\n  if (!visible) return null;\n  const choose = (value) => {\n    localStorage.setItem(\"fleissig-consent\", value);\n    setVisible(false);\n    if (value === \"accepted\") loadAnalyticsAfterConsent();\n  };\n  return (\n    <div className=\"fw-cookie\">\n      <div><strong>Datenschutzeinstellungen</strong><span>Optionale Analyse- und Marketingdienste nur mit Ihrer Einwilligung.</span></div>\n      <div>\n        <button onClick={() => choose(\"rejected\")}>Nur notwendige</button>\n        <button className=\"primary\" onClick={() => choose(\"accepted\")}>Alle akzeptieren</button>\n      </div>\n    </div>\n  );\n}\n\n""", '', 'Fenster CookieBanner')
    text = replace_once(text, '    loadAnalyticsAfterConsent();\n', '', 'Fenster analytics effect call')
    text = replace_once(text, '      <CookieBanner />\n', '', 'Fenster CookieBanner render')
    return text


def cleanup_privacy_controls(text: str) -> str:
    return replace_once(
        text,
        """/* The page components still contain their historical cookie banners. The\n   central controls below replace them so every route uses one consent model. */\n.cookie,.lp-cookie,.fw-cookie{display:none!important}\n""",
        '',
        'central legacy banner CSS',
    )


update('src/tracking.js', cleanup_tracking)
update('src/AppV4.jsx', cleanup_appv4)
update('src/UmzugsreinigungLanding.jsx', cleanup_umzug)
update('src/FensterreinigungLanding.jsx', cleanup_fenster)
update('src/SitePrivacyControls.jsx', cleanup_privacy_controls)

print('Active tracking/consent cleanup completed successfully')

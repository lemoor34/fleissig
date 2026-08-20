from pathlib import Path

HTML_FILES = [
    Path('index.html'),
    Path('umzugsreinigung-aargau/index.html'),
    Path('fensterreinigung-aargau/index.html'),
]
COMPONENT_FILES = [
    Path('src/AppV4.jsx'),
    Path('src/UmzugsreinigungLanding.jsx'),
    Path('src/FensterreinigungLanding.jsx'),
]

PRECONNECT_GOOGLE = '    <link rel="preconnect" href="https://fonts.googleapis.com" />\n'
PRECONNECT_GSTATIC = '    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />\n'
FONT_IMPORT = "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');\n"
OLD_STACK = "'Plus Jakarta Sans',sans-serif"
NEW_STACK = 'Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'

for path in HTML_FILES:
    text = path.read_text(encoding='utf-8')
    if PRECONNECT_GOOGLE not in text or PRECONNECT_GSTATIC not in text:
        raise RuntimeError(f'{path}: expected Google Fonts preconnects exactly once')
    text = text.replace(PRECONNECT_GOOGLE, '', 1).replace(PRECONNECT_GSTATIC, '', 1)
    path.write_text(text, encoding='utf-8')

for path in COMPONENT_FILES:
    text = path.read_text(encoding='utf-8')
    if FONT_IMPORT not in text:
        raise RuntimeError(f'{path}: expected Google Fonts @import')
    if OLD_STACK not in text:
        raise RuntimeError(f'{path}: expected Plus Jakarta Sans stack')
    text = text.replace(FONT_IMPORT, '', 1)
    text = text.replace(OLD_STACK, NEW_STACK)
    path.write_text(text, encoding='utf-8')

print('Removed Google Fonts network dependency from active pages')

with open('client/src/pages/dashboard/dashboard.css', 'r', encoding='utf-8') as f:
    css = f.read()

css = css.replace('.coop-layout {\n  zoom: 0.75;\n  display: flex;', '.coop-layout {\n  display: flex;')

zoom_css = '''
@media (min-width: 901px) {
  .coop-layout {
    zoom: 0.75;
    min-height: 133.34vh;
  }
}
'''

css += zoom_css

with open('client/src/pages/dashboard/dashboard.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("Done")

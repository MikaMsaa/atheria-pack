from playwright.sync_api import sync_playwright
import pathlib, sys
u=pathlib.Path('plans-urbanisme.html').resolve().as_uri()
with sync_playwright() as pw:
    b=pw.chromium.launch(); pg=b.new_page(viewport={'width':400,'height':900})
    pg.goto(u); pg.wait_for_timeout(800)
    for v in ['mamoudzou','longoni']:
        pg.locator('#defile-'+v).screenshot(path='cap_'+v+'.png')
    print(pg.evaluate('document.documentElement.scrollWidth'))
    b.close()

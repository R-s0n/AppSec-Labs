from sqlite3 import dbapi2 as sqlite3
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
import time

host, port = 'localhost', 80
HOST = f'http://{host}:{port}'

options = Options()

options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--disable-infobars')
options.add_argument('--disable-background-networking')
options.add_argument('--disable-default-apps')
options.add_argument('--disable-extensions')
options.add_argument('--disable-gpu')
options.add_argument('--disable-sync')
options.add_argument('--disable-translate')
options.add_argument('--hide-scrollbars')
options.add_argument('--metrics-recording-only')
options.add_argument('--mute-audio')
options.add_argument('--no-first-run')
options.add_argument('--dns-prefetch-disable')
options.add_argument('--safebrowsing-disable-auto-update')
options.add_argument('--media-cache-size=1')
options.add_argument('--disk-cache-size=1')
options.add_argument('--user-agent=HadesHTB/1.0')

browser = webdriver.Chrome('chromedriver', options=options, service_args=['--verbose', '--log-path=/tmp/chromedriver.log'])

browser.get(f'{HOST}/api/bot/login')

try:
	browser.get(f'{HOST}/list')

	WebDriverWait(browser, 10).until(lambda r: r.execute_script('return document.readyState') == 'complete')

	time.sleep(30)

except Exception as e:
	pass

finally: 
	browser.quit()

time.sleep(5)

conn = sqlite3.connect('bonechewercon.db', isolation_level=None)
conn.cursor().executescript(open('application/schema.sql').read())
conn.commit()
conn.close()
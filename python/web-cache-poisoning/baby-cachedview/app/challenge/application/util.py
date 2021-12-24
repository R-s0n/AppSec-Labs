import functools, signal, struct, socket, os
from urllib.parse import urlparse
from application.models import cache
from flask import request, abort

generate = lambda x: os.urandom(x).hex()

def flash(message, level, **kwargs):
    return { 'message': message, 'level': level, **kwargs }

def serve_screenshot_from(url, domain, width=1000, min_height=400, wait_time=10):
    from selenium import webdriver
    from selenium.webdriver.firefox.options import Options
    from selenium.webdriver.support.ui import WebDriverWait

    options = Options()

    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--ignore-certificate-errors')
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
    options.add_argument('--no-first-run')
    options.add_argument('--safebrowsing-disable-auto-update')
    options.add_argument('--media-cache-size=1')
    options.add_argument('--disk-cache-size=1')
    options.add_argument('--user-agent=MiniMakelaris/1.0')

    options.preferences.update(
        {
            'javascript.enabled': False
        }
    )

    driver = webdriver.Firefox(
        executable_path='geckodriver',
        options=options,
        service_log_path='/tmp/geckodriver.log',
    )

    driver.set_page_load_timeout(wait_time)
    driver.implicitly_wait(wait_time)

    driver.set_window_position(0, 0)
    driver.set_window_size(width, min_height)

    driver.get(url)

    WebDriverWait(driver, wait_time).until(lambda r: r.execute_script('return document.readyState') == 'complete')

    filename = f'{generate(14)}.png'

    driver.save_screenshot(f'application/static/screenshots/{filename}')

    driver.service.process.send_signal(signal.SIGTERM)
    driver.quit()

    cache.new(domain, filename)

    return flash(f'Successfully cached {domain}', 'success', domain=domain, filename=filename)

def cache_web(url):
    scheme = urlparse(url).scheme
    domain = urlparse(url).hostname

    if not domain or not scheme:
        return flash(f'Malformed url {url}', 'danger')
        
    if scheme not in ['http', 'https']:
        return flash('Invalid scheme', 'danger')

    def ip2long(ip_addr):
        return struct.unpack('!L', socket.inet_aton(ip_addr))[0]
    
    def is_inner_ipaddress(ip):
        ip = ip2long(ip)
        return ip2long('127.0.0.0') >> 24 == ip >> 24 or \
                ip2long('10.0.0.0') >> 24 == ip >> 24 or \
                ip2long('172.16.0.0') >> 20 == ip >> 20 or \
                ip2long('192.168.0.0') >> 16 == ip >> 16 or \
                ip2long('0.0.0.0') >> 24 == ip >> 24
    
    if is_inner_ipaddress(socket.gethostbyname(domain)):
        return flash('IP not allowed', 'danger')
    
    return serve_screenshot_from(url, domain)

def is_from_localhost(func):
    @functools.wraps(func)
    def check_ip(*args, **kwargs):
        if request.remote_addr != '127.0.0.1' or request.referrer:
            return abort(403)
        return func(*args, **kwargs)
    return check_ip
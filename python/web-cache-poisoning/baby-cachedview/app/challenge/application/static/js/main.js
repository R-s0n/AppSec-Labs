const form       = document.getElementById('form');
const url        = document.getElementById('url');
const alerts     = document.getElementById('alerts');
const screenshot = document.getElementById('screenshot');
const loading    = document.getElementById('loading');

const flash = (message, level) => {
    alerts.innerHTML += `
        <div class='alert alert-${level}' role='alert'>
            <button type='button' id='closeAlert' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
            <strong>${message}</strong>
        </div>
    `;
};

form.addEventListener('submit', e => {
    e.preventDefault();

    alerts.innerHTML = '';
    screenshot.innerHTML = '';

    if (url.value.trim().length == 0) return flash('URL can\'t be empty', 'warning');

    loading.style.display = 'block';
    fetch('/api/cache', {
        method: 'POST',
        body: JSON.stringify({
            'url': url.value
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(resp => resp.json())
    .then(resp => {
        if (resp.message) {
            flash(resp.message, resp.level);
            
            setTimeout(() => {
                document.getElementById('closeAlert').click();
            }, 2800);
        }

        if (resp.domain) {
            screenshot.innerHTML += `
                <h2>Screenshot for <a href='${url.value}' target='_blank'>${resp.domain}</a></h2>
                <img src='/static/screenshots/${resp.filename}' class='layout'>			
            `;
        }
    })
    .then(() => {
        url.value = '';
        loading.style.display = 'none';
    });
});
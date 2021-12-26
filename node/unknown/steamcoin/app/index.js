const express       = require('express');
const app           = express();
const path          = require('path');
const cookieParser  = require('cookie-parser');
const fileUpload    = require('express-fileupload');
const nunjucks      = require('nunjucks');
const routes        = require('./routes');
const Database      = require('./database');
const Config        = require('./config');

const db = new Database();
const config = new Config();

app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({ limits: {
	fileSize: 2 * 1024 * 1024 // 2 MB
},
abortOnLimit: true
}));

nunjucks.configure('views', {
	autoescape: true,
	express: app
});

app.disable('etag');
app.set('views', express.static(path.resolve('uploads')));
app.use('/static', express.static(path.resolve('static')));
app.use('/uploads', express.static(path.resolve('uploads')));

app.use(routes(db, config));

app.all('*', (req, res) => {
	return res.status(404).send({
		message: '404 page not found'
	});
});

(async () => {
	await db.init();
	app.listen(1337, '0.0.0.0', () => console.log('listening on port 1337'));
})();
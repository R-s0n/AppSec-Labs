const fs             = require('fs');
const path           = require('path');
const express        = require('express');
const router         = express.Router({caseSensitive: true});
const JWTHelper      = require('../helpers/JWTHelper');
const AuthMiddleware = require('../middleware/AuthMiddleware');
const ui_tester            = require('../bot');

let db, conf;

const isValidFile = (file) => { 
	return [
		'jpg',
		'png',
		'svg',
		'pdf'
	].includes(file.name.split('.').slice(-1)[0])
}

const response = data => ({ message: data });

router.get('/', (req, res) => {
	return res.render('login.html');
});

router.get('/register', (req, res) => {
	return res.render('register.html');
});

router.post('/api/register', async (req, res) => {
	const { username, password } = req.body;

	if (username && password) {
		return db.registerUser({
				username: username,
				password: password,
				verification_doc: ''
			})
			.then(()  => res.send(response('Account registered successfully!')))
			.catch(() => res.status(403).send(response('This username is already registered!')));
	}
	return res.status(401).send(response('Please fill out all the required fields!'));
});

router.post('/api/login', async (req, res) => {
	const { username, password } = req.body;

	if (username && password) {
		return db.loginUser({
			username: username,
			password: password
		})
			.then(user => {
				JWTHelper.sign(
					{ username: username }, 
					conf.PRIVATE_KEY,
					`${conf.AUTH_PROVIDER}/.well-known/jwks.json`, 
					conf.KID
				)
					.then(token => {
						res.cookie('session', token, { maxAge: 43200000 });
						return res.send(response('User authenticated successfully!'));
					})
			})
			.catch(() => res.status(403).send(response('Invalid email or password!')));
	}
	return res.status(500).send(response('Missing parameters!'));
});

router.get('/dashboard', AuthMiddleware, async (req, res, next) => {
	return db.getUser(req.data.username)
		.then(user => {
			if ( user.username == 'admin') return res.render('admin.html', { user });
			res.render('dashboard.html', { user });
		})
		.catch(() => res.status(500).send(response('Something went wrong!')));
});

router.get('/settings', AuthMiddleware, async (req, res, next) => {
	return db.getUser(req.data.username)
		.then(user => {
			if ( user.username == 'admin') return res.redirect('/dashboard');
			res.render('settings.html', { user: user });
		})
		.catch(() => res.status(500).send(response('Something went wrong!')));
});

router.get('/logout', (req, res) => {
	res.clearCookie('session');
	return res.redirect('/');
});

router.get('/.well-known/jwks.json', async (req, res, next) => {
	return res.json({
		'keys': [
			{
				'alg': 'RS256',
				'kty': 'RSA',
				'use': 'sig',
				'e': 'AQAB',
				'n': conf.KEY_COMP.n.toString('base64'),
				'kid': conf.KID
			}
		]
	});
});

router.post('/api/upload', AuthMiddleware, async (req, res) => {
	return db.getUser(req.data.username)
		.then(user => {
			if ( user.username == 'admin') return res.redirect('/dashboard');
			if (!req.files || !req.files.verificationDoc) return res.status(400).send(response('No files were uploaded.'));
			let verificationDoc = req.files.verificationDoc;
			if (!isValidFile(verificationDoc)) return res.status(403).send(response('The file must be an image or pdf!'));
			let filename = `${verificationDoc.md5}.${verificationDoc.name.split('.').slice(-1)[0]}`;
			uploadPath = path.join(__dirname, '/../uploads', filename);
			verificationDoc.mv(uploadPath, (err) => {
				if (err) return res.status(500).send(response('Something went wrong!'));
			});
			if(user.verification_doc && user.verification_doc !== filename){
				fs.unlinkSync(path.join(__dirname, '/../uploads',user.verification_doc));
			}
			user.verification_doc = filename;
			db.updateUser(user)
				.then(() =>{
					res.send({'message':'verification file uploaded successfully!','filename':filename});
				})
				.catch(() => res.status(500).send(response('Something went wrong!')));
		})
		.catch(err => res.status(500).send(response(err.message)));
});

router.post('/api/test-ui', AuthMiddleware, (req, res) => {
	return db.getUser(req.data.username)
		.then(user => {
			if (user.username !== 'admin') return res.status(403).send(response('You are not an admin!'));
			let { path, keyword } = req.body;
			if (path, keyword) {
				if (path.startsWith('/')) path = path.replace('/','');
				return ui_tester.testUI(path, keyword)
					.then(resp => res.send(response(resp)))
					.catch(e => res.send(response(e.toString())));
			}
			return res.status(500).send('Missing required parameters!');
		})
		.catch(() => res.status(500).send(response('Authentication required!')));
});

module.exports = (database, config) => { 
	db = database;
	conf = config;
	return router;
};
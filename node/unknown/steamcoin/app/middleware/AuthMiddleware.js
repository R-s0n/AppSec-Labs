const JWTHelper = require('../helpers/JWTHelper');

const response = data => ({ message: data });

module.exports = async (req, res, next) => {
	try {
		if (req.cookies.session === undefined) {
			if (!req.is('application/json')) return res.redirect('/');
			return res.status(401).send(response('Authentication required!'));
		}
		return JWTHelper.getHeader(req.cookies.session)
			.then(header => {
				if (header.jku && header.kid){
					if (header.jku.lastIndexOf('http://localhost:1337/', 0) !== 0) {
						return res.status(500).send(response('The JWKS endpoint is not from localhost!'));
					}
					return JWTHelper.getPublicKey(header.jku, header.kid)
						.then(pubkey => {
							return JWTHelper.verify(req.cookies.session, pubkey)
								.then(data => {
									req.data = {
										username: data.username,
									}
									return next();
								})
								.catch(() => res.status(403).send(response('Authentication token could not be verified!')));
						})
						.catch(() => res.redirect('/logout'));
				}
				return res.status(500).send(response('Missing required claims in JWT!'));
			})
			.catch(err => res.status(500).send(response("Invalid session token supplied!")));
	} catch (e) {
		return res.status(500).send(response(e.toString()));
	}
}
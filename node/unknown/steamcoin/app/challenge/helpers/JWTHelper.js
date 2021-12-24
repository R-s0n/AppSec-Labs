const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
module.exports = {
	async sign(data, privkey, jku, kid) {
		return new Promise(async (resolve, reject) => {
			try {
				resolve(jwt.sign(data, privkey, {
					algorithm: 'RS256',
					header: { 
						jku: jku,
						kid: kid 
					}
				}));
			} catch (e) {
				reject(e);
			}
		});
	},
	async verify(token, pubkey) {
		return new Promise(async (resolve, reject) => {
			try {
				return resolve(jwt.verify(token, pubkey, { algorithm: 'RS256' }));
			} catch (e) {
				reject(e);
			}
		});
	},
	async getHeader(token) {
		return new Promise(async (resolve, reject) => {
			try {
				return resolve(jwt.decode(token, {
					complete: true
				}).header);
			} catch (e) {
				reject(e);
			}
		});
	},
	async getPublicKey(jku, kid) {
		return new Promise(async (resolve, reject) => {
			client = jwksClient({
				jwksUri: jku,
				timeout: 30000
			});
			client.getSigningKey(kid)
				.then(key => {
					resolve(key.getPublicKey());
				})
				.catch(e => {
					reject(e);
				});
		});
	}
};
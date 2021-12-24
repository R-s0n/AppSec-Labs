const crypto = require('crypto');
const nano = require('nano');

class Database {

	async init() {
		this.couch = nano('http://admin:youwouldntdownloadacouch@localhost:5984');
		await this.couch.db.create('users', (err) => {  
			if (err && err.statusCode != 412) {
				console.error(err);
			}
			this.userdb = this.couch.use('users');
			let adminUser = {  
				username: 'admin',
				password: crypto.randomBytes(13).toString('hex'),
				verification_doc: 'HTB{f4k3_fl4g_f0r_t3st1ng}'
			};
			this.userdb.insert(adminUser, adminUser.username)
				.catch(() => {});
		}); 
	}

	async registerUser(user) {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await this.userdb.insert(user, user.username);
				resolve(resp);
			} catch(e) {
				reject(e);
			}
		});
	}

	async loginUser(user) {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await this.userdb.get(user.username);
				(resp.password === user.password) ? resolve() : reject();
			} catch(e) {
				reject(e);
			}
		});
	}

	async getUser(username) {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await this.userdb.get(username);
				resolve(resp);
			} catch(e) {
				reject(false);
			}
		});
	}

	async updateUser(user) {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await this.userdb.insert(user);
				resolve(resp);
			} catch(e) {
				reject(e);
			}
		});
	}

	async listUsers() {
		return new Promise(async (resolve, reject) => {
			try {
				const resp = await this.userdb.list();
				resolve(resp);
			} catch(e) {
				reject(e);
			}
		});
	}

}

module.exports = Database;
const NodeRSA = require('node-rsa');
const uuid = require('uuid');
class Config {
	constructor(env='local'){
		this.KEY = new NodeRSA({b: 512});
		this.KEY.generateKeyPair();
		this.PUBLIC_KEY = this.KEY.exportKey('public')
		this.PRIVATE_KEY = this.KEY.exportKey('private')
		this.KEY_COMP = this.KEY.exportKey('components-public');
		this.KID = uuid.v4();
		if (env == 'prod') {
			this.AUTH_PROVIDER = 'http://steamcoin.htb:1337';
		} else {
			this.AUTH_PROVIDER = 'http://localhost:1337';
		}
	}
}

module.exports = Config
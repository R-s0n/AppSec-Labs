$(document).ready(() => {

});


// can I haz security?
const htmlEncode = (str) => {
	return String(str).replace(/[^\w. ]/gi, function(c) {
		return '&#' + c.charCodeAt(0) + ';';
	});
}
const htmlDecode = (str) => {
	var doc = new DOMParser().parseFromString(str, "text/html");
	return doc.documentElement.textContent;
}
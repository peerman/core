// check for if this is the login popup window
if(window.opener && window.opener.peerman) {

	if(window.opener.peerman.waitForLoginCompletion) {
		window.opener.peerman._completeLogin();
		window.close();
	} else if(window.opener.peerman.waitForLogoutCompletion) {
		window.opener.peerman._completeLogout();
		window.close();
	}
}


var query = getScriptQuery();
var sigServer = query.sigServer || 'http://localhost:5005'; //change this to production value later
var appServer = query.appServer || 'http://localhost:5006'; //change this to production value later

//added debug options
if(query.debug) {
	var parts = decodeURI(query.debug).split(',');
	parts.forEach(function(part) {
		debug.names.push(new RegExp(part.trim()));
	});
}

var peerman = window.peerman = new Peerman();
peerman.connect(sigServer, appServer);

//exporting Classes
peerman.EventEmitter = EventEmitter;
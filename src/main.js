var query = getScriptQuery();
var server = query.server || 'http://localhost:5005'; //change this to production value later

//added debug options
if(query.debug) {
	var parts = decodeURI(query.debug).split(',');
	parts.forEach(function(part) {
		debug.names.push(new RegExp(part.trim()));
	});
}

var peerman = window.peerman = new Peerman();
peerman.connect(server);
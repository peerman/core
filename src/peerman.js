function Peerman() {

	var peerId = this.peerId = getPeerId();
	var socket;
	var options;
	var resourceManager;

	var resources = {};
	var authenticated = null;

	this.connect = function(server) {
		
		server = server || "http://localhost:5005";
		socket = io.connect(server);
		resourceManager = new ResourceManager(socket);
		
		//initialize
		if(socket.socket.connected) {
			initialize();
		}
		socket.on('connect', initialize);
		
		//add some utility methods
		this.createResource = resourceManager.createResource.bind(resourceManager);
		this.removeResource = resourceManager.removeResource.bind(resourceManager);
		this.getResource = resourceManager.getResource.bind(resourceManager);

		this.connect = function() {};
	};

	this.disconnect = function disconnect() {
		
		for(var key in resources) {
			resources[key].leave();
		}
		socket.removeListener('connect', initialize);
		socket.disconnect();
	};

	this.join = function join(id, options) {

		options = options || {};
		options.maxPeers = options.maxPeers || 5;
		options.answerTimeout = options.answerTimeout || 60000;
		options.offerTimeout = options.offerTimeout || 60000;

		var resourceObj = new PeermanResource(peerId, socket);
		resourceObj.connect(id, options);
		resourceObj.metadata = resourceManager.loadMetadata(id);

		resources[id] = resourceObj;
		return resourceObj;
	};

	this.reconnect = function reconnect(callback) {

		authenticated = null;
		initialize(callback);
		//reconnect individual resources as well;
	};

	this.isAuthenticated = function isAuthenticated(callback) {

		if(authenticated == null) {
			//wait for the authenticated notice
			socket.once('authenticated', callback);
		} else {
			callback(authenticated);
		}
	};

	function initialize(callback) {

		var loginToken = getCookie('peerman-login-token');

		socket.emit('init', peerId, loginToken);
		socket.once('authenticated', function(_authenticated) {
			authenticated = _authenticated;
			if(callback) callback(authenticated);
		});
	}
}

function PeermanResource (peerId, server) {

	var self = this;
	var connectionManager;
	var peerDirectory;
	this.id;

	this.connect = function connect(resource, options) {
		
		this.id = resource;
		var connectionOptions = { answerTimeout: options.answerTimeout };
		connectionManager = new ConnectionManager(server, resource, peerId, options.maxPeers, connectionOptions);
		connectionManager.on('peer', onNewPeer);
		
		var directoryOptions = { offerTimeout: options.offerTimeout };
		peerDirectory = new PeerDirectory(server, connectionManager, peerId, directoryOptions);
		peerDirectory.connect(resource, options.maxPeers);

		this.connect = function() {};
	};

	this.reconnect = function reconnect(callback) {

		var $ = new Qbox(2);
		$.ready(callback);

		connectionManager.reconnect(function() { $.tick(); });
		peerDirectory.reconnect(function() { $.tick(); });
	};

	this.leave = function leave() {

		connectionManager.removeListener('peer', onNewPeer);
		peerDirectory.close();
		connectionManager.close();
	};

	function onNewPeer(peer) {

		self.emit('peer', peer);
	}
}

extend(PeermanResource, EventEmitter);


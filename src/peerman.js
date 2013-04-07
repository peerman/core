function Peerman() {

	var peerId = getPeerId();
	var loginToken = getCookie('peerman-login-token');
	var socket;
	var options;
	var resourceManager;

	var resources = {};

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

	function initialize() {

		socket.emit('init', peerId, loginToken);
	}
}

function PeermanResource (peerId, server) {

	var self = this;
	var connectionManager;
	var peerDirectory;

	this.connect = function connect(resource, options) {
		
		var connectionOptions = { answerTimeout: options.answerTimeout };
		connectionManager = new ConnectionManager(server, resource, peerId, options.maxPeers, connectionOptions);
		connectionManager.on('peer', onNewPeer);
		
		var directoryOptions = { offerTimeout: options.offerTimeout };
		peerDirectory = new PeerDirectory(server, connectionManager, peerId, directoryOptions);
		peerDirectory.connect(resource);

		this.connect = function() {};
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


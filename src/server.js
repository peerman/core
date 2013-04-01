var logger = debug('server');

var peerId = getPeerId();
var maxPeers = 5;
var resourceLookingFor = 'default';

var socket = io.connect('http://localhost:5005')
var connectionManager = new ConnectionManager(resourceLookingFor);
var peerDirectory = new PeerDirectory(socket, connectionManager, peerId);

peerDirectory.connect(resourceLookingFor, maxPeers);

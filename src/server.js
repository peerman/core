var logger = debug('server');

var peerId = getPeerId();
var maxPeers = 5;
var resourceLookingFor = 'default';

var socket = io.connect('http://localhost:5005')
var connectionOptions = { answerTimeout: 60000 };
var connectionManager = new ConnectionManager(socket, resourceLookingFor, peerId, maxPeers, connectionOptions);

var directoryOptions = { offerTimeout: 60000 };
var peerDirectory = new PeerDirectory(socket, connectionManager, peerId, directoryOptions);

peerDirectory.connect(resourceLookingFor, maxPeers);

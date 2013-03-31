var logger = debug('server');

var peerId = getPeerId();
var maxPeers = 5;
var connectedPeers = [];
var resourceLookingFor = 'default';

var socket = io.connect('http://localhost:5005')

var connectionManager = new ConnectionManager();

socket.on('connect', afterConnected);
connectionManager.on('disconnect', onPeerDisconnected);

function afterConnected() {

    logger('socket.io connected and initialzing');
    socket.emit('init', peerId, maxPeers, connectedPeers, [resourceLookingFor]);
    socket.once('init-success', findPeersFromDirectory);
}

function findPeersFromDirectory() {
    
    logger('finiging initial peers for resource: ' + resourceLookingFor);
    socket.emit('request-peers', resourceLookingFor, 2);
    socket.once('peers-found', connectWithFoundPeers);
}

function connectWithFoundPeers(peers) {
    
    logger('receiving peers to connect: ' + JSON.stringify(peers));
    if(peers.length == 0) {
        setTimeout(findPeersFromDirectory, 2000);
    } else {
        peers.forEach(function(peer) {

            connectionManager.connectNew(peer, {timeout: 60000}, afterPeerConnectionEst(peer));
        });
    }
}

function afterPeerConnectionEst(peer) {
    
    return function(err) {

        if(err) {
            logger('connection error to peer: ' + peer + ' error: ' + err.message);
        } else {
            connectedPeers.push(peer);
            socket.emit('add-peer', peer);
        }

        reconsiderRequestingMorePeers();
    }
}

function onPeerDisconnected(peer) {

    var index = connectedPeers.indexOf(peer);
    connectedPeers.splice(index, 1);
    socket.emit('remove-peer', peer);

    reconsiderRequestingMorePeers();
}

function reconsiderRequestingMorePeers() {

    var howMuchMorePeersNeeded = maxPeers - connectedPeers.length;
    if(howMuchMorePeersNeeded > 0) {
        setTimeout(findPeersFromDirectory, 2000);
    }
}
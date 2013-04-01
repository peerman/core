function PeerDirectory (server, connectionManager, peerId) {

    var resource;
    var maxPeers;
    var connectedPeers = [];
    var logger = debug('directory');

    this.connect = function connect(_resource, _maxPeers) {

        resource = _resource;
        maxPeers = _maxPeers;

        if(server.socket.connected) {
            //initialize straight if already connected
            initialize();
        }
        server.on('connect', initialize);
    };

    function initialize() {
        
        server.emit('init', peerId, maxPeers, connectedPeers, [resource]);
        server.once('init-success', findPeersFromDirectory);
    }

    function findPeersFromDirectory() {
    
        logger('findiing initial peers for resource: ' + resource);
        server.emit('request-peers', resource, 2);
        server.once('peers-found', connectWithFoundPeers);
    }

    function connectWithFoundPeers(peers) {
        
        logger('receiving peers to connect: ' + JSON.stringify(peers));
        if(peers.length == 0) {
            setTimeout(findPeersFromDirectory, 2000);
        } else {
            peers.forEach(function(peer) {

                connectionManager.connectNew(peer, {timeout: 60000}, afterPeerConnected);
            });
        }
    }

    function afterPeerConnected(err, peerSocket) {
        
        if(err) {
            logger('error connecting to peer: ' + err.peerId + ' error: ' + err.message);
        } else {
            connectedPeers.push(peerSocket.peerId);
            server.emit('add-peer', peerSocket.peerId);

            peerSocket.on('disconnected', onPeerDisconnected);
            reconsiderRequestingMorePeers();
        }
    }

    function onPeerDisconnected() {

        var index = connectedPeers.indexOf(this.peerId);
        connectedPeers.splice(index, 1);
        this.removeListener('disconnected', onPeerDisconnected);
        
        server.emit('remove-peer', this.peerId);
        reconsiderRequestingMorePeers();
    }

    function reconsiderRequestingMorePeers() {

        var howMuchMorePeersNeeded = maxPeers - connectedPeers.length;
        if(howMuchMorePeersNeeded > 0) {
            setTimeout(findPeersFromDirectory, 2000);
        }
    }
}
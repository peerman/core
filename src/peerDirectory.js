function PeerDirectory (server, connectionManager, peerId, options) {

    options = options || {};

    var resource;
    var maxPeers;
    var logger = debug('directory');
    var NUM_REQUESTING_PEERS_COUNT = 2;
    var closed = false;

    this.connect = function connect(_resource, _maxPeers) {

        resource = _resource;
        maxPeers = _maxPeers;

        if(server.socket.connected) {
            //initialize straight if already connected
            initialize();
        }
        server.on('connect', initialize);
        connectionManager.on('peer', onNewPeer);
    };

    this.close = function close() {

        closed = true;
        server.removeListener('connect', initialize);
        connectionManager.removeListener('peer', onNewPeer);
    };

    function initialize() {
        
        var connectedPeers = connectionManager.getConnectedPeerNames();
        var loginToken = getCookie('peerman-login-token');
        server.emit('init-resource', peerId, resource, {
            totalInterested: maxPeers,
            connectedPeers: connectedPeers,
            timestamp: Date.now()
        });
        server.once('init-success-' + resource, function() {
            findPeersFromDirectory.triggerIn(0, [NUM_REQUESTING_PEERS_COUNT]);
        });
    }

    var findPeersFromDirectory = new Runner(function findPeersFromDirectory(peerCount) {

        logger('findiing peers for resource: ' + resource + ' count: ' + peerCount);
        server.emit('request-peers', resource, peerCount);
        server.once('peers-found-' + resource, connectWithFoundPeers);
    }, this);

    function connectWithFoundPeers(peers) {
        
        logger('receiving peers to connect: ' + JSON.stringify(peers));

        if(peers.length == 0) {
            reconsiderRequestingMorePeers();
        } else {
            var numConnecting = 0;
            peers.forEach(function(peer) {

                if(!connectionManager.peers[peer]) {
                    connectionManager.connectNew(peer, {timeout: options.offerTimeout});
                    numConnecting++;
                }
            });

            if(numConnecting != NUM_REQUESTING_PEERS_COUNT) {
                reconsiderRequestingMorePeers();
            }
        }
    }

    function onNewPeer(peerSocket) {
        
        logger('connected with new peer: ' + peerSocket.peerId + ' type: ' + peerSocket.type);
  
        server.emit('add-peer', resource, peerSocket.peerId);

        peerSocket.on('disconnected', onPeerDisconnected);
        reconsiderRequestingMorePeers();
    }

    function onPeerDisconnected() {

        this.removeListener('disconnected', onPeerDisconnected);
        
        server.emit('remove-peer', resource, this.peerId);
        reconsiderRequestingMorePeers();
    }

    function reconsiderRequestingMorePeers() {

        if(!closed) {
            var acceptedPeerCount = connectionManager.canHaveMorePeers(NUM_REQUESTING_PEERS_COUNT);
            if(acceptedPeerCount > 0) {
                findPeersFromDirectory.triggerIn(2000, [acceptedPeerCount]);  
            }
        }
    }
}
function PeerDirectory (server, connectionManager, peerId, options) {

    options = options || {};

    var resource;
    var maxPeers;
    var logger = debug('directory');
    var NUM_REQUESTING_PEERS_COUNT = 2;

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

    function initialize() {
        
        var connectedPeers = connectionManager.getConnectedPeerNames();
        server.emit('init', peerId, maxPeers, connectedPeers, [resource]);
        server.once('init-success', function() {
            findPeersFromDirectory.triggerIn(0);
        });
    }

    var findPeersFromDirectory = new Runner(function findPeersFromDirectory() {
    
        logger('findiing initial peers for resource: ' + resource);
        server.emit('request-peers', resource, NUM_REQUESTING_PEERS_COUNT);
        server.once('peers-found', connectWithFoundPeers);
    }, this);

    function connectWithFoundPeers(peers) {
        
        logger('receiving peers to connect: ' + JSON.stringify(peers));
        if(peers.length == 0) {
            findPeersFromDirectory.triggerIn(2000);
        } else {

            var numConnecting = 0;
            peers.forEach(function(peer) {

                if(!connectionManager.peers[peer]) {
                    connectionManager.connectNew(peer, {timeout: options.offerTimeout});
                    numConnecting++;
                }
            });

            if(numConnecting != NUM_REQUESTING_PEERS_COUNT) {
                findPeersFromDirectory.triggerIn(2000);
            }
        }
    }

    function onNewPeer(peerSocket) {
        
        logger('connected with new peer: ' + peerSocket.peerId + ' type: ' + peerSocket.type);
  
        server.emit('add-peer', peerSocket.peerId);

        peerSocket.on('disconnected', onPeerDisconnected);
        reconsiderRequestingMorePeers();
    }

    function onPeerDisconnected() {

        this.removeListener('disconnected', onPeerDisconnected);
        
        server.emit('remove-peer', this.peerId);
        reconsiderRequestingMorePeers();
    }

    function reconsiderRequestingMorePeers() {

        var connectedPeerCount = connectionManager.getConnectedPeerCount();
        var howMuchMorePeersNeeded = maxPeers - connectedPeerCount;
        if(howMuchMorePeersNeeded > 0) {
            findPeersFromDirectory.triggerIn(2000);
        }
    }
}
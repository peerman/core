function PeerDirectory (server, connectionManager, peerId) {

    var resource;
    var maxPeers;
    var logger = debug('directory');

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
        server.emit('request-peers', resource, 2);
        server.once('peers-found', connectWithFoundPeers);
    }, this);

    function connectWithFoundPeers(peers) {
        
        logger('receiving peers to connect: ' + JSON.stringify(peers));
        if(peers.length == 0) {
            findPeersFromDirectory.triggerIn(2000);
        } else {

            var newPeersExists = false;
            peers.forEach(function(peer) {

                if(!connectionManager.peers[peer]) {
                    connectionManager.connectNew(peer, {timeout: 60000});
                    newPeersExists = true;
                }
            });

            if(!newPeersExists) {
                findPeersFromDirectory.triggerIn(2000);
            }
        }
    }

    function onNewPeer(peerSocket) {
        
        logger('connected with new peer: ' + peerSocket.peerId + ' type: ' + peerSocket.type);
  
        server.emit('add-peer', peerSocket.peerId);

        peerSocket.on('disconnected', onPeerDisconnected.bind(peerSocket));
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
function ConnectionManager(server, resourceName, peerId, maxPeers) {

	var self = this;
	this.peers = {}; //connected peers
    var connectedPeerCount = 0;

    var logger = debug('connection-manager');

    this.connectNew = function connectNew(otherPeerId) {
        
        logger('start connecting with peer: ' + otherPeerId);

        var connection = new PeerSocket(resourceName, otherPeerId, 'offered');
        connection.on('disconnected', removeConnection.bind(connection));
        connection.on('candidate', sendCandidate.bind(connection));
        connection.on('connected', onConnected.bind(connection));

        this.peers[otherPeerId] = connection;

        connection.offer(function(desc) {

            server.emit('offer', otherPeerId, desc);
        });
    };

    this.getConnectedPeerNames = function getConnectedPeers() {

        var rtn = [];
        for(var peerName in this.peers) {
            if(this.peers[peerName].connected) {
                rtn.push(peerName);
            }
        }

        return peerName;
    };

    this.getConnectedPeerCount = function getConnectedPeerCount() {

        return connectedPeerCount;
    };

    server.on('answer', onAnswer);
    server.on('offer', onOffer);
    server.on('ice-candidate', onIceCandidate);

    function onAnswer(from, status, answerDesc) {

        logger('answer from: ' + from  + ' with status: ' + status);
        var connection = self.peers[from];
        if(status == 'ACCEPTED') {
            connection.setRemote(answerDesc);
        } else {
            connection.close();
        }
    }

    function onOffer(from, desc) {

        logger('offer from: ' + from);
        if(self.peers[desc]) {
            logger('offer rejected because of exisitng from: ' + from);
            server.emit('answer', from, 'REJECTED');
        } else {
            var connection = new PeerSocket(resourceName, from, 'answered');
            connection.on('disconnected', removeConnection.bind(connection));
            connection.on('candidate', sendCandidate.bind(connection));
            connection.on('connected', onConnected.bind(connection));
            connection.answer(desc, function(answerDesc) {

                server.emit('answer', from, 'ACCEPTED', answerDesc);
            });

            self.peers[from] = connection;
        }

    }

    function onIceCandidate(from, candidate) {

        var connection = self.peers[from];
        connection.addCandidate(candidate);
    }

    function sendCandidate(candidate) {

        socket.emit('ice-candidate', this.peerId, candidate);
    }

    function onConnected() {

        logger('connecting: ' + this.peerId);
        connectedPeerCount++;
        self.emit('peer', this);
        this.removeListener('connected', onConnected);
    }

    function removeConnection() {

        logger('disconnecting: ' + this.peerId);
        connectedPeerCount--;

    	delete self.peers[this.peerId];
        this.removeListener('disconnected', removeConnection);
        this.removeListener('candidate', sendCandidate);
        this.removeListener('connected', onConnected);
    }
}

extend(ConnectionManager, EventEmitter);
function ConnectionManager(server, resourceName, peerId, maxPeers, options) {

    options = options || {};

	var self = this;
	this.peers = {}; //connected peers
    var connectedPeerCount = 0;
    var timeoutHandlers = {};

    var logger = debug('connection-manager');

    this.connectNew = function connectNew(otherPeerId, connectOptions) {
        
        connectOptions = connectOptions || {};

        logger('start connecting with peer: ' + otherPeerId);

        var connection = new PeerSocket(resourceName, otherPeerId, 'offered');
        connection.on('disconnected', onDisconnected);
        connection.on('candidate', sendCandidate);
        connection.on('connected', onConnected);

        this.peers[otherPeerId] = connection;

        connection.offer(function(desc) {

            server.emit('offer', otherPeerId, desc);
        });

        if(connectOptions.timeout) {
            enableTimeout(otherPeerId, connectOptions.timeout);
        }
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

    this.canHaveMorePeers = function canHaveMorePeers(count) {

        var cntMoreNeeded = maxPeers - connectedPeerCount;
        if(cntMoreNeeded > 0) {
            return (cntMoreNeeded > count)? count: cntMoreNeeded;
        } else {
            return 0;
        }
    };

    server.on('answer', onAnswer);
    server.on('offer', onOffer);
    server.on('ice-candidate', onIceCandidate);

    function onAnswer(from, status, answerDesc) {

        logger('answer from: ' + from  + ' with status: ' + status);
        var connection = self.peers[from];
        if(connection) {
            if(status == 'ACCEPTED') {
                connection.setRemote(answerDesc);
            } else {
                connection.close();
            }
        } else {
            logger('no connection to answer: ' + from);
        }
    }

    function onOffer(from, desc) {

        logger('offer from: ' + from);
        if(self.peers[desc]) {
            logger('offer rejected because of exisitng from: ' + from);
            server.emit('answer', from, 'REJECTED');
        } else {
            var connection = new PeerSocket(resourceName, from, 'answered');
            if(connection) {
                connection.on('disconnected', onDisconnected);
                connection.on('candidate', sendCandidate);
                connection.on('connected', onConnected);
                connection.answer(desc, function(answerDesc) {

                    server.emit('answer', from, 'ACCEPTED', answerDesc);
                });

                self.peers[from] = connection;

                if(options.answerTimeout) {
                    enableTimeout(from, options.answerTimeout);
                }
            } else {
                logger('no connection to offer: ' + from);
            }
        }

    }

    function onIceCandidate(from, candidate) {

        var connection = self.peers[from];
        if(connection) {
            connection.addCandidate(candidate);
        } else {
            logger('no connection to offer ice-candidate: ' + from);
        }
    }

    function sendCandidate(candidate) {

        socket.emit('ice-candidate', this.peerId, candidate);
    }

    function onConnected() {

        logger('connecting: ' + this.peerId);
        connectedPeerCount++;
        self.emit('peer', this);
        this.removeListener('connected', onConnected);

        cancleTimeout(this.peerId);
    }

    function onDisconnected() {

        logger('disconnecting: ' + this.peerId);
        connectedPeerCount--;

    	delete self.peers[this.peerId];
        this.removeListener('disconnected', onDisconnected);
        this.removeListener('candidate', sendCandidate);
        this.removeListener('connected', onConnected);

        cancleTimeout(this.peerId);
    }

    function enableTimeout(peerId, timeoutMillis) {
        
        timeoutHandlers[peerId] = setTimeout(function() {

            var connection = self.peers[peerId];
            if(connection && !connection.connected) {
                logger('timeouting: ' + peerId + ' after: ' + timeoutMillis);
                connection.close();
                timeoutHandlers[peerId] = null;
            }
        }, timeoutMillis);
    }

    function cancleTimeout(peerId) {
        
        var handler = timeoutHandlers[peerId];
        if(handler) {
            logger('clearing timeout handler for: ' + peerId);
            clearTimeout(handler);
            timeoutHandlers[peerId] = null;
        }
    }
}

extend(ConnectionManager, EventEmitter);
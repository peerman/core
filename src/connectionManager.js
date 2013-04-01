function ConnectionManager(resourceName) {

	var self = this;
	this.peers = {};

    this.connectNew = function connectNew(otherPeerId, options, callback) {
        
        logger('start connecting with peer: ' + otherPeerId);

        var connection = new PeerSocket(resourceName, otherPeerId);
        connection.on('disconnected', removeConnection);
        this.peers[otherPeerId] = connection;

        setTimeout(function() {

        	callback(null, connection);
        }, 2000);
    };

    function removeConnection() {

    	delete self.peers[this.peerId];
        this.removeListener('disconnected', removeConnection);
    }
}
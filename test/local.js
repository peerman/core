var resource = peerman.join('abc10');
resource.on('peer', function(peer) {

	console.log('connected with peer: ', peer.peerId);
	peer.once('disconnected', function() {
		console.log('disconnected with peer: ', peer.peerId);
	});
});
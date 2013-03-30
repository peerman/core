function Peer(name) {

    var self = this;

    var logger = this.logger = debug('peer:' + name);
    var iceLogger = this.iceLogger = debug('peer-ice:' + name);

    var servers = {"iceServers":[{"url":"stun:stun.l.google.com:19302"}]};
    var me = this.me = new RTCPeerConnection(servers, {optional: [{RtpDataChannels: true}]});
    var meData = this.meData = me.createDataChannel('default', { reliable: false });
    
    me.onicecandidate = this._onIceCandidate.bind(this);
    me.onicechange = this._onIceChange.bind(this);
    meData.onmessage = this._notifyMessage.bind(this);
    meData.onopen = this._notifyOpen.bind(this);
}

extend(Peer, EventEmitter);

Peer.prototype.offer = function offer(callback) {
    
    var self = this;  
    this.me.createOffer(function(desc) {

        self.logger('offer created');
        self.me.setLocalDescription(desc);
        callback(desc);
    });
};

Peer.prototype.answer = function answer (remoteDesc, callback) {
    
    if(!(remoteDesc instanceof RTCSessionDescription)) {
        remoteDesc = new RTCSessionDescription(remoteDesc);
    }

    var self = this;
    this.me.setRemoteDescription(remoteDesc);
    this.me.createAnswer(function(desc) {

        self.logger('answer created');
        self.me.setLocalDescription(desc);
        callback(desc);
    });
};

Peer.prototype.send = function send(message) {

    this.logger('sending message: ' + message);
    this.meData.send(message);
};

Peer.prototype.setRemote = function configureWithRemote (desc) {
    
    if(!(desc instanceof RTCSessionDescription)) {
        desc = new RTCSessionDescription(desc);
    }

    this.logger('setting remote');
    this.me.setRemoteDescription(desc);  
};

Peer.prototype.addCandidate = function addIceCandidate (candidate) {
    
    this.iceLogger('adding ice candidate: ' + candidate.sdpMid);
    if(this.me.iceConnectionState != 'disconnected') {
        this.me.addIceCandidate(new RTCIceCandidate(candidate));
    }
};

Peer.prototype.close = function close() {

    this.me.close();
    
    this.me.onicecandidate = null;
    this.me.onicechange = null;
    this.meData.onmessage = null;
    this.meData.onopen = null;
    this.meData.onclose = null;
    
    this.logger('closed');
};

Peer.prototype._onIceCandidate = function _onIceCandidate (e) {

    if(e.candidate && e.candidate.sdpMid == 'data') {
        
        this.iceLogger('receiving ice candidate: ' + e.candidate.candidate);
        this.emit('candidate', e.candidate);
    }
}

Peer.prototype._notifyMessage = function _notifyMessage(message) {

    this.logger('receiving message: ' + message.data);
    this.emit('message', message.data);
}

Peer.prototype._notifyOpen = function _notifyOpen() {

    this.logger('state changed: connected');
    this.emit('connected');
}

Peer.prototype._onIceChange = function _onIceChange (state) {
    
    this.logger('changing ice status: ' + this.me.iceConnectionState);
    if(this.me.iceConnectionState == 'disconnected') {
        this.close();
    }
}
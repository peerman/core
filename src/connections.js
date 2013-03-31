function ConnectionManager() {

    this.connectNew = function connectNew(otherPeerId, options, callback) {
        
        logger('start connecting with peer: ' + otherPeerId);
        setTimeout(callback, 2000);
    };
}

extend(ConnectionManager, EventEmitter);
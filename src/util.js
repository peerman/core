function extend(dest, src) {

    for(var key in src.prototype) {
        dest.prototype[key] = src.prototype[key];
    }
}

function uuid_v4() {
   
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

/*
    Get the peerId from either stored on the localStorage or create a new one
*/
function getPeerId() {
    
    var keyname = 'peerman-peer-id';
    var peerId = localStorage.getItem(keyname);

    if(!peerId) {
        peerId = uuid_v4();
        localStorage.setItem(keyname, peerId);
    }

    return peerId;
}
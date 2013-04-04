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

/*
    An Utility which runs a function with a timeout

    * While in queue, if asked to run again that request will be discarded
    * Timeout start with the "last run time", not the current time
*/
function Runner(callback, self) {

    var lastRunAt = 0;
    var scheduled = false;

    this.triggerIn = function(millis, args) {

        if(!scheduled) {
            var now = Date.now();
            var timeDiff = now - lastRunAt;
            
            if(timeDiff > millis) {
                triggerFunction(args);
            } else {
                scheduled = true;
                setTimeout(function() {
                    triggerFunction(args);
                }, millis - timeDiff);
            }
        }
    };

    function triggerFunction(args) {
       
        scheduled = false;
        lastRunAt = Date.now();
        callback.apply(self, args);
    }
}

function getCookie(c_name) {
    
    var i,x,y,ARRcookies=document.cookie.split(";");
    for (i=0;i<ARRcookies.length;i++) {
        x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
        y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
        x=x.replace(/^\s+|\s+$/g,"");
        if (x==c_name) {
            return unescape(y);
        }
    }
}

function getScriptQuery() {
    
    var scripts = document.getElementsByTagName('script');
    var scriptSrc= scripts[scripts.length - 1].src;

    var qs = scriptSrc.split('?')[1];
    var query = {};
    if(qs) {
        var parts = qs.split('&');
        parts.forEach(function(part) {
            var secondPart = part.split('=');
            query[secondPart[0]] = secondPart[1];
        });
    }   

    return query;
}
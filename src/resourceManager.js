function ResourceManager(server) {
    
    this.createResource = function createResource(callback) {
        
        server.emit('create-resource');
        server.once('create-resource', errorCallback(callback));
    };

    this.removeResource = function removeResource(id, callback) {

        server.emit('remove-resource', id);
        server.once('remove-resource-' + id, errorCallback(callback));
    };

    this.getResource = function getResource(callback) {

        server.emit('get-resource');
        server.once('get-resource', errorCallback(callback));
    };

    this.isResourceOwner = function isResourceOwner(id, callback) {

        server.emit('is-resource-owner', id);
        server.once('is-resource-owner-' + id, callback);
    };

    this.loadMetadata = function loadMetadata(resource) {
        
        return new ResourceMetadata(resource);
    };

    function ResourceMetadata (resource) {
        
        this.set = function set(kvPairs, callback) {

            if(typeof(kvPairs) == 'object') {
                server.emit('set-metadata', resource, kvPairs);
                server.once('set-metadata-' + resource, errorCallback(callback));
            } else {
                throw new Error('First argument need to be an object!');
            }
        };

        this.get = function get(keyList, callback) {

            if(typeof(keyList) == 'string' || typeof(keyList) == 'number') {
                keyList = [keyList]
            } else if(!keyList instanceof Array) {
                throw Error('First argument need be a key or array of keys');
            }

            server.emit('get-metadata', resource, keyList);
            server.once('get-metadata-' + resource, errorCallback(callback));
        };

        this.getAll = function getAll(callback) {

            server.emit('get-all-metadata', resource);
            server.once('get-all-metadata-' + resource, errorCallback(callback));
        };

        this.remove = function remove(keyList, callback) {

            if(typeof(keyList) == 'string' || typeof(keyList) == 'number') {
                keyList = [keyList]
            } else if(!keyList instanceof Array) {
                throw Error('First argument need be a key or array of keys');
            }

            server.emit('remove-metadata', resource, keyList);
            server.once('remove-metadata-' + resource, errorCallback(callback));
        };
    }

    function errorCallback(callback) {

        return function() {
            if(arguments[0]) {
                arguments[0] = new Error(arguments[0]);
            }
            callback.apply(null, arguments);
        }
    }
}

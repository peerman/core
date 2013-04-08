(function(exports) {

	function UI() {

		this.log = function log(message) {
			
			console.log(message);
		};

		this.send = function send(message) {

			this.emit('message', message);
		};
	}

	UI.prototype = peerman.EventEmitter.prototype;

	exports.ui = new UI();

})(window);
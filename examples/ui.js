(function(exports) {

	function UI() {

		this.on('log', function(message) {

			console.log(message);
		});
	}

	UI.prototype = peerman.EventEmitter.prototype;

	exports.ui = new UI();

})(window);
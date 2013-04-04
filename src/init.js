if(!window.RTCPeerConnection) {

	if (navigator.mozGetUserMedia) {
	    window.RTCSessionDescription = window.mozRTCSessionDescription;
	    window.RTCPeerConnection = window.mozRTCPeerConnection;
	   	window.getUserMedia = navigator.mozGetUserMedia.bind(navigator);
	} else if (navigator.webkitGetUserMedia) {
	    window.RTCPeerConnection = window.webkitRTCPeerConnection;
	    window.getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
	}
}

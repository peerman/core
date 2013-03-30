if(RTCPeerConnection) return;

var RTCPeerConnection = null;
var getUserMedia = null;
var attachMediaStream = null;

if (navigator.mozGetUserMedia) {
    RTCSessionDescription = window.mozRTCSessionDescription;
    RTCPeerConnection = window.mozRTCPeerConnection;
    getUserMedia = navigator.mozGetUserMedia.bind(navigator);
} else if (navigator.webkitGetUserMedia) {
    RTCPeerConnection = window.webkitRTCPeerConnection;
    getUserMedia = navigator.webkitGetUserMedia.bind(navigator);
}
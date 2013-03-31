// var name = getNameFromUri();
// var me = new Peer(name);
// var otherName;

// var socket = io.connect('http://localhost:5005');
// socket.on('connect', function () {
    
//     console.log('socket.io connected');
//     socket.emit('init', name);
// });

// socket.on('init-success', function() {

//     console.log('initialization succeded');
// });

// function connectTo(other) {
    
//     otherName = other;
//     me.offer(function(desc) {

//         socket.emit('offer-desc', other, desc);
//     });

//     socket.on('answer-desc', function(desc) {

//         me.setRemote(desc);
//     });
// }

// socket.on('offer-desc', function(name, desc) {

//     otherName = name;
//     me.answer(desc, function(answerDesc) {

//         socket.emit('answer-desc', name, answerDesc);
//     })
// });

// socket.on('candidate', function(from, candidate) {

//     me.addCandidate(candidate);
// });

// me.on('candidate', function(candidate) {

//     socket.emit('candidate', otherName, candidate);
// });

// function getNameFromUri() {

//     var parts = location.href.match(/.*#(.*)/);
//     if(parts) {
//         return parts[1];
//     } else {
//         return null;
//     }
// }


var me = new Peer('me');
var you = new Peer('you');

you.on('candidate', me.addCandidate.bind(me));
me.on('candidate', you.addCandidate.bind(you));

me.offer(function(config) {

    you.answer(config, configureMe);
});

function configureMe (config) {
    
    me.setRemote(config);
};

you.on('connected', function() {
    console.log('You Connected');
});

me.on('connected', function() {
    console.log('Me Connected');
});

you.on('message', printMessage('you'));
me.on('message', printMessage('me'));

function printMessage(type) {

    return function(message) {

        console.log('[' +  type + '] incoming message: ', message);
    };
}

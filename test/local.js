function createConnection (id) {
    
    var me = new Peer('me-' + id);
    var you = new Peer('you-' + id);

    you.on('candidate', me.addCandidate.bind(me));
    me.on('candidate', you.addCandidate.bind(you));

    me.offer(function(config) {

        you.answer(config, configureMe);
    });

    function configureMe (config) {
        
        me.setRemote(config);
    };

    window['me' + id] = me;
    window['you' + id] = you;
}

createConnection(1);


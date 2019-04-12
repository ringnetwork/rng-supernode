require('../start.js');
var eventBus = require('rng-core/base/event_bus');

console.log('Unittest : create miner deposit address\n==================\n')

eventBus.on('headless_wallet_ready', function(){
    var createMinerDepositAddress = require('../lib/create_deposit_address.js');
    var db = require('rng-core/db/db.js');

    db.query('SELECT * from my_addresses', [], function(rows) {
        var my_addresses = rows[0].address;
        createMinerDepositAddress.createMinerDepositAddress(my_addresses, 50000000, function(shared_address){
            console.log(JSON.stringify(shared_address));
        })
    })
})
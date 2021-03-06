require("../start");
var eventBus = require("rng-core/base/event_bus");
var objectHash = require('rng-core/base/object_hash.js');

eventBus.on('headless_wallet_ready', function(){
    var headless = require('../lib/wallet')
    var wallet = require("rng-core/wallet/wallet")

    wallet.sendMultiPayment({
        wallet: '4b8fWkZSYYiaVrpvY9fFGF+9XoIhy614twyR3+BM7Zg=',
        arrPayingAddresses: ['FGGWZMAFSSH5GNVRTP73NAW6N2MCTSFY'],
        to_address: 'W3BAX3ECVSEQNMO7BJDMOUUEML4JO5Q3',
        amount: 2000,
        change_address:'W3BAX3ECVSEQNMO7BJDMOUUEML4JO5Q3',
        arrSigningDeviceAddresses: '04HQUUY62ARR7SYXI7XOTRSLUKNQEPR56',
        signWithLocalPrivateKey: headless.signWithLocalPrivateKey,
        messages: [{
            app: "address_definition_change",
            payload_location: "inline",
            payload_hash: objectHash.getBase64Hash({definition_chash: "W3BAX3ECVSEQNMO7BJDMOUUEML4JO5Q3"}),
            payload: {definition_chash: "W3BAX3ECVSEQNMO7BJDMOUUEML4JO5Q3"}
        }]
    }, function(err, result) {
        console.log(err)
        console.log("*&^*^*(^*(^*&^(^(^(^&*^*^(*&^(" + result);
    })
})
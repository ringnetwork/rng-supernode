function createMinerSharedAddress(my_address, amount, callback) {
	/**
	 * create Miner Shared Address
	 * @param my_address {String} supernode address
	 * @param amount {Number} the amount of shared address
	 * @return shared_address {String} miner shared address
	 */
	var ValidationUtils = require("trustnote-pow-common/validation/validation_utils.js");
	
	if (!ValidationUtils.isValidAddress(address))
		return console.log('Please send a valid address');
	
    var constants = require("trustnote-pow-common/config/constants.js");

    function sendMessageToDevice(device_address, text){
        var device = require('trustnote-pow-common/wallet/device.js');
        device.sendMessageToDevice(device_address, 'text', text);
    }

    function onError(err) {
        // throw Error(err);
        console.log("Error: " + err);
    }

	// sendMessageToDevice(from_address, 'Building shared address');
	var device = require('trustnote-pow-common/wallet/device.js');
	var myDeviceAddresses = device.getMyDeviceAddress();
    // var deadline = getUnlockDate();
	var arrDefinition = ['or', 
		['address', constants.FOUNDATION_ADDRESS],
		['address', my_address],
	];
	var assocSignersByPath={
		'r.0.0': {
			address: constants.FOUNDATION_ADDRESS,
			member_signing_path: 'r',
			device_address: constants.FOUNDATION_DEVICE_ADDRESS
		},
		'r.1.0': {
			address: my_address,
			member_signing_path: 'r',
			device_address: myDeviceAddresses
		},
	};

	/**
	 * Create Miner Address
	 * @param {Array} arrDefinition - definiton of miner shared address
	 * @param {Object} assocSignersByPath - address paths of shared address
	 * @param {Function} callback - callback
	 */
	function createMinerAddress(my_address, arrDefinition, assocSignersByPath, callback) {
		var walletDefinedByAddresses = require('trustnote-pow-common/wallet/wallet_defined_by_addresses.js');
		var objectHash = require('trustnote-pow-common/base/object_hash.js');
		var db = require('trustnote-pow-common/db/db.js');
		var shared_address = objectHash.getChash160(arrDefinition)
		db.query('INSERT INTO supernode(address, deposit_address) VALUES (?, ?)', [my_address, shared_address])
		walletDefinedByAddresses.handleNewSharedAddress({address: shared_address, definition: arrDefinition, signers: assocSignersByPath}, {
			ifError: function (err) {
				sendMessageToDevice(from_address, err);
			},
			ifOk: function () {
				var signer = require('./signer.js');
				var composer = require('trustnote-pow-common/unit/composer.js');
				var network = require('trustnote-pow-common/p2p/network.js');
				var callbacks = composer.getSavingCallbacks({
					ifNotEnoughFunds: onError,
					ifError: onError,
					ifOk: function(objJoint){
						network.broadcastJoint(objJoint);
						callback(shared_address);
					}
				});
	
				var input_address = botAddress;
				var arrOutputs = [
					{address: input_address, amount: 0},      // the change
					{address: shared_address, amount: amount}  // the receiver
				];
				var params = {
					paying_addresses: [input_address],
					outputs: arrOutputs,
					signer: signer.signer,
					callbacks: callbacks
				};
				params.arrShareDefinition = [{"arrDefinition":arrDefinition, "assocSignersByPath":assocSignersByPath}];
				params.callbacks = callbacks;
				composer.composeJoint(params);
			}
		})
	}

	createMinerAddress(my_address, arrDefinition, assocSignersByPath, callback);
}

exports.createMinerSharedAddress = createMinerSharedAddress;
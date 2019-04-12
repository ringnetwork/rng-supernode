/*jslint node: true */
"use strict";
var conf = require('rng-core/config/conf');
var ValidationUtils = require("rng-core/validation/validation_utils.js");
var constants = require('rng-core/config/constants.js');

/**
 * create Miner Shared Address
 * @param my_address {String} supernode address
 * @param amount {Number} the amount of shared address
 * @param callback - callback(shared_address) {String} miner shared address
 */
function createMinerDepositAddress(my_address, amount, callback) {
	var deposit = require('rng-core/sc/deposit.js');
	
	if (!ValidationUtils.isValidAddress(my_address))
		return console.log('Please send a valid address');

    function onError(err) {
		// throw Error(err);
		console.log("Error: " + err)
        callback("Error: " + err);
    }

	deposit.hasInvalidUnitsFromHistory(null, my_address, function(err, hasInvalid) {
		if(err) {
			return onError(err)
		} else if (hasInvalid) {
			return onError("Your address had invalid joints. If you still want to be a miner, please create new joint or use other mnemonic codes")
		}
		var address = conf.safe_address ? conf.safe_address : my_address;
		deposit.getDepositAddressBySupernodeAddress(null, my_address, function(err, deposit_address) {
			if (deposit_address) {
				return callback(null, deposit_address)
			}
			deposit.createDepositAddress(address, {
				ifError: onError,
				ifOk: function (deposit_address) {
					var supernode = require('rng-core/wallet/supernode');
					var composer = require('rng-core/unit/composer.js');
					var network = require('rng-core/p2p/network.js');
					var device = require('rng-core/wallet/device.js');
					var callbacks = composer.getSavingCallbacks({
						ifNotEnoughFunds: onError,
						ifError: onError,
						ifOk: function(objJoint){
							network.broadcastJoint(objJoint);
							callback(null, deposit_address);
						}
					});
		
					var input_address = my_address;
					var myDeviceAddresses = device.getMyDeviceAddress();
					if( conf.safe_address ) {
						myDeviceAddresses = conf.safe_device_address;
					}
					if( !ValidationUtils.isValidDeviceAddress(myDeviceAddresses) ) {
						return callbacks.ifError('Not valid safe_device_address')
					}
					var arrOutputs = [
						{address: input_address, amount: 0},      // the change
						{address: deposit_address, amount: amount}  // the receiver
					];
					var params = {
						paying_addresses: [input_address],
						outputs: arrOutputs,
						signer: supernode.signer,
						callbacks: callbacks
					};
					var arrDefinition = [
						'or', 
						[
							['address', constants.FOUNDATION_SAFE_ADDRESS],
							['address', address],
						]
					];
					var assocSignersByPath={
						'r.0': {
							address: constants.FOUNDATION_SAFE_ADDRESS,
							member_signing_path: 'r',
							device_address: constants.FOUNDATION_DEVICE_ADDRESS
						},
						'r.1': {
							address: address,
							member_signing_path: 'r',
							device_address: myDeviceAddresses
						},
					};
					
					params.arrShareDefinition = [{"arrDefinition":arrDefinition, "assocSignersByPath":assocSignersByPath}];
					params.callbacks = callbacks;
					composer.composeJoint(params);
				}
			})
		})
	})
}

/**
 * export
 */
exports.createMinerDepositAddress = createMinerDepositAddress;

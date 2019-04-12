/*jslint node: true */
"use strict";
var conf = require('rng-core/config/conf.js');
var eventBus = require('rng-core/base/event_bus.js');

function replaceConsoleLog(){
	var clog = console.log;
	console.log = function(){
		Array.prototype.unshift.call(arguments, Date().toString()+':');
		clog.apply(null, arguments);
	}
}

function start(){
	console.log('starting');
	var network = require('rng-core/p2p/network.js');
	if (conf.initial_peers)
		conf.initial_peers.forEach(function(url){
			network.findOutboundPeerOrConnect(url);
		});
}

eventBus.on('headless_wallet_ready', function(){
	replaceConsoleLog();
	start()
})
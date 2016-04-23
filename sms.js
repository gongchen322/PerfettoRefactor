// Twilio Credentials 
var accountSid = 'ACdf9761c8272ca6dbc417931845b1e0a7'; 
var authToken = 'c2f19a3e39755944e42d5650af0c3dfa'; 
 
//require the Twilio module and create a REST client 
var client = require('twilio')(accountSid, authToken); 

var sms ={};

sms.sendMessage = function(toNumber, totalPrice) {
		client.messages.create({
	    to: toNumber,
	    from:'+13128183944',
	    body:'You just placed an order at Perfetto! Your total cost is '+totalPrice
	}, function(err, message) { 
		console.log(message.sid); 
	});
};

module.exports = sms;
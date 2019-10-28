const typeMessage	= "message";
const typeCommands	= "commands";
const typeEnable	= "enable";
const typeDisable	= "disable";
const typeError		= "error";

const WebSocket = require('ws');

class XRayManager {
    constructor(host) {
	this.timeout = 250;
	this.theWS = null;
	this.port = 9729; // port = XRAY
	this.host = host;
	this.theWss = null;
	this.that = this;
    }


    // genericcommand actions
    oncommands(message)	{ console.log("oncommands"+message); return {} }; // empty response
    onenable(message)   { console.log("onenable"+message); return {} }; // empty response
    ondisable(message)  { console.log("ondisable"+message); return {} }; // empty response
    onmessage(message)	{ console.log("onmessage"+message); return {} }; // empty response
    onunknown(message)	{ console.log("onunknown"+message); return {} }; // empty response
    
    // generic command dispatcher
    dispatch(messageS) {
	console.log(`XRAY: rcvd: ${messageS}`);
	var messageJ = JSON.parse(messageS);
	// log incoming messages 
	// dispatcher
	     if (messageJ.type == typeCommands) XRayManager.prototype.oncommands(messageJ.message);
	else if (messageJ.type == typeEnable)   XRayManager.prototype.onenable(messageJ.message);
	else if (messageJ.type == typeDisable)  XRayManager.prototype.ondisable(messageJ.message);
	else if (messageJ.type == typeMessage)  XRayManager.prototype.onmessage(messageJ.message);
	else	                                XRayManager.prototype.unknown(messageJ.message);
    }

    //	
    // this is the client setup code. when receiving data, 
    // just change the state of the compoenent, and it will
    // render with the received data
    // 
    //		xray = newXRay();
    //		xray.onmessage = (data) => {this.setState(data);}
    //
    // you can also get a list of the commands
    // 
    //		cmds = xray.getCommands(); 
    //		
    // which returns a map like {"metrics" :
    // <json-metrics-data-prototype>} where "metrics" is a command the
    // the prottype must be JSONparse'd and has a prottype of a
    // metrics message. this allows you to dynamically buid a button
    // to enable/disable the commands, and table/form of the results,
    // without having to known everything in advance.
    //
    // to enable/disable use:
    //	
    //		xray.enable("metrics")
    //		xray.disable("metrics")
    //     

    connect() {
	const url = `ws://${this.host}:${this.port}`;
	console.log(`Connect: ${url}`);
	var theWS = new WebSocket(url);
	var that = this;

	// wire in the dispatcher
	theWS.onmessage = event => { XRayManager.prototype.dispatch(event.data); }

        // if socket is closed, then backoff and retry
        theWS.onclose = function(e) {
            that.timeout = Math.min(10000, 2 * that.timeout); // backoff 2x, but not > 10sec
            console.log(
                `Socket is closed. reconnecting in ${that.timeout} mSeconds.`,
                e.reason
            );
	    // set a timer to reconnect
            setTimeout(check, that.timeout);
        };

	function check() {
	    if (!this.theWS || this.theWS.readyState === WebSocket.CLOSED)
		that.connect(); // if we don't have a ws, or its closed, then reopen
	};
	
	theWS.onerror = function(event) {
	    console.error("WebSocket error observed:", event.message);
	};


    }


    // this is the server code

    broadcast(json_msg) {
	this.theWss.clients.forEach( client => {
	    if (client.readyState === WebSocket.OPEN) {
		client.send(JSON.stringify(json_msg));
	    }
	});
    };
    

    listen() {
	this.theWss = new WebSocket.Server({"port":this.port});

	this.theWss.on('message', function (ws, message)  {
	    console.log("Server message:" + message);
	    dispatch(message);
	});

	this.theWss.on('connection', function(ws, request) {
	    
	    console.log("Connected to" + ws._socket.remoteAddress);
	    
	    ws.on('message', function(message) {
		// we should not receive any messages
		// 
		console.log(`unexpected message ${message} `);
		// uncomment to echo the message
		// const response = `echo "${message}"`;
		// ws.send(response);
	    });
	    
	    ws.on('close', function() {
		console.log(`CLOSE`);
	    });
	    
	    ws.on('error', function(errorEvent) {
		console.log(`ERROR ${JSON.stringify(errorEvent)}`);
	    })
	});
    }
    
}

// we funnel all the xray producers to the client
class XRayServer {

    constructor() {
	this.ids = new Map();
	this.enabled = new Map();
	this.xrm = new XRayManager("localhost");
	this.xrm.enable = this.enable;
	this.xrm.disable = this.disable;
	this.xrm.oncommands = this.oncommands;
	this.xrm.listen();
    }

    add(id,proto) {
	this.ids[id] = proto; // a map id->prototype
	this.enable(id); // enabled by default
	return
    }

    enable(id) {
	this.enabled[id] = true;
	return true;
    }

    disable(id) {
	this.enabled[id] = false;
	return false;
    }
    oncommands() {
	ids_string = JSON.stringify(this.ids);
	return {cmd, ids_string};
    }

    send(id, message) {
	if (this.enabled[id]) {
	    this.xrm.broadcast(
		{
		    "type"    : typeMessage,
		    "id"      : id,
		    "message" : JSON.stringify(message)});
	}
    }

}


// each package is a producer that generates messages
xrs = null;
class XRayProducer {
    constructor(id, proto) {
	// singleton server object
	if (xrs==null) {
	    xrs = new XRayServer();
	    console.log("New server");
	} else {
	    console.log("Same server");
	}

 	this.id = id;
	console.log(this.id);
 	xrs.add(id, this);
    }

    send(message) {
 	// perhaps we should check message keys against prototype keys	
 	xrs.send(this.id, message);
    }
    
}

class XRayConsumer {
    constructor() {
	this.xrm = new XRayManager("localhost");
	this.xrm.connect(); // connect to the server
	this.xrm.onmessage = this.onmessage;

    }

    onmessage(message) {
	console.log("Consumed: " + message);
    }
    

}

module.exports = {XRayProducer, XRayConsumer};

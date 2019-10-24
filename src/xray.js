const typeMessage	= "message";
const typeCommands	= "commands";
const typeEnable	= "enable";
const typeDisable	= "disable";
const typeError		= "error";
const typeData		= "data";

class XRayConsumer {
    timeout = 250;
    theWS = null;
    port = 9729; // port = XRAY

    // genericcommand actions
    oncommands(message)	{ return {} }; // empty response
    onenable(message)   { return {} }; // empty response
    ondisable(message)  { return {} }; // empty response
    ondata(message)	{ return {} }; // empty response
    onunknown(message)	{ return {} }; // empty response
    
    // generic command dispatcher
    dispatch(messageS) {
	messageJ = JSON.parse(messageS);
	// log incoming messages 
	console.log(`XRAY: rcvd: ${messageJ}`);
	// dispatcher
	     if (messageJ.command == messageCommands) oncommands(messageJ.message);
	else if (messageJ.command == messageEnable)   onenable(messageJ.message);
	else if (messageJ.command == messageDisable)  ondisable(messageJ.message);
	else if (messageJ.command == messageData)     ondata(messageJ.message);
	else	                                      unknown(messageJ.message);
    }

    //	
    // this is the client setup code. when receiving data, 
    // just change the state of the compoenent, and it will
    // render with the received data
    // 
    //		xray = newXRay();
    //		xray.ondata = (data) => {this.setState(data);}
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

    connect(host) {
	var theWS = new WebSocket(`ws://${host}:${this.port}`);
	that = this;

	// wire in the dispatcher
	theWS.onmessage = message => dispatch(message);

        // if socket is closed, then backoff and retry
        theWS.onclose = e => {
            that.timeout = Math.min(10000, 2 * that.timeout); // backoff 2x, but not > 10sec
            console.log(
                `Socket is closed. reconnecting in ${that.timeout} mSeconds.`,
                e.reason
            );
	    // set a timer to reconnect
            connectInterval = setTimeout(this.check, that.timeout);
        };

	check = () => {
	    if (!this.ws || this.ws.readyState === WebSocket.CLOSED)
		this.connect(); // if we don't have a ws, or its closed, then reopen
	    };
    }

    // this is the server code
    listen() {
	const wss = new WebSocket.Server({ server });

	function broadcast(json_msg) {
	    wss.clients.forEach( client => {
		if (client.readyState === WebSocket.OPEN) {
		    client.send(json_msg);
		}
	    });
	};

	wss.on('message', function (ws, message)  {
	    pass;
	});

	wss.on('connection', function(ws, request) {
    
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

class XRayProducer {

    constructor() {
	this.ids = new Map();
	this.enabled = new Map();
	this.wsm = new WSManager();
	this.wsm.enable = this.enable;
	this.wsm.disable = this.disable;
	this.wsm.getCommands = this.getCOmmands;
    }

    add(cmd,id) {
	this.ids[id] = xray;
	this.disable(id);
	return
    }

    enable(cmd,id) {
	this.enabled(id) = True;
	return {cmd,id};
    }

    disable(cmd,id) {
	this.enabled(id) = False;
	return {cmd,id};
    }
    getCommands() {
	ids_string = JSON.stringify(this.ids);
	return {cmd, ids_string};
    }

    send(id, message) {
	if (this.enabled(id)) {
	    ws.send(
		{
		    "type"    : typeMessage,
		    "id"      : id,
		    "message" : JSON.stringify(message)});
	}
    }

}

//xrm = new XRayManager();
// class xray {
//     construcftor(id, proto) {
// 	this.id = id;
// 	this.proto = proto;
// 	xrm.add(id, this);
//     }

//     send(message) {
// 	// perhaps we should check message keys against prototype keys	
// 	xrm.send(this.id, message);
//     }
    
// }

module.exports = {XRayProducer, XRayConsumer};
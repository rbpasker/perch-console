import React from "react";

export default class Comp extends React.Component {

    timeout = 250; // Initial timeout duration as a class variable
    count = 1;

    constructor(props) {
	super(props);
	this.state = { 
	    rows: [{"hostname":"hostname",
		    "campaign":"campaign",
		    "product":"product",
		    "actions":"actions",
		    "button":"button"}],
	    ws: null   // websocket
	};
    }
    
    componentDidMount() {
	console.log("Connect");
        this.connect();
    }

    connect = () => {
        var thews = new WebSocket("ws://192.168.200.97:2027/ws");
        let that = this; // cache the this
        var connectInterval;

	// when a message is received
	thews.onmessage = message => {
	    //console.log(`MESSAGE ${message.data} `);
	    this.appendRow(message.data);
	};
    
        // websocket onopen event listener
        thews.onopen = () => {
            console.log("Socket opened");
            this.setState({ ws: thews }); // save the ws into the component state
            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        thews.onclose = e => {
	    this.setState({ws:null});
            that.timeout = Math.min(10000, 2 * that.timeout); // backoff 2x, but not > 10sec
            console.log(
                `Socket is closed. reconnect in ${that.timeout} mSeconds.`,
                e.reason
            );

            connectInterval = setTimeout(this.check, that.timeout);
        };

        // websocket onerror event listener
        thews.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            thews.close();
        };
    };

    /**
     * utilited by the @function connect to check if the connection is close, if so attempts to reconnect
     */
    check = () => {
        const { oldws } = this.state;
        if (!oldws || oldws.readyState === WebSocket.CLOSED)
	    this.connect(); //check if websocket instance is closed, if so call `connect` function.
    };



    appendRow(message) {
	const row = JSON.parse(message);
	row.count = this.count++
	const newrows = this.state.rows.concat([row]);
	this.setState({ rows: newrows});
    }

    render() {
	return (
		<div>
		Connection: {this.state.ws==null?"Closed":"Connected"}
		<table border="1">
		<thead />
		<tbody>{this.state.rows.map(row => 
					    <tr key={row.count}> 
					    <td>{row.hostname}</td> 
					    <td>{row.campaign}</td> 
					    <td>{row.product}</td> 
					    <td>{row.actions}</td> 
					    <td>{row.button}</td> 
					    </tr>)
		       }</tbody>

		</table>
		</div>
	);
    }
}

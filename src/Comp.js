import React from "react";

export default class Comp extends React.Component {

    timeout = 250; // Initial timeout duration as a class variable

    constructor(props) {
	super(props);
	this.state = { 
	    rows: [{"count":"count","date":"date","tick":"tick"}],  // rows of the table
	    ws: null   // websocket
	};
    }
    
    componentDidMount() {
	console.log("Connect");
        this.connect();
    }

    connect = () => {
        var thews = new WebSocket("ws://localhost:8080/ws");
        let that = this; // cache the this
        var connectInterval;

	// when a message is received
	thews.onmessage = message => {
	    console.log(`MESSAGE ${message.data} `);
	    this.appendRow(message.data);
	};
    
        // websocket onopen event listener
        thews.onopen = () => {
            console.log("connected websocket main component");
            this.setState({ ws: thews }); // save the ws into the component state
            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        thews.onclose = e => {
	    this.setState({ws:null});
            that.timeout = Math.min(10000, 2 * that.timeout); // backoff 2x, but not > 10sec
            console.log(
                `Socket is closed. Reconnect will be attempted in ${that.timeout} mSeconds.`,
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
	const newrows = this.state.rows.concat([JSON.parse(message)]);
	//console.log(newrows);
	this.setState({ rows: newrows});
    }

    render() {
	return (
		<div>
		Connected: {this.state.ws==null?"Closed":"Connected"}
		<table border="1">
		<thead />
		<tbody>{this.state.rows.map(row => 
					    <tr key={row.count}> 
					    <td>{row.count}</td> 
					    <td>{row.date}</td> 
					    <td>{row.tick}</td> 
					    </tr>)
		       }</tbody>

		</table>
		</div>
	);
    }
}

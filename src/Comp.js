import React from "react";

export default class Comp extends React.Component {

    timeout = 250; // Initial timeout duration as a class variable

    constructor(props) {
	super(props);
	this.state = { 
	    rows: [], 
	    ws: null
	};
    }
    
    componentDidMount() {
	console.log("Connect");
        this.connect();
    }

    connect = () => {
        var newws = new WebSocket("ws://localhost:8080/ws");
        let that = this; // cache the this
        var connectInterval;

	newws.onmessage = message => {
	    console.log(`MESSAGE ${message.data} `);
	    this.appendRow(message.data);
	};
    
        // websocket onopen event listener
        newws.onopen = () => {
            console.log("connected websocket main component");

            this.setState({ ws: newws });

            that.timeout = 250; // reset timer to 250 on open of websocket connection 
            clearTimeout(connectInterval); // clear Interval on on open of websocket connection
        };

        // websocket onclose event listener
        newws.onclose = e => {
	    this.setState({ws:null});
            console.log(
                `Socket is closed. Reconnect will be attempted in ${Math.min(
                    10000 / 1000,
                    (that.timeout + that.timeout) / 1000
                )} second.`,
                e.reason
            );

            that.timeout = that.timeout + that.timeout; //increment retry interval
            connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
        };

        // websocket onerror event listener
        newws.onerror = err => {
            console.error(
                "Socket encountered error: ",
                err.message,
                "Closing socket"
            );

            newws.close();
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
	var joined = this.state.rows.concat(
		<tr>
		<td>
		{message}
		</td>
		</tr>
	);
	this.setState({ rows: joined });
    }

    render() {
	return (
		<div>
		Connected: {this.state.ws==null?"Closed":"Connected"}
		<table>
		<thead />
		<tbody>{this.state.rows}</tbody>
		</table>
		</div>
	);
    }
}

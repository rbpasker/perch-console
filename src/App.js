import React from 'react';
import logo from './logo.svg';
import './App.css';
import Comp from "./Comp";


function App() {
    return (
	    <div className="App">
            <Comp />
	    </div>
    );
}






//    messages.textContent += `\n${message}`;
//    messages.scrollTop = messages.scrollHeight;
//

// const currentRoute= 'localhost:8080' // window.location.host
// console.log(currentRoute);
// const ws = new WebSocket(`ws://${currentRoute}`);
// ws.onerror = function(event, source, lineno, colno, error ) {
//     var msg = `ERROR: ${JSON.stringify(event)}`;
//     showMessage(msg);
// };
// ws.onopen = function() {
//     showMessage('OPEN');
// };
// ws.onclose = function() {
//     showMessage('CLOSE');
// };
// ws.onmessage = function(message) {
//     showMessage(`MESSAGE ${message.data} `);

// }


export default App;

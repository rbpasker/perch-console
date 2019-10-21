import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}


function showMessage(message) {
    console.log(message);
//    messages.textContent += `\n${message}`;
//    messages.scrollTop = messages.scrollHeight;
}

const currentRoute= 'localhost:8080' // window.location.host
console.log(currentRoute);
const ws = new WebSocket(`ws://${currentRoute}`);
ws.onerror = function(event, source, lineno, colno, error ) {
    var msg = `ERROR: ${JSON.stringify(event)}`;
    showMessage(msg);
};
ws.onopen = function() {
    showMessage('OPEN');
};
ws.onclose = function() {
    showMessage('CLOSE');
};
ws.onmessage = function(message) {
    showMessage(`MESSAGE ${message.data} `);

}


export default App;

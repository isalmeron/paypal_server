import React from 'react';
import './App.css';
import Paypal from './components/PayPal';

const items = [
  {
    amount: {
      currency_code: 'USD',
      value: 10.90
    }
  }
];

function App() {
  return (
    <div className="App">
      <Paypal
        items={items}
        style={{
          color:  'blue',
          shape:  'rect'
        }}
      />
    </div>
  );
}

export default App;

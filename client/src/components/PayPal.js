import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import get from 'lodash/get';

import './PayPal.css';

const PayPalComponent = ({
  items,
  style
}) => {
  const [isSdkReady, setIsSdkReady] = useState(false);
  const [status, setStatus] = useState(200);
  const [message, setMessage] = useState(null);

  const injectPaypalScript = () => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_CLIENT_ID}`;
    script.async = true;
    script.onload = () => setIsSdkReady(true);
    script.onerror = (error) => {
        throw new Error("Could not load SDK");
    };

    document.body.appendChild(script);
  };

  const createOrder = (data, actions, items) => {
    setStatus(200);
    setMessage("Waiting...");

    return fetch('/api/create-order', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({ items }),
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      setMessage("Transaction accepted.");
      return data.orderID; // Use the same key name for order ID on the client and server
    });
  };

  const onApprove = (data, actions) => {
    return fetch('/api/capture-order', {
      method: 'post',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({orderID: data.orderID}),
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      setStatus(200);
      setMessage("Transaction succeeded.");
      return data.captureID;
    });
  };

  const onCancel = (data, actions) => {
    setStatus(200);
    setMessage(`Transaction ${data.orderID} was canceled.`);
  };

  const onError = (data, actions) => {
    setStatus(500);
    setMessage("An error ocurred during transaction.");
  };

  useEffect(() => {
    const windowPaypal = get(window, 'paypal', null);
    if (!windowPaypal) {
      injectPaypalScript();
    }
  }, []);

  if (!isSdkReady) {
    return null;
  }

  const PaypalButton = window.paypal.Buttons.driver("react", {
    React,
    ReactDOM,
  });

  return (
    <div>
      <div>
        <p className={`app_status status_${status}`}>
          {message}
        </p>
      </div>
      <PaypalButton
        env="sandbox"
        createOrder={(data, actions) => createOrder(data, actions, items)}
        onApprove={(data, actions) => onApprove(data, actions)}
        onCancel={(data, actions) => onCancel(data, actions)}
        onError={(data, actions) => onError(data, actions)}
        style={style}
      />
    </div>
  )
};

export default PayPalComponent;
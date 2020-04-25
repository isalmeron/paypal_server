require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const paypal = require('@paypal/checkout-server-sdk');
const _get = require('lodash/get');
const paypalClient = require('./paypalClient');

const app = express();
const port = 3001;

const requestOrderDetails = async (orderID) => {
  const request = new paypal.orders.OrdersGetRequest(orderID);

  let order;
  try {
    order = await paypalClient.client().execute(request);
  } catch (err) {
    console.error(err);
    return {error: 500};
  }

  const purchase_units = _get(order, 'result.purchase_units', []);
  if (!purchase_units.length) {
    return {error: 400};
  }

  return purchase_units;
};

app.post('/api/create-order', bodyParser.json(), async (req, res) => {
  const items = _get(req, 'body.items', []);

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: items,
  });

  try {
    const order = await paypalClient.client().execute(request);
    const orderID = _get(order, 'result.id', -1);

    res.status(200).json({
      // -1 invalid ID
      orderID,
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

app.post('/api/capture-order', bodyParser.json(), async (req, res) => {
  const orderID = _get(req, 'body.orderID', -1);

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await paypalClient.client().execute(request);
    const captureID = _get(capture, 'result.purchase_units[0].payments.captures[0].id', -1);

    res.status(200).json({
      // -1 invalid ID
      captureID,
    });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

app.listen(port, () =>
  console.log(`App listening at http://localhost:${port}`)
);
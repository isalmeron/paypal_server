const paypalSdk = require('@paypal/checkout-server-sdk');

function environment() {
  let clientId = process.env.CLIENT_ID || 'PAYPAL-SANDBOX-CLIENT-ID';
  let clientSecret = process.env.CLIENT_SECRET || 'PAYPAL-SANDBOX-CLIENT-SECRET';

  return new paypalSdk.core.SandboxEnvironment(
      clientId, clientSecret
  );
};

function client() {
  return new paypalSdk.core.PayPalHttpClient(environment());
};

module.exports = {
  client: client
};

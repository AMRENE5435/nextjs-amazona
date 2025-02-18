// const base = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com'

// export const paypal = {
//   createOrder: async function createOrder(price: number) {
//     const accessToken = await generateAccessToken()
//     const url = `${base}/v2/checkout/orders`
//     const response = await fetch(url, {
//       method: 'post',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${accessToken}`,
//       },
//       body: JSON.stringify({
//         intent: 'CAPTURE',
//         purchase_units: [
//           {
//             amount: {
//               currency_code: 'USD',
//               value: price,
//             },
//           },
//         ],
//       }),
//     })
//     return handleResponse(response)
//   },
//   capturePayment: async function capturePayment(orderId: string) {
//     const accessToken = await generateAccessToken()
//     const url = `${base}/v2/checkout/orders/${orderId}/capture`
//     const response = await fetch(url, {
//       method: 'post',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${accessToken}`,
//       },
//     })

//     return handleResponse(response)
//   },
// }

// async function generateAccessToken() {
//   const { PAYPAL_CLIENT_ID, PAYPAL_APP_SECRET } = process.env
//   const auth = Buffer.from(PAYPAL_CLIENT_ID + ':' + PAYPAL_APP_SECRET).toString(
//     'base64'
//   )
//   const response = await fetch(`${base}/v1/oauth2/token`, {
//     method: 'post',
//     body: 'grant_type=client_credentials',
//     headers: {
//       Authorization: `Basic ${auth}`,
//     },
//   })

//   const jsonData = await handleResponse(response)
//   return jsonData.access_token
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// async function handleResponse(response: any) {
//   if (response.status === 200 || response.status === 201) {
//     return response.json()
//   }

//   const errorMessage = await response.text()
//   throw new Error(errorMessage)
// }

//////////////////////////////////////////////////////////////////////////////////////////////////

import axios from 'axios';
import Order from './db/models/order.model';

const PAYPAL_API_BASE_URL = process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_SECRET;

/**
 * Get PayPal access token using client credentials.
 */
export const getPayPalAccessToken = async () => {
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching PayPal access token:', error);
    throw error;
  }
};

/**
 * Create a PayPal order.
 */
interface PayPalOrderDetails {
  intent: string;
  purchase_units: {
    amount: {
      currency_code: string;
      value: string;
    };
    payee: {
      email_address: string;
    };
    description?: string;
  }[];
  application_context: {
    return_url: string;
    cancel_url: string;
    brand_name?: string;
    shipping_preference?: string;
    user_action?: string;
  };
}

export const createPayPalOrder = async (orderId: string, receiverEmail: string) => {
  try {
    const accessToken = await getPayPalAccessToken();

    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const orderDetails: PayPalOrderDetails = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: order.totalPrice.toFixed(2),
          },
          payee: {
            email_address: receiverEmail,
          },
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      },
    };

    const response = await fetch(
      process.env.NEXT_PUBLIC_PAYPAL_MODE === 'live'
        ? 'https://api.paypal.com/v2/checkout/orders'
        : 'https://api.sandbox.paypal.com/v2/checkout/orders',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(orderDetails),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

/**
 * Capture a PayPal order.
 */
export const capturePayPalOrder = async (orderId: string, accessToken: string) => {
  try {
    const response = await axios.post(
      `${PAYPAL_API_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
};
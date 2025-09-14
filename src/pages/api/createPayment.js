export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { amount, currency, customerEmail } = req.body;

    try {
      const auth = Buffer.from(`${process.env.VIVA_MERCHANT_ID}:${process.env.VIVA_API_KEY}`).toString('base64');

      const response = await fetch('https://demo.vivapayments.com/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // σε λεπτά
          currency: currency || 'EUR',
          email: customerEmail,
          sourceCode: process.env.VIVA_SOURCE_CODE,
        }),
      });

      const data = await response.json();
      console.log(data)
      res.status(response.status).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Payment creation failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

const { sendMail, readJsonBody, setCors } = require('./_lib/mailer');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' });

  let body;
  try {
    body = await readJsonBody(req);
  } catch {
    return res.status(400).json({ success: false, message: 'Invalid request body.' });
  }

  const { email } = body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  await sendMail({
    subject: 'New Newsletter Subscription',
    text: `New subscriber: ${email}`,
    html: `<p>New newsletter subscriber: <strong>${email}</strong></p>`,
  });

  res.status(200).json({ success: true, message: 'You have been subscribed to our newsletter!' });
};

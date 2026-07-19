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

  const { name, email, phone, company, service, subject, message } = body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
  }

  await sendMail({
    subject: `New Contact Inquiry — ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nCompany: ${company || '-'}\nService: ${service || '-'}\nSubject: ${subject || '-'}\n\nMessage:\n${message}`,
    html: `<h3>New Contact Inquiry</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || '-'}</p>
      <p><strong>Company:</strong> ${company || '-'}</p>
      <p><strong>Service:</strong> ${service || '-'}</p>
      <p><strong>Subject:</strong> ${subject || '-'}</p>
      <p><strong>Message:</strong><br>${String(message).replace(/\n/g, '<br>')}</p>`,
  });

  console.log(`[${new Date().toLocaleString()}] New inquiry from: ${name} <${email}>`);
  res.status(200).json({ success: true, message: 'Thank you for contacting us! We will get back to you within 24 hours.' });
};

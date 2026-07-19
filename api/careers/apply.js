const { sendMail, readJsonBody, setCors } = require('../_lib/mailer');

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

  const { name, email, phone, position, experience, message } = body;
  if (!name || !email || !position) {
    return res.status(400).json({ success: false, message: 'Name, email and position are required.' });
  }

  await sendMail({
    subject: `New Career Application — ${position}`,
    text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || '-'}\nPosition: ${position}\nExperience: ${experience || '-'}\n\nMessage:\n${message || '-'}`,
    html: `<h3>New Career Application</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || '-'}</p>
      <p><strong>Position:</strong> ${position}</p>
      <p><strong>Experience:</strong> ${experience || '-'}</p>
      <p><strong>Message:</strong><br>${String(message || '-').replace(/\n/g, '<br>')}</p>`,
  });

  console.log(`[${new Date().toLocaleString()}] New application from: ${name} for ${position}`);
  res.status(200).json({ success: true, message: 'Your application has been received. Our HR team will contact you shortly.' });
};

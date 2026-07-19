require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const path = require('path');
const { sendMail } = require('../api/_lib/mailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ── Contact Form ──────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, company, service, subject, message } = req.body;

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
  res.json({ success: true, message: 'Thank you for contacting us! We will get back to you within 24 hours.' });
});

// ── Career Application ─────────────────────────────────────────────────────────
app.post('/api/careers/apply', async (req, res) => {
  const { name, email, phone, position, experience, message } = req.body;

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
  res.json({ success: true, message: 'Your application has been received. Our HR team will contact you shortly.' });
});

// ── Newsletter Subscription ────────────────────────────────────────────────────
app.post('/api/newsletter', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });

  await sendMail({
    subject: 'New Newsletter Subscription',
    text: `New subscriber: ${email}`,
    html: `<p>New newsletter subscriber: <strong>${email}</strong></p>`,
  });

  res.json({ success: true, message: 'You have been subscribed to our newsletter!' });
});

// ── Health Check ───────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), company: 'Waves Envirotech Pvt. Ltd.' });
});

// ── Catch-all → serve index.html ───────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════════╗');
  console.log('  ║   Waves Envirotech Pvt. Ltd. — Website Server   ║');
  console.log(`  ║   Running at: http://localhost:${PORT}              ║`);
  console.log('  ╚══════════════════════════════════════════════════╝');
  console.log('');
});

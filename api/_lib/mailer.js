const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return cachedTransporter;
}

// Sends a notification email. Never throws — logs and resolves false on any
// failure so a missing/broken SMTP config never breaks the visitor's form submission.
async function sendMail({ subject, text, html }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[mailer] SMTP not configured — skipping email. Set SMTP_HOST/SMTP_USER/SMTP_PASS env vars.');
    console.log('[mailer] Would have sent:', subject, '\n', text);
    return false;
  }
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.MAIL_TO || 'syreddy@wavesenviro.com',
      subject,
      text,
      html,
    });
    return true;
  } catch (err) {
    console.error('[mailer] Failed to send email:', err.message);
    return false;
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined) {
      // Vercel's Node runtime already parses JSON bodies for us in most cases.
      if (typeof req.body === 'object' && req.body !== null) return resolve(req.body);
      if (typeof req.body === 'string') {
        try { return resolve(req.body ? JSON.parse(req.body) : {}); } catch { return resolve({}); }
      }
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = { sendMail, readJsonBody, setCors };

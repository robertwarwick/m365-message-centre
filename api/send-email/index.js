const nodemailer = require('nodemailer');

module.exports = async function (context, req) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { to, pageTitle, items } = body;

  if (!to || typeof to !== 'string' || !to.includes('@')) {
    context.res = { status: 400, body: 'Invalid recipient address.' };
    return;
  }
  if (!Array.isArray(items) || items.length === 0) {
    context.res = { status: 400, body: 'No items provided.' };
    return;
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    context.res = {
      status: 503,
      body: 'Email service not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in application settings.',
    };
    return;
  }

  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const from = process.env.SMTP_FROM || smtpUser;

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port,
    secure,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const now = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const title = pageTitle || 'M365 Items';
  const subject = `${title} — ${now} (${items.length} item${items.length !== 1 ? 's' : ''})`;
  const html = buildHtml(title, items, now);

  try {
    await transporter.sendMail({ from, to, subject, html });
    context.res = { status: 200, body: 'OK' };
  } catch (err) {
    context.log.error('Email send failed:', err.message);
    context.res = { status: 502, body: 'Failed to send email: ' + err.message };
  }
};

function buildHtml(title, items, date) {
  const statusStyle = {
    'Launched':       ['#00864F', 'white',   '✓ Launched'],
    'Rolling out':    ['#fff4ce', '#7a4f00', '↗ Rolling out'],
    'Preview':        ['#e6f2fb', '#0078d4', '◎ Preview'],
    'In development': ['#E6F5EE', '#00864F', '⚙ In development'],
    'Cancelled':      ['#fde7e9', '#c50f1f', '✕ Cancelled'],
  };

  const badge = (status) => {
    if (!status || !statusStyle[status]) return '';
    const [bg, color, label] = statusStyle[status];
    return `<span style="display:inline-block;background:${bg};color:${color};font-size:10px;font-weight:600;padding:2px 8px;border-radius:10px;text-transform:uppercase;letter-spacing:0.03em;border:1px solid rgba(0,0,0,0.08)">${label}</span>`;
  };

  const rows = items.map(item => {
    const d = item.date ? new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const products = (item.products || []).join(', ');
    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #edebe9;vertical-align:top">
          <div style="margin-bottom:5px">
            <a href="${esc(item.url)}" style="font-size:14px;font-weight:600;color:#00864F;text-decoration:none">${esc(item.title)}</a>
          </div>
          <div style="font-size:12px;color:#605e5c;margin-bottom:6px;display:flex;flex-wrap:wrap;gap:8px;align-items:center">
            <span style="font-family:Courier New,monospace;font-weight:600;color:#231F20">${esc(item.id)}</span>
            ${d ? `<span>📅 ${d}</span>` : ''}
            ${products ? `<span>${esc(products)}</span>` : ''}
            ${item.status ? badge(item.status) : ''}
          </div>
          ${item.summary ? `<div style="font-size:13px;color:#231F20;line-height:1.5">${esc(item.summary)}${item.summary.length >= 400 ? '…' : ''}</div>` : ''}
        </td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:20px;background:#f3f2f1;font-family:'Segoe UI',Arial,sans-serif;font-size:14px;color:#231F20">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:700px;margin:0 auto;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
    <tr>
      <td style="background:#00864F;padding:20px 24px">
        <div style="font-size:20px;font-weight:600;color:white;margin-bottom:4px">${esc(title)}</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.85)">${items.length} item${items.length !== 1 ? 's' : ''} &nbsp;·&nbsp; ${date}</div>
      </td>
    </tr>
    <tr>
      <td style="background:white;padding:0 24px">
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
          ${rows}
        </table>
      </td>
    </tr>
    <tr>
      <td style="background:#f3f2f1;padding:12px 24px;text-align:center;font-size:11px;color:#605e5c">
        Sent from M365 Message Centre Review
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

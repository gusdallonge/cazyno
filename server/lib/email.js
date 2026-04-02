import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = 'Cazyno <noreply@cazyno.net>';

// ─── Base HTML template with Cazyno branding ───
function template(content) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#080c12;font-family:'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#00e701;font-size:28px;font-weight:900;letter-spacing:0.05em;margin:0;">CAZYNO</h1>
      <div style="width:60px;height:2px;background:#00e701;margin:12px auto 0;"></div>
    </div>
    <!-- Content -->
    <div style="background:#0f1923;border:1px solid #1a2a38;border-radius:16px;padding:32px;color:#e2e8f0;">
      ${content}
    </div>
    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#4b5c6f;font-size:12px;margin:0;">
        &copy; Cazyno — Play responsibly. This email was sent from a no-reply address.
      </p>
    </div>
  </div>
</body>
</html>`;
}

async function send(to, subject, html) {
  if (resend) {
    try {
      await resend.emails.send({ from: FROM, to, subject, html });
    } catch (err) {
      console.error('[email] Resend error:', err);
    }
  } else {
    console.log(`[email][DEV] To: ${to} | Subject: ${subject}`);
  }
}

// ─── Welcome email ───
export async function sendWelcome(email, name) {
  const html = template(`
    <h2 style="color:#00e701;font-size:20px;margin:0 0 16px;">Welcome to Cazyno, ${name}!</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
      Your account is ready. You start with <strong style="color:#00e701;">1,000 credits</strong> — hit the tables and start climbing the VIP ranks.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://cazyno.net/app" style="display:inline-block;background:#00e701;color:#080c12;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
        Start Playing
      </a>
    </div>
    <p style="color:#4b5c6f;font-size:13px;margin:0;">See you at the tables!</p>
  `);
  await send(email, 'Welcome to Cazyno!', html);
}

// ─── Login code email ───
export async function sendLoginCode(email, code) {
  const html = template(`
    <p style="color:#94a3b8;margin:0 0 24px;">Your login code:</p>
    <div style="background:#111a25;border:1px solid #1a2a38;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
      <span style="font-size:36px;font-weight:900;letter-spacing:0.3em;color:#00e701;">${code}</span>
    </div>
    <p style="color:#4b5c6f;font-size:13px;margin:0;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
  `);
  await send(email, `${code} — Your Cazyno code`, html);
}

// ─── Level-up notification ───
export async function sendLevelUp(email, name, tierName, bonus) {
  const bonusLine = bonus
    ? `<p style="color:#94a3b8;line-height:1.6;margin:16px 0 0;">You earned a level-up bonus of <strong style="color:#00e701;">${bonus.toLocaleString()} credits</strong>!</p>`
    : '';
  const html = template(`
    <h2 style="color:#00e701;font-size:20px;margin:0 0 16px;">Level Up!</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0;">
      Congratulations <strong style="color:#fff;">${name}</strong>, you've reached <strong style="color:#00e701;">${tierName}</strong>!
    </p>
    ${bonusLine}
    <div style="text-align:center;margin:24px 0;">
      <a href="https://cazyno.net/app" style="display:inline-block;background:#00e701;color:#080c12;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
        Keep Playing
      </a>
    </div>
  `);
  await send(email, `You reached ${tierName}!`, html);
}

// ─── Daily reward available ───
export async function sendDailyRewardAvailable(email, name, amount) {
  const html = template(`
    <h2 style="color:#00e701;font-size:20px;margin:0 0 16px;">Daily Reward Ready</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
      Hey <strong style="color:#fff;">${name}</strong>, your daily reward of <strong style="color:#00e701;">${amount.toLocaleString()} credits</strong> is waiting for you.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <a href="https://cazyno.net/app" style="display:inline-block;background:#00e701;color:#080c12;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
        Claim Reward
      </a>
    </div>
    <p style="color:#4b5c6f;font-size:13px;margin:0;">Rewards reset daily at midnight UTC.</p>
  `);
  await send(email, `${name}, your daily reward is ready!`, html);
}

// ─── Inactivity reminder ───
export async function sendInactivity(email, name, days) {
  const bonusOffer = days >= 7
    ? `<p style="color:#94a3b8;line-height:1.6;margin:16px 0 0;">Come back now and receive a <strong style="color:#00e701;">special comeback bonus</strong>!</p>`
    : '';
  const html = template(`
    <h2 style="color:#00e701;font-size:20px;margin:0 0 16px;">We miss you!</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0;">
      Hey <strong style="color:#fff;">${name}</strong>, it's been <strong style="color:#00e701;">${days} days</strong> since your last visit. The tables are waiting!
    </p>
    ${bonusOffer}
    <div style="text-align:center;margin:24px 0;">
      <a href="https://cazyno.net/app" style="display:inline-block;background:#00e701;color:#080c12;font-weight:700;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:15px;">
        Return to Cazyno
      </a>
    </div>
  `);
  await send(email, `${name}, we miss you at Cazyno!`, html);
}

// ─── Withdrawal confirmed ───
export async function sendWithdrawalConfirmed(email, name, amount, crypto, txHash) {
  const html = template(`
    <h2 style="color:#00e701;font-size:20px;margin:0 0 16px;">Withdrawal Confirmed</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
      Hey <strong style="color:#fff;">${name}</strong>, your withdrawal has been processed:
    </p>
    <div style="background:#111a25;border:1px solid #1a2a38;border-radius:12px;padding:20px;margin-bottom:16px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="color:#4b5c6f;padding:4px 0;font-size:14px;">Amount</td>
          <td style="color:#fff;padding:4px 0;font-size:14px;text-align:right;font-weight:600;">${amount} ${crypto.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="color:#4b5c6f;padding:4px 0;font-size:14px;">TX Hash</td>
          <td style="color:#00e701;padding:4px 0;font-size:12px;text-align:right;word-break:break-all;">${txHash}</td>
        </tr>
      </table>
    </div>
    <p style="color:#4b5c6f;font-size:13px;margin:0;">It may take a few minutes to appear in your wallet depending on network congestion.</p>
  `);
  await send(email, 'Withdrawal Confirmed', html);
}

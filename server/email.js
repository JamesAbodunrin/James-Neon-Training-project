/**
 * Send welcome email when a user account is created.
 * Uses Resend when RESEND_API_KEY is set; otherwise logs and skips.
 * Set EMAIL_FROM (e.g. "ThesisAnalyzer <onboarding@resend.dev>") or we use a default.
 */

async function sendWelcomeEmail(email, username) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log('[email] RESEND_API_KEY not set; skipping welcome email to', email);
    return;
  }
  try {
    const { Resend } = require('resend');
    const resend = new Resend(apiKey);
    const from = process.env.EMAIL_FROM || 'ThesisAnalyzer <onboarding@resend.dev>';
    const displayName = username || email?.split('@')[0] || 'User';
    const { data, error } = await resend.emails.send({
      from,
      to: email,
      subject: 'Your ThesisAnalyzer account has been created',
      html: `
        <h2>Welcome to ThesisAnalyzer</h2>
        <p>Hi ${displayName},</p>
        <p>Your account has been successfully created. You can log in with your email or username and password.</p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>— ThesisAnalyzer</p>
      `,
    });
    if (error) {
      console.error('[email] Resend error:', error);
      return;
    }
    console.log('[email] Welcome email sent to', email, data?.id || '');
  } catch (err) {
    console.error('[email] Failed to send welcome email:', err.message || err);
  }
}

module.exports = { sendWelcomeEmail };

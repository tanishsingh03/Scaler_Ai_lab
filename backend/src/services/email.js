const nodemailer = require('nodemailer');

// Nodemailer transporter using Gmail SMTP (100% free, no third party)
// Requires: A Gmail account + an App Password (not your regular password)
// Setup: myaccount.google.com/apppasswords → Create → Copy the 16-char password
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,          // use STARTTLS (port 587), NOT SSL (port 465)
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  tls: {
    rejectUnauthorized: false, // allows self-signed certs in local dev
  },
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'MeetSync <noreply@meetsync.com>';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * Send booking confirmation email to the invitee
 */
async function sendBookingConfirmation(booking) {
  if (!process.env.SMTP_USER) return; // Skip if not configured

  const { inviteeName, inviteeEmail, startTime, endTime, eventType, rescheduleToken } = booking;

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  const rescheduleLink = `${FRONTEND_URL}/reschedule/${rescheduleToken}`;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: inviteeEmail,
    subject: `Confirmed: ${eventType.title} on ${dateStr}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e2e2e2; border-radius: 8px;">
        <div style="background: #006bff; color: white; text-align: center; padding: 24px; border-radius: 6px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px;">✅ You're Scheduled!</h1>
        </div>

        <p style="font-size: 16px;">Hi <strong>${inviteeName}</strong>,</p>
        <p style="color: #444;">Your meeting has been confirmed. Here are the details:</p>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin: 0 0 16px; font-size: 18px; color: #1a1a1a;">${eventType.title}</h2>
          <p style="margin: 8px 0; color: #444;">📅 <strong>${dateStr}</strong></p>
          <p style="margin: 8px 0; color: #444;">🕒 ${timeStr}</p>
          <p style="margin: 8px 0; color: #444;">⏱ ${eventType.duration} minutes</p>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${rescheduleLink}" style="background: #006bff; color: white; padding: 12px 28px; border-radius: 40px; text-decoration: none; font-weight: 600; font-size: 15px;">
            Reschedule Meeting
          </a>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 24px;">
          If you need to cancel, please contact the host directly.<br/>
          This email was sent by MeetSync.
        </p>
      </div>
    `,
  });
}

/**
 * Send cancellation email to the invitee
 */
async function sendCancellationEmail(booking) {
  if (!process.env.SMTP_USER) return; // Skip if not configured

  const { inviteeName, inviteeEmail, startTime, eventType } = booking;

  const startDate = new Date(startTime);
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: inviteeEmail,
    subject: `Cancelled: ${eventType.title} on ${dateStr}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e2e2e2; border-radius: 8px;">
        <div style="background: #e11d48; color: white; text-align: center; padding: 24px; border-radius: 6px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px;">❌ Meeting Cancelled</h1>
        </div>

        <p style="font-size: 16px;">Hi <strong>${inviteeName}</strong>,</p>
        <p style="color: #444;">Your meeting has been cancelled. Here were the original details:</p>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; opacity: 0.7;">
          <h2 style="margin: 0 0 12px; font-size: 18px; color: #1a1a1a; text-decoration: line-through;">${eventType.title}</h2>
          <p style="margin: 8px 0; color: #444; text-decoration: line-through;">📅 ${dateStr}</p>
        </div>

        <p style="font-size: 13px; color: #888; text-align: center; margin-top: 24px;">
          Please reach out to the host to reschedule if needed.<br/>
          This email was sent by MeetSync.
        </p>
      </div>
    `,
  });
}

/**
 * Send rescheduling confirmation email
 */
async function sendRescheduleConfirmation(booking) {
  if (!process.env.SMTP_USER) return;

  const { inviteeName, inviteeEmail, startTime, endTime, eventType } = booking;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);
  const dateStr = startDate.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const timeStr = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: inviteeEmail,
    subject: `Rescheduled: ${eventType.title} — New time: ${dateStr}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #fff; border: 1px solid #e2e2e2; border-radius: 8px;">
        <div style="background: #0ba360; color: white; text-align: center; padding: 24px; border-radius: 6px; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 22px;">🔄 Meeting Rescheduled</h1>
        </div>
        <p>Hi <strong>${inviteeName}</strong>, your meeting has been rescheduled to:</p>
        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h2 style="margin: 0 0 12px;">${eventType.title}</h2>
          <p style="margin: 8px 0;">📅 <strong>${dateStr}</strong></p>
          <p style="margin: 8px 0;">🕒 ${timeStr}</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendBookingConfirmation, sendCancellationEmail, sendRescheduleConfirmation };

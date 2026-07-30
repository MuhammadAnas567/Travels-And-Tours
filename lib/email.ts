import { Resend } from "resend";
import { SIGNUP_OTP_TTL_MINUTES } from "@/lib/auth/otp";

function getResend() {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  return new Resend(key);
}

function fromAddress() {
  return process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  if (!resend) {
    throw new Error("RESEND_API_KEY is missing. Add it to .env.local to send email.");
  }

  const { error } = await resend.emails.send({
    from: fromAddress(),
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message || "Failed to send email");
  }
}

/** Real signup OTP email via Resend. Never log the OTP. */
export async function sendSignupOtpEmail({
  to,
  name,
  otp,
}: {
  to: string;
  name?: string | null;
  otp: string;
}) {
  const greeting = name?.trim() ? `Hi ${name.trim()},` : "Hi,";
  await sendEmail({
    to,
    subject: `${otp} is your Arreat Travels verification code`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#1A1611">
        <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#B48A50">Arreat Travels &amp; Tours</p>
        <h1 style="font-size:28px;font-weight:600;margin:12px 0 16px">Verify your email</h1>
        <p style="font-size:16px;line-height:1.6">${greeting}</p>
        <p style="font-size:16px;line-height:1.6">Use this one-time code to finish creating your account. It expires in ${SIGNUP_OTP_TTL_MINUTES} minutes.</p>
        <p style="font-size:36px;letter-spacing:0.35em;font-weight:700;margin:28px 0;font-variant-numeric:tabular-nums">${otp}</p>
        <p style="font-size:14px;line-height:1.6;color:#5C564C">If you did not sign up, you can ignore this email.</p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendBookingConfirmationEmail({
  to,
  bookingId,
  bookingReference,
  tourTitle,
  startDate,
  endDate,
  totalPrice,
  travelerName,
}: {
  to: string;
  bookingId: string;
  bookingReference?: string;
  tourTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  travelerName: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const ref = bookingReference ?? bookingId;

  await sendEmail({
    to,
    subject: `Booking Confirmed — ${tourTitle}`,
    html: `
      <h1>Your booking is confirmed!</h1>
      <p>Hi ${travelerName},</p>
      <p>Thank you for booking <strong>${tourTitle}</strong>.</p>
      <ul>
        <li><strong>Reference:</strong> ${ref}</li>
        <li><strong>Dates:</strong> ${startDate} — ${endDate}</li>
        <li><strong>Total:</strong> ${totalPrice}</li>
      </ul>
      <p><a href="${appUrl}/dashboard/bookings/${bookingId}/ticket">View your e-ticket</a></p>
      <p>Have a wonderful trip!</p>
    `,
  });
}

/** Confirmation to the passenger after a flight booking request (Lahore desk fulfillment). */
export async function sendFlightBookingConfirmationEmail({
  to,
  travelerName,
  reference,
  routeLabel,
  airline,
  flightNumbers,
  departLabel,
  arriveLabel,
  fareLabel,
  travellers,
}: {
  to: string;
  travelerName: string;
  reference: string;
  routeLabel: string;
  airline: string;
  flightNumbers: string;
  departLabel: string;
  arriveLabel: string;
  fareLabel: string;
  travellers: number;
}) {
  const name = escapeHtml(travelerName.trim() || "Traveller");
  const route = escapeHtml(routeLabel);
  const ref = escapeHtml(reference);
  const airlineSafe = escapeHtml(airline);
  const flights = escapeHtml(flightNumbers);
  const depart = escapeHtml(departLabel);
  const arrive = escapeHtml(arriveLabel);
  const fare = escapeHtml(fareLabel);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await sendEmail({
    to,
    subject: `Flight booking received — ${routeLabel} (${reference})`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#1A1611">
        <p style="font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:#B48A50">Arreat Travels &amp; Tours</p>
        <h1 style="font-size:28px;font-weight:600;margin:12px 0 16px">Booking request received</h1>
        <p style="font-size:16px;line-height:1.6">Hi ${name},</p>
        <p style="font-size:16px;line-height:1.6">
          We have your flight request for <strong>${route}</strong>. Our Lahore desk will confirm seats and send ticket details shortly.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:15px;line-height:1.6">
          <tr><td style="padding:6px 0;color:#5C564C">Reference</td><td style="padding:6px 0;text-align:right;font-variant-numeric:tabular-nums"><strong>${ref}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#5C564C">Airline</td><td style="padding:6px 0;text-align:right">${airlineSafe}</td></tr>
          <tr><td style="padding:6px 0;color:#5C564C">Flight</td><td style="padding:6px 0;text-align:right">${flights}</td></tr>
          <tr><td style="padding:6px 0;color:#5C564C">Depart</td><td style="padding:6px 0;text-align:right">${depart}</td></tr>
          <tr><td style="padding:6px 0;color:#5C564C">Arrive</td><td style="padding:6px 0;text-align:right">${arrive}</td></tr>
          <tr><td style="padding:6px 0;color:#5C564C">Travellers</td><td style="padding:6px 0;text-align:right;font-variant-numeric:tabular-nums">${travellers}</td></tr>
          <tr><td style="padding:6px 0;color:#5C564C">Fare</td><td style="padding:6px 0;text-align:right;font-variant-numeric:tabular-nums"><strong>${fare}</strong></td></tr>
        </table>
        <p style="font-size:14px;line-height:1.6;color:#5C564C">
          Questions? Reply to this email or visit
          <a href="${appUrl}/contact" style="color:#2F4438">arreat.travel/contact</a>.
        </p>
      </div>
    `,
  });
}

/** Returns true only when Resend actually accepted the send */
export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<boolean> {
  try {
    const { getContactInbox } = await import("@/lib/site-config");
    const to = getContactInbox();
    const resend = getResend();
    if (!resend) {
      console.warn("RESEND_API_KEY not set, skipping contact email");
      return false;
    }

    const { error } = await resend.emails.send({
      from: fromAddress(),
      to,
      replyTo: email,
      subject: `Contact: ${subject}`,
      html: `
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });
    return !error;
  } catch (error) {
    console.error("[contact] email send failed:", error);
    return false;
  }
}

export async function sendBookingPendingEmail({
  to,
  bookingId,
  tourTitle,
  totalPrice,
  travelerName,
  paymentMethod,
}: {
  to: string;
  bookingId: string;
  tourTitle: string;
  totalPrice: string;
  travelerName: string;
  paymentMethod: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendEmail({
    to,
    subject: `Payment pending — ${tourTitle}`,
    html: `
      <h1>Complete your payment</h1>
      <p>Hi ${travelerName},</p>
      <p>Your booking for <strong>${tourTitle}</strong> is awaiting payment verification (${paymentMethod}).</p>
      <ul>
        <li><strong>Reference:</strong> ${bookingId}</li>
        <li><strong>Amount:</strong> ${totalPrice}</li>
      </ul>
      <p><a href="${appUrl}/booking/pending/${bookingId}">Upload payment proof</a></p>
      <p>We typically confirm within 2 business hours after receiving proof.</p>
    `,
  });
}

export async function sendBookingCancelledEmail({
  to,
  tourTitle,
  travelerName,
}: {
  to: string;
  tourTitle: string;
  travelerName: string;
}) {
  await sendEmail({
    to,
    subject: `Booking cancelled — ${tourTitle}`,
    html: `
      <h1>Booking cancelled</h1>
      <p>Hi ${travelerName},</p>
      <p>Your booking for <strong>${tourTitle}</strong> has been cancelled.</p>
      <p>If this was a mistake, reply to this email or contact us and we will help.</p>
    `,
  });
}

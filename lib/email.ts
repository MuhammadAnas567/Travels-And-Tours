import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
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
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  await resend.emails.send({ from, to, subject, html });
}

export async function sendBookingConfirmationEmail({
  to,
  bookingId,
  tourTitle,
  startDate,
  endDate,
  totalPrice,
  travelerName,
}: {
  to: string;
  bookingId: string;
  tourTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: string;
  travelerName: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping email");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await resend.emails.send({
    from,
    to,
    subject: `Booking Confirmed — ${tourTitle}`,
    html: `
      <h1>Your booking is confirmed!</h1>
      <p>Hi ${travelerName},</p>
      <p>Thank you for booking <strong>${tourTitle}</strong>.</p>
      <ul>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
        <li><strong>Dates:</strong> ${startDate} — ${endDate}</li>
        <li><strong>Total:</strong> ${totalPrice}</li>
      </ul>
      <p><a href="${appUrl}/dashboard/bookings/${bookingId}/ticket">View your e-ticket</a></p>
      <p>Have a wonderful trip!</p>
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
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set, skipping contact email");
    return false;
  }

  const to = process.env.CONTACT_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";
  const from = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  await resend.emails.send({
    from,
    to,
    replyTo: email,
    subject: `Contact: ${subject}`,
    html: `
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });
  return true;
}

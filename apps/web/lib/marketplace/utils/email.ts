type Email = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let _provider: { send(e: Email): Promise<void> } | null = null;

function getProvider() {
  if (_provider) return _provider;
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    _provider = {
      async send(e: Email) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              from: process.env.MAIL_FROM || 'Sukit <noreply@sukit.dev>',
              to: e.to,
              subject: e.subject,
              html: e.html,
              text: e.text || e.html.replace(/<[^>]+>/g, ''),
            }),
          });
          if (!res.ok) {
            console.error('[email] resend failed', await res.text());
          }
        } catch (err) {
          console.error('[email] resend error', err);
        }
      },
    };
  } else {
    _provider = {
      async send(e: Email) {
        if (process.env.NODE_ENV !== 'production') {
          console.log(
            `[email:dev] to=${e.to} subject=${e.subject} body=${(e.text || e.html).slice(0, 120)}…`
          );
        }
      },
    };
  }
  return _provider;
}

export async function sendEmail(e: Email) {
  return getProvider().send(e);
}

export function ticketEmail(opts: {
  toName: string;
  ticketId: string;
  subject: string;
  status: string;
  responseAuthor: string;
  message: string;
  url: string;
}) {
  return sendEmail({
    to: opts.toName,
    subject: `[Ticket #${opts.ticketId.slice(0, 8)}] ${opts.subject}`,
    html: `
      <p>Hello,</p>
      <p><strong>${opts.responseAuthor}</strong> responded to your support ticket
      "<em>${opts.subject}</em>" (status: ${opts.status}):</p>
      <blockquote>${opts.message.replace(/\n/g, '<br>')}</blockquote>
      <p><a href="${opts.url}">View ticket</a></p>
    `,
  });
}

export function reviewNotificationEmail(opts: {
  toName: string;
  moduleName: string;
  rating: number;
  reviewTitle?: string;
  url: string;
}) {
  const stars = '★'.repeat(opts.rating) + '☆'.repeat(5 - opts.rating);
  return sendEmail({
    to: opts.toName,
    subject: `New ${opts.rating}-star review on ${opts.moduleName}`,
    html: `
      <p>You have a new review on your module <strong>${opts.moduleName}</strong>:</p>
      <p>${stars} ${opts.rating}/5</p>
      ${opts.reviewTitle ? `<p><em>${opts.reviewTitle}</em></p>` : ''}
      <p><a href="${opts.url}">View review</a></p>
    `,
  });
}

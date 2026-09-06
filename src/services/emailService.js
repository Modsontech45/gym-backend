const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'GymPro <noreply@mail.arenoxempire.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

// ─── Base layout ────────────────────────────────────────────────────────────
const layout = (title, body) => `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#f97316;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:800;letter-spacing:-0.5px;">💪 GymPro</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Votre plateforme fitness</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none;padding:20px 32px;text-align:center;">
            <p style="margin:0;color:#64748b;font-size:12px;">© ${new Date().getFullYear()} GymPro · Propulsé par Operals</p>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:11px;">Vous recevez cet email car vous êtes inscrit sur GymPro.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (href, label) =>
  `<a href="${href}" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:13px 28px;border-radius:8px;text-decoration:none;margin-top:20px;">${label}</a>`;

const divider = () =>
  `<hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;" />`;

const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
  } catch (err) {
    // Email errors are non-fatal — log but don't crash the request
    console.error('📧 Email error:', err.message);
  }
};

// ─── Templates ──────────────────────────────────────────────────────────────

exports.sendWelcome = ({ firstName, email }) =>
  sendEmail({
    to: email,
    subject: '🎉 Bienvenue sur GymPro !',
    html: layout('Bienvenue sur GymPro', `
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Bonjour ${firstName} 👋</h2>
      <p style="margin:0 0 16px;color:#475569;line-height:1.6;">
        Votre compte GymPro a été créé avec succès. Vous pouvez dès maintenant suivre vos entraînements,
        consulter vos abonnements et rester en contact avec votre coach.
      </p>
      ${divider()}
      <p style="margin:0;color:#475569;font-size:14px;">
        Connectez-vous à l'application mobile ou à l'espace web pour commencer votre parcours fitness.
      </p>
    `),
  });

exports.sendNewClientAlert = ({ adminEmail, clientFirstName, clientLastName, clientEmail }) =>
  sendEmail({
    to: adminEmail || ADMIN_EMAIL,
    subject: `👤 Nouveau client inscrit : ${clientFirstName} ${clientLastName}`,
    html: layout('Nouveau client inscrit', `
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Nouveau client inscrit</h2>
      <p style="margin:0 0 20px;color:#475569;">Un nouveau client vient de créer un compte sur GymPro.</p>
      <table cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;width:100%;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Nom</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${clientFirstName} ${clientLastName}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${clientEmail}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Date</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${new Date().toLocaleDateString('fr-FR', { dateStyle: 'long' })}</td></tr>
      </table>
    `),
  });

exports.sendSubscriptionCreated = ({ firstName, email, planName, planType, balance, sessionsIncluded, startDate, endDate }) =>
  sendEmail({
    to: email,
    subject: `✅ Abonnement activé : ${planName}`,
    html: layout('Abonnement activé', `
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Votre abonnement est actif 🎯</h2>
      <p style="margin:0 0 20px;color:#475569;">Bonjour ${firstName}, votre abonnement a été créé et est immédiatement actif.</p>
      <table cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:20px;width:100%;">
        <tr><td style="padding:6px 0;color:#92400e;font-size:14px;">Plan</td><td style="padding:6px 0;font-weight:700;color:#c2410c;">${planName}</td></tr>
        <tr><td style="padding:6px 0;color:#92400e;font-size:14px;">Type</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${planType}</td></tr>
        <tr><td style="padding:6px 0;color:#92400e;font-size:14px;">Solde</td><td style="padding:6px 0;font-weight:700;color:#f97316;">${Math.round(balance).toLocaleString('fr-FR')} FCFA</td></tr>
        <tr><td style="padding:6px 0;color:#92400e;font-size:14px;">Séances</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${sessionsIncluded} séances incluses</td></tr>
        <tr><td style="padding:6px 0;color:#92400e;font-size:14px;">Validité</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${startDate} → ${endDate}</td></tr>
      </table>
    `),
  });

exports.sendBalanceCredited = ({ firstName, email, amount, newBalance, planName }) =>
  sendEmail({
    to: email,
    subject: '💳 Solde crédité sur votre abonnement',
    html: layout('Solde crédité', `
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Votre solde a été crédité 💰</h2>
      <p style="margin:0 0 20px;color:#475569;">Bonjour ${firstName}, un crédit a été ajouté à votre abonnement <strong>${planName}</strong>.</p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:20px;text-align:center;">
        <p style="margin:0;color:#166534;font-size:13px;text-transform:uppercase;letter-spacing:.5px;">Montant crédité</p>
        <p style="margin:8px 0 4px;color:#16a34a;font-size:36px;font-weight:800;">+${Math.round(amount).toLocaleString('fr-FR')} FCFA</p>
        <p style="margin:0;color:#64748b;font-size:13px;">Nouveau solde : <strong>${Math.round(newBalance).toLocaleString('fr-FR')} FCFA</strong></p>
      </div>
    `),
  });

exports.sendFollowUpScheduled = ({ clientFirstName, clientEmail, coachFirstName, title, note, scheduledDate, priority }) => {
  const priorityColor = { haute: '#ef4444', normale: '#f97316', basse: '#64748b' }[priority] || '#f97316';
  const priorityLabel = { haute: '🔴 Haute', normale: '🟠 Normale', basse: '⚪ Basse' }[priority] || priority;
  const dateStr = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Non définie';

  return sendEmail({
    to: clientEmail,
    subject: `📅 Suivi planifié par votre coach : ${title}`,
    html: layout('Suivi planifié', `
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Un suivi a été planifié 📋</h2>
      <p style="margin:0 0 20px;color:#475569;">Bonjour ${clientFirstName}, votre coach <strong>${coachFirstName}</strong> a planifié un suivi pour vous.</p>
      <table cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;width:100%;">
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Titre</td><td style="padding:6px 0;font-weight:700;color:#0f172a;">${title}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Date</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${dateStr}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:14px;">Priorité</td><td style="padding:6px 0;font-weight:600;color:${priorityColor};">${priorityLabel}</td></tr>
        ${note ? `<tr><td style="padding:6px 0;color:#64748b;font-size:14px;vertical-align:top;">Note</td><td style="padding:6px 0;color:#475569;">${note}</td></tr>` : ''}
      </table>
    `),
  });
};

exports.sendPasswordChanged = ({ firstName, email }) =>
  sendEmail({
    to: email,
    subject: '🔐 Mot de passe modifié',
    html: layout('Mot de passe modifié', `
      <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px;">Mot de passe modifié</h2>
      <p style="margin:0 0 16px;color:#475569;">Bonjour ${firstName}, votre mot de passe GymPro vient d'être modifié avec succès.</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;">
        <p style="margin:0;color:#991b1b;font-size:14px;">
          ⚠️ Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement votre coach ou l'administrateur.
        </p>
      </div>
    `),
  });

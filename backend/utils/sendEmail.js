import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send Pro Plan activation confirmation email
 */
export const sendProActivationEmail = async (user, paymentDetails) => {
  const { plan, amount, currency, paymentId, orderId } = paymentDetails;

  const planLabel = plan.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  const amountFormatted = currency === "INR" ? `₹${amount}` : `$${amount}`;

  const expiryDate = new Date(user.proExpiresAt).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { margin: 0; padding: 0; background: #0f172a; font-family: 'Segoe UI', Arial, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%); padding: 40px 30px; text-align: center; }
      .header h1 { color: #fff; margin: 0; font-size: 28px; }
      .header p { color: rgba(255,255,255,0.85); margin: 10px 0 0; font-size: 16px; }
      .body { padding: 40px 30px; }
      .greeting { color: #f8fafc; font-size: 20px; font-weight: 600; margin-bottom: 16px; }
      .message { color: #94a3b8; font-size: 15px; line-height: 1.7; margin-bottom: 30px; }
      .details-card { background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.2); border-radius: 12px; padding: 24px; margin-bottom: 30px; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { color: #94a3b8; font-size: 14px; }
      .detail-value { color: #f8fafc; font-size: 14px; font-weight: 600; }
      .features { margin: 30px 0; }
      .features h3 { color: #38bdf8; font-size: 16px; margin-bottom: 16px; }
      .feature-item { color: #cbd5e1; font-size: 14px; padding: 6px 0; }
      .feature-item::before { content: "✓ "; color: #38bdf8; font-weight: bold; }
      .cta-btn { display: inline-block; background: linear-gradient(135deg, #38bdf8 0%, #2563eb 100%); color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 600; font-size: 15px; }
      .footer { text-align: center; padding: 30px; border-top: 1px solid rgba(255,255,255,0.05); }
      .footer p { color: #475569; font-size: 12px; margin: 4px 0; }
    </style>
  </head>
  <body>
    <div style="padding: 20px; background: #0f172a;">
      <div class="container">
        <div class="header">
          <h1>🧩 Welcome to Creatixo Pro!</h1>
          <p>Your creative journey just leveled up</p>
        </div>
        <div class="body">
          <div class="greeting">Hey ${user.name}! 🎉</div>
          <div class="message">
            Congratulations! Your <strong style="color:#38bdf8;">${planLabel}</strong> plan has been activated successfully.
            You now have access to all premium features on Creatixo. Let's create something extraordinary.
          </div>

          <div class="details-card">
            <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="color:#94a3b8;font-size:14px;">Plan</td>
                <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;">${planLabel}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="color:#94a3b8;font-size:14px;">Amount Paid</td>
                <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;">${amountFormatted}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="color:#94a3b8;font-size:14px;">Payment ID</td>
                <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;">${paymentId}</td>
              </tr>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                <td style="color:#94a3b8;font-size:14px;">Order ID</td>
                <td style="color:#f8fafc;font-size:14px;font-weight:600;text-align:right;">${orderId}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;font-size:14px;">Valid Until</td>
                <td style="color:#38bdf8;font-size:14px;font-weight:600;text-align:right;">${expiryDate}</td>
              </tr>
            </table>
          </div>

          <div class="features">
            <h3 style="color:#38bdf8;font-size:16px;margin-bottom:16px;">Your Unlocked Features:</h3>
            <div class="feature-item">✓ Unlimited Posts & Video Uploads</div>
            <div class="feature-item">✓ Showcase Video Ads on Home Feed</div>
            <div class="feature-item">✓ Advanced AI-Powered Analytics</div>
            <div class="feature-item">✓ Priority Visibility in All Feeds</div>
            <div class="feature-item">✓ 24/7 Priority Support</div>
            <div class="feature-item">✓ Ad-Free Experience</div>
          </div>

          <div style="text-align:center;margin-top:30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/home" class="cta-btn">
              Start Creating Now →
            </a>
          </div>
        </div>
        <div class="footer">
          <p>🧩 Creatixo — Where Brands Become Movements</p>
          <p>This is a payment confirmation for your records.</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"Creatixo" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `🎉 Welcome to Creatixo ${planLabel} — Payment Confirmed`,
      html: htmlContent,
    });
    console.log(`✅ Pro activation email sent to ${user.email}`);
    return true;
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    return false;
  }
};

export default sendProActivationEmail;

const nodemailer = require("nodemailer");
require("dotenv").config();

// Fix: Use host and port 465 for more stable SSL connections with Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Ensure this is a 16-character App Password
  },
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Email Server Setup Error:", error.message);
  } else {
    console.log("✔ Email Server is ready to take messages");
  }
});

exports.sendSuccessEmail = async (recipientEmail, invoiceData) => {
  const mailOptions = {
    from: `"PDF2Sheet Auto" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `✔ Extraction Complete: ${invoiceData.vendor} (#${invoiceData.invoiceNo})`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.1); border: 1px solid #e2e8f0;">
                
                <tr>
                  <td style="background-color: #4f46e5; padding: 32px; text-align: center;">
                    <div style="background-color: rgba(255,255,255,0.2); width: 48px; height: 48px; border-radius: 14px; display: inline-block; margin-bottom: 16px;">
                      <span style="color: white; line-height: 48px; font-size: 24px;">✔</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800;">Extraction Successful</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 40px;">
                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">Hello,</p>
                    <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #475569;">
                      Our AI has finished processing your invoice for <strong>${invoiceData.vendor || 'Unknown'}</strong>. The data has been automatically synced to your Google Sheet.
                    </p>

                    <div style="background-color: #f1f5f9; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                      <table width="100%" border="0" cellspacing="0" cellpadding="4">
                        <tr>
                          <td style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Invoice No</td>
                          <td style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; text-align: right;">Total Amount</td>
                        </tr>
                        <tr>
                          <td style="font-size: 18px; font-weight: 700; color: #1e293b;">#${invoiceData.invoiceNo}</td>
                          <td style="font-size: 18px; font-weight: 700; color: #4f46e5; text-align: right;">₹${invoiceData.total}</td>
                        </tr>
                        <tr>
                          <td colspan="2" style="padding-top: 16px; border-top: 1px solid #e2e8f0; margin-top: 16px;">
                            <span style="font-size: 12px; color: #64748b;">Processed on: ${new Date().toLocaleDateString('en-IN')}</span>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <div style="text-align: center;">
                      <a href="${process.env.Frontend_Deployed_URL || '#'}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">View in Dashboard</a>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 0 40px 40px 40px; text-align: center;">
                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                      Automated notification from <strong>PDF2Sheet Auto</strong>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`\x1b[32m✔ Confirmation email sent to: ${recipientEmail}\x1b[0m`);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};
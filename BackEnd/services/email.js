const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendSuccessEmail = async (recipientEmail, invoiceData) => {
  const mailOptions = {
    from: `"PDF2Sheet Auto" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: `✔ Invoice Processed: ${invoiceData.invoiceNo}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">Invoice Successfully Processed!</h2>
        <p>Hello,</p>
        <p>Your invoice has been extracted and logged into our system successfully.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Invoice No:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${invoiceData.invoiceNo}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Date:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${invoiceData.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td>
            <td style="padding: 8px; border: 1px solid #ddd;">₹${invoiceData.total}</td>
          </tr>
        </table>
        <p>The data is now available in your Google Sheet.</p>
        <br>
        <p>Best Regards,<br><strong>PDF2Sheet Automation System</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`\x1b[32m✔ Confirmation email sent to: ${recipientEmail}\x1b[0m`);
  } catch (error) {
    console.error("❌ Email Error:", error.message);
  }
};
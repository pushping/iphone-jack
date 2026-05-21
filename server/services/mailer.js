const nodemailer = require('nodemailer');

let transporter = null;
let testAccount = null;

async function getTransporter() {
  if (transporter) return transporter;

  // In development, use Ethereal (fake SMTP for testing)
  testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('📧 Ethereal test account:', testAccount.user);
  console.log('📧 View sent emails at: https://ethereal.email/login');
  return transporter;
}

async function sendVerificationCode(email, code) {
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: '"iPhone Jack" <noreply@iphonejack.com>',
    to: email,
    subject: '【iPhone Jack】邮箱验证码',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #22d3ee;">iPhone Jack 验证码</h2>
        <p>你正在注册 iPhone Jack 账户，验证码如下：</p>
        <div style="font-size: 32px; font-weight: bold; color: #c084fc; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">
          ${code}
        </div>
        <p style="color: #666; font-size: 14px;">验证码 5 分钟内有效。如非本人操作，请忽略此邮件。</p>
      </div>
    `,
  });

  // Return preview URL for development (Ethereal)
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log('📧 Preview URL:', previewUrl);
  }

  return { messageId: info.messageId, previewUrl };
}

module.exports = { sendVerificationCode };

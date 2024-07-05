interface SendEmailParams {
  from: string | undefined;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: [
    {
      filename: string;
      content: Buffer;
    }
  ];
}

export default async function sendEmail(config: SendEmailParams) {
  const transporter = await getTransporter();

  return transporter.sendMail(config);
}

function getTransporter() {
  // if (isTest()) {
  //   return getMockMailTransporter();
  // }

  // if (!configuration.production) {
  //   return getEtherealMailTransporter();
  // }

  return getSMTPTransporter();
}

async function getSMTPTransporter() {
  const nodemailer = await import("nodemailer");

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT);

  // const secure = port === 465 && !configuration.production;

  const secure = port === 465;

  // validate that we have all the required configuration
  if (!user || !pass || !host || !port) {
    throw new Error(
      `Missing email configuration. Please add the following environment variables:
      EMAIL_USER
      EMAIL_PASSWORD
      EMAIL_HOST
      EMAIL_PORT
      `
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

async function getEtherealMailTransporter() {
  const nodemailer = await import("nodemailer");
  const testAccount = await getEtherealTestAccount();

  const host = "smtp.ethereal.email";
  const port = 587;

  return nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

function getMockMailTransporter() {
  return {
    sendMail(params: SendEmailParams) {},
  };
}

async function getEtherealTestAccount() {
  const user = process.env.ETHEREAL_EMAIL;
  const pass = process.env.ETHEREAL_PASSWORD;

  // if we have added an Ethereal account, we reuse these credentials to
  // send the email
  if (user && pass) {
    return {
      user,
      pass,
    };
  }

  // Otherwise, we create a new account and recommend to add the credentials
  // to the configuration file
  return createEtherealTestAccount();
}

async function createEtherealTestAccount() {
  const nodemailer = await import("nodemailer");
  const newAccount = await nodemailer.createTestAccount();

  return newAccount;
}

function isTest() {
  return process.env.IS_CI === "true";
}

export const resetPasswordTemplate = (baseUrl: string, uniqueId: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #dddddd;
      border-radius: 10px;
    }
    .header {
      text-align: center;
      padding: 10px;
      background-color: #f4f4f4;
      border-bottom: 1px solid #dddddd;
    }
    .content {
      padding: 20px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      background-color: #f4f4f4;
      border-top: 1px solid #dddddd;
    }
    a {
      color: #3498db;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    .button {
      display: inline-block;
      padding: 10px 20px;
      font-size: 16px;
      color: #ffffff;
      background-color: #3498db;
      border-radius: 5px;
      text-decoration: none;
    }
    .button:hover {
      background-color: #2980b9;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Password Reset Request</h2>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password. You can reset your password by clicking one of the links below:</p>
      <p>
        <a href="${baseUrl}/?uuid=${uniqueId}" class="button">Reset Password</a>
      </p>
      <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
      <p>Thanks,</p>
      <p>The MyApp Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 MyApp. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

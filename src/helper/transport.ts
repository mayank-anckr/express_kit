import logger from "../utils/logger";
import staticConfig from "./staticConfig";
import nodemailer from "nodemailer";

async function getSMTPTransporter() {
  let transporter = nodemailer.createTransport({
    service: staticConfig.smtpTransporter.service,
    auth: {
      user: staticConfig.smtpTransporter.email, // your email address to send from
      pass: staticConfig.smtpTransporter.password, // your Gmail account password
    },
  });
  return transporter;
}

async function sendingMail(mailDetails: any) {
  let mailOptions = {};
  if (mailDetails.htmlTemplate) {
    mailOptions = {
      from: staticConfig.smtpTransporter.email, // sender address
      to: mailDetails.senderEmail, // list of receivers
      subject: mailDetails.subject, // Subject line
      html: mailDetails.htmlTemplate, // html body
    };
  } else {
    mailOptions = {
      from: staticConfig.smtpTransporter.email, // sender address
      to: mailDetails.senderEmail, // list of receivers
      subject: mailDetails.subject, // Subject line
      text: mailDetails.text, // plain text body
    };
  }
  const transporter = await getSMTPTransporter();

  // Send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return logger.error("error", error);
    }
    logger.info("Message sent: %s", info.messageId);
  });
}

export default sendingMail;

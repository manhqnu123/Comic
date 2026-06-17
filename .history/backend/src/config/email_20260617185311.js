import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "manhlk",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

export default transporter;

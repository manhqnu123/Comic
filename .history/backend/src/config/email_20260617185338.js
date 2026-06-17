import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "manhlk200@gmail.com",
    pass: process.env.EMAIL_PASS || "Manhlk_@2004",
  },
});

export default transporter;

import nodemailer from "nodemailer";

export const emailAdapter = {
  async sendEmail(email: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "denkrav98.dk@gmail.com", // generated ethereal user
        pass: "bdetlybpvpkxmpnu", // generated ethereal password
      },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: "Denchi <denkrav98.dk@gmail.com>", // sender address
      to: email, // list of receivers
      subject, // Subject line
      html: message, // html body
    });

    return info;
  },
};

export default emailAdapter;

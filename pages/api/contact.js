export default function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, company, projectType, description, budget } =
      req.body;

    // Replace the code below with your email sending logic using your preferred email service or library
    // Example using Nodemailer:
    const nodemailer = require("nodemailer");

    async function sendEmail() {
      try {
        // Create a transporter using your email service provider's configuration
        const transporter = nodemailer.createTransport({
          // Configure your email service provider settings here
          // Example configuration for Gmail:
          service: "Gmail",
          auth: {
            user: "kade20413@gmail.com",
            pass: "pspwbxoscradflfp",
          },
        });

        const html = `
          <h1>New Website Estimate Request</h1>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Company:</strong> ${company}</p>
          <p><strong>Project Type:</strong> ${projectType}</p>
          <p><strong>Description:</strong> ${description}</p>
          <p><strong>Budget:</strong> ${budget}</p>
        `;

        // Send the email
        await transporter.sendMail({
          from: email,
          to: "stanforddevcontact@gmail.com", // Replace with your desired recipient email address
          subject: "New Website Estimate Request",
          html: html,
        });

        console.log("Message sent successfully");
      } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to send message");
      }
    }

    sendEmail()
      .then(() => {
        res.status(200).json({ message: "Message sent successfully" });
      })
      .catch(() => {
        res.status(500).json({ message: "Failed to send message" });
      });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

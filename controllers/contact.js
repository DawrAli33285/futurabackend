const nodemailer = require("nodemailer");
const path = require("path");

const contactUs = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Futura Research" <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      replyTo: email,
      subject: `New Contact Us Message from ${firstName} ${lastName}`,
      html: `
        <div style="margin:0; padding:0; background-color:#050807; font-family: 'Segoe UI', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#050807; padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background-color:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:16px; overflow:hidden;">
                  
                  <!-- Header -->
                  <tr>
                    <td align="center" style="padding:32px 32px 16px 32px; border-bottom:1px solid rgba(255,255,255,0.08);">
                    <img src="cid:companylogo" alt="Futura Research" style="height:84px; width:auto; display:block; margin:0 auto 16px auto;" />
                      <div style="color:#ffffff; font-size:20px; font-weight:600; letter-spacing:0.3px;">
                        Futura Research
                      </div>
                      <div style="color:#14b8a6; font-size:12px; letter-spacing:1.5px; text-transform:uppercase; margin-top:4px;">
                        New Contact Submission
                      </div>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:28px 32px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom:16px;">
                            <div style="color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px;">Name</div>
                            <div style="color:#ffffff; font-size:15px;">${firstName} ${lastName}</div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:16px;">
                            <div style="color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px;">Email</div>
                            <div style="color:#14b8a6; font-size:15px;">${email}</div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div style="color:#9ca3af; font-size:11px; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:6px;">Message</div>
                            <div style="color:#e5e7eb; font-size:14px; line-height:1.6; background-color:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:14px 16px;">
                              ${message.replace(/\n/g, "<br/>")}
                            </div>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td align="center" style="padding:20px 32px; border-top:1px solid rgba(255,255,255,0.08);">
                      <div style="color:#6b7280; font-size:12px;">
                        This message was sent via the Futura Research contact form.
                      </div>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </div>
      `,
      attachments: [
        {
          filename: "logo.png",
          path: path.join("D:", "all projects", "futurabackend", "logo.png"),
          cid: "companylogo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "Message sent successfully." });
  } catch (error) {
    console.error("Contact Us Error:", error);
    return res.status(500).json({ message: "Failed to send message." });
  }
};

module.exports = { contactUs };
import nodemailer from 'nodemailer'
import 'dotenv/config'

const { SMTP_EMAIL, SMTP_PASS } = process.env
// console.log(SMTP_EMAIL)

let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASS,
    },
})
export const sendVerificationEmail = async (email: string, otp: number) => {
    const mailOptions = {
        to: email,
        subject: "Welcome To JobVentures",
        html: `<body>
            <body style="font-family: Arial, sans-serif margin: 0 padding: 0 background-color: #f7f7f7">
            <table role="presentation" cellspacing="0" cellpadding="0"  width="600"
            style="margin: 0 auto background-color: #fff padding: 20px border-radius: 5px box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3)">
            <tr>
            <td>
            <h3 style="color: #0838bc font-size: 24px text-align: center margin-bottom: 10px">Verification Mail</h3>
            <hr style="border: 1px solid #ccc margin: 20px 0">
            <h4 style="font-size: 20px color: #333">Hi there,</h4>
            <p style="font-size: 16px color: #333 margin: 20px 0">Here is the otp to confirm your mail ${otp}. This otp is valid for 15 minutes only.</p>
            <p style="font-size: 16px color: #333">Wish you the best for your future.</p>
                        <div style="font-size: 16px color: #333 margin-top: 20px text-align: center">
                        <h5 style="font-size: 18px">Best Regards</h5>
                        <h5 style="font-size: 18px">JobVentures</h5>
                        </div>
                    </td>
                    </tr>
                    </table>
                    </body>
                </body>`
    }

    try {
        await transporter.sendMail(mailOptions)
        console.log("Mail sent to the user")
    } catch (error) {
        console.error("Error sending email:", error)
        throw error
    }
}


// sendVerificationEmail('mohit35753@gmail.com',4455)


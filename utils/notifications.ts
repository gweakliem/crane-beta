import { Resend } from 'resend'
import twilio from 'twilio'

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Lazy initialization to avoid startup errors
let resend: Resend | null = null
let twilioClient: ReturnType<typeof twilio> | null = null

function getResend() {
  if (!resend) {
    const config = useRuntimeConfig()
    resend = new Resend(config.resendApiKey)
  }
  return resend
}

function getTwilioClient() {
  if (!twilioClient) {
    const config = useRuntimeConfig()
    twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken)
  }
  return twilioClient
}

export async function sendOTPEmail(to: string, code: string, userType: 'client' | 'admin'): Promise<boolean> {
  try {
    const subject = userType === 'admin' ? 'Admin Login Code' : 'Your Login Code'
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Your Login Code</h2>
        <p>Enter this code to log in:</p>
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 5 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `

    await getResend().emails.send({
      from: 'noreply@crane-beta.vercel.app',
      to,
      subject,
      html,
    })

    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    return false
  }
}

export async function sendOTPSMS(to: string, code: string): Promise<boolean> {
  try {
    const config = useRuntimeConfig()
    await getTwilioClient().messages.create({
      body: `Your login code is: ${code}. This code expires in 5 minutes.`,
      from: config.twilioPhoneNumber,
      to,
    })

    return true
  } catch (error) {
    console.error('Failed to send OTP SMS:', error)
    return false
  }
}

export async function sendWorksheetNotification(
  clientContact: { email?: string; phone?: string },
  clientName: string,
  worksheetTitle: string
): Promise<boolean> {
  try {
    if (clientContact.email) {
      await getResend().emails.send({
        from: 'noreply@crane-beta.vercel.app',
        to: clientContact.email,
        subject: 'New Worksheet Assignment',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>New Worksheet Assignment</h2>
            <p>Hi ${clientName},</p>
            <p>You have been assigned a new worksheet: <strong>${worksheetTitle}</strong></p>
            <p>Please log in to your dashboard to complete it.</p>
            <p>Thank you!</p>
          </div>
        `,
      })
    }

    if (clientContact.phone) {
      const config = useRuntimeConfig()
      await getTwilioClient().messages.create({
        body: `Hi ${clientName}, you have a new worksheet assignment: "${worksheetTitle}". Please log in to complete it.`,
        from: config.twilioPhoneNumber,
        to: clientContact.phone,
      })
    }

    return true
  } catch (error) {
    console.error('Failed to send worksheet notification:', error)
    return false
  }
}
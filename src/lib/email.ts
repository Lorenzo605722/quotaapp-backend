import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here'
    ? new Resend(process.env.RESEND_API_KEY)
    : null;

export async function sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

    if (!resend) {
        console.log('--- MOCK EMAIL SENDING ---');
        console.log(`To: ${email}`);
        console.log(`Subject: Verify your QuotaApp account`);
        console.log(`Link: ${verifyUrl}`);
        console.log('---------------------------');
        return { success: true, mocked: true };
    }

    try {
        await resend.emails.send({
            from: 'QuotaApp <onboarding@resend.dev>',
            to: email,
            subject: 'Verify your QuotaApp account',
            html: `
        <h1>Welcome to QuotaApp!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `,
        });
        return { success: true };
    } catch (error) {
        console.error('Failed to send verification email:', error);
        return { success: false, error };
    }
}

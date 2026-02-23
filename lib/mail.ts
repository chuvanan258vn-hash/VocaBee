import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    // Log for development
    console.log('--- PASSWORD RESET LINK ---');
    console.log(`To: ${email}`);
    console.log(`Link: ${resetLink}`);
    console.log('---------------------------');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('SMTP credentials not found. Email will strictly be logged to console.');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Or use host/port from env
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: '"VocaBee Support" <no-reply@vocabee.com>',
            to: email,
            subject: 'Reset your password',
            html: `
        <p>You requested a password reset for your VocaBee account.</p>
        <p>Click the link below to set a new password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
        });
        console.log(`Email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't throw, just log. We already logged the link for dev transparency.
    }
}

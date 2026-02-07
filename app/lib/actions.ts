'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData);
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.';
                default:
                    return 'Something went wrong.';
            }
        }
        throw error;
    }
}

export async function register(
    prevState: string | undefined,
    formData: FormData,
) {
    const schema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
    });

    const validatedFields = schema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        name: formData.get('name'),
    });

    if (!validatedFields.success) {
        return 'Email không hợp lệ hoặc mật khẩu quá ngắn (tối thiểu 6 ký tự).';
    }

    const { email, password, name } = validatedFields.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || '',
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return 'Email đã tồn tại hoặc có lỗi xảy ra.';
    }

    // Auto login logic could act here, but for now redirect or return success
    // Actually server actions redirect by throwing, so we can't easily auto-login *inside* this try-catch without re-throwing the redirect from signIn

    return 'success';
}

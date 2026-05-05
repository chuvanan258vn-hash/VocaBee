import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            
            // Danh sách các trang KHÔNG cần đăng nhập
            const isAuthPage = nextUrl.pathname.startsWith('/login') || 
                               nextUrl.pathname.startsWith('/register') || 
                               nextUrl.pathname.startsWith('/forgot-password');

            if (isAuthPage) {
                // Nếu đã đăng nhập mà cố vào login/register -> đá về trang chủ
                if (isLoggedIn) {
                    return Response.redirect(new URL('/', nextUrl));
                }
                // Nếu chưa đăng nhập thì cho phép vào trang login/register
                return true;
            }

            // Mọi trang khác ĐỀU bắt buộc phải đăng nhập
            if (!isLoggedIn) {
                return false; // Tự động redirect về '/login'
            }

            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

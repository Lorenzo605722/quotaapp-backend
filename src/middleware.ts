import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    // Get origin from request
    const origin = request.headers.get('origin');

    // Allow requests from any origin in development
    const allowedOrigins = process.env.NODE_ENV === 'development'
        ? ['*']
        : (process.env.ALLOWED_ORIGINS || '').split(',');

    const response = NextResponse.next();

    // Set CORS headers
    if (origin && (allowedOrigins.includes('*') || allowedOrigins.includes(origin))) {
        response.headers.set('Access-Control-Allow-Origin', origin);
    }

    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Requested-With'
    );

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: response.headers,
        });
    }

    return response;
}

export const config = {
    matcher: '/api/:path*',
};

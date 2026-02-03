import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface JWTPayload {
    userId: string;
    email: string;
}

export function signToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
}

export function generateVerificationToken(userId: string): string {
    return jwt.sign({ userId, type: 'email_verification' }, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyEmailToken(token: string): { userId: string } | null {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string; type: string };
        if (payload.type === 'email_verification') {
            return { userId: payload.userId };
        }
        return null;
    } catch (error) {
        return null;
    }
}

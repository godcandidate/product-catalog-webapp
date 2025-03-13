import jwt_decode from 'jwt-decode';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

export const decodeToken = (token: string): User | null => {
  try {
    const decoded = jwt_decode<JwtPayload>(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };
  } catch {
    return null;
  }
};

export const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
};

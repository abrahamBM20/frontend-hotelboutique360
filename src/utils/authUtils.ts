import type { CognitoJwtPayload, UserRole } from '../types';

export const getUserRolesFromToken = (idToken?: string): UserRole[] => {
  if (!idToken) return ['GUEST'];
  try {
    const base64Url = idToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload: CognitoJwtPayload = JSON.parse(jsonPayload);
    
    return (payload['cognito:groups'] as UserRole[]) || ['HUESPED'];
  } catch (error) {
    console.error('Error parseando token JWT de Cognito:', error);
    return ['GUEST'];
  }
};
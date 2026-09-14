import type  { AuthProviderProps } from 'react-oidc-context';

const requiredEnv = (name: 'VITE_COGNITO_AUTHORITY' | 'VITE_COGNITO_CLIENT_ID' | 'VITE_API_URL') => {
  const value = import.meta.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}. Revisa .env.local.`);
  }
  return value;
};

export const cognitoAuthConfig: AuthProviderProps = {
  authority: requiredEnv('VITE_COGNITO_AUTHORITY'),
  client_id: requiredEnv('VITE_COGNITO_CLIENT_ID'),
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid email phone",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

export const API_GATEWAY_URL = requiredEnv('VITE_API_URL');
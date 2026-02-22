import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * This page handles the redirect from the backend after Google login.
 * URL: /auth/callback?token=JWT
 * It stores the token and sends the user to the home page.
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      loginWithToken(token);
      navigate('/', { replace: true });
    } else {
      // Auth failed — go back to login with an error message
      navigate(`/login?error=${error || 'auth_failed'}`, { replace: true });
    }
  }, []);

  return (
    <div className="auth-loading">
      <div className="auth-loading-spinner" />
      <p>Connexion en cours...</p>
    </div>
  );
};

export default AuthCallback;

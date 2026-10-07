import { createContext, useContext, useState, useEffect } from "react";
import { loginService, signupService, googleLoginService, googleCodeLoginService, getProfileService } from "../services/authService";

const TOKEN_KEY = "craftiq_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from sessionStorage on initial page load
  useEffect(() => {
    async function restoreSession() {
      const storedToken = sessionStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const profile = await getProfileService(storedToken);
          setToken(storedToken);
          setUser(profile);
        } catch (err) {
          // Token is expired, invalid, or server is unreachable
          sessionStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }

    restoreSession();
  }, []);

  // Login handler
  async function login({ email, password }) {
    const tokenData = await loginService({ email, password });
    const accessToken = tokenData.access_token;

    // Verify token & fetch user profile before completing login
    const profile = await getProfileService(accessToken);

    sessionStorage.setItem(TOKEN_KEY, accessToken);
    setToken(accessToken);
    setUser(profile);

    return { token: accessToken, user: profile };
  }

  // Google Login handler (ID token flow)
  async function loginWithGoogle(idToken) {
    try {
      const tokenData = await googleLoginService(idToken);
      const accessToken = tokenData.access_token;

      // Verify token & fetch user profile before completing login
      const profile = await getProfileService(accessToken);

      sessionStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
      setUser(profile);

      return { token: accessToken, user: profile };
    } catch (err) {
      // Clear any partial session state if profile fetch or authentication fails
      sessionStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      throw err;
    }
  }

  // Google Login handler (Authorization code flow)
  async function loginWithGoogleCode(code) {
    try {
      const tokenData = await googleCodeLoginService(code);
      const accessToken = tokenData.access_token;

      // Verify token & fetch user profile before completing login
      const profile = await getProfileService(accessToken);

      sessionStorage.setItem(TOKEN_KEY, accessToken);
      setToken(accessToken);
      setUser(profile);

      return { token: accessToken, user: profile };
    } catch (err) {
      // Clear any partial session state if profile fetch or authentication fails
      sessionStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      throw err;
    }
  }

  // Signup handler (registers user then performs auto-login)
  async function signup({ fullName, email, password }) {
    await signupService({ fullName, email, password });
    return await login({ email, password });
  }

  // Logout handler
  function logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = {
    user,
    token,
    isLoading,
    login,
    loginWithGoogle,
    loginWithGoogleCode,
    signup,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

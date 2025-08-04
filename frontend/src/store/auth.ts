// utils/auth.ts

const TOKEN_KEY = "auth-token";
const REFRESH_TOKEN_KEY = "refresh-token";
const USERNAME_KEY = "username";
const IS_ADMIN_KEY = "is-admin";

export const Auth = {
  // Getters
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),
  getUsername: (): string | null => localStorage.getItem(USERNAME_KEY),
  isAdmin: (): boolean => {
    const value = localStorage.getItem(IS_ADMIN_KEY);
    return value === "true" ? true : false;
  },

  // Setters
  setToken: (token: string | null, refreshToken: string | null) => {
    console.log(token, refreshToken);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);

    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  setUsername: (username: string | null) => {
    if (username) localStorage.setItem(USERNAME_KEY, username);
    else localStorage.removeItem(USERNAME_KEY);
  },

  setIsAdmin: (isAdmin: boolean | null) => {
    if (isAdmin !== null)
      localStorage.setItem(IS_ADMIN_KEY, isAdmin ? "true" : "false");
    else localStorage.removeItem(IS_ADMIN_KEY);
  },

  // Clear all
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    localStorage.removeItem(IS_ADMIN_KEY);
  },
};

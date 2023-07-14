/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';

type AuthUser = {
  userId: string | null;
  token: string | null;
};

type LoginInput = {
  accessToken: string;
  userId: string;
};

type AuthContextProvider = {
  user: AuthUser | null;
  // eslint-disable-next-line no-unused-vars
  login: ({ accessToken, userId }: LoginInput) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const authContext = React.createContext<AuthContextProvider>({} as AuthContextProvider);

export default function AuthProvider({ children }: AuthProviderProps) {
  const { userIdData, tokenData } = getLocalStorageData();
  const [user, setUser] = useState<AuthUser | null>({ token: tokenData, userId: userIdData });

  const login = ({ accessToken, userId }: LoginInput) => {
    const now = new Date();
    const item = {
      token: accessToken,
      expire: now.getTime() + 3600 * 1000,
      userId,
    };
    localStorage.setItem('userData', JSON.stringify(item));
    setUser({ userId, token: accessToken });
  };

  const logout = () => {
    console.log('#### here');
    localStorage.removeItem('tokenData');
    setUser(null);
  };

  return <authContext.Provider value={{ user, login, logout }}>{children}</authContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => useContext(authContext);

const getLocalStorageData = () => {
  let tokenData = null;
  let userIdData = null;

  let localStorageData = localStorage.getItem('userData');
  localStorageData = localStorageData && JSON.parse(localStorageData);

  if (localStorageData) {
    const { token, expire, userId } = localStorageData as unknown as {
      token: string;
      expire: string;
      userId: string;
    };
    userIdData = userId;

    if (new Date() > new Date(expire)) {
      localStorage.removeItem('userData');
    } else {
      tokenData = token;
    }
  }

  return { tokenData, userIdData };
};

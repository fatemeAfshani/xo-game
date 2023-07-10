/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';

type AuthContextProvider = {
  userToken: string | null;
  login: (token: string) => void;
  logout: () => void;
};

type AuthProviderProps = {
  children: React.ReactNode;
};

const authContext = React.createContext<AuthContextProvider>({} as AuthContextProvider);

export default function AuthProvider({ children }: AuthProviderProps) {
  let localStorageData = localStorage.getItem('userData');
  let tokenData = null;

  localStorageData = localStorageData && JSON.parse(localStorageData);
  if (localStorageData) {
    const { token, expire } = localStorageData as unknown as {
      token: string;
      expire: string;
    };
    if (new Date() > new Date(expire)) {
      localStorage.removeItem('userData');
    } else {
      tokenData = token;
    }
  }
  const [userToken, setUserToken] = useState<string | null>(tokenData);

  const login = (token: string) => {
    const now = new Date();
    const item = {
      token,
      expire: now.getTime() + 6 * 3600 * 1000,
    };
    localStorage.setItem('userData', JSON.stringify(item));
    setUserToken(token);
  };

  const logout = () => {
    console.log('#### here');
    localStorage.removeItem('tokenData');
    setUserToken(null);
  };

  return <authContext.Provider value={{ userToken, login, logout }}>{children}</authContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};

export const useAuth = () => useContext(authContext);

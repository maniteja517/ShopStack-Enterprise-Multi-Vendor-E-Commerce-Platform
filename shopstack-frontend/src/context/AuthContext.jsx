import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (!token) {
      return null;
    }

    return {
      token,
      role,
      email,
    };
  });

  const login = (loginResponse) => {
    localStorage.setItem("token", loginResponse.token);
    localStorage.setItem("role", loginResponse.role);
    localStorage.setItem("email", loginResponse.email);

    setUser(loginResponse);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
// src/UserContext.tsx
import React, { createContext, useContext, useState } from "react";

type UserState = { email: string } | null;

const Ctx = createContext<{ user: UserState; setUser: (u: UserState) => void }>({
  user: null,
  setUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState>(null);
  return <Ctx.Provider value={{ user, setUser }}>{children}</Ctx.Provider>;
};

export const useUser = () => useContext(Ctx);

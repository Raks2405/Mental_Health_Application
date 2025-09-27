import React, { createContext, useContext, useState } from "react";

type UserCtx = { email?: string; setEmail: (v?: string) => void };
const Ctx = createContext<UserCtx>({ email: undefined, setEmail: () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState<string | undefined>(undefined);
  return <Ctx.Provider value={{ email, setEmail }}>{children}</Ctx.Provider>;
}

export const useUser = () => useContext(Ctx);

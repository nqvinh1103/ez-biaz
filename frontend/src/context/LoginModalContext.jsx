import { createContext, useCallback, useContext, useState } from "react";

const LoginModalContext = createContext(null);

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used inside <LoginModalProvider>");
  return ctx;
}

export function LoginModalProvider({ children }) {
  const [loginOpen, setLoginOpen]       = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  const openLoginModal    = useCallback(() => { setRegisterOpen(false); setLoginOpen(true);    }, []);
  const closeLoginModal   = useCallback(() => setLoginOpen(false),    []);
  const openRegisterModal = useCallback(() => { setLoginOpen(false);  setRegisterOpen(true);  }, []);
  const closeRegisterModal= useCallback(() => setRegisterOpen(false), []);

  return (
    <LoginModalContext.Provider value={{
      loginOpen, openLoginModal, closeLoginModal,
      registerOpen, openRegisterModal, closeRegisterModal,
    }}>
      {children}
    </LoginModalContext.Provider>
  );
}

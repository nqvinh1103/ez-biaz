import { createContext, useContext } from "react";

/** True khi component đang render bên trong ProfilePage (nested route) */
export const NestedLayoutContext = createContext(false);

export const useNestedLayout = () => useContext(NestedLayoutContext);

import { createContext } from "react";

export const LayoutContext = createContext<{
  setTitle: (title: string) => void;
}>({ setTitle: () => {} });

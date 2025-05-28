import { useContext, useEffect } from "react";
import { LayoutContext } from "../context/LayoutContext";

/**
 * Sets the browser tab title.
 * Adds a suffix like " | MyApp" for branding consistency.
 */
export const useTabTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | MyApp`;
  }, [title]);
};

/**
 * Sets both the layout title (visible in UI) and the browser tab title.
 * If `tabTitle` is not provided, it falls back to using `layoutTitle`.
 */
export const usePageTitles = (layoutTitle: string, tabTitle?: string) => {
  const { setTitle } = useContext(LayoutContext);

  useEffect(() => {
    setTitle(layoutTitle);
  }, [layoutTitle, setTitle]);

  useTabTitle(tabTitle ?? layoutTitle);
};

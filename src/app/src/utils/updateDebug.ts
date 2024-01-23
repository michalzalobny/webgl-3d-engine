import { globalState } from "./globalState";

export const updateDebug = (text: string) => {
  if (!globalState.debugHolderEl) return;
  globalState.debugHolderEl.innerHTML = text;
};

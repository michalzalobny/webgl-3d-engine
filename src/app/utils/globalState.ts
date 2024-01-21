import { App } from "../App";

export const globalState = {
  stageSize: {
    value: [0, 0],
  },
  pixelRatio: {
    value: 1,
  },
  slowDownFactor: {
    value: 1,
  },
  uTime: {
    value: 0,
  },
  app: null as App | null,
  debugHolderEl: document.createElement("p") as HTMLElement, // just to avoid null
};

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
  mouse2DTarget: {
    value: [0, 0],
  },
  mouse2DCurrent: {
    value: [0, 0],
  },
  app: null as App | null,
  debugHolderEl: null as HTMLDivElement | null,
  canvasEl: null as HTMLCanvasElement | null,
};

import { deferByFrame } from "./src/utils/deferByFrame";
import { globalState } from "./src/utils/globalState";
import { App } from "./src/App";

document.addEventListener("DOMContentLoaded", async () => {
  deferByFrame(async () => {
    globalState.debugHolderEl = document.querySelector(
      ".debug-holder"
    ) as HTMLDivElement;

    globalState.canvasEl = document.getElementById(
      "canvas"
    ) as HTMLCanvasElement;

    // const { App } = await import("./App");
    globalState.app = new App();
  });
});

// Don't allow to zoom
document.addEventListener(
  "touchstart",
  function (event) {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  },
  { passive: false }
);

let lastTouchEnd = 0;
document.addEventListener(
  "touchend",
  function (event) {
    const now = window.performance.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  },
  false
);

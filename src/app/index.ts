import { deferByFrame } from "./src/utils/deferByFrame";
import { globalState } from "./src/utils/globalState";
import { App } from "./src/App";
import { MouseMove } from "./src/utils/MouseMove";

const onMouseMove = (e: any) => {
  const mouseX = (e.target as MouseMove).mouse.x;
  const mouseY = (e.target as MouseMove).mouse.y;

  const stageX = globalState.stageSize.value[0];
  const stageY = globalState.stageSize.value[1];

  globalState.mouse2DTarget.value = [
    (mouseX / stageX) * 2 - 1,
    -(mouseY / stageY) * 2 + 1,
  ];
};

document.addEventListener("DOMContentLoaded", async () => {
  deferByFrame(async () => {
    globalState.debugHolderEl = document.querySelector(
      ".debug-holder"
    ) as HTMLDivElement;

    globalState.canvasEl = document.getElementById(
      "canvas"
    ) as HTMLCanvasElement;

    const mouseMove = MouseMove.getInstance();

    mouseMove.addEventListener("mousemove", onMouseMove);

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

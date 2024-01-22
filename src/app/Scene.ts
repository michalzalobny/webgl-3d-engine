import { updateDebug } from "./utils/updateDebug";
import { globalState } from "./utils/globalState";

export class Scene {
  constructor() {}

  update() {}

  onResize() {
    updateDebug(globalState.stageSize.value.join(" x "));
  }

  onPixelRatioChange() {}
}

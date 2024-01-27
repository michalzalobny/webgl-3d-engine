import { EventDispatcher } from "./EventDispatcher";

interface Mouse {
  x: number;
  y: number;
}

export class MouseMove extends EventDispatcher {
  _mouseLast: Mouse = { x: 0, y: 0 };
  _isTouching = false;
  _clickStart: Mouse = { x: 0, y: 0 };
  mouse: Mouse = { x: 0, y: 0 };
  strength = 0;
  _isInit = false;

  static _instance: MouseMove | null;
  static _canCreate = false;
  static getInstance() {
    if (!MouseMove._instance) {
      MouseMove._canCreate = true;
      MouseMove._instance = new MouseMove();
      MouseMove._canCreate = false;
    }

    return MouseMove._instance;
  }

  constructor() {
    super();

    if (MouseMove._instance || !MouseMove._canCreate) {
      throw new Error("Use MouseMove.getInstance()");
    }

    this._addEvents();

    MouseMove._instance = this;
  }

  _onTouchDown = (event: TouchEvent | MouseEvent) => {
    this._isInit = true;
    this._isTouching = true;
    this._mouseLast.x =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    this._mouseLast.y =
      "touches" in event ? event.touches[0].clientY : event.clientY;

    this.mouse.x = this._mouseLast.x;
    this.mouse.y = this._mouseLast.y;

    this._clickStart.x = this.mouse.x;
    this._clickStart.y = this.mouse.y;
    this.dispatchEvent({ type: "down" });
  };

  _onTouchMove = (event: TouchEvent | MouseEvent) => {
    this._isInit = true;
    const touchX =
      "touches" in event ? event.touches[0].clientX : event.clientX;
    const touchY =
      "touches" in event ? event.touches[0].clientY : event.clientY;

    const deltaX = touchX - this._mouseLast.x;
    const deltaY = touchY - this._mouseLast.y;

    this.strength = deltaX * deltaX + deltaY * deltaY;

    this._mouseLast.x = touchX;
    this._mouseLast.y = touchY;

    this.mouse.x += deltaX;
    this.mouse.y += deltaY;

    this.dispatchEvent({ type: "mousemove" });
    this._mouseLast.x = this.mouse.x;
    this._mouseLast.y = this.mouse.y;
  };

  _onTouchUp = () => {
    this._isTouching = false;
    this.dispatchEvent({ type: "up" });
  };

  _onMouseLeave = () => {
    this.dispatchEvent({ type: "left" });
  };

  _onClick = (e: any) => {
    // Dont react if the user clicked on a button or a link
    if (
      e.target instanceof HTMLButtonElement ||
      e.target instanceof HTMLAnchorElement
    ) {
      // console.warn("The clicked element is not a canvas");
      return;
    }
    this._isInit = true;
    const clickBounds = 10;
    const xDiff = Math.abs(this._clickStart.x - this.mouse.x);
    const yDiff = Math.abs(this._clickStart.y - this.mouse.y);

    //Make sure that the user's click is held between certain boundaries
    if (xDiff <= clickBounds && yDiff <= clickBounds) {
      this.dispatchEvent({ type: "click" });
    }
  };

  _addEvents() {
    window.addEventListener("pointerdown", this._onTouchDown);

    window.addEventListener("mousemove", this._onTouchMove, { passive: true });
    window.addEventListener("touchmove", this._onTouchMove, { passive: true });

    window.addEventListener("pointerup", this._onTouchUp);

    window.addEventListener("click", this._onClick);
    window.addEventListener("mouseout", this._onMouseLeave);
  }
}

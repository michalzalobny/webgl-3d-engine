export interface DomRectSSR {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
  x: number;
  y: number;
}

export const emptySSRRect: DomRectSSR = {
  bottom: 1,
  height: 1,
  left: 1,
  right: 1,
  top: 1,
  width: 1,
  x: 1,
  y: 1,
};

export interface ScrollObj {
  current: { value: [number, number] };
  target: { value: [number, number] };
  last: { value: [number, number] };
  directionX: { value: number };
  directionY: { value: number };
  currentStrength: { value: [number, number] };
  targetStrength: { value: [number, number] };
  scrollProgress: { value: [number, number] };
}

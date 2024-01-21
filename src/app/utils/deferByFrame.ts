export const deferByFrame = (callback: () => void) => {
  setTimeout(() => {
    callback();
  }, 1);
};

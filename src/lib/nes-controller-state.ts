// Lightweight pub/sub state for controlling the NES controller overlay visibility
let nesControllerOpen = false;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach(l => l());

export const toggleNesController = () => {
  nesControllerOpen = !nesControllerOpen;
  notify();
};

export const closeNesController = () => {
  nesControllerOpen = false;
  notify();
};

export const getNesControllerOpen = () => nesControllerOpen;

export const subscribeNesController = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

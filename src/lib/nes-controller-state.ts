type Listener = (isOpen: boolean) => void;
type ArcadeListener = (isActive: boolean) => void;

let nesControllerOpen = false;
let arcadeModeActive = false;
const listeners: Set<Listener> = new Set();
const arcadeListeners: Set<ArcadeListener> = new Set();

export const toggleNesController = () => {
  nesControllerOpen = !nesControllerOpen;
  listeners.forEach(l => l(nesControllerOpen));
};

export const closeNesController = () => {
  if (nesControllerOpen) {
    nesControllerOpen = false;
    listeners.forEach(l => l(nesControllerOpen));
  }
};

export const getNesControllerOpen = () => nesControllerOpen;

export const subscribeNesController = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Arcade Mode State
export const setArcadeMode = (active: boolean) => {
  arcadeModeActive = active;
  arcadeListeners.forEach(l => l(arcadeModeActive));
};

export const getArcadeMode = () => arcadeModeActive;

export const subscribeArcadeMode = (listener: ArcadeListener) => {
  arcadeListeners.add(listener);
  return () => arcadeListeners.delete(listener);
};

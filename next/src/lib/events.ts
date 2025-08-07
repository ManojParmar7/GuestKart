const events = new EventTarget();

export const emitUserUpdate = () => {
  events.dispatchEvent(new Event("user-updated"));
};

export const onUserUpdate = (callback: () => void) => {
  const handler = () => callback();
  events.addEventListener("user-updated", handler);
  return () => events.removeEventListener("user-updated", handler);
};

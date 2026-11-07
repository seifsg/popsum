// Small DOM helpers shared by the views.

// Required element by id; a missing one is a markup bug, so fail loudly at start.
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`popsum: #${id} missing from index.html`);
  return el as T;
}

// Replays a one-shot CSS animation class (reflow between remove and add restarts it).
export function replay(el: HTMLElement, cls: string): void {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

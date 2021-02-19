//
// Post custom message to all workers (including main worker)
//
Module["postCustomMessage"] = (data) => {
  // TODO: Acutally want to post only to main worker
  for (let worker of PThread.runningWorkers) {
    worker.postMessage({ 'cmd': 'custom', 'userData': data });
  }
};

//
// Simple queue with async get (assume single consumer)
//
class Queue {
  constructor() {
    this.getter = null;
    this.list = [];
  }
  async get() {
    if (this.list.length > 0) { return this.list.shift(); }
    return await new Promise(resolve => this.getter = resolve);
  }
  put(x) {
    if (this.getter) { this.getter(x); this.getter = null; return; }
    this.list.push(x);
  }
};

//
// TODO: This is used only by main worker
//
Module["queue"] = new Queue();

Module["onCustomMessage"] = (data) => {
  Module["queue"].put(data);
};

//
// API
//

// Align to the same API as niklasf's stockfish
Module["postMessage"] = Module["postCustomMessage"];

const listeners = [];

Module["addMessageListener"] = (listener) => {
  listeners.push(listener);
};

Module["removeMessageListener"] = (listener) => {
  const i = listeners.indexOf(listener);
  if (i >= 0) { listeners.splice(i, 1); }
};

Module["print"] = Module["printErr"] = (data) => {
  if (listeners.length === 0) { console.log(data); return; }
  for (let listener of listeners) {
    listener(data);
  }
};

Module["terminate"] = () => {
  PThread.terminateAllThreads();
};

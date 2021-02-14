//
// Post custom message to all workers (including main worker)
//
Module["postCustomMessage"] = (data) => {
  // TODO: Acutally want to post only to main worker
  for (let worker of PThread.runningWorkers) {
    worker.postMessage({ cmd: 'custom', userData: data });
  }
};

//
// Simple queue with async get
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
  Module.queue.put(data);
};

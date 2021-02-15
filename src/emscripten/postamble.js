(() => {

//
// Type of thread (PThread.getThreadName is available when PTHREADS_PROFILING=1)
//
const MAIN_BACKGROUND = "Application main thread"; // cf. __call_main in library_pthread.c

const isMainForeground = () => !ENVIRONMENT_IS_WORKER;
const isMainBackground = () => ENVIRONMENT_IS_WORKER && PThread.getThreadName(_pthread_self()) == MAIN_BACKGROUND;

const getWorkerName = (worker) => PThread.getThreadName(worker.pthread.thread);

//
// Post custom message between MainForeground and MainBackground
//
Module["postCustomMessage"] = (data) => {
  err('postCustomMessage', data);
  if (isMainForeground()) {
    for (let worker of PThread.runningWorkers) {
      if (getWorkerName(worker) == MAIN_BACKGROUND) {
        worker.postMessage({ cmd: 'custom', userData: data });
      }
    }
  }
  if (isMainBackground()) {
    postMessage({ cmd: 'custom', userData: data });
  }
};

//
// Patch PThread.loadWasmModuleToWorker for MainForeground to receive custom message from workers
//
const old_loadWasmModuleToWorker = PThread.loadWasmModuleToWorker

const new_loadWasmModuleToWorker = (worker, onFinishedLoading) => {
  old_loadWasmModuleToWorker(worker, onFinishedLoading);

  const old_onmessage = worker.onmessage;

  const new_onmessage = (e) => {
    if (e.data.cmd === 'custom') {
      if (typeof Module['onCustomMessage'] === 'function') {
        Module['onCustomMessage'](e.data.userData);
      }
    } else {
      old_onmessage(e);
    }
  };

  worker.onmessage = new_onmessage;
}

PThread.loadWasmModuleToWorker = new_loadWasmModuleToWorker;

//
// Application specific logic
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

Module["print"] = (data) => {
  if (listeners.length === 0) { console.log(data); return; }
  for (let listener of listeners) {
    listener(data);
  }
};

//
// Queue with async get (assume single consumer)
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

// Used only for MainBackground
Module["uci_command_queue"] = new Queue();

let background_ready_promise_resolve;
const background_ready_promise = new Promise(resolve => background_ready_promise_resolve = resolve);

Module["onCustomMessage"] = (data) => {
  err('onCustomMessage', data);
  if (isMainForeground()) {
    if (data == 'background_ready') {
      background_ready_promise_resolve();
    }
    if (data == 'background_exit') {
      PThread.terminateAllThreads();
    }
  }

  if (isMainBackground()) {
    Module.uci_command_queue.put(data);
  }
};

// Wait until MainBackground is ready
if (isMainForeground()) {
  const new_ready = Module["ready"].then(() => background_ready_promise).then(() => Module);
  Module["ready"] = new_ready;
}

})();

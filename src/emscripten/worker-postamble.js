//
// Patch `onmessage` to support custom message
//
const old_onmessage = this.onmessage;

const new_onmessage = (e) => {
  if (e.data.cmd === 'custom') {
    if (typeof Module['onCustomMessage'] === 'function') {
      Module['onCustomMessage'](e.data.userData);
    }
  } else {
    old_onmessage(e);
  }
}

onmessage = this.onmessage = new_onmessage;

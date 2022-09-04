const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("api", {
  send(channel, data) {
    ipcRenderer.send(channel, data);
  },
  receive(channel, func, ...otherFuncs) {
    ipcRenderer.on(channel, function (event, ...args) {
      func(event, ...args);
      for (let f of otherFuncs) {
        f()
      };
    });
  },
  invoke(channel, ...data) {
    return ipcRenderer.invoke(channel, ...data);
  },
});

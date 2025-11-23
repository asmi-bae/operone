import { contextBridge as r, ipcRenderer as n } from "electron";
r.exposeInMainWorld("electron", {
  onAuthSuccess: (e) => {
    n.on("auth-success", (t, o) => e(o));
  },
  openExternal: (e) => {
    n.send("open-external", e);
  }
});

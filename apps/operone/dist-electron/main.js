var mo = Object.defineProperty;
var es = (e) => {
  throw TypeError(e);
};
var po = (e, t, r) => t in e ? mo(e, t, { enumerable: !0, configurable: !0, writable: !0, value: r }) : e[t] = r;
var nt = (e, t, r) => po(e, typeof t != "symbol" ? t + "" : t, r), ts = (e, t, r) => t.has(e) || es("Cannot " + r);
var ae = (e, t, r) => (ts(e, t, "read from private field"), r ? r.call(e) : t.get(e)), st = (e, t, r) => t.has(e) ? es("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), at = (e, t, r, n) => (ts(e, t, "write to private field"), n ? n.call(e, r) : t.set(e, r), r);
import Di, { app as Ue, BrowserWindow as Li, shell as yo } from "electron";
import Mn from "path";
import ie from "node:process";
import se from "node:path";
import { promisify as le, isDeepStrictEqual as vo } from "node:util";
import Y from "node:fs";
import it from "node:crypto";
import go from "node:assert";
import Mi from "node:os";
import "node:events";
import "node:stream";
const He = (e) => {
  const t = typeof e;
  return e !== null && (t === "object" || t === "function");
}, jr = /* @__PURE__ */ new Set([
  "__proto__",
  "prototype",
  "constructor"
]), $o = new Set("0123456789");
function gr(e) {
  const t = [];
  let r = "", n = "start", i = !1;
  for (const s of e)
    switch (s) {
      case "\\": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        i && (r += s), n = "property", i = !i;
        break;
      }
      case ".": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "property";
          break;
        }
        if (i) {
          i = !1, r += s;
          break;
        }
        if (jr.has(r))
          return [];
        t.push(r), r = "", n = "property";
        break;
      }
      case "[": {
        if (n === "index")
          throw new Error("Invalid character in an index");
        if (n === "indexEnd") {
          n = "index";
          break;
        }
        if (i) {
          i = !1, r += s;
          break;
        }
        if (n === "property") {
          if (jr.has(r))
            return [];
          t.push(r), r = "";
        }
        n = "index";
        break;
      }
      case "]": {
        if (n === "index") {
          t.push(Number.parseInt(r, 10)), r = "", n = "indexEnd";
          break;
        }
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
      }
      default: {
        if (n === "index" && !$o.has(s))
          throw new Error("Invalid character in an index");
        if (n === "indexEnd")
          throw new Error("Invalid character after an index");
        n === "start" && (n = "property"), i && (i = !1, r += "\\"), r += s;
      }
    }
  switch (i && (r += "\\"), n) {
    case "property": {
      if (jr.has(r))
        return [];
      t.push(r);
      break;
    }
    case "index":
      throw new Error("Index was not closed");
    case "start": {
      t.push("");
      break;
    }
  }
  return t;
}
function Fn(e, t) {
  if (typeof t != "number" && Array.isArray(e)) {
    const r = Number.parseInt(t, 10);
    return Number.isInteger(r) && e[r] === e[t];
  }
  return !1;
}
function Vi(e, t) {
  if (Fn(e, t))
    throw new Error("Cannot use string index");
}
function _o(e, t, r) {
  if (!He(e) || typeof t != "string")
    return r === void 0 ? e : r;
  const n = gr(t);
  if (n.length === 0)
    return r;
  for (let i = 0; i < n.length; i++) {
    const s = n[i];
    if (Fn(e, s) ? e = i === n.length - 1 ? void 0 : null : e = e[s], e == null) {
      if (i !== n.length - 1)
        return r;
      break;
    }
  }
  return e === void 0 ? r : e;
}
function rs(e, t, r) {
  if (!He(e) || typeof t != "string")
    return e;
  const n = e, i = gr(t);
  for (let s = 0; s < i.length; s++) {
    const c = i[s];
    Vi(e, c), s === i.length - 1 ? e[c] = r : He(e[c]) || (e[c] = typeof i[s + 1] == "number" ? [] : {}), e = e[c];
  }
  return n;
}
function Eo(e, t) {
  if (!He(e) || typeof t != "string")
    return !1;
  const r = gr(t);
  for (let n = 0; n < r.length; n++) {
    const i = r[n];
    if (Vi(e, i), n === r.length - 1)
      return delete e[i], !0;
    if (e = e[i], !He(e))
      return !1;
  }
}
function wo(e, t) {
  if (!He(e) || typeof t != "string")
    return !1;
  const r = gr(t);
  if (r.length === 0)
    return !1;
  for (const n of r) {
    if (!He(e) || !(n in e) || Fn(e, n))
      return !1;
    e = e[n];
  }
  return !0;
}
const Ve = Mi.homedir(), Un = Mi.tmpdir(), { env: Qe } = ie, So = (e) => {
  const t = se.join(Ve, "Library");
  return {
    data: se.join(t, "Application Support", e),
    config: se.join(t, "Preferences", e),
    cache: se.join(t, "Caches", e),
    log: se.join(t, "Logs", e),
    temp: se.join(Un, e)
  };
}, bo = (e) => {
  const t = Qe.APPDATA || se.join(Ve, "AppData", "Roaming"), r = Qe.LOCALAPPDATA || se.join(Ve, "AppData", "Local");
  return {
    // Data/config/cache/log are invented by me as Windows isn't opinionated about this
    data: se.join(r, e, "Data"),
    config: se.join(t, e, "Config"),
    cache: se.join(r, e, "Cache"),
    log: se.join(r, e, "Log"),
    temp: se.join(Un, e)
  };
}, Ro = (e) => {
  const t = se.basename(Ve);
  return {
    data: se.join(Qe.XDG_DATA_HOME || se.join(Ve, ".local", "share"), e),
    config: se.join(Qe.XDG_CONFIG_HOME || se.join(Ve, ".config"), e),
    cache: se.join(Qe.XDG_CACHE_HOME || se.join(Ve, ".cache"), e),
    // https://wiki.debian.org/XDGBaseDirectorySpecification#state
    log: se.join(Qe.XDG_STATE_HOME || se.join(Ve, ".local", "state"), e),
    temp: se.join(Un, t, e)
  };
};
function Po(e, { suffix: t = "nodejs" } = {}) {
  if (typeof e != "string")
    throw new TypeError(`Expected a string, got ${typeof e}`);
  return t && (e += `-${t}`), ie.platform === "darwin" ? So(e) : ie.platform === "win32" ? bo(e) : Ro(e);
}
const ke = (e, t) => {
  const { onError: r } = t;
  return function(...i) {
    return e.apply(void 0, i).catch(r);
  };
}, Ne = (e, t) => {
  const { onError: r } = t;
  return function(...i) {
    try {
      return e.apply(void 0, i);
    } catch (s) {
      return r(s);
    }
  };
}, Io = 250, Ce = (e, t) => {
  const { isRetriable: r } = t;
  return function(i) {
    const { timeout: s } = i, c = i.interval ?? Io, o = Date.now() + s;
    return function u(...l) {
      return e.apply(void 0, l).catch((a) => {
        if (!r(a) || Date.now() >= o)
          throw a;
        const g = Math.round(c * Math.random());
        return g > 0 ? new Promise((y) => setTimeout(y, g)).then(() => u.apply(void 0, l)) : u.apply(void 0, l);
      });
    };
  };
}, De = (e, t) => {
  const { isRetriable: r } = t;
  return function(i) {
    const { timeout: s } = i, c = Date.now() + s;
    return function(...u) {
      for (; ; )
        try {
          return e.apply(void 0, u);
        } catch (l) {
          if (!r(l) || Date.now() >= c)
            throw l;
          continue;
        }
    };
  };
}, et = {
  /* API */
  isChangeErrorOk: (e) => {
    if (!et.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "ENOSYS" || !No && (t === "EINVAL" || t === "EPERM");
  },
  isNodeError: (e) => e instanceof Error,
  isRetriableError: (e) => {
    if (!et.isNodeError(e))
      return !1;
    const { code: t } = e;
    return t === "EMFILE" || t === "ENFILE" || t === "EAGAIN" || t === "EBUSY" || t === "EACCESS" || t === "EACCES" || t === "EACCS" || t === "EPERM";
  },
  onChangeError: (e) => {
    if (!et.isNodeError(e))
      throw e;
    if (!et.isChangeErrorOk(e))
      throw e;
  }
}, ht = {
  onError: et.onChangeError
}, ge = {
  onError: () => {
  }
}, No = ie.getuid ? !ie.getuid() : !1, fe = {
  isRetriable: et.isRetriableError
}, de = {
  attempt: {
    /* ASYNC */
    chmod: ke(le(Y.chmod), ht),
    chown: ke(le(Y.chown), ht),
    close: ke(le(Y.close), ge),
    fsync: ke(le(Y.fsync), ge),
    mkdir: ke(le(Y.mkdir), ge),
    realpath: ke(le(Y.realpath), ge),
    stat: ke(le(Y.stat), ge),
    unlink: ke(le(Y.unlink), ge),
    /* SYNC */
    chmodSync: Ne(Y.chmodSync, ht),
    chownSync: Ne(Y.chownSync, ht),
    closeSync: Ne(Y.closeSync, ge),
    existsSync: Ne(Y.existsSync, ge),
    fsyncSync: Ne(Y.fsync, ge),
    mkdirSync: Ne(Y.mkdirSync, ge),
    realpathSync: Ne(Y.realpathSync, ge),
    statSync: Ne(Y.statSync, ge),
    unlinkSync: Ne(Y.unlinkSync, ge)
  },
  retry: {
    /* ASYNC */
    close: Ce(le(Y.close), fe),
    fsync: Ce(le(Y.fsync), fe),
    open: Ce(le(Y.open), fe),
    readFile: Ce(le(Y.readFile), fe),
    rename: Ce(le(Y.rename), fe),
    stat: Ce(le(Y.stat), fe),
    write: Ce(le(Y.write), fe),
    writeFile: Ce(le(Y.writeFile), fe),
    /* SYNC */
    closeSync: De(Y.closeSync, fe),
    fsyncSync: De(Y.fsyncSync, fe),
    openSync: De(Y.openSync, fe),
    readFileSync: De(Y.readFileSync, fe),
    renameSync: De(Y.renameSync, fe),
    statSync: De(Y.statSync, fe),
    writeSync: De(Y.writeSync, fe),
    writeFileSync: De(Y.writeFileSync, fe)
  }
}, Oo = "utf8", ns = 438, To = 511, jo = {}, Ao = ie.geteuid ? ie.geteuid() : -1, qo = ie.getegid ? ie.getegid() : -1, ko = 1e3, Co = !!ie.getuid;
ie.getuid && ie.getuid();
const ss = 128, Do = (e) => e instanceof Error && "code" in e, as = (e) => typeof e == "string", Ar = (e) => e === void 0, Lo = ie.platform === "linux", Fi = ie.platform === "win32", zn = ["SIGHUP", "SIGINT", "SIGTERM"];
Fi || zn.push("SIGALRM", "SIGABRT", "SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
Lo && zn.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT");
class Mo {
  /* CONSTRUCTOR */
  constructor() {
    this.callbacks = /* @__PURE__ */ new Set(), this.exited = !1, this.exit = (t) => {
      if (!this.exited) {
        this.exited = !0;
        for (const r of this.callbacks)
          r();
        t && (Fi && t !== "SIGINT" && t !== "SIGTERM" && t !== "SIGKILL" ? ie.kill(ie.pid, "SIGTERM") : ie.kill(ie.pid, t));
      }
    }, this.hook = () => {
      ie.once("exit", () => this.exit());
      for (const t of zn)
        try {
          ie.once(t, () => this.exit(t));
        } catch {
        }
    }, this.register = (t) => (this.callbacks.add(t), () => {
      this.callbacks.delete(t);
    }), this.hook();
  }
}
const Vo = new Mo(), Fo = Vo.register, he = {
  /* VARIABLES */
  store: {},
  // filePath => purge
  /* API */
  create: (e) => {
    const t = `000000${Math.floor(Math.random() * 16777215).toString(16)}`.slice(-6), i = `.tmp-${Date.now().toString().slice(-10)}${t}`;
    return `${e}${i}`;
  },
  get: (e, t, r = !0) => {
    const n = he.truncate(t(e));
    return n in he.store ? he.get(e, t, r) : (he.store[n] = r, [n, () => delete he.store[n]]);
  },
  purge: (e) => {
    he.store[e] && (delete he.store[e], de.attempt.unlink(e));
  },
  purgeSync: (e) => {
    he.store[e] && (delete he.store[e], de.attempt.unlinkSync(e));
  },
  purgeSyncAll: () => {
    for (const e in he.store)
      he.purgeSync(e);
  },
  truncate: (e) => {
    const t = se.basename(e);
    if (t.length <= ss)
      return e;
    const r = /^(\.?)(.*?)((?:\.[^.]+)?(?:\.tmp-\d{10}[a-f0-9]{6})?)$/.exec(t);
    if (!r)
      return e;
    const n = t.length - ss;
    return `${e.slice(0, -t.length)}${r[1]}${r[2].slice(0, -n)}${r[3]}`;
  }
};
Fo(he.purgeSyncAll);
function Ui(e, t, r = jo) {
  if (as(r))
    return Ui(e, t, { encoding: r });
  const i = { timeout: r.timeout ?? ko };
  let s = null, c = null, o = null;
  try {
    const u = de.attempt.realpathSync(e), l = !!u;
    e = u || e, [c, s] = he.get(e, r.tmpCreate || he.create, r.tmpPurge !== !1);
    const a = Co && Ar(r.chown), g = Ar(r.mode);
    if (l && (a || g)) {
      const d = de.attempt.statSync(e);
      d && (r = { ...r }, a && (r.chown = { uid: d.uid, gid: d.gid }), g && (r.mode = d.mode));
    }
    if (!l) {
      const d = se.dirname(e);
      de.attempt.mkdirSync(d, {
        mode: To,
        recursive: !0
      });
    }
    o = de.retry.openSync(i)(c, "w", r.mode || ns), r.tmpCreated && r.tmpCreated(c), as(t) ? de.retry.writeSync(i)(o, t, 0, r.encoding || Oo) : Ar(t) || de.retry.writeSync(i)(o, t, 0, t.length, 0), r.fsync !== !1 && (r.fsyncWait !== !1 ? de.retry.fsyncSync(i)(o) : de.attempt.fsync(o)), de.retry.closeSync(i)(o), o = null, r.chown && (r.chown.uid !== Ao || r.chown.gid !== qo) && de.attempt.chownSync(c, r.chown.uid, r.chown.gid), r.mode && r.mode !== ns && de.attempt.chmodSync(c, r.mode);
    try {
      de.retry.renameSync(i)(c, e);
    } catch (d) {
      if (!Do(d) || d.code !== "ENAMETOOLONG")
        throw d;
      de.retry.renameSync(i)(c, he.truncate(e));
    }
    s(), c = null;
  } finally {
    o && de.attempt.closeSync(o), c && he.purge(c);
  }
}
function zi(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var mt = { exports: {} }, qr = {}, Oe = {}, ze = {}, kr = {}, Cr = {}, Dr = {}, is;
function yr() {
  return is || (is = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.regexpCode = e.getEsmExportName = e.getProperty = e.safeStringify = e.stringify = e.strConcat = e.addCodeArg = e.str = e._ = e.nil = e._Code = e.Name = e.IDENTIFIER = e._CodeOrName = void 0;
    class t {
    }
    e._CodeOrName = t, e.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
    class r extends t {
      constructor(f) {
        if (super(), !e.IDENTIFIER.test(f))
          throw new Error("CodeGen: name must be a valid identifier");
        this.str = f;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        return !1;
      }
      get names() {
        return { [this.str]: 1 };
      }
    }
    e.Name = r;
    class n extends t {
      constructor(f) {
        super(), this._items = typeof f == "string" ? [f] : f;
      }
      toString() {
        return this.str;
      }
      emptyStr() {
        if (this._items.length > 1)
          return !1;
        const f = this._items[0];
        return f === "" || f === '""';
      }
      get str() {
        var f;
        return (f = this._str) !== null && f !== void 0 ? f : this._str = this._items.reduce((p, S) => `${p}${S}`, "");
      }
      get names() {
        var f;
        return (f = this._names) !== null && f !== void 0 ? f : this._names = this._items.reduce((p, S) => (S instanceof r && (p[S.str] = (p[S.str] || 0) + 1), p), {});
      }
    }
    e._Code = n, e.nil = new n("");
    function i(v, ...f) {
      const p = [v[0]];
      let S = 0;
      for (; S < f.length; )
        o(p, f[S]), p.push(v[++S]);
      return new n(p);
    }
    e._ = i;
    const s = new n("+");
    function c(v, ...f) {
      const p = [y(v[0])];
      let S = 0;
      for (; S < f.length; )
        p.push(s), o(p, f[S]), p.push(s, y(v[++S]));
      return u(p), new n(p);
    }
    e.str = c;
    function o(v, f) {
      f instanceof n ? v.push(...f._items) : f instanceof r ? v.push(f) : v.push(g(f));
    }
    e.addCodeArg = o;
    function u(v) {
      let f = 1;
      for (; f < v.length - 1; ) {
        if (v[f] === s) {
          const p = l(v[f - 1], v[f + 1]);
          if (p !== void 0) {
            v.splice(f - 1, 3, p);
            continue;
          }
          v[f++] = "+";
        }
        f++;
      }
    }
    function l(v, f) {
      if (f === '""')
        return v;
      if (v === '""')
        return f;
      if (typeof v == "string")
        return f instanceof r || v[v.length - 1] !== '"' ? void 0 : typeof f != "string" ? `${v.slice(0, -1)}${f}"` : f[0] === '"' ? v.slice(0, -1) + f.slice(1) : void 0;
      if (typeof f == "string" && f[0] === '"' && !(v instanceof r))
        return `"${v}${f.slice(1)}`;
    }
    function a(v, f) {
      return f.emptyStr() ? v : v.emptyStr() ? f : c`${v}${f}`;
    }
    e.strConcat = a;
    function g(v) {
      return typeof v == "number" || typeof v == "boolean" || v === null ? v : y(Array.isArray(v) ? v.join(",") : v);
    }
    function d(v) {
      return new n(y(v));
    }
    e.stringify = d;
    function y(v) {
      return JSON.stringify(v).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    }
    e.safeStringify = y;
    function w(v) {
      return typeof v == "string" && e.IDENTIFIER.test(v) ? new n(`.${v}`) : i`[${v}]`;
    }
    e.getProperty = w;
    function _(v) {
      if (typeof v == "string" && e.IDENTIFIER.test(v))
        return new n(`${v}`);
      throw new Error(`CodeGen: invalid export name: ${v}, use explicit $id name mapping`);
    }
    e.getEsmExportName = _;
    function h(v) {
      return new n(v.toString());
    }
    e.regexpCode = h;
  })(Dr)), Dr;
}
var Lr = {}, os;
function cs() {
  return os || (os = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.ValueScope = e.ValueScopeName = e.Scope = e.varKinds = e.UsedValueState = void 0;
    const t = yr();
    class r extends Error {
      constructor(l) {
        super(`CodeGen: "code" for ${l} not defined`), this.value = l.value;
      }
    }
    var n;
    (function(u) {
      u[u.Started = 0] = "Started", u[u.Completed = 1] = "Completed";
    })(n || (e.UsedValueState = n = {})), e.varKinds = {
      const: new t.Name("const"),
      let: new t.Name("let"),
      var: new t.Name("var")
    };
    class i {
      constructor({ prefixes: l, parent: a } = {}) {
        this._names = {}, this._prefixes = l, this._parent = a;
      }
      toName(l) {
        return l instanceof t.Name ? l : this.name(l);
      }
      name(l) {
        return new t.Name(this._newName(l));
      }
      _newName(l) {
        const a = this._names[l] || this._nameGroup(l);
        return `${l}${a.index++}`;
      }
      _nameGroup(l) {
        var a, g;
        if (!((g = (a = this._parent) === null || a === void 0 ? void 0 : a._prefixes) === null || g === void 0) && g.has(l) || this._prefixes && !this._prefixes.has(l))
          throw new Error(`CodeGen: prefix "${l}" is not allowed in this scope`);
        return this._names[l] = { prefix: l, index: 0 };
      }
    }
    e.Scope = i;
    class s extends t.Name {
      constructor(l, a) {
        super(a), this.prefix = l;
      }
      setValue(l, { property: a, itemIndex: g }) {
        this.value = l, this.scopePath = (0, t._)`.${new t.Name(a)}[${g}]`;
      }
    }
    e.ValueScopeName = s;
    const c = (0, t._)`\n`;
    class o extends i {
      constructor(l) {
        super(l), this._values = {}, this._scope = l.scope, this.opts = { ...l, _n: l.lines ? c : t.nil };
      }
      get() {
        return this._scope;
      }
      name(l) {
        return new s(l, this._newName(l));
      }
      value(l, a) {
        var g;
        if (a.ref === void 0)
          throw new Error("CodeGen: ref must be passed in value");
        const d = this.toName(l), { prefix: y } = d, w = (g = a.key) !== null && g !== void 0 ? g : a.ref;
        let _ = this._values[y];
        if (_) {
          const f = _.get(w);
          if (f)
            return f;
        } else
          _ = this._values[y] = /* @__PURE__ */ new Map();
        _.set(w, d);
        const h = this._scope[y] || (this._scope[y] = []), v = h.length;
        return h[v] = a.ref, d.setValue(a, { property: y, itemIndex: v }), d;
      }
      getValue(l, a) {
        const g = this._values[l];
        if (g)
          return g.get(a);
      }
      scopeRefs(l, a = this._values) {
        return this._reduceValues(a, (g) => {
          if (g.scopePath === void 0)
            throw new Error(`CodeGen: name "${g}" has no value`);
          return (0, t._)`${l}${g.scopePath}`;
        });
      }
      scopeCode(l = this._values, a, g) {
        return this._reduceValues(l, (d) => {
          if (d.value === void 0)
            throw new Error(`CodeGen: name "${d}" has no value`);
          return d.value.code;
        }, a, g);
      }
      _reduceValues(l, a, g = {}, d) {
        let y = t.nil;
        for (const w in l) {
          const _ = l[w];
          if (!_)
            continue;
          const h = g[w] = g[w] || /* @__PURE__ */ new Map();
          _.forEach((v) => {
            if (h.has(v))
              return;
            h.set(v, n.Started);
            let f = a(v);
            if (f) {
              const p = this.opts.es5 ? e.varKinds.var : e.varKinds.const;
              y = (0, t._)`${y}${p} ${v} = ${f};${this.opts._n}`;
            } else if (f = d == null ? void 0 : d(v))
              y = (0, t._)`${y}${f}${this.opts._n}`;
            else
              throw new r(v);
            h.set(v, n.Completed);
          });
        }
        return y;
      }
    }
    e.ValueScope = o;
  })(Lr)), Lr;
}
var us;
function J() {
  return us || (us = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.or = e.and = e.not = e.CodeGen = e.operators = e.varKinds = e.ValueScopeName = e.ValueScope = e.Scope = e.Name = e.regexpCode = e.stringify = e.getProperty = e.nil = e.strConcat = e.str = e._ = void 0;
    const t = yr(), r = cs();
    var n = yr();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return n._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return n.str;
    } }), Object.defineProperty(e, "strConcat", { enumerable: !0, get: function() {
      return n.strConcat;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return n.nil;
    } }), Object.defineProperty(e, "getProperty", { enumerable: !0, get: function() {
      return n.getProperty;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return n.stringify;
    } }), Object.defineProperty(e, "regexpCode", { enumerable: !0, get: function() {
      return n.regexpCode;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return n.Name;
    } });
    var i = cs();
    Object.defineProperty(e, "Scope", { enumerable: !0, get: function() {
      return i.Scope;
    } }), Object.defineProperty(e, "ValueScope", { enumerable: !0, get: function() {
      return i.ValueScope;
    } }), Object.defineProperty(e, "ValueScopeName", { enumerable: !0, get: function() {
      return i.ValueScopeName;
    } }), Object.defineProperty(e, "varKinds", { enumerable: !0, get: function() {
      return i.varKinds;
    } }), e.operators = {
      GT: new t._Code(">"),
      GTE: new t._Code(">="),
      LT: new t._Code("<"),
      LTE: new t._Code("<="),
      EQ: new t._Code("==="),
      NEQ: new t._Code("!=="),
      NOT: new t._Code("!"),
      OR: new t._Code("||"),
      AND: new t._Code("&&"),
      ADD: new t._Code("+")
    };
    class s {
      optimizeNodes() {
        return this;
      }
      optimizeNames($, R) {
        return this;
      }
    }
    class c extends s {
      constructor($, R, k) {
        super(), this.varKind = $, this.name = R, this.rhs = k;
      }
      render({ es5: $, _n: R }) {
        const k = $ ? r.varKinds.var : this.varKind, W = this.rhs === void 0 ? "" : ` = ${this.rhs}`;
        return `${k} ${this.name}${W};` + R;
      }
      optimizeNames($, R) {
        if ($[this.name.str])
          return this.rhs && (this.rhs = A(this.rhs, $, R)), this;
      }
      get names() {
        return this.rhs instanceof t._CodeOrName ? this.rhs.names : {};
      }
    }
    class o extends s {
      constructor($, R, k) {
        super(), this.lhs = $, this.rhs = R, this.sideEffects = k;
      }
      render({ _n: $ }) {
        return `${this.lhs} = ${this.rhs};` + $;
      }
      optimizeNames($, R) {
        if (!(this.lhs instanceof t.Name && !$[this.lhs.str] && !this.sideEffects))
          return this.rhs = A(this.rhs, $, R), this;
      }
      get names() {
        const $ = this.lhs instanceof t.Name ? {} : { ...this.lhs.names };
        return G($, this.rhs);
      }
    }
    class u extends o {
      constructor($, R, k, W) {
        super($, k, W), this.op = R;
      }
      render({ _n: $ }) {
        return `${this.lhs} ${this.op}= ${this.rhs};` + $;
      }
    }
    class l extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `${this.label}:` + $;
      }
    }
    class a extends s {
      constructor($) {
        super(), this.label = $, this.names = {};
      }
      render({ _n: $ }) {
        return `break${this.label ? ` ${this.label}` : ""};` + $;
      }
    }
    class g extends s {
      constructor($) {
        super(), this.error = $;
      }
      render({ _n: $ }) {
        return `throw ${this.error};` + $;
      }
      get names() {
        return this.error.names;
      }
    }
    class d extends s {
      constructor($) {
        super(), this.code = $;
      }
      render({ _n: $ }) {
        return `${this.code};` + $;
      }
      optimizeNodes() {
        return `${this.code}` ? this : void 0;
      }
      optimizeNames($, R) {
        return this.code = A(this.code, $, R), this;
      }
      get names() {
        return this.code instanceof t._CodeOrName ? this.code.names : {};
      }
    }
    class y extends s {
      constructor($ = []) {
        super(), this.nodes = $;
      }
      render($) {
        return this.nodes.reduce((R, k) => R + k.render($), "");
      }
      optimizeNodes() {
        const { nodes: $ } = this;
        let R = $.length;
        for (; R--; ) {
          const k = $[R].optimizeNodes();
          Array.isArray(k) ? $.splice(R, 1, ...k) : k ? $[R] = k : $.splice(R, 1);
        }
        return $.length > 0 ? this : void 0;
      }
      optimizeNames($, R) {
        const { nodes: k } = this;
        let W = k.length;
        for (; W--; ) {
          const x = k[W];
          x.optimizeNames($, R) || (D($, x.names), k.splice(W, 1));
        }
        return k.length > 0 ? this : void 0;
      }
      get names() {
        return this.nodes.reduce(($, R) => F($, R.names), {});
      }
    }
    class w extends y {
      render($) {
        return "{" + $._n + super.render($) + "}" + $._n;
      }
    }
    class _ extends y {
    }
    class h extends w {
    }
    h.kind = "else";
    class v extends w {
      constructor($, R) {
        super(R), this.condition = $;
      }
      render($) {
        let R = `if(${this.condition})` + super.render($);
        return this.else && (R += "else " + this.else.render($)), R;
      }
      optimizeNodes() {
        super.optimizeNodes();
        const $ = this.condition;
        if ($ === !0)
          return this.nodes;
        let R = this.else;
        if (R) {
          const k = R.optimizeNodes();
          R = this.else = Array.isArray(k) ? new h(k) : k;
        }
        if (R)
          return $ === !1 ? R instanceof v ? R : R.nodes : this.nodes.length ? this : new v(X($), R instanceof v ? [R] : R.nodes);
        if (!($ === !1 || !this.nodes.length))
          return this;
      }
      optimizeNames($, R) {
        var k;
        if (this.else = (k = this.else) === null || k === void 0 ? void 0 : k.optimizeNames($, R), !!(super.optimizeNames($, R) || this.else))
          return this.condition = A(this.condition, $, R), this;
      }
      get names() {
        const $ = super.names;
        return G($, this.condition), this.else && F($, this.else.names), $;
      }
    }
    v.kind = "if";
    class f extends w {
    }
    f.kind = "for";
    class p extends f {
      constructor($) {
        super(), this.iteration = $;
      }
      render($) {
        return `for(${this.iteration})` + super.render($);
      }
      optimizeNames($, R) {
        if (super.optimizeNames($, R))
          return this.iteration = A(this.iteration, $, R), this;
      }
      get names() {
        return F(super.names, this.iteration.names);
      }
    }
    class S extends f {
      constructor($, R, k, W) {
        super(), this.varKind = $, this.name = R, this.from = k, this.to = W;
      }
      render($) {
        const R = $.es5 ? r.varKinds.var : this.varKind, { name: k, from: W, to: x } = this;
        return `for(${R} ${k}=${W}; ${k}<${x}; ${k}++)` + super.render($);
      }
      get names() {
        const $ = G(super.names, this.from);
        return G($, this.to);
      }
    }
    class m extends f {
      constructor($, R, k, W) {
        super(), this.loop = $, this.varKind = R, this.name = k, this.iterable = W;
      }
      render($) {
        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render($);
      }
      optimizeNames($, R) {
        if (super.optimizeNames($, R))
          return this.iterable = A(this.iterable, $, R), this;
      }
      get names() {
        return F(super.names, this.iterable.names);
      }
    }
    class E extends w {
      constructor($, R, k) {
        super(), this.name = $, this.args = R, this.async = k;
      }
      render($) {
        return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render($);
      }
    }
    E.kind = "func";
    class b extends y {
      render($) {
        return "return " + super.render($);
      }
    }
    b.kind = "return";
    class O extends w {
      render($) {
        let R = "try" + super.render($);
        return this.catch && (R += this.catch.render($)), this.finally && (R += this.finally.render($)), R;
      }
      optimizeNodes() {
        var $, R;
        return super.optimizeNodes(), ($ = this.catch) === null || $ === void 0 || $.optimizeNodes(), (R = this.finally) === null || R === void 0 || R.optimizeNodes(), this;
      }
      optimizeNames($, R) {
        var k, W;
        return super.optimizeNames($, R), (k = this.catch) === null || k === void 0 || k.optimizeNames($, R), (W = this.finally) === null || W === void 0 || W.optimizeNames($, R), this;
      }
      get names() {
        const $ = super.names;
        return this.catch && F($, this.catch.names), this.finally && F($, this.finally.names), $;
      }
    }
    class M extends w {
      constructor($) {
        super(), this.error = $;
      }
      render($) {
        return `catch(${this.error})` + super.render($);
      }
    }
    M.kind = "catch";
    class z extends w {
      render($) {
        return "finally" + super.render($);
      }
    }
    z.kind = "finally";
    class C {
      constructor($, R = {}) {
        this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = { ...R, _n: R.lines ? `
` : "" }, this._extScope = $, this._scope = new r.Scope({ parent: $ }), this._nodes = [new _()];
      }
      toString() {
        return this._root.render(this.opts);
      }
      // returns unique name in the internal scope
      name($) {
        return this._scope.name($);
      }
      // reserves unique name in the external scope
      scopeName($) {
        return this._extScope.name($);
      }
      // reserves unique name in the external scope and assigns value to it
      scopeValue($, R) {
        const k = this._extScope.value($, R);
        return (this._values[k.prefix] || (this._values[k.prefix] = /* @__PURE__ */ new Set())).add(k), k;
      }
      getScopeValue($, R) {
        return this._extScope.getValue($, R);
      }
      // return code that assigns values in the external scope to the names that are used internally
      // (same names that were returned by gen.scopeName or gen.scopeValue)
      scopeRefs($) {
        return this._extScope.scopeRefs($, this._values);
      }
      scopeCode() {
        return this._extScope.scopeCode(this._values);
      }
      _def($, R, k, W) {
        const x = this._scope.toName(R);
        return k !== void 0 && W && (this._constants[x.str] = k), this._leafNode(new c($, x, k)), x;
      }
      // `const` declaration (`var` in es5 mode)
      const($, R, k) {
        return this._def(r.varKinds.const, $, R, k);
      }
      // `let` declaration with optional assignment (`var` in es5 mode)
      let($, R, k) {
        return this._def(r.varKinds.let, $, R, k);
      }
      // `var` declaration with optional assignment
      var($, R, k) {
        return this._def(r.varKinds.var, $, R, k);
      }
      // assignment code
      assign($, R, k) {
        return this._leafNode(new o($, R, k));
      }
      // `+=` code
      add($, R) {
        return this._leafNode(new u($, e.operators.ADD, R));
      }
      // appends passed SafeExpr to code or executes Block
      code($) {
        return typeof $ == "function" ? $() : $ !== t.nil && this._leafNode(new d($)), this;
      }
      // returns code for object literal for the passed argument list of key-value pairs
      object(...$) {
        const R = ["{"];
        for (const [k, W] of $)
          R.length > 1 && R.push(","), R.push(k), (k !== W || this.opts.es5) && (R.push(":"), (0, t.addCodeArg)(R, W));
        return R.push("}"), new t._Code(R);
      }
      // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
      if($, R, k) {
        if (this._blockNode(new v($)), R && k)
          this.code(R).else().code(k).endIf();
        else if (R)
          this.code(R).endIf();
        else if (k)
          throw new Error('CodeGen: "else" body without "then" body');
        return this;
      }
      // `else if` clause - invalid without `if` or after `else` clauses
      elseIf($) {
        return this._elseNode(new v($));
      }
      // `else` clause - only valid after `if` or `else if` clauses
      else() {
        return this._elseNode(new h());
      }
      // end `if` statement (needed if gen.if was used only with condition)
      endIf() {
        return this._endBlockNode(v, h);
      }
      _for($, R) {
        return this._blockNode($), R && this.code(R).endFor(), this;
      }
      // a generic `for` clause (or statement if `forBody` is passed)
      for($, R) {
        return this._for(new p($), R);
      }
      // `for` statement for a range of values
      forRange($, R, k, W, x = this.opts.es5 ? r.varKinds.var : r.varKinds.let) {
        const re = this._scope.toName($);
        return this._for(new S(x, re, R, k), () => W(re));
      }
      // `for-of` statement (in es5 mode replace with a normal for loop)
      forOf($, R, k, W = r.varKinds.const) {
        const x = this._scope.toName($);
        if (this.opts.es5) {
          const re = R instanceof t.Name ? R : this.var("_arr", R);
          return this.forRange("_i", 0, (0, t._)`${re}.length`, (te) => {
            this.var(x, (0, t._)`${re}[${te}]`), k(x);
          });
        }
        return this._for(new m("of", W, x, R), () => k(x));
      }
      // `for-in` statement.
      // With option `ownProperties` replaced with a `for-of` loop for object keys
      forIn($, R, k, W = this.opts.es5 ? r.varKinds.var : r.varKinds.const) {
        if (this.opts.ownProperties)
          return this.forOf($, (0, t._)`Object.keys(${R})`, k);
        const x = this._scope.toName($);
        return this._for(new m("in", W, x, R), () => k(x));
      }
      // end `for` loop
      endFor() {
        return this._endBlockNode(f);
      }
      // `label` statement
      label($) {
        return this._leafNode(new l($));
      }
      // `break` statement
      break($) {
        return this._leafNode(new a($));
      }
      // `return` statement
      return($) {
        const R = new b();
        if (this._blockNode(R), this.code($), R.nodes.length !== 1)
          throw new Error('CodeGen: "return" should have one node');
        return this._endBlockNode(b);
      }
      // `try` statement
      try($, R, k) {
        if (!R && !k)
          throw new Error('CodeGen: "try" without "catch" and "finally"');
        const W = new O();
        if (this._blockNode(W), this.code($), R) {
          const x = this.name("e");
          this._currNode = W.catch = new M(x), R(x);
        }
        return k && (this._currNode = W.finally = new z(), this.code(k)), this._endBlockNode(M, z);
      }
      // `throw` statement
      throw($) {
        return this._leafNode(new g($));
      }
      // start self-balancing block
      block($, R) {
        return this._blockStarts.push(this._nodes.length), $ && this.code($).endBlock(R), this;
      }
      // end the current self-balancing block
      endBlock($) {
        const R = this._blockStarts.pop();
        if (R === void 0)
          throw new Error("CodeGen: not in self-balancing block");
        const k = this._nodes.length - R;
        if (k < 0 || $ !== void 0 && k !== $)
          throw new Error(`CodeGen: wrong number of nodes: ${k} vs ${$} expected`);
        return this._nodes.length = R, this;
      }
      // `function` heading (or definition if funcBody is passed)
      func($, R = t.nil, k, W) {
        return this._blockNode(new E($, R, k)), W && this.code(W).endFunc(), this;
      }
      // end function definition
      endFunc() {
        return this._endBlockNode(E);
      }
      optimize($ = 1) {
        for (; $-- > 0; )
          this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
      }
      _leafNode($) {
        return this._currNode.nodes.push($), this;
      }
      _blockNode($) {
        this._currNode.nodes.push($), this._nodes.push($);
      }
      _endBlockNode($, R) {
        const k = this._currNode;
        if (k instanceof $ || R && k instanceof R)
          return this._nodes.pop(), this;
        throw new Error(`CodeGen: not in block "${R ? `${$.kind}/${R.kind}` : $.kind}"`);
      }
      _elseNode($) {
        const R = this._currNode;
        if (!(R instanceof v))
          throw new Error('CodeGen: "else" without "if"');
        return this._currNode = R.else = $, this;
      }
      get _root() {
        return this._nodes[0];
      }
      get _currNode() {
        const $ = this._nodes;
        return $[$.length - 1];
      }
      set _currNode($) {
        const R = this._nodes;
        R[R.length - 1] = $;
      }
    }
    e.CodeGen = C;
    function F(I, $) {
      for (const R in $)
        I[R] = (I[R] || 0) + ($[R] || 0);
      return I;
    }
    function G(I, $) {
      return $ instanceof t._CodeOrName ? F(I, $.names) : I;
    }
    function A(I, $, R) {
      if (I instanceof t.Name)
        return k(I);
      if (!W(I))
        return I;
      return new t._Code(I._items.reduce((x, re) => (re instanceof t.Name && (re = k(re)), re instanceof t._Code ? x.push(...re._items) : x.push(re), x), []));
      function k(x) {
        const re = R[x.str];
        return re === void 0 || $[x.str] !== 1 ? x : (delete $[x.str], re);
      }
      function W(x) {
        return x instanceof t._Code && x._items.some((re) => re instanceof t.Name && $[re.str] === 1 && R[re.str] !== void 0);
      }
    }
    function D(I, $) {
      for (const R in $)
        I[R] = (I[R] || 0) - ($[R] || 0);
    }
    function X(I) {
      return typeof I == "boolean" || typeof I == "number" || I === null ? !I : (0, t._)`!${j(I)}`;
    }
    e.not = X;
    const K = P(e.operators.AND);
    function U(...I) {
      return I.reduce(K);
    }
    e.and = U;
    const H = P(e.operators.OR);
    function q(...I) {
      return I.reduce(H);
    }
    e.or = q;
    function P(I) {
      return ($, R) => $ === t.nil ? R : R === t.nil ? $ : (0, t._)`${j($)} ${I} ${j(R)}`;
    }
    function j(I) {
      return I instanceof t.Name ? I : (0, t._)`(${I})`;
    }
  })(Cr)), Cr;
}
var Z = {}, ls;
function ee() {
  if (ls) return Z;
  ls = 1, Object.defineProperty(Z, "__esModule", { value: !0 }), Z.checkStrictMode = Z.getErrorPath = Z.Type = Z.useFunc = Z.setEvaluated = Z.evaluatedPropsToName = Z.mergeEvaluated = Z.eachItem = Z.unescapeJsonPointer = Z.escapeJsonPointer = Z.escapeFragment = Z.unescapeFragment = Z.schemaRefOrVal = Z.schemaHasRulesButRef = Z.schemaHasRules = Z.checkUnknownRules = Z.alwaysValidSchema = Z.toHash = void 0;
  const e = J(), t = yr();
  function r(m) {
    const E = {};
    for (const b of m)
      E[b] = !0;
    return E;
  }
  Z.toHash = r;
  function n(m, E) {
    return typeof E == "boolean" ? E : Object.keys(E).length === 0 ? !0 : (i(m, E), !s(E, m.self.RULES.all));
  }
  Z.alwaysValidSchema = n;
  function i(m, E = m.schema) {
    const { opts: b, self: O } = m;
    if (!b.strictSchema || typeof E == "boolean")
      return;
    const M = O.RULES.keywords;
    for (const z in E)
      M[z] || S(m, `unknown keyword: "${z}"`);
  }
  Z.checkUnknownRules = i;
  function s(m, E) {
    if (typeof m == "boolean")
      return !m;
    for (const b in m)
      if (E[b])
        return !0;
    return !1;
  }
  Z.schemaHasRules = s;
  function c(m, E) {
    if (typeof m == "boolean")
      return !m;
    for (const b in m)
      if (b !== "$ref" && E.all[b])
        return !0;
    return !1;
  }
  Z.schemaHasRulesButRef = c;
  function o({ topSchemaRef: m, schemaPath: E }, b, O, M) {
    if (!M) {
      if (typeof b == "number" || typeof b == "boolean")
        return b;
      if (typeof b == "string")
        return (0, e._)`${b}`;
    }
    return (0, e._)`${m}${E}${(0, e.getProperty)(O)}`;
  }
  Z.schemaRefOrVal = o;
  function u(m) {
    return g(decodeURIComponent(m));
  }
  Z.unescapeFragment = u;
  function l(m) {
    return encodeURIComponent(a(m));
  }
  Z.escapeFragment = l;
  function a(m) {
    return typeof m == "number" ? `${m}` : m.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  Z.escapeJsonPointer = a;
  function g(m) {
    return m.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  Z.unescapeJsonPointer = g;
  function d(m, E) {
    if (Array.isArray(m))
      for (const b of m)
        E(b);
    else
      E(m);
  }
  Z.eachItem = d;
  function y({ mergeNames: m, mergeToName: E, mergeValues: b, resultToName: O }) {
    return (M, z, C, F) => {
      const G = C === void 0 ? z : C instanceof e.Name ? (z instanceof e.Name ? m(M, z, C) : E(M, z, C), C) : z instanceof e.Name ? (E(M, C, z), z) : b(z, C);
      return F === e.Name && !(G instanceof e.Name) ? O(M, G) : G;
    };
  }
  Z.mergeEvaluated = {
    props: y({
      mergeNames: (m, E, b) => m.if((0, e._)`${b} !== true && ${E} !== undefined`, () => {
        m.if((0, e._)`${E} === true`, () => m.assign(b, !0), () => m.assign(b, (0, e._)`${b} || {}`).code((0, e._)`Object.assign(${b}, ${E})`));
      }),
      mergeToName: (m, E, b) => m.if((0, e._)`${b} !== true`, () => {
        E === !0 ? m.assign(b, !0) : (m.assign(b, (0, e._)`${b} || {}`), _(m, b, E));
      }),
      mergeValues: (m, E) => m === !0 ? !0 : { ...m, ...E },
      resultToName: w
    }),
    items: y({
      mergeNames: (m, E, b) => m.if((0, e._)`${b} !== true && ${E} !== undefined`, () => m.assign(b, (0, e._)`${E} === true ? true : ${b} > ${E} ? ${b} : ${E}`)),
      mergeToName: (m, E, b) => m.if((0, e._)`${b} !== true`, () => m.assign(b, E === !0 ? !0 : (0, e._)`${b} > ${E} ? ${b} : ${E}`)),
      mergeValues: (m, E) => m === !0 ? !0 : Math.max(m, E),
      resultToName: (m, E) => m.var("items", E)
    })
  };
  function w(m, E) {
    if (E === !0)
      return m.var("props", !0);
    const b = m.var("props", (0, e._)`{}`);
    return E !== void 0 && _(m, b, E), b;
  }
  Z.evaluatedPropsToName = w;
  function _(m, E, b) {
    Object.keys(b).forEach((O) => m.assign((0, e._)`${E}${(0, e.getProperty)(O)}`, !0));
  }
  Z.setEvaluated = _;
  const h = {};
  function v(m, E) {
    return m.scopeValue("func", {
      ref: E,
      code: h[E.code] || (h[E.code] = new t._Code(E.code))
    });
  }
  Z.useFunc = v;
  var f;
  (function(m) {
    m[m.Num = 0] = "Num", m[m.Str = 1] = "Str";
  })(f || (Z.Type = f = {}));
  function p(m, E, b) {
    if (m instanceof e.Name) {
      const O = E === f.Num;
      return b ? O ? (0, e._)`"[" + ${m} + "]"` : (0, e._)`"['" + ${m} + "']"` : O ? (0, e._)`"/" + ${m}` : (0, e._)`"/" + ${m}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
    }
    return b ? (0, e.getProperty)(m).toString() : "/" + a(m);
  }
  Z.getErrorPath = p;
  function S(m, E, b = m.opts.strictSchema) {
    if (b) {
      if (E = `strict mode: ${E}`, b === !0)
        throw new Error(E);
      m.self.logger.warn(E);
    }
  }
  return Z.checkStrictMode = S, Z;
}
var pt = {}, fs;
function be() {
  if (fs) return pt;
  fs = 1, Object.defineProperty(pt, "__esModule", { value: !0 });
  const e = J(), t = {
    // validation function arguments
    data: new e.Name("data"),
    // data passed to validation function
    // args passed from referencing schema
    valCxt: new e.Name("valCxt"),
    // validation/data context - should not be used directly, it is destructured to the names below
    instancePath: new e.Name("instancePath"),
    parentData: new e.Name("parentData"),
    parentDataProperty: new e.Name("parentDataProperty"),
    rootData: new e.Name("rootData"),
    // root data - same as the data passed to the first/top validation function
    dynamicAnchors: new e.Name("dynamicAnchors"),
    // used to support recursiveRef and dynamicRef
    // function scoped variables
    vErrors: new e.Name("vErrors"),
    // null or array of validation errors
    errors: new e.Name("errors"),
    // counter of validation errors
    this: new e.Name("this"),
    // "globals"
    self: new e.Name("self"),
    scope: new e.Name("scope"),
    // JTD serialize/parse name for JSON string and position
    json: new e.Name("json"),
    jsonPos: new e.Name("jsonPos"),
    jsonLen: new e.Name("jsonLen"),
    jsonPart: new e.Name("jsonPart")
  };
  return pt.default = t, pt;
}
var ds;
function $r() {
  return ds || (ds = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.extendErrors = e.resetErrorsCount = e.reportExtraError = e.reportError = e.keyword$DataError = e.keywordError = void 0;
    const t = J(), r = ee(), n = be();
    e.keywordError = {
      message: ({ keyword: h }) => (0, t.str)`must pass "${h}" keyword validation`
    }, e.keyword$DataError = {
      message: ({ keyword: h, schemaType: v }) => v ? (0, t.str)`"${h}" keyword must be ${v} ($data)` : (0, t.str)`"${h}" keyword is invalid ($data)`
    };
    function i(h, v = e.keywordError, f, p) {
      const { it: S } = h, { gen: m, compositeRule: E, allErrors: b } = S, O = g(h, v, f);
      p ?? (E || b) ? u(m, O) : l(S, (0, t._)`[${O}]`);
    }
    e.reportError = i;
    function s(h, v = e.keywordError, f) {
      const { it: p } = h, { gen: S, compositeRule: m, allErrors: E } = p, b = g(h, v, f);
      u(S, b), m || E || l(p, n.default.vErrors);
    }
    e.reportExtraError = s;
    function c(h, v) {
      h.assign(n.default.errors, v), h.if((0, t._)`${n.default.vErrors} !== null`, () => h.if(v, () => h.assign((0, t._)`${n.default.vErrors}.length`, v), () => h.assign(n.default.vErrors, null)));
    }
    e.resetErrorsCount = c;
    function o({ gen: h, keyword: v, schemaValue: f, data: p, errsCount: S, it: m }) {
      if (S === void 0)
        throw new Error("ajv implementation error");
      const E = h.name("err");
      h.forRange("i", S, n.default.errors, (b) => {
        h.const(E, (0, t._)`${n.default.vErrors}[${b}]`), h.if((0, t._)`${E}.instancePath === undefined`, () => h.assign((0, t._)`${E}.instancePath`, (0, t.strConcat)(n.default.instancePath, m.errorPath))), h.assign((0, t._)`${E}.schemaPath`, (0, t.str)`${m.errSchemaPath}/${v}`), m.opts.verbose && (h.assign((0, t._)`${E}.schema`, f), h.assign((0, t._)`${E}.data`, p));
      });
    }
    e.extendErrors = o;
    function u(h, v) {
      const f = h.const("err", v);
      h.if((0, t._)`${n.default.vErrors} === null`, () => h.assign(n.default.vErrors, (0, t._)`[${f}]`), (0, t._)`${n.default.vErrors}.push(${f})`), h.code((0, t._)`${n.default.errors}++`);
    }
    function l(h, v) {
      const { gen: f, validateName: p, schemaEnv: S } = h;
      S.$async ? f.throw((0, t._)`new ${h.ValidationError}(${v})`) : (f.assign((0, t._)`${p}.errors`, v), f.return(!1));
    }
    const a = {
      keyword: new t.Name("keyword"),
      schemaPath: new t.Name("schemaPath"),
      // also used in JTD errors
      params: new t.Name("params"),
      propertyName: new t.Name("propertyName"),
      message: new t.Name("message"),
      schema: new t.Name("schema"),
      parentSchema: new t.Name("parentSchema")
    };
    function g(h, v, f) {
      const { createErrors: p } = h.it;
      return p === !1 ? (0, t._)`{}` : d(h, v, f);
    }
    function d(h, v, f = {}) {
      const { gen: p, it: S } = h, m = [
        y(S, f),
        w(h, f)
      ];
      return _(h, v, m), p.object(...m);
    }
    function y({ errorPath: h }, { instancePath: v }) {
      const f = v ? (0, t.str)`${h}${(0, r.getErrorPath)(v, r.Type.Str)}` : h;
      return [n.default.instancePath, (0, t.strConcat)(n.default.instancePath, f)];
    }
    function w({ keyword: h, it: { errSchemaPath: v } }, { schemaPath: f, parentSchema: p }) {
      let S = p ? v : (0, t.str)`${v}/${h}`;
      return f && (S = (0, t.str)`${S}${(0, r.getErrorPath)(f, r.Type.Str)}`), [a.schemaPath, S];
    }
    function _(h, { params: v, message: f }, p) {
      const { keyword: S, data: m, schemaValue: E, it: b } = h, { opts: O, propertyName: M, topSchemaRef: z, schemaPath: C } = b;
      p.push([a.keyword, S], [a.params, typeof v == "function" ? v(h) : v || (0, t._)`{}`]), O.messages && p.push([a.message, typeof f == "function" ? f(h) : f]), O.verbose && p.push([a.schema, E], [a.parentSchema, (0, t._)`${z}${C}`], [n.default.data, m]), M && p.push([a.propertyName, M]);
    }
  })(kr)), kr;
}
var hs;
function Uo() {
  if (hs) return ze;
  hs = 1, Object.defineProperty(ze, "__esModule", { value: !0 }), ze.boolOrEmptySchema = ze.topBoolOrEmptySchema = void 0;
  const e = $r(), t = J(), r = be(), n = {
    message: "boolean schema is false"
  };
  function i(o) {
    const { gen: u, schema: l, validateName: a } = o;
    l === !1 ? c(o, !1) : typeof l == "object" && l.$async === !0 ? u.return(r.default.data) : (u.assign((0, t._)`${a}.errors`, null), u.return(!0));
  }
  ze.topBoolOrEmptySchema = i;
  function s(o, u) {
    const { gen: l, schema: a } = o;
    a === !1 ? (l.var(u, !1), c(o)) : l.var(u, !0);
  }
  ze.boolOrEmptySchema = s;
  function c(o, u) {
    const { gen: l, data: a } = o, g = {
      gen: l,
      keyword: "false schema",
      data: a,
      schema: !1,
      schemaCode: !1,
      schemaValue: !1,
      params: {},
      it: o
    };
    (0, e.reportError)(g, n, void 0, u);
  }
  return ze;
}
var ue = {}, Ge = {}, ms;
function Gi() {
  if (ms) return Ge;
  ms = 1, Object.defineProperty(Ge, "__esModule", { value: !0 }), Ge.getRules = Ge.isJSONType = void 0;
  const e = ["string", "number", "integer", "boolean", "null", "object", "array"], t = new Set(e);
  function r(i) {
    return typeof i == "string" && t.has(i);
  }
  Ge.isJSONType = r;
  function n() {
    const i = {
      number: { type: "number", rules: [] },
      string: { type: "string", rules: [] },
      array: { type: "array", rules: [] },
      object: { type: "object", rules: [] }
    };
    return {
      types: { ...i, integer: !0, boolean: !0, null: !0 },
      rules: [{ rules: [] }, i.number, i.string, i.array, i.object],
      post: { rules: [] },
      all: {},
      keywords: {}
    };
  }
  return Ge.getRules = n, Ge;
}
var Te = {}, ps;
function Ki() {
  if (ps) return Te;
  ps = 1, Object.defineProperty(Te, "__esModule", { value: !0 }), Te.shouldUseRule = Te.shouldUseGroup = Te.schemaHasRulesForType = void 0;
  function e({ schema: n, self: i }, s) {
    const c = i.RULES.types[s];
    return c && c !== !0 && t(n, c);
  }
  Te.schemaHasRulesForType = e;
  function t(n, i) {
    return i.rules.some((s) => r(n, s));
  }
  Te.shouldUseGroup = t;
  function r(n, i) {
    var s;
    return n[i.keyword] !== void 0 || ((s = i.definition.implements) === null || s === void 0 ? void 0 : s.some((c) => n[c] !== void 0));
  }
  return Te.shouldUseRule = r, Te;
}
var ys;
function vr() {
  if (ys) return ue;
  ys = 1, Object.defineProperty(ue, "__esModule", { value: !0 }), ue.reportTypeError = ue.checkDataTypes = ue.checkDataType = ue.coerceAndCheckDataType = ue.getJSONTypes = ue.getSchemaTypes = ue.DataType = void 0;
  const e = Gi(), t = Ki(), r = $r(), n = J(), i = ee();
  var s;
  (function(f) {
    f[f.Correct = 0] = "Correct", f[f.Wrong = 1] = "Wrong";
  })(s || (ue.DataType = s = {}));
  function c(f) {
    const p = o(f.type);
    if (p.includes("null")) {
      if (f.nullable === !1)
        throw new Error("type: null contradicts nullable: false");
    } else {
      if (!p.length && f.nullable !== void 0)
        throw new Error('"nullable" cannot be used without "type"');
      f.nullable === !0 && p.push("null");
    }
    return p;
  }
  ue.getSchemaTypes = c;
  function o(f) {
    const p = Array.isArray(f) ? f : f ? [f] : [];
    if (p.every(e.isJSONType))
      return p;
    throw new Error("type must be JSONType or JSONType[]: " + p.join(","));
  }
  ue.getJSONTypes = o;
  function u(f, p) {
    const { gen: S, data: m, opts: E } = f, b = a(p, E.coerceTypes), O = p.length > 0 && !(b.length === 0 && p.length === 1 && (0, t.schemaHasRulesForType)(f, p[0]));
    if (O) {
      const M = w(p, m, E.strictNumbers, s.Wrong);
      S.if(M, () => {
        b.length ? g(f, p, b) : h(f);
      });
    }
    return O;
  }
  ue.coerceAndCheckDataType = u;
  const l = /* @__PURE__ */ new Set(["string", "number", "integer", "boolean", "null"]);
  function a(f, p) {
    return p ? f.filter((S) => l.has(S) || p === "array" && S === "array") : [];
  }
  function g(f, p, S) {
    const { gen: m, data: E, opts: b } = f, O = m.let("dataType", (0, n._)`typeof ${E}`), M = m.let("coerced", (0, n._)`undefined`);
    b.coerceTypes === "array" && m.if((0, n._)`${O} == 'object' && Array.isArray(${E}) && ${E}.length == 1`, () => m.assign(E, (0, n._)`${E}[0]`).assign(O, (0, n._)`typeof ${E}`).if(w(p, E, b.strictNumbers), () => m.assign(M, E))), m.if((0, n._)`${M} !== undefined`);
    for (const C of S)
      (l.has(C) || C === "array" && b.coerceTypes === "array") && z(C);
    m.else(), h(f), m.endIf(), m.if((0, n._)`${M} !== undefined`, () => {
      m.assign(E, M), d(f, M);
    });
    function z(C) {
      switch (C) {
        case "string":
          m.elseIf((0, n._)`${O} == "number" || ${O} == "boolean"`).assign(M, (0, n._)`"" + ${E}`).elseIf((0, n._)`${E} === null`).assign(M, (0, n._)`""`);
          return;
        case "number":
          m.elseIf((0, n._)`${O} == "boolean" || ${E} === null
              || (${O} == "string" && ${E} && ${E} == +${E})`).assign(M, (0, n._)`+${E}`);
          return;
        case "integer":
          m.elseIf((0, n._)`${O} === "boolean" || ${E} === null
              || (${O} === "string" && ${E} && ${E} == +${E} && !(${E} % 1))`).assign(M, (0, n._)`+${E}`);
          return;
        case "boolean":
          m.elseIf((0, n._)`${E} === "false" || ${E} === 0 || ${E} === null`).assign(M, !1).elseIf((0, n._)`${E} === "true" || ${E} === 1`).assign(M, !0);
          return;
        case "null":
          m.elseIf((0, n._)`${E} === "" || ${E} === 0 || ${E} === false`), m.assign(M, null);
          return;
        case "array":
          m.elseIf((0, n._)`${O} === "string" || ${O} === "number"
              || ${O} === "boolean" || ${E} === null`).assign(M, (0, n._)`[${E}]`);
      }
    }
  }
  function d({ gen: f, parentData: p, parentDataProperty: S }, m) {
    f.if((0, n._)`${p} !== undefined`, () => f.assign((0, n._)`${p}[${S}]`, m));
  }
  function y(f, p, S, m = s.Correct) {
    const E = m === s.Correct ? n.operators.EQ : n.operators.NEQ;
    let b;
    switch (f) {
      case "null":
        return (0, n._)`${p} ${E} null`;
      case "array":
        b = (0, n._)`Array.isArray(${p})`;
        break;
      case "object":
        b = (0, n._)`${p} && typeof ${p} == "object" && !Array.isArray(${p})`;
        break;
      case "integer":
        b = O((0, n._)`!(${p} % 1) && !isNaN(${p})`);
        break;
      case "number":
        b = O();
        break;
      default:
        return (0, n._)`typeof ${p} ${E} ${f}`;
    }
    return m === s.Correct ? b : (0, n.not)(b);
    function O(M = n.nil) {
      return (0, n.and)((0, n._)`typeof ${p} == "number"`, M, S ? (0, n._)`isFinite(${p})` : n.nil);
    }
  }
  ue.checkDataType = y;
  function w(f, p, S, m) {
    if (f.length === 1)
      return y(f[0], p, S, m);
    let E;
    const b = (0, i.toHash)(f);
    if (b.array && b.object) {
      const O = (0, n._)`typeof ${p} != "object"`;
      E = b.null ? O : (0, n._)`!${p} || ${O}`, delete b.null, delete b.array, delete b.object;
    } else
      E = n.nil;
    b.number && delete b.integer;
    for (const O in b)
      E = (0, n.and)(E, y(O, p, S, m));
    return E;
  }
  ue.checkDataTypes = w;
  const _ = {
    message: ({ schema: f }) => `must be ${f}`,
    params: ({ schema: f, schemaValue: p }) => typeof f == "string" ? (0, n._)`{type: ${f}}` : (0, n._)`{type: ${p}}`
  };
  function h(f) {
    const p = v(f);
    (0, r.reportError)(p, _);
  }
  ue.reportTypeError = h;
  function v(f) {
    const { gen: p, data: S, schema: m } = f, E = (0, i.schemaRefOrVal)(f, m, "type");
    return {
      gen: p,
      keyword: "type",
      data: S,
      schema: m.type,
      schemaCode: E,
      schemaValue: E,
      parentSchema: m,
      params: {},
      it: f
    };
  }
  return ue;
}
var ot = {}, vs;
function zo() {
  if (vs) return ot;
  vs = 1, Object.defineProperty(ot, "__esModule", { value: !0 }), ot.assignDefaults = void 0;
  const e = J(), t = ee();
  function r(i, s) {
    const { properties: c, items: o } = i.schema;
    if (s === "object" && c)
      for (const u in c)
        n(i, u, c[u].default);
    else s === "array" && Array.isArray(o) && o.forEach((u, l) => n(i, l, u.default));
  }
  ot.assignDefaults = r;
  function n(i, s, c) {
    const { gen: o, compositeRule: u, data: l, opts: a } = i;
    if (c === void 0)
      return;
    const g = (0, e._)`${l}${(0, e.getProperty)(s)}`;
    if (u) {
      (0, t.checkStrictMode)(i, `default is ignored for: ${g}`);
      return;
    }
    let d = (0, e._)`${g} === undefined`;
    a.useDefaults === "empty" && (d = (0, e._)`${d} || ${g} === null || ${g} === ""`), o.if(d, (0, e._)`${g} = ${(0, e.stringify)(c)}`);
  }
  return ot;
}
var Se = {}, ne = {}, gs;
function Re() {
  if (gs) return ne;
  gs = 1, Object.defineProperty(ne, "__esModule", { value: !0 }), ne.validateUnion = ne.validateArray = ne.usePattern = ne.callValidateCode = ne.schemaProperties = ne.allSchemaProperties = ne.noPropertyInData = ne.propertyInData = ne.isOwnProperty = ne.hasPropFunc = ne.reportMissingProp = ne.checkMissingProp = ne.checkReportMissingProp = void 0;
  const e = J(), t = ee(), r = be(), n = ee();
  function i(f, p) {
    const { gen: S, data: m, it: E } = f;
    S.if(a(S, m, p, E.opts.ownProperties), () => {
      f.setParams({ missingProperty: (0, e._)`${p}` }, !0), f.error();
    });
  }
  ne.checkReportMissingProp = i;
  function s({ gen: f, data: p, it: { opts: S } }, m, E) {
    return (0, e.or)(...m.map((b) => (0, e.and)(a(f, p, b, S.ownProperties), (0, e._)`${E} = ${b}`)));
  }
  ne.checkMissingProp = s;
  function c(f, p) {
    f.setParams({ missingProperty: p }, !0), f.error();
  }
  ne.reportMissingProp = c;
  function o(f) {
    return f.scopeValue("func", {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      ref: Object.prototype.hasOwnProperty,
      code: (0, e._)`Object.prototype.hasOwnProperty`
    });
  }
  ne.hasPropFunc = o;
  function u(f, p, S) {
    return (0, e._)`${o(f)}.call(${p}, ${S})`;
  }
  ne.isOwnProperty = u;
  function l(f, p, S, m) {
    const E = (0, e._)`${p}${(0, e.getProperty)(S)} !== undefined`;
    return m ? (0, e._)`${E} && ${u(f, p, S)}` : E;
  }
  ne.propertyInData = l;
  function a(f, p, S, m) {
    const E = (0, e._)`${p}${(0, e.getProperty)(S)} === undefined`;
    return m ? (0, e.or)(E, (0, e.not)(u(f, p, S))) : E;
  }
  ne.noPropertyInData = a;
  function g(f) {
    return f ? Object.keys(f).filter((p) => p !== "__proto__") : [];
  }
  ne.allSchemaProperties = g;
  function d(f, p) {
    return g(p).filter((S) => !(0, t.alwaysValidSchema)(f, p[S]));
  }
  ne.schemaProperties = d;
  function y({ schemaCode: f, data: p, it: { gen: S, topSchemaRef: m, schemaPath: E, errorPath: b }, it: O }, M, z, C) {
    const F = C ? (0, e._)`${f}, ${p}, ${m}${E}` : p, G = [
      [r.default.instancePath, (0, e.strConcat)(r.default.instancePath, b)],
      [r.default.parentData, O.parentData],
      [r.default.parentDataProperty, O.parentDataProperty],
      [r.default.rootData, r.default.rootData]
    ];
    O.opts.dynamicRef && G.push([r.default.dynamicAnchors, r.default.dynamicAnchors]);
    const A = (0, e._)`${F}, ${S.object(...G)}`;
    return z !== e.nil ? (0, e._)`${M}.call(${z}, ${A})` : (0, e._)`${M}(${A})`;
  }
  ne.callValidateCode = y;
  const w = (0, e._)`new RegExp`;
  function _({ gen: f, it: { opts: p } }, S) {
    const m = p.unicodeRegExp ? "u" : "", { regExp: E } = p.code, b = E(S, m);
    return f.scopeValue("pattern", {
      key: b.toString(),
      ref: b,
      code: (0, e._)`${E.code === "new RegExp" ? w : (0, n.useFunc)(f, E)}(${S}, ${m})`
    });
  }
  ne.usePattern = _;
  function h(f) {
    const { gen: p, data: S, keyword: m, it: E } = f, b = p.name("valid");
    if (E.allErrors) {
      const M = p.let("valid", !0);
      return O(() => p.assign(M, !1)), M;
    }
    return p.var(b, !0), O(() => p.break()), b;
    function O(M) {
      const z = p.const("len", (0, e._)`${S}.length`);
      p.forRange("i", 0, z, (C) => {
        f.subschema({
          keyword: m,
          dataProp: C,
          dataPropType: t.Type.Num
        }, b), p.if((0, e.not)(b), M);
      });
    }
  }
  ne.validateArray = h;
  function v(f) {
    const { gen: p, schema: S, keyword: m, it: E } = f;
    if (!Array.isArray(S))
      throw new Error("ajv implementation error");
    if (S.some((z) => (0, t.alwaysValidSchema)(E, z)) && !E.opts.unevaluated)
      return;
    const O = p.let("valid", !1), M = p.name("_valid");
    p.block(() => S.forEach((z, C) => {
      const F = f.subschema({
        keyword: m,
        schemaProp: C,
        compositeRule: !0
      }, M);
      p.assign(O, (0, e._)`${O} || ${M}`), f.mergeValidEvaluated(F, M) || p.if((0, e.not)(O));
    })), f.result(O, () => f.reset(), () => f.error(!0));
  }
  return ne.validateUnion = v, ne;
}
var $s;
function Go() {
  if ($s) return Se;
  $s = 1, Object.defineProperty(Se, "__esModule", { value: !0 }), Se.validateKeywordUsage = Se.validSchemaType = Se.funcKeywordCode = Se.macroKeywordCode = void 0;
  const e = J(), t = be(), r = Re(), n = $r();
  function i(d, y) {
    const { gen: w, keyword: _, schema: h, parentSchema: v, it: f } = d, p = y.macro.call(f.self, h, v, f), S = l(w, _, p);
    f.opts.validateSchema !== !1 && f.self.validateSchema(p, !0);
    const m = w.name("valid");
    d.subschema({
      schema: p,
      schemaPath: e.nil,
      errSchemaPath: `${f.errSchemaPath}/${_}`,
      topSchemaRef: S,
      compositeRule: !0
    }, m), d.pass(m, () => d.error(!0));
  }
  Se.macroKeywordCode = i;
  function s(d, y) {
    var w;
    const { gen: _, keyword: h, schema: v, parentSchema: f, $data: p, it: S } = d;
    u(S, y);
    const m = !p && y.compile ? y.compile.call(S.self, v, f, S) : y.validate, E = l(_, h, m), b = _.let("valid");
    d.block$data(b, O), d.ok((w = y.valid) !== null && w !== void 0 ? w : b);
    function O() {
      if (y.errors === !1)
        C(), y.modifying && c(d), F(() => d.error());
      else {
        const G = y.async ? M() : z();
        y.modifying && c(d), F(() => o(d, G));
      }
    }
    function M() {
      const G = _.let("ruleErrs", null);
      return _.try(() => C((0, e._)`await `), (A) => _.assign(b, !1).if((0, e._)`${A} instanceof ${S.ValidationError}`, () => _.assign(G, (0, e._)`${A}.errors`), () => _.throw(A))), G;
    }
    function z() {
      const G = (0, e._)`${E}.errors`;
      return _.assign(G, null), C(e.nil), G;
    }
    function C(G = y.async ? (0, e._)`await ` : e.nil) {
      const A = S.opts.passContext ? t.default.this : t.default.self, D = !("compile" in y && !p || y.schema === !1);
      _.assign(b, (0, e._)`${G}${(0, r.callValidateCode)(d, E, A, D)}`, y.modifying);
    }
    function F(G) {
      var A;
      _.if((0, e.not)((A = y.valid) !== null && A !== void 0 ? A : b), G);
    }
  }
  Se.funcKeywordCode = s;
  function c(d) {
    const { gen: y, data: w, it: _ } = d;
    y.if(_.parentData, () => y.assign(w, (0, e._)`${_.parentData}[${_.parentDataProperty}]`));
  }
  function o(d, y) {
    const { gen: w } = d;
    w.if((0, e._)`Array.isArray(${y})`, () => {
      w.assign(t.default.vErrors, (0, e._)`${t.default.vErrors} === null ? ${y} : ${t.default.vErrors}.concat(${y})`).assign(t.default.errors, (0, e._)`${t.default.vErrors}.length`), (0, n.extendErrors)(d);
    }, () => d.error());
  }
  function u({ schemaEnv: d }, y) {
    if (y.async && !d.$async)
      throw new Error("async keyword in sync schema");
  }
  function l(d, y, w) {
    if (w === void 0)
      throw new Error(`keyword "${y}" failed to compile`);
    return d.scopeValue("keyword", typeof w == "function" ? { ref: w } : { ref: w, code: (0, e.stringify)(w) });
  }
  function a(d, y, w = !1) {
    return !y.length || y.some((_) => _ === "array" ? Array.isArray(d) : _ === "object" ? d && typeof d == "object" && !Array.isArray(d) : typeof d == _ || w && typeof d > "u");
  }
  Se.validSchemaType = a;
  function g({ schema: d, opts: y, self: w, errSchemaPath: _ }, h, v) {
    if (Array.isArray(h.keyword) ? !h.keyword.includes(v) : h.keyword !== v)
      throw new Error("ajv implementation error");
    const f = h.dependencies;
    if (f != null && f.some((p) => !Object.prototype.hasOwnProperty.call(d, p)))
      throw new Error(`parent schema must have dependencies of ${v}: ${f.join(",")}`);
    if (h.validateSchema && !h.validateSchema(d[v])) {
      const S = `keyword "${v}" value is invalid at path "${_}": ` + w.errorsText(h.validateSchema.errors);
      if (y.validateSchema === "log")
        w.logger.error(S);
      else
        throw new Error(S);
    }
  }
  return Se.validateKeywordUsage = g, Se;
}
var je = {}, _s;
function Ko() {
  if (_s) return je;
  _s = 1, Object.defineProperty(je, "__esModule", { value: !0 }), je.extendSubschemaMode = je.extendSubschemaData = je.getSubschema = void 0;
  const e = J(), t = ee();
  function r(s, { keyword: c, schemaProp: o, schema: u, schemaPath: l, errSchemaPath: a, topSchemaRef: g }) {
    if (c !== void 0 && u !== void 0)
      throw new Error('both "keyword" and "schema" passed, only one allowed');
    if (c !== void 0) {
      const d = s.schema[c];
      return o === void 0 ? {
        schema: d,
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(c)}`,
        errSchemaPath: `${s.errSchemaPath}/${c}`
      } : {
        schema: d[o],
        schemaPath: (0, e._)`${s.schemaPath}${(0, e.getProperty)(c)}${(0, e.getProperty)(o)}`,
        errSchemaPath: `${s.errSchemaPath}/${c}/${(0, t.escapeFragment)(o)}`
      };
    }
    if (u !== void 0) {
      if (l === void 0 || a === void 0 || g === void 0)
        throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
      return {
        schema: u,
        schemaPath: l,
        topSchemaRef: g,
        errSchemaPath: a
      };
    }
    throw new Error('either "keyword" or "schema" must be passed');
  }
  je.getSubschema = r;
  function n(s, c, { dataProp: o, dataPropType: u, data: l, dataTypes: a, propertyName: g }) {
    if (l !== void 0 && o !== void 0)
      throw new Error('both "data" and "dataProp" passed, only one allowed');
    const { gen: d } = c;
    if (o !== void 0) {
      const { errorPath: w, dataPathArr: _, opts: h } = c, v = d.let("data", (0, e._)`${c.data}${(0, e.getProperty)(o)}`, !0);
      y(v), s.errorPath = (0, e.str)`${w}${(0, t.getErrorPath)(o, u, h.jsPropertySyntax)}`, s.parentDataProperty = (0, e._)`${o}`, s.dataPathArr = [..._, s.parentDataProperty];
    }
    if (l !== void 0) {
      const w = l instanceof e.Name ? l : d.let("data", l, !0);
      y(w), g !== void 0 && (s.propertyName = g);
    }
    a && (s.dataTypes = a);
    function y(w) {
      s.data = w, s.dataLevel = c.dataLevel + 1, s.dataTypes = [], c.definedProperties = /* @__PURE__ */ new Set(), s.parentData = c.data, s.dataNames = [...c.dataNames, w];
    }
  }
  je.extendSubschemaData = n;
  function i(s, { jtdDiscriminator: c, jtdMetadata: o, compositeRule: u, createErrors: l, allErrors: a }) {
    u !== void 0 && (s.compositeRule = u), l !== void 0 && (s.createErrors = l), a !== void 0 && (s.allErrors = a), s.jtdDiscriminator = c, s.jtdMetadata = o;
  }
  return je.extendSubschemaMode = i, je;
}
var me = {}, Mr, Es;
function Hi() {
  return Es || (Es = 1, Mr = function e(t, r) {
    if (t === r) return !0;
    if (t && r && typeof t == "object" && typeof r == "object") {
      if (t.constructor !== r.constructor) return !1;
      var n, i, s;
      if (Array.isArray(t)) {
        if (n = t.length, n != r.length) return !1;
        for (i = n; i-- !== 0; )
          if (!e(t[i], r[i])) return !1;
        return !0;
      }
      if (t.constructor === RegExp) return t.source === r.source && t.flags === r.flags;
      if (t.valueOf !== Object.prototype.valueOf) return t.valueOf() === r.valueOf();
      if (t.toString !== Object.prototype.toString) return t.toString() === r.toString();
      if (s = Object.keys(t), n = s.length, n !== Object.keys(r).length) return !1;
      for (i = n; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(r, s[i])) return !1;
      for (i = n; i-- !== 0; ) {
        var c = s[i];
        if (!e(t[c], r[c])) return !1;
      }
      return !0;
    }
    return t !== t && r !== r;
  }), Mr;
}
var Vr = { exports: {} }, ws;
function Ho() {
  if (ws) return Vr.exports;
  ws = 1;
  var e = Vr.exports = function(n, i, s) {
    typeof i == "function" && (s = i, i = {}), s = i.cb || s;
    var c = typeof s == "function" ? s : s.pre || function() {
    }, o = s.post || function() {
    };
    t(i, c, o, n, "", n);
  };
  e.keywords = {
    additionalItems: !0,
    items: !0,
    contains: !0,
    additionalProperties: !0,
    propertyNames: !0,
    not: !0,
    if: !0,
    then: !0,
    else: !0
  }, e.arrayKeywords = {
    items: !0,
    allOf: !0,
    anyOf: !0,
    oneOf: !0
  }, e.propsKeywords = {
    $defs: !0,
    definitions: !0,
    properties: !0,
    patternProperties: !0,
    dependencies: !0
  }, e.skipKeywords = {
    default: !0,
    enum: !0,
    const: !0,
    required: !0,
    maximum: !0,
    minimum: !0,
    exclusiveMaximum: !0,
    exclusiveMinimum: !0,
    multipleOf: !0,
    maxLength: !0,
    minLength: !0,
    pattern: !0,
    format: !0,
    maxItems: !0,
    minItems: !0,
    uniqueItems: !0,
    maxProperties: !0,
    minProperties: !0
  };
  function t(n, i, s, c, o, u, l, a, g, d) {
    if (c && typeof c == "object" && !Array.isArray(c)) {
      i(c, o, u, l, a, g, d);
      for (var y in c) {
        var w = c[y];
        if (Array.isArray(w)) {
          if (y in e.arrayKeywords)
            for (var _ = 0; _ < w.length; _++)
              t(n, i, s, w[_], o + "/" + y + "/" + _, u, o, y, c, _);
        } else if (y in e.propsKeywords) {
          if (w && typeof w == "object")
            for (var h in w)
              t(n, i, s, w[h], o + "/" + y + "/" + r(h), u, o, y, c, h);
        } else (y in e.keywords || n.allKeys && !(y in e.skipKeywords)) && t(n, i, s, w, o + "/" + y, u, o, y, c);
      }
      s(c, o, u, l, a, g, d);
    }
  }
  function r(n) {
    return n.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  return Vr.exports;
}
var Ss;
function _r() {
  if (Ss) return me;
  Ss = 1, Object.defineProperty(me, "__esModule", { value: !0 }), me.getSchemaRefs = me.resolveUrl = me.normalizeId = me._getFullPath = me.getFullPath = me.inlineRef = void 0;
  const e = ee(), t = Hi(), r = Ho(), n = /* @__PURE__ */ new Set([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum",
    "const"
  ]);
  function i(_, h = !0) {
    return typeof _ == "boolean" ? !0 : h === !0 ? !c(_) : h ? o(_) <= h : !1;
  }
  me.inlineRef = i;
  const s = /* @__PURE__ */ new Set([
    "$ref",
    "$recursiveRef",
    "$recursiveAnchor",
    "$dynamicRef",
    "$dynamicAnchor"
  ]);
  function c(_) {
    for (const h in _) {
      if (s.has(h))
        return !0;
      const v = _[h];
      if (Array.isArray(v) && v.some(c) || typeof v == "object" && c(v))
        return !0;
    }
    return !1;
  }
  function o(_) {
    let h = 0;
    for (const v in _) {
      if (v === "$ref")
        return 1 / 0;
      if (h++, !n.has(v) && (typeof _[v] == "object" && (0, e.eachItem)(_[v], (f) => h += o(f)), h === 1 / 0))
        return 1 / 0;
    }
    return h;
  }
  function u(_, h = "", v) {
    v !== !1 && (h = g(h));
    const f = _.parse(h);
    return l(_, f);
  }
  me.getFullPath = u;
  function l(_, h) {
    return _.serialize(h).split("#")[0] + "#";
  }
  me._getFullPath = l;
  const a = /#\/?$/;
  function g(_) {
    return _ ? _.replace(a, "") : "";
  }
  me.normalizeId = g;
  function d(_, h, v) {
    return v = g(v), _.resolve(h, v);
  }
  me.resolveUrl = d;
  const y = /^[a-z_][-a-z0-9._]*$/i;
  function w(_, h) {
    if (typeof _ == "boolean")
      return {};
    const { schemaId: v, uriResolver: f } = this.opts, p = g(_[v] || h), S = { "": p }, m = u(f, p, !1), E = {}, b = /* @__PURE__ */ new Set();
    return r(_, { allKeys: !0 }, (z, C, F, G) => {
      if (G === void 0)
        return;
      const A = m + C;
      let D = S[G];
      typeof z[v] == "string" && (D = X.call(this, z[v])), K.call(this, z.$anchor), K.call(this, z.$dynamicAnchor), S[C] = D;
      function X(U) {
        const H = this.opts.uriResolver.resolve;
        if (U = g(D ? H(D, U) : U), b.has(U))
          throw M(U);
        b.add(U);
        let q = this.refs[U];
        return typeof q == "string" && (q = this.refs[q]), typeof q == "object" ? O(z, q.schema, U) : U !== g(A) && (U[0] === "#" ? (O(z, E[U], U), E[U] = z) : this.refs[U] = A), U;
      }
      function K(U) {
        if (typeof U == "string") {
          if (!y.test(U))
            throw new Error(`invalid anchor "${U}"`);
          X.call(this, `#${U}`);
        }
      }
    }), E;
    function O(z, C, F) {
      if (C !== void 0 && !t(z, C))
        throw M(F);
    }
    function M(z) {
      return new Error(`reference "${z}" resolves to more than one schema`);
    }
  }
  return me.getSchemaRefs = w, me;
}
var bs;
function lt() {
  if (bs) return Oe;
  bs = 1, Object.defineProperty(Oe, "__esModule", { value: !0 }), Oe.getData = Oe.KeywordCxt = Oe.validateFunctionCode = void 0;
  const e = Uo(), t = vr(), r = Ki(), n = vr(), i = zo(), s = Go(), c = Ko(), o = J(), u = be(), l = _r(), a = ee(), g = $r();
  function d(N) {
    if (m(N) && (b(N), S(N))) {
      h(N);
      return;
    }
    y(N, () => (0, e.topBoolOrEmptySchema)(N));
  }
  Oe.validateFunctionCode = d;
  function y({ gen: N, validateName: T, schema: L, schemaEnv: V, opts: B }, Q) {
    B.code.es5 ? N.func(T, (0, o._)`${u.default.data}, ${u.default.valCxt}`, V.$async, () => {
      N.code((0, o._)`"use strict"; ${f(L, B)}`), _(N, B), N.code(Q);
    }) : N.func(T, (0, o._)`${u.default.data}, ${w(B)}`, V.$async, () => N.code(f(L, B)).code(Q));
  }
  function w(N) {
    return (0, o._)`{${u.default.instancePath}="", ${u.default.parentData}, ${u.default.parentDataProperty}, ${u.default.rootData}=${u.default.data}${N.dynamicRef ? (0, o._)`, ${u.default.dynamicAnchors}={}` : o.nil}}={}`;
  }
  function _(N, T) {
    N.if(u.default.valCxt, () => {
      N.var(u.default.instancePath, (0, o._)`${u.default.valCxt}.${u.default.instancePath}`), N.var(u.default.parentData, (0, o._)`${u.default.valCxt}.${u.default.parentData}`), N.var(u.default.parentDataProperty, (0, o._)`${u.default.valCxt}.${u.default.parentDataProperty}`), N.var(u.default.rootData, (0, o._)`${u.default.valCxt}.${u.default.rootData}`), T.dynamicRef && N.var(u.default.dynamicAnchors, (0, o._)`${u.default.valCxt}.${u.default.dynamicAnchors}`);
    }, () => {
      N.var(u.default.instancePath, (0, o._)`""`), N.var(u.default.parentData, (0, o._)`undefined`), N.var(u.default.parentDataProperty, (0, o._)`undefined`), N.var(u.default.rootData, u.default.data), T.dynamicRef && N.var(u.default.dynamicAnchors, (0, o._)`{}`);
    });
  }
  function h(N) {
    const { schema: T, opts: L, gen: V } = N;
    y(N, () => {
      L.$comment && T.$comment && G(N), z(N), V.let(u.default.vErrors, null), V.let(u.default.errors, 0), L.unevaluated && v(N), O(N), A(N);
    });
  }
  function v(N) {
    const { gen: T, validateName: L } = N;
    N.evaluated = T.const("evaluated", (0, o._)`${L}.evaluated`), T.if((0, o._)`${N.evaluated}.dynamicProps`, () => T.assign((0, o._)`${N.evaluated}.props`, (0, o._)`undefined`)), T.if((0, o._)`${N.evaluated}.dynamicItems`, () => T.assign((0, o._)`${N.evaluated}.items`, (0, o._)`undefined`));
  }
  function f(N, T) {
    const L = typeof N == "object" && N[T.schemaId];
    return L && (T.code.source || T.code.process) ? (0, o._)`/*# sourceURL=${L} */` : o.nil;
  }
  function p(N, T) {
    if (m(N) && (b(N), S(N))) {
      E(N, T);
      return;
    }
    (0, e.boolOrEmptySchema)(N, T);
  }
  function S({ schema: N, self: T }) {
    if (typeof N == "boolean")
      return !N;
    for (const L in N)
      if (T.RULES.all[L])
        return !0;
    return !1;
  }
  function m(N) {
    return typeof N.schema != "boolean";
  }
  function E(N, T) {
    const { schema: L, gen: V, opts: B } = N;
    B.$comment && L.$comment && G(N), C(N), F(N);
    const Q = V.const("_errs", u.default.errors);
    O(N, Q), V.var(T, (0, o._)`${Q} === ${u.default.errors}`);
  }
  function b(N) {
    (0, a.checkUnknownRules)(N), M(N);
  }
  function O(N, T) {
    if (N.opts.jtd)
      return X(N, [], !1, T);
    const L = (0, t.getSchemaTypes)(N.schema), V = (0, t.coerceAndCheckDataType)(N, L);
    X(N, L, !V, T);
  }
  function M(N) {
    const { schema: T, errSchemaPath: L, opts: V, self: B } = N;
    T.$ref && V.ignoreKeywordsWithRef && (0, a.schemaHasRulesButRef)(T, B.RULES) && B.logger.warn(`$ref: keywords ignored in schema at path "${L}"`);
  }
  function z(N) {
    const { schema: T, opts: L } = N;
    T.default !== void 0 && L.useDefaults && L.strictSchema && (0, a.checkStrictMode)(N, "default is ignored in the schema root");
  }
  function C(N) {
    const T = N.schema[N.opts.schemaId];
    T && (N.baseId = (0, l.resolveUrl)(N.opts.uriResolver, N.baseId, T));
  }
  function F(N) {
    if (N.schema.$async && !N.schemaEnv.$async)
      throw new Error("async schema in sync schema");
  }
  function G({ gen: N, schemaEnv: T, schema: L, errSchemaPath: V, opts: B }) {
    const Q = L.$comment;
    if (B.$comment === !0)
      N.code((0, o._)`${u.default.self}.logger.log(${Q})`);
    else if (typeof B.$comment == "function") {
      const oe = (0, o.str)`${V}/$comment`, we = N.scopeValue("root", { ref: T.root });
      N.code((0, o._)`${u.default.self}.opts.$comment(${Q}, ${oe}, ${we}.schema)`);
    }
  }
  function A(N) {
    const { gen: T, schemaEnv: L, validateName: V, ValidationError: B, opts: Q } = N;
    L.$async ? T.if((0, o._)`${u.default.errors} === 0`, () => T.return(u.default.data), () => T.throw((0, o._)`new ${B}(${u.default.vErrors})`)) : (T.assign((0, o._)`${V}.errors`, u.default.vErrors), Q.unevaluated && D(N), T.return((0, o._)`${u.default.errors} === 0`));
  }
  function D({ gen: N, evaluated: T, props: L, items: V }) {
    L instanceof o.Name && N.assign((0, o._)`${T}.props`, L), V instanceof o.Name && N.assign((0, o._)`${T}.items`, V);
  }
  function X(N, T, L, V) {
    const { gen: B, schema: Q, data: oe, allErrors: we, opts: ye, self: ve } = N, { RULES: ce } = ve;
    if (Q.$ref && (ye.ignoreKeywordsWithRef || !(0, a.schemaHasRulesButRef)(Q, ce))) {
      B.block(() => W(N, "$ref", ce.all.$ref.definition));
      return;
    }
    ye.jtd || U(N, T), B.block(() => {
      for (const Ee of ce.rules)
        Xe(Ee);
      Xe(ce.post);
    });
    function Xe(Ee) {
      (0, r.shouldUseGroup)(Q, Ee) && (Ee.type ? (B.if((0, n.checkDataType)(Ee.type, oe, ye.strictNumbers)), K(N, Ee), T.length === 1 && T[0] === Ee.type && L && (B.else(), (0, n.reportTypeError)(N)), B.endIf()) : K(N, Ee), we || B.if((0, o._)`${u.default.errors} === ${V || 0}`));
    }
  }
  function K(N, T) {
    const { gen: L, schema: V, opts: { useDefaults: B } } = N;
    B && (0, i.assignDefaults)(N, T.type), L.block(() => {
      for (const Q of T.rules)
        (0, r.shouldUseRule)(V, Q) && W(N, Q.keyword, Q.definition, T.type);
    });
  }
  function U(N, T) {
    N.schemaEnv.meta || !N.opts.strictTypes || (H(N, T), N.opts.allowUnionTypes || q(N, T), P(N, N.dataTypes));
  }
  function H(N, T) {
    if (T.length) {
      if (!N.dataTypes.length) {
        N.dataTypes = T;
        return;
      }
      T.forEach((L) => {
        I(N.dataTypes, L) || R(N, `type "${L}" not allowed by context "${N.dataTypes.join(",")}"`);
      }), $(N, T);
    }
  }
  function q(N, T) {
    T.length > 1 && !(T.length === 2 && T.includes("null")) && R(N, "use allowUnionTypes to allow union type keyword");
  }
  function P(N, T) {
    const L = N.self.RULES.all;
    for (const V in L) {
      const B = L[V];
      if (typeof B == "object" && (0, r.shouldUseRule)(N.schema, B)) {
        const { type: Q } = B.definition;
        Q.length && !Q.some((oe) => j(T, oe)) && R(N, `missing type "${Q.join(",")}" for keyword "${V}"`);
      }
    }
  }
  function j(N, T) {
    return N.includes(T) || T === "number" && N.includes("integer");
  }
  function I(N, T) {
    return N.includes(T) || T === "integer" && N.includes("number");
  }
  function $(N, T) {
    const L = [];
    for (const V of N.dataTypes)
      I(T, V) ? L.push(V) : T.includes("integer") && V === "number" && L.push("integer");
    N.dataTypes = L;
  }
  function R(N, T) {
    const L = N.schemaEnv.baseId + N.errSchemaPath;
    T += ` at "${L}" (strictTypes)`, (0, a.checkStrictMode)(N, T, N.opts.strictTypes);
  }
  class k {
    constructor(T, L, V) {
      if ((0, s.validateKeywordUsage)(T, L, V), this.gen = T.gen, this.allErrors = T.allErrors, this.keyword = V, this.data = T.data, this.schema = T.schema[V], this.$data = L.$data && T.opts.$data && this.schema && this.schema.$data, this.schemaValue = (0, a.schemaRefOrVal)(T, this.schema, V, this.$data), this.schemaType = L.schemaType, this.parentSchema = T.schema, this.params = {}, this.it = T, this.def = L, this.$data)
        this.schemaCode = T.gen.const("vSchema", te(this.$data, T));
      else if (this.schemaCode = this.schemaValue, !(0, s.validSchemaType)(this.schema, L.schemaType, L.allowUndefined))
        throw new Error(`${V} value must be ${JSON.stringify(L.schemaType)}`);
      ("code" in L ? L.trackErrors : L.errors !== !1) && (this.errsCount = T.gen.const("_errs", u.default.errors));
    }
    result(T, L, V) {
      this.failResult((0, o.not)(T), L, V);
    }
    failResult(T, L, V) {
      this.gen.if(T), V ? V() : this.error(), L ? (this.gen.else(), L(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    pass(T, L) {
      this.failResult((0, o.not)(T), void 0, L);
    }
    fail(T) {
      if (T === void 0) {
        this.error(), this.allErrors || this.gen.if(!1);
        return;
      }
      this.gen.if(T), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
    }
    fail$data(T) {
      if (!this.$data)
        return this.fail(T);
      const { schemaCode: L } = this;
      this.fail((0, o._)`${L} !== undefined && (${(0, o.or)(this.invalid$data(), T)})`);
    }
    error(T, L, V) {
      if (L) {
        this.setParams(L), this._error(T, V), this.setParams({});
        return;
      }
      this._error(T, V);
    }
    _error(T, L) {
      (T ? g.reportExtraError : g.reportError)(this, this.def.error, L);
    }
    $dataError() {
      (0, g.reportError)(this, this.def.$dataError || g.keyword$DataError);
    }
    reset() {
      if (this.errsCount === void 0)
        throw new Error('add "trackErrors" to keyword definition');
      (0, g.resetErrorsCount)(this.gen, this.errsCount);
    }
    ok(T) {
      this.allErrors || this.gen.if(T);
    }
    setParams(T, L) {
      L ? Object.assign(this.params, T) : this.params = T;
    }
    block$data(T, L, V = o.nil) {
      this.gen.block(() => {
        this.check$data(T, V), L();
      });
    }
    check$data(T = o.nil, L = o.nil) {
      if (!this.$data)
        return;
      const { gen: V, schemaCode: B, schemaType: Q, def: oe } = this;
      V.if((0, o.or)((0, o._)`${B} === undefined`, L)), T !== o.nil && V.assign(T, !0), (Q.length || oe.validateSchema) && (V.elseIf(this.invalid$data()), this.$dataError(), T !== o.nil && V.assign(T, !1)), V.else();
    }
    invalid$data() {
      const { gen: T, schemaCode: L, schemaType: V, def: B, it: Q } = this;
      return (0, o.or)(oe(), we());
      function oe() {
        if (V.length) {
          if (!(L instanceof o.Name))
            throw new Error("ajv implementation error");
          const ye = Array.isArray(V) ? V : [V];
          return (0, o._)`${(0, n.checkDataTypes)(ye, L, Q.opts.strictNumbers, n.DataType.Wrong)}`;
        }
        return o.nil;
      }
      function we() {
        if (B.validateSchema) {
          const ye = T.scopeValue("validate$data", { ref: B.validateSchema });
          return (0, o._)`!${ye}(${L})`;
        }
        return o.nil;
      }
    }
    subschema(T, L) {
      const V = (0, c.getSubschema)(this.it, T);
      (0, c.extendSubschemaData)(V, this.it, T), (0, c.extendSubschemaMode)(V, T);
      const B = { ...this.it, ...V, items: void 0, props: void 0 };
      return p(B, L), B;
    }
    mergeEvaluated(T, L) {
      const { it: V, gen: B } = this;
      V.opts.unevaluated && (V.props !== !0 && T.props !== void 0 && (V.props = a.mergeEvaluated.props(B, T.props, V.props, L)), V.items !== !0 && T.items !== void 0 && (V.items = a.mergeEvaluated.items(B, T.items, V.items, L)));
    }
    mergeValidEvaluated(T, L) {
      const { it: V, gen: B } = this;
      if (V.opts.unevaluated && (V.props !== !0 || V.items !== !0))
        return B.if(L, () => this.mergeEvaluated(T, o.Name)), !0;
    }
  }
  Oe.KeywordCxt = k;
  function W(N, T, L, V) {
    const B = new k(N, L, T);
    "code" in L ? L.code(B, V) : B.$data && L.validate ? (0, s.funcKeywordCode)(B, L) : "macro" in L ? (0, s.macroKeywordCode)(B, L) : (L.compile || L.validate) && (0, s.funcKeywordCode)(B, L);
  }
  const x = /^\/(?:[^~]|~0|~1)*$/, re = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function te(N, { dataLevel: T, dataNames: L, dataPathArr: V }) {
    let B, Q;
    if (N === "")
      return u.default.rootData;
    if (N[0] === "/") {
      if (!x.test(N))
        throw new Error(`Invalid JSON-pointer: ${N}`);
      B = N, Q = u.default.rootData;
    } else {
      const ve = re.exec(N);
      if (!ve)
        throw new Error(`Invalid JSON-pointer: ${N}`);
      const ce = +ve[1];
      if (B = ve[2], B === "#") {
        if (ce >= T)
          throw new Error(ye("property/index", ce));
        return V[T - ce];
      }
      if (ce > T)
        throw new Error(ye("data", ce));
      if (Q = L[T - ce], !B)
        return Q;
    }
    let oe = Q;
    const we = B.split("/");
    for (const ve of we)
      ve && (Q = (0, o._)`${Q}${(0, o.getProperty)((0, a.unescapeJsonPointer)(ve))}`, oe = (0, o._)`${oe} && ${Q}`);
    return oe;
    function ye(ve, ce) {
      return `Cannot access ${ve} ${ce} levels up, current level is ${T}`;
    }
  }
  return Oe.getData = te, Oe;
}
var yt = {}, Rs;
function Er() {
  if (Rs) return yt;
  Rs = 1, Object.defineProperty(yt, "__esModule", { value: !0 });
  class e extends Error {
    constructor(r) {
      super("validation failed"), this.errors = r, this.ajv = this.validation = !0;
    }
  }
  return yt.default = e, yt;
}
var vt = {}, Ps;
function ft() {
  if (Ps) return vt;
  Ps = 1, Object.defineProperty(vt, "__esModule", { value: !0 });
  const e = _r();
  class t extends Error {
    constructor(n, i, s, c) {
      super(c || `can't resolve reference ${s} from id ${i}`), this.missingRef = (0, e.resolveUrl)(n, i, s), this.missingSchema = (0, e.normalizeId)((0, e.getFullPath)(n, this.missingRef));
    }
  }
  return vt.default = t, vt;
}
var $e = {}, Is;
function wr() {
  if (Is) return $e;
  Is = 1, Object.defineProperty($e, "__esModule", { value: !0 }), $e.resolveSchema = $e.getCompilingSchema = $e.resolveRef = $e.compileSchema = $e.SchemaEnv = void 0;
  const e = J(), t = Er(), r = be(), n = _r(), i = ee(), s = lt();
  class c {
    constructor(v) {
      var f;
      this.refs = {}, this.dynamicAnchors = {};
      let p;
      typeof v.schema == "object" && (p = v.schema), this.schema = v.schema, this.schemaId = v.schemaId, this.root = v.root || this, this.baseId = (f = v.baseId) !== null && f !== void 0 ? f : (0, n.normalizeId)(p == null ? void 0 : p[v.schemaId || "$id"]), this.schemaPath = v.schemaPath, this.localRefs = v.localRefs, this.meta = v.meta, this.$async = p == null ? void 0 : p.$async, this.refs = {};
    }
  }
  $e.SchemaEnv = c;
  function o(h) {
    const v = a.call(this, h);
    if (v)
      return v;
    const f = (0, n.getFullPath)(this.opts.uriResolver, h.root.baseId), { es5: p, lines: S } = this.opts.code, { ownProperties: m } = this.opts, E = new e.CodeGen(this.scope, { es5: p, lines: S, ownProperties: m });
    let b;
    h.$async && (b = E.scopeValue("Error", {
      ref: t.default,
      code: (0, e._)`require("ajv/dist/runtime/validation_error").default`
    }));
    const O = E.scopeName("validate");
    h.validateName = O;
    const M = {
      gen: E,
      allErrors: this.opts.allErrors,
      data: r.default.data,
      parentData: r.default.parentData,
      parentDataProperty: r.default.parentDataProperty,
      dataNames: [r.default.data],
      dataPathArr: [e.nil],
      // TODO can its length be used as dataLevel if nil is removed?
      dataLevel: 0,
      dataTypes: [],
      definedProperties: /* @__PURE__ */ new Set(),
      topSchemaRef: E.scopeValue("schema", this.opts.code.source === !0 ? { ref: h.schema, code: (0, e.stringify)(h.schema) } : { ref: h.schema }),
      validateName: O,
      ValidationError: b,
      schema: h.schema,
      schemaEnv: h,
      rootId: f,
      baseId: h.baseId || f,
      schemaPath: e.nil,
      errSchemaPath: h.schemaPath || (this.opts.jtd ? "" : "#"),
      errorPath: (0, e._)`""`,
      opts: this.opts,
      self: this
    };
    let z;
    try {
      this._compilations.add(h), (0, s.validateFunctionCode)(M), E.optimize(this.opts.code.optimize);
      const C = E.toString();
      z = `${E.scopeRefs(r.default.scope)}return ${C}`, this.opts.code.process && (z = this.opts.code.process(z, h));
      const G = new Function(`${r.default.self}`, `${r.default.scope}`, z)(this, this.scope.get());
      if (this.scope.value(O, { ref: G }), G.errors = null, G.schema = h.schema, G.schemaEnv = h, h.$async && (G.$async = !0), this.opts.code.source === !0 && (G.source = { validateName: O, validateCode: C, scopeValues: E._values }), this.opts.unevaluated) {
        const { props: A, items: D } = M;
        G.evaluated = {
          props: A instanceof e.Name ? void 0 : A,
          items: D instanceof e.Name ? void 0 : D,
          dynamicProps: A instanceof e.Name,
          dynamicItems: D instanceof e.Name
        }, G.source && (G.source.evaluated = (0, e.stringify)(G.evaluated));
      }
      return h.validate = G, h;
    } catch (C) {
      throw delete h.validate, delete h.validateName, z && this.logger.error("Error compiling schema, function code:", z), C;
    } finally {
      this._compilations.delete(h);
    }
  }
  $e.compileSchema = o;
  function u(h, v, f) {
    var p;
    f = (0, n.resolveUrl)(this.opts.uriResolver, v, f);
    const S = h.refs[f];
    if (S)
      return S;
    let m = d.call(this, h, f);
    if (m === void 0) {
      const E = (p = h.localRefs) === null || p === void 0 ? void 0 : p[f], { schemaId: b } = this.opts;
      E && (m = new c({ schema: E, schemaId: b, root: h, baseId: v }));
    }
    if (m !== void 0)
      return h.refs[f] = l.call(this, m);
  }
  $e.resolveRef = u;
  function l(h) {
    return (0, n.inlineRef)(h.schema, this.opts.inlineRefs) ? h.schema : h.validate ? h : o.call(this, h);
  }
  function a(h) {
    for (const v of this._compilations)
      if (g(v, h))
        return v;
  }
  $e.getCompilingSchema = a;
  function g(h, v) {
    return h.schema === v.schema && h.root === v.root && h.baseId === v.baseId;
  }
  function d(h, v) {
    let f;
    for (; typeof (f = this.refs[v]) == "string"; )
      v = f;
    return f || this.schemas[v] || y.call(this, h, v);
  }
  function y(h, v) {
    const f = this.opts.uriResolver.parse(v), p = (0, n._getFullPath)(this.opts.uriResolver, f);
    let S = (0, n.getFullPath)(this.opts.uriResolver, h.baseId, void 0);
    if (Object.keys(h.schema).length > 0 && p === S)
      return _.call(this, f, h);
    const m = (0, n.normalizeId)(p), E = this.refs[m] || this.schemas[m];
    if (typeof E == "string") {
      const b = y.call(this, h, E);
      return typeof (b == null ? void 0 : b.schema) != "object" ? void 0 : _.call(this, f, b);
    }
    if (typeof (E == null ? void 0 : E.schema) == "object") {
      if (E.validate || o.call(this, E), m === (0, n.normalizeId)(v)) {
        const { schema: b } = E, { schemaId: O } = this.opts, M = b[O];
        return M && (S = (0, n.resolveUrl)(this.opts.uriResolver, S, M)), new c({ schema: b, schemaId: O, root: h, baseId: S });
      }
      return _.call(this, f, E);
    }
  }
  $e.resolveSchema = y;
  const w = /* @__PURE__ */ new Set([
    "properties",
    "patternProperties",
    "enum",
    "dependencies",
    "definitions"
  ]);
  function _(h, { baseId: v, schema: f, root: p }) {
    var S;
    if (((S = h.fragment) === null || S === void 0 ? void 0 : S[0]) !== "/")
      return;
    for (const b of h.fragment.slice(1).split("/")) {
      if (typeof f == "boolean")
        return;
      const O = f[(0, i.unescapeFragment)(b)];
      if (O === void 0)
        return;
      f = O;
      const M = typeof f == "object" && f[this.opts.schemaId];
      !w.has(b) && M && (v = (0, n.resolveUrl)(this.opts.uriResolver, v, M));
    }
    let m;
    if (typeof f != "boolean" && f.$ref && !(0, i.schemaHasRulesButRef)(f, this.RULES)) {
      const b = (0, n.resolveUrl)(this.opts.uriResolver, v, f.$ref);
      m = y.call(this, p, b);
    }
    const { schemaId: E } = this.opts;
    if (m = m || new c({ schema: f, schemaId: E, root: p, baseId: v }), m.schema !== m.root.schema)
      return m;
  }
  return $e;
}
const Xo = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#", Wo = "Meta-schema for $data reference (JSON AnySchema extension proposal)", Bo = "object", xo = ["$data"], Jo = { $data: { type: "string", anyOf: [{ format: "relative-json-pointer" }, { format: "json-pointer" }] } }, Yo = !1, Zo = {
  $id: Xo,
  description: Wo,
  type: Bo,
  required: xo,
  properties: Jo,
  additionalProperties: Yo
};
var gt = {}, ct = { exports: {} }, Fr, Ns;
function Xi() {
  if (Ns) return Fr;
  Ns = 1;
  const e = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu), t = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);
  function r(d) {
    let y = "", w = 0, _ = 0;
    for (_ = 0; _ < d.length; _++)
      if (w = d[_].charCodeAt(0), w !== 48) {
        if (!(w >= 48 && w <= 57 || w >= 65 && w <= 70 || w >= 97 && w <= 102))
          return "";
        y += d[_];
        break;
      }
    for (_ += 1; _ < d.length; _++) {
      if (w = d[_].charCodeAt(0), !(w >= 48 && w <= 57 || w >= 65 && w <= 70 || w >= 97 && w <= 102))
        return "";
      y += d[_];
    }
    return y;
  }
  const n = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);
  function i(d) {
    return d.length = 0, !0;
  }
  function s(d, y, w) {
    if (d.length) {
      const _ = r(d);
      if (_ !== "")
        y.push(_);
      else
        return w.error = !0, !1;
      d.length = 0;
    }
    return !0;
  }
  function c(d) {
    let y = 0;
    const w = { error: !1, address: "", zone: "" }, _ = [], h = [];
    let v = !1, f = !1, p = s;
    for (let S = 0; S < d.length; S++) {
      const m = d[S];
      if (!(m === "[" || m === "]"))
        if (m === ":") {
          if (v === !0 && (f = !0), !p(h, _, w))
            break;
          if (++y > 7) {
            w.error = !0;
            break;
          }
          S > 0 && d[S - 1] === ":" && (v = !0), _.push(":");
          continue;
        } else if (m === "%") {
          if (!p(h, _, w))
            break;
          p = i;
        } else {
          h.push(m);
          continue;
        }
    }
    return h.length && (p === i ? w.zone = h.join("") : f ? _.push(h.join("")) : _.push(r(h))), w.address = _.join(""), w;
  }
  function o(d) {
    if (u(d, ":") < 2)
      return { host: d, isIPV6: !1 };
    const y = c(d);
    if (y.error)
      return { host: d, isIPV6: !1 };
    {
      let w = y.address, _ = y.address;
      return y.zone && (w += "%" + y.zone, _ += "%25" + y.zone), { host: w, isIPV6: !0, escapedHost: _ };
    }
  }
  function u(d, y) {
    let w = 0;
    for (let _ = 0; _ < d.length; _++)
      d[_] === y && w++;
    return w;
  }
  function l(d) {
    let y = d;
    const w = [];
    let _ = -1, h = 0;
    for (; h = y.length; ) {
      if (h === 1) {
        if (y === ".")
          break;
        if (y === "/") {
          w.push("/");
          break;
        } else {
          w.push(y);
          break;
        }
      } else if (h === 2) {
        if (y[0] === ".") {
          if (y[1] === ".")
            break;
          if (y[1] === "/") {
            y = y.slice(2);
            continue;
          }
        } else if (y[0] === "/" && (y[1] === "." || y[1] === "/")) {
          w.push("/");
          break;
        }
      } else if (h === 3 && y === "/..") {
        w.length !== 0 && w.pop(), w.push("/");
        break;
      }
      if (y[0] === ".") {
        if (y[1] === ".") {
          if (y[2] === "/") {
            y = y.slice(3);
            continue;
          }
        } else if (y[1] === "/") {
          y = y.slice(2);
          continue;
        }
      } else if (y[0] === "/" && y[1] === ".") {
        if (y[2] === "/") {
          y = y.slice(2);
          continue;
        } else if (y[2] === "." && y[3] === "/") {
          y = y.slice(3), w.length !== 0 && w.pop();
          continue;
        }
      }
      if ((_ = y.indexOf("/", 1)) === -1) {
        w.push(y);
        break;
      } else
        w.push(y.slice(0, _)), y = y.slice(_);
    }
    return w.join("");
  }
  function a(d, y) {
    const w = y !== !0 ? escape : unescape;
    return d.scheme !== void 0 && (d.scheme = w(d.scheme)), d.userinfo !== void 0 && (d.userinfo = w(d.userinfo)), d.host !== void 0 && (d.host = w(d.host)), d.path !== void 0 && (d.path = w(d.path)), d.query !== void 0 && (d.query = w(d.query)), d.fragment !== void 0 && (d.fragment = w(d.fragment)), d;
  }
  function g(d) {
    const y = [];
    if (d.userinfo !== void 0 && (y.push(d.userinfo), y.push("@")), d.host !== void 0) {
      let w = unescape(d.host);
      if (!t(w)) {
        const _ = o(w);
        _.isIPV6 === !0 ? w = `[${_.escapedHost}]` : w = d.host;
      }
      y.push(w);
    }
    return (typeof d.port == "number" || typeof d.port == "string") && (y.push(":"), y.push(String(d.port))), y.length ? y.join("") : void 0;
  }
  return Fr = {
    nonSimpleDomain: n,
    recomposeAuthority: g,
    normalizeComponentEncoding: a,
    removeDotSegments: l,
    isIPv4: t,
    isUUID: e,
    normalizeIPv6: o,
    stringArrayToHexStripped: r
  }, Fr;
}
var Ur, Os;
function Qo() {
  if (Os) return Ur;
  Os = 1;
  const { isUUID: e } = Xi(), t = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu, r = (
    /** @type {const} */
    [
      "http",
      "https",
      "ws",
      "wss",
      "urn",
      "urn:uuid"
    ]
  );
  function n(m) {
    return r.indexOf(
      /** @type {*} */
      m
    ) !== -1;
  }
  function i(m) {
    return m.secure === !0 ? !0 : m.secure === !1 ? !1 : m.scheme ? m.scheme.length === 3 && (m.scheme[0] === "w" || m.scheme[0] === "W") && (m.scheme[1] === "s" || m.scheme[1] === "S") && (m.scheme[2] === "s" || m.scheme[2] === "S") : !1;
  }
  function s(m) {
    return m.host || (m.error = m.error || "HTTP URIs must have a host."), m;
  }
  function c(m) {
    const E = String(m.scheme).toLowerCase() === "https";
    return (m.port === (E ? 443 : 80) || m.port === "") && (m.port = void 0), m.path || (m.path = "/"), m;
  }
  function o(m) {
    return m.secure = i(m), m.resourceName = (m.path || "/") + (m.query ? "?" + m.query : ""), m.path = void 0, m.query = void 0, m;
  }
  function u(m) {
    if ((m.port === (i(m) ? 443 : 80) || m.port === "") && (m.port = void 0), typeof m.secure == "boolean" && (m.scheme = m.secure ? "wss" : "ws", m.secure = void 0), m.resourceName) {
      const [E, b] = m.resourceName.split("?");
      m.path = E && E !== "/" ? E : void 0, m.query = b, m.resourceName = void 0;
    }
    return m.fragment = void 0, m;
  }
  function l(m, E) {
    if (!m.path)
      return m.error = "URN can not be parsed", m;
    const b = m.path.match(t);
    if (b) {
      const O = E.scheme || m.scheme || "urn";
      m.nid = b[1].toLowerCase(), m.nss = b[2];
      const M = `${O}:${E.nid || m.nid}`, z = S(M);
      m.path = void 0, z && (m = z.parse(m, E));
    } else
      m.error = m.error || "URN can not be parsed.";
    return m;
  }
  function a(m, E) {
    if (m.nid === void 0)
      throw new Error("URN without nid cannot be serialized");
    const b = E.scheme || m.scheme || "urn", O = m.nid.toLowerCase(), M = `${b}:${E.nid || O}`, z = S(M);
    z && (m = z.serialize(m, E));
    const C = m, F = m.nss;
    return C.path = `${O || E.nid}:${F}`, E.skipEscape = !0, C;
  }
  function g(m, E) {
    const b = m;
    return b.uuid = b.nss, b.nss = void 0, !E.tolerant && (!b.uuid || !e(b.uuid)) && (b.error = b.error || "UUID is not valid."), b;
  }
  function d(m) {
    const E = m;
    return E.nss = (m.uuid || "").toLowerCase(), E;
  }
  const y = (
    /** @type {SchemeHandler} */
    {
      scheme: "http",
      domainHost: !0,
      parse: s,
      serialize: c
    }
  ), w = (
    /** @type {SchemeHandler} */
    {
      scheme: "https",
      domainHost: y.domainHost,
      parse: s,
      serialize: c
    }
  ), _ = (
    /** @type {SchemeHandler} */
    {
      scheme: "ws",
      domainHost: !0,
      parse: o,
      serialize: u
    }
  ), h = (
    /** @type {SchemeHandler} */
    {
      scheme: "wss",
      domainHost: _.domainHost,
      parse: _.parse,
      serialize: _.serialize
    }
  ), p = (
    /** @type {Record<SchemeName, SchemeHandler>} */
    {
      http: y,
      https: w,
      ws: _,
      wss: h,
      urn: (
        /** @type {SchemeHandler} */
        {
          scheme: "urn",
          parse: l,
          serialize: a,
          skipNormalize: !0
        }
      ),
      "urn:uuid": (
        /** @type {SchemeHandler} */
        {
          scheme: "urn:uuid",
          parse: g,
          serialize: d,
          skipNormalize: !0
        }
      )
    }
  );
  Object.setPrototypeOf(p, null);
  function S(m) {
    return m && (p[
      /** @type {SchemeName} */
      m
    ] || p[
      /** @type {SchemeName} */
      m.toLowerCase()
    ]) || void 0;
  }
  return Ur = {
    wsIsSecure: i,
    SCHEMES: p,
    isValidSchemeName: n,
    getSchemeHandler: S
  }, Ur;
}
var Ts;
function ec() {
  if (Ts) return ct.exports;
  Ts = 1;
  const { normalizeIPv6: e, removeDotSegments: t, recomposeAuthority: r, normalizeComponentEncoding: n, isIPv4: i, nonSimpleDomain: s } = Xi(), { SCHEMES: c, getSchemeHandler: o } = Qo();
  function u(h, v) {
    return typeof h == "string" ? h = /** @type {T} */
    d(w(h, v), v) : typeof h == "object" && (h = /** @type {T} */
    w(d(h, v), v)), h;
  }
  function l(h, v, f) {
    const p = f ? Object.assign({ scheme: "null" }, f) : { scheme: "null" }, S = a(w(h, p), w(v, p), p, !0);
    return p.skipEscape = !0, d(S, p);
  }
  function a(h, v, f, p) {
    const S = {};
    return p || (h = w(d(h, f), f), v = w(d(v, f), f)), f = f || {}, !f.tolerant && v.scheme ? (S.scheme = v.scheme, S.userinfo = v.userinfo, S.host = v.host, S.port = v.port, S.path = t(v.path || ""), S.query = v.query) : (v.userinfo !== void 0 || v.host !== void 0 || v.port !== void 0 ? (S.userinfo = v.userinfo, S.host = v.host, S.port = v.port, S.path = t(v.path || ""), S.query = v.query) : (v.path ? (v.path[0] === "/" ? S.path = t(v.path) : ((h.userinfo !== void 0 || h.host !== void 0 || h.port !== void 0) && !h.path ? S.path = "/" + v.path : h.path ? S.path = h.path.slice(0, h.path.lastIndexOf("/") + 1) + v.path : S.path = v.path, S.path = t(S.path)), S.query = v.query) : (S.path = h.path, v.query !== void 0 ? S.query = v.query : S.query = h.query), S.userinfo = h.userinfo, S.host = h.host, S.port = h.port), S.scheme = h.scheme), S.fragment = v.fragment, S;
  }
  function g(h, v, f) {
    return typeof h == "string" ? (h = unescape(h), h = d(n(w(h, f), !0), { ...f, skipEscape: !0 })) : typeof h == "object" && (h = d(n(h, !0), { ...f, skipEscape: !0 })), typeof v == "string" ? (v = unescape(v), v = d(n(w(v, f), !0), { ...f, skipEscape: !0 })) : typeof v == "object" && (v = d(n(v, !0), { ...f, skipEscape: !0 })), h.toLowerCase() === v.toLowerCase();
  }
  function d(h, v) {
    const f = {
      host: h.host,
      scheme: h.scheme,
      userinfo: h.userinfo,
      port: h.port,
      path: h.path,
      query: h.query,
      nid: h.nid,
      nss: h.nss,
      uuid: h.uuid,
      fragment: h.fragment,
      reference: h.reference,
      resourceName: h.resourceName,
      secure: h.secure,
      error: ""
    }, p = Object.assign({}, v), S = [], m = o(p.scheme || f.scheme);
    m && m.serialize && m.serialize(f, p), f.path !== void 0 && (p.skipEscape ? f.path = unescape(f.path) : (f.path = escape(f.path), f.scheme !== void 0 && (f.path = f.path.split("%3A").join(":")))), p.reference !== "suffix" && f.scheme && S.push(f.scheme, ":");
    const E = r(f);
    if (E !== void 0 && (p.reference !== "suffix" && S.push("//"), S.push(E), f.path && f.path[0] !== "/" && S.push("/")), f.path !== void 0) {
      let b = f.path;
      !p.absolutePath && (!m || !m.absolutePath) && (b = t(b)), E === void 0 && b[0] === "/" && b[1] === "/" && (b = "/%2F" + b.slice(2)), S.push(b);
    }
    return f.query !== void 0 && S.push("?", f.query), f.fragment !== void 0 && S.push("#", f.fragment), S.join("");
  }
  const y = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;
  function w(h, v) {
    const f = Object.assign({}, v), p = {
      scheme: void 0,
      userinfo: void 0,
      host: "",
      port: void 0,
      path: "",
      query: void 0,
      fragment: void 0
    };
    let S = !1;
    f.reference === "suffix" && (f.scheme ? h = f.scheme + ":" + h : h = "//" + h);
    const m = h.match(y);
    if (m) {
      if (p.scheme = m[1], p.userinfo = m[3], p.host = m[4], p.port = parseInt(m[5], 10), p.path = m[6] || "", p.query = m[7], p.fragment = m[8], isNaN(p.port) && (p.port = m[5]), p.host)
        if (i(p.host) === !1) {
          const O = e(p.host);
          p.host = O.host.toLowerCase(), S = O.isIPV6;
        } else
          S = !0;
      p.scheme === void 0 && p.userinfo === void 0 && p.host === void 0 && p.port === void 0 && p.query === void 0 && !p.path ? p.reference = "same-document" : p.scheme === void 0 ? p.reference = "relative" : p.fragment === void 0 ? p.reference = "absolute" : p.reference = "uri", f.reference && f.reference !== "suffix" && f.reference !== p.reference && (p.error = p.error || "URI is not a " + f.reference + " reference.");
      const E = o(f.scheme || p.scheme);
      if (!f.unicodeSupport && (!E || !E.unicodeSupport) && p.host && (f.domainHost || E && E.domainHost) && S === !1 && s(p.host))
        try {
          p.host = URL.domainToASCII(p.host.toLowerCase());
        } catch (b) {
          p.error = p.error || "Host's domain name can not be converted to ASCII: " + b;
        }
      (!E || E && !E.skipNormalize) && (h.indexOf("%") !== -1 && (p.scheme !== void 0 && (p.scheme = unescape(p.scheme)), p.host !== void 0 && (p.host = unescape(p.host))), p.path && (p.path = escape(unescape(p.path))), p.fragment && (p.fragment = encodeURI(decodeURIComponent(p.fragment)))), E && E.parse && E.parse(p, f);
    } else
      p.error = p.error || "URI can not be parsed.";
    return p;
  }
  const _ = {
    SCHEMES: c,
    normalize: u,
    resolve: l,
    resolveComponent: a,
    equal: g,
    serialize: d,
    parse: w
  };
  return ct.exports = _, ct.exports.default = _, ct.exports.fastUri = _, ct.exports;
}
var js;
function tc() {
  if (js) return gt;
  js = 1, Object.defineProperty(gt, "__esModule", { value: !0 });
  const e = ec();
  return e.code = 'require("ajv/dist/runtime/uri").default', gt.default = e, gt;
}
var As;
function Wi() {
  return As || (As = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.CodeGen = e.Name = e.nil = e.stringify = e.str = e._ = e.KeywordCxt = void 0;
    var t = lt();
    Object.defineProperty(e, "KeywordCxt", { enumerable: !0, get: function() {
      return t.KeywordCxt;
    } });
    var r = J();
    Object.defineProperty(e, "_", { enumerable: !0, get: function() {
      return r._;
    } }), Object.defineProperty(e, "str", { enumerable: !0, get: function() {
      return r.str;
    } }), Object.defineProperty(e, "stringify", { enumerable: !0, get: function() {
      return r.stringify;
    } }), Object.defineProperty(e, "nil", { enumerable: !0, get: function() {
      return r.nil;
    } }), Object.defineProperty(e, "Name", { enumerable: !0, get: function() {
      return r.Name;
    } }), Object.defineProperty(e, "CodeGen", { enumerable: !0, get: function() {
      return r.CodeGen;
    } });
    const n = Er(), i = ft(), s = Gi(), c = wr(), o = J(), u = _r(), l = vr(), a = ee(), g = Zo, d = tc(), y = (q, P) => new RegExp(q, P);
    y.code = "new RegExp";
    const w = ["removeAdditional", "useDefaults", "coerceTypes"], _ = /* @__PURE__ */ new Set([
      "validate",
      "serialize",
      "parse",
      "wrapper",
      "root",
      "schema",
      "keyword",
      "pattern",
      "formats",
      "validate$data",
      "func",
      "obj",
      "Error"
    ]), h = {
      errorDataPath: "",
      format: "`validateFormats: false` can be used instead.",
      nullable: '"nullable" keyword is supported by default.',
      jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
      extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
      missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
      processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
      sourceCode: "Use option `code: {source: true}`",
      strictDefaults: "It is default now, see option `strict`.",
      strictKeywords: "It is default now, see option `strict`.",
      uniqueItems: '"uniqueItems" keyword is always validated.',
      unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
      cache: "Map is used as cache, schema object as key.",
      serialize: "Map is used as cache, schema object as key.",
      ajvErrors: "It is default now."
    }, v = {
      ignoreKeywordsWithRef: "",
      jsPropertySyntax: "",
      unicode: '"minLength"/"maxLength" account for unicode characters by default.'
    }, f = 200;
    function p(q) {
      var P, j, I, $, R, k, W, x, re, te, N, T, L, V, B, Q, oe, we, ye, ve, ce, Xe, Ee, Nr, Or;
      const rt = q.strict, Tr = (P = q.code) === null || P === void 0 ? void 0 : P.optimize, Zn = Tr === !0 || Tr === void 0 ? 1 : Tr || 0, Qn = (I = (j = q.code) === null || j === void 0 ? void 0 : j.regExp) !== null && I !== void 0 ? I : y, ho = ($ = q.uriResolver) !== null && $ !== void 0 ? $ : d.default;
      return {
        strictSchema: (k = (R = q.strictSchema) !== null && R !== void 0 ? R : rt) !== null && k !== void 0 ? k : !0,
        strictNumbers: (x = (W = q.strictNumbers) !== null && W !== void 0 ? W : rt) !== null && x !== void 0 ? x : !0,
        strictTypes: (te = (re = q.strictTypes) !== null && re !== void 0 ? re : rt) !== null && te !== void 0 ? te : "log",
        strictTuples: (T = (N = q.strictTuples) !== null && N !== void 0 ? N : rt) !== null && T !== void 0 ? T : "log",
        strictRequired: (V = (L = q.strictRequired) !== null && L !== void 0 ? L : rt) !== null && V !== void 0 ? V : !1,
        code: q.code ? { ...q.code, optimize: Zn, regExp: Qn } : { optimize: Zn, regExp: Qn },
        loopRequired: (B = q.loopRequired) !== null && B !== void 0 ? B : f,
        loopEnum: (Q = q.loopEnum) !== null && Q !== void 0 ? Q : f,
        meta: (oe = q.meta) !== null && oe !== void 0 ? oe : !0,
        messages: (we = q.messages) !== null && we !== void 0 ? we : !0,
        inlineRefs: (ye = q.inlineRefs) !== null && ye !== void 0 ? ye : !0,
        schemaId: (ve = q.schemaId) !== null && ve !== void 0 ? ve : "$id",
        addUsedSchema: (ce = q.addUsedSchema) !== null && ce !== void 0 ? ce : !0,
        validateSchema: (Xe = q.validateSchema) !== null && Xe !== void 0 ? Xe : !0,
        validateFormats: (Ee = q.validateFormats) !== null && Ee !== void 0 ? Ee : !0,
        unicodeRegExp: (Nr = q.unicodeRegExp) !== null && Nr !== void 0 ? Nr : !0,
        int32range: (Or = q.int32range) !== null && Or !== void 0 ? Or : !0,
        uriResolver: ho
      };
    }
    class S {
      constructor(P = {}) {
        this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = /* @__PURE__ */ new Set(), this._loading = {}, this._cache = /* @__PURE__ */ new Map(), P = this.opts = { ...P, ...p(P) };
        const { es5: j, lines: I } = this.opts.code;
        this.scope = new o.ValueScope({ scope: {}, prefixes: _, es5: j, lines: I }), this.logger = F(P.logger);
        const $ = P.validateFormats;
        P.validateFormats = !1, this.RULES = (0, s.getRules)(), m.call(this, h, P, "NOT SUPPORTED"), m.call(this, v, P, "DEPRECATED", "warn"), this._metaOpts = z.call(this), P.formats && O.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), P.keywords && M.call(this, P.keywords), typeof P.meta == "object" && this.addMetaSchema(P.meta), b.call(this), P.validateFormats = $;
      }
      _addVocabularies() {
        this.addKeyword("$async");
      }
      _addDefaultMetaSchema() {
        const { $data: P, meta: j, schemaId: I } = this.opts;
        let $ = g;
        I === "id" && ($ = { ...g }, $.id = $.$id, delete $.$id), j && P && this.addMetaSchema($, $[I], !1);
      }
      defaultMeta() {
        const { meta: P, schemaId: j } = this.opts;
        return this.opts.defaultMeta = typeof P == "object" ? P[j] || P : void 0;
      }
      validate(P, j) {
        let I;
        if (typeof P == "string") {
          if (I = this.getSchema(P), !I)
            throw new Error(`no schema with key or ref "${P}"`);
        } else
          I = this.compile(P);
        const $ = I(j);
        return "$async" in I || (this.errors = I.errors), $;
      }
      compile(P, j) {
        const I = this._addSchema(P, j);
        return I.validate || this._compileSchemaEnv(I);
      }
      compileAsync(P, j) {
        if (typeof this.opts.loadSchema != "function")
          throw new Error("options.loadSchema should be a function");
        const { loadSchema: I } = this.opts;
        return $.call(this, P, j);
        async function $(te, N) {
          await R.call(this, te.$schema);
          const T = this._addSchema(te, N);
          return T.validate || k.call(this, T);
        }
        async function R(te) {
          te && !this.getSchema(te) && await $.call(this, { $ref: te }, !0);
        }
        async function k(te) {
          try {
            return this._compileSchemaEnv(te);
          } catch (N) {
            if (!(N instanceof i.default))
              throw N;
            return W.call(this, N), await x.call(this, N.missingSchema), k.call(this, te);
          }
        }
        function W({ missingSchema: te, missingRef: N }) {
          if (this.refs[te])
            throw new Error(`AnySchema ${te} is loaded but ${N} cannot be resolved`);
        }
        async function x(te) {
          const N = await re.call(this, te);
          this.refs[te] || await R.call(this, N.$schema), this.refs[te] || this.addSchema(N, te, j);
        }
        async function re(te) {
          const N = this._loading[te];
          if (N)
            return N;
          try {
            return await (this._loading[te] = I(te));
          } finally {
            delete this._loading[te];
          }
        }
      }
      // Adds schema to the instance
      addSchema(P, j, I, $ = this.opts.validateSchema) {
        if (Array.isArray(P)) {
          for (const k of P)
            this.addSchema(k, void 0, I, $);
          return this;
        }
        let R;
        if (typeof P == "object") {
          const { schemaId: k } = this.opts;
          if (R = P[k], R !== void 0 && typeof R != "string")
            throw new Error(`schema ${k} must be string`);
        }
        return j = (0, u.normalizeId)(j || R), this._checkUnique(j), this.schemas[j] = this._addSchema(P, I, j, $, !0), this;
      }
      // Add schema that will be used to validate other schemas
      // options in META_IGNORE_OPTIONS are alway set to false
      addMetaSchema(P, j, I = this.opts.validateSchema) {
        return this.addSchema(P, j, !0, I), this;
      }
      //  Validate schema against its meta-schema
      validateSchema(P, j) {
        if (typeof P == "boolean")
          return !0;
        let I;
        if (I = P.$schema, I !== void 0 && typeof I != "string")
          throw new Error("$schema must be a string");
        if (I = I || this.opts.defaultMeta || this.defaultMeta(), !I)
          return this.logger.warn("meta-schema not available"), this.errors = null, !0;
        const $ = this.validate(I, P);
        if (!$ && j) {
          const R = "schema is invalid: " + this.errorsText();
          if (this.opts.validateSchema === "log")
            this.logger.error(R);
          else
            throw new Error(R);
        }
        return $;
      }
      // Get compiled schema by `key` or `ref`.
      // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
      getSchema(P) {
        let j;
        for (; typeof (j = E.call(this, P)) == "string"; )
          P = j;
        if (j === void 0) {
          const { schemaId: I } = this.opts, $ = new c.SchemaEnv({ schema: {}, schemaId: I });
          if (j = c.resolveSchema.call(this, $, P), !j)
            return;
          this.refs[P] = j;
        }
        return j.validate || this._compileSchemaEnv(j);
      }
      // Remove cached schema(s).
      // If no parameter is passed all schemas but meta-schemas are removed.
      // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
      // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
      removeSchema(P) {
        if (P instanceof RegExp)
          return this._removeAllSchemas(this.schemas, P), this._removeAllSchemas(this.refs, P), this;
        switch (typeof P) {
          case "undefined":
            return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), this._cache.clear(), this;
          case "string": {
            const j = E.call(this, P);
            return typeof j == "object" && this._cache.delete(j.schema), delete this.schemas[P], delete this.refs[P], this;
          }
          case "object": {
            const j = P;
            this._cache.delete(j);
            let I = P[this.opts.schemaId];
            return I && (I = (0, u.normalizeId)(I), delete this.schemas[I], delete this.refs[I]), this;
          }
          default:
            throw new Error("ajv.removeSchema: invalid parameter");
        }
      }
      // add "vocabulary" - a collection of keywords
      addVocabulary(P) {
        for (const j of P)
          this.addKeyword(j);
        return this;
      }
      addKeyword(P, j) {
        let I;
        if (typeof P == "string")
          I = P, typeof j == "object" && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), j.keyword = I);
        else if (typeof P == "object" && j === void 0) {
          if (j = P, I = j.keyword, Array.isArray(I) && !I.length)
            throw new Error("addKeywords: keyword must be string or non-empty array");
        } else
          throw new Error("invalid addKeywords parameters");
        if (A.call(this, I, j), !j)
          return (0, a.eachItem)(I, (R) => D.call(this, R)), this;
        K.call(this, j);
        const $ = {
          ...j,
          type: (0, l.getJSONTypes)(j.type),
          schemaType: (0, l.getJSONTypes)(j.schemaType)
        };
        return (0, a.eachItem)(I, $.type.length === 0 ? (R) => D.call(this, R, $) : (R) => $.type.forEach((k) => D.call(this, R, $, k))), this;
      }
      getKeyword(P) {
        const j = this.RULES.all[P];
        return typeof j == "object" ? j.definition : !!j;
      }
      // Remove keyword
      removeKeyword(P) {
        const { RULES: j } = this;
        delete j.keywords[P], delete j.all[P];
        for (const I of j.rules) {
          const $ = I.rules.findIndex((R) => R.keyword === P);
          $ >= 0 && I.rules.splice($, 1);
        }
        return this;
      }
      // Add format
      addFormat(P, j) {
        return typeof j == "string" && (j = new RegExp(j)), this.formats[P] = j, this;
      }
      errorsText(P = this.errors, { separator: j = ", ", dataVar: I = "data" } = {}) {
        return !P || P.length === 0 ? "No errors" : P.map(($) => `${I}${$.instancePath} ${$.message}`).reduce(($, R) => $ + j + R);
      }
      $dataMetaSchema(P, j) {
        const I = this.RULES.all;
        P = JSON.parse(JSON.stringify(P));
        for (const $ of j) {
          const R = $.split("/").slice(1);
          let k = P;
          for (const W of R)
            k = k[W];
          for (const W in I) {
            const x = I[W];
            if (typeof x != "object")
              continue;
            const { $data: re } = x.definition, te = k[W];
            re && te && (k[W] = H(te));
          }
        }
        return P;
      }
      _removeAllSchemas(P, j) {
        for (const I in P) {
          const $ = P[I];
          (!j || j.test(I)) && (typeof $ == "string" ? delete P[I] : $ && !$.meta && (this._cache.delete($.schema), delete P[I]));
        }
      }
      _addSchema(P, j, I, $ = this.opts.validateSchema, R = this.opts.addUsedSchema) {
        let k;
        const { schemaId: W } = this.opts;
        if (typeof P == "object")
          k = P[W];
        else {
          if (this.opts.jtd)
            throw new Error("schema must be object");
          if (typeof P != "boolean")
            throw new Error("schema must be object or boolean");
        }
        let x = this._cache.get(P);
        if (x !== void 0)
          return x;
        I = (0, u.normalizeId)(k || I);
        const re = u.getSchemaRefs.call(this, P, I);
        return x = new c.SchemaEnv({ schema: P, schemaId: W, meta: j, baseId: I, localRefs: re }), this._cache.set(x.schema, x), R && !I.startsWith("#") && (I && this._checkUnique(I), this.refs[I] = x), $ && this.validateSchema(P, !0), x;
      }
      _checkUnique(P) {
        if (this.schemas[P] || this.refs[P])
          throw new Error(`schema with key or id "${P}" already exists`);
      }
      _compileSchemaEnv(P) {
        if (P.meta ? this._compileMetaSchema(P) : c.compileSchema.call(this, P), !P.validate)
          throw new Error("ajv implementation error");
        return P.validate;
      }
      _compileMetaSchema(P) {
        const j = this.opts;
        this.opts = this._metaOpts;
        try {
          c.compileSchema.call(this, P);
        } finally {
          this.opts = j;
        }
      }
    }
    S.ValidationError = n.default, S.MissingRefError = i.default, e.default = S;
    function m(q, P, j, I = "error") {
      for (const $ in q) {
        const R = $;
        R in P && this.logger[I](`${j}: option ${$}. ${q[R]}`);
      }
    }
    function E(q) {
      return q = (0, u.normalizeId)(q), this.schemas[q] || this.refs[q];
    }
    function b() {
      const q = this.opts.schemas;
      if (q)
        if (Array.isArray(q))
          this.addSchema(q);
        else
          for (const P in q)
            this.addSchema(q[P], P);
    }
    function O() {
      for (const q in this.opts.formats) {
        const P = this.opts.formats[q];
        P && this.addFormat(q, P);
      }
    }
    function M(q) {
      if (Array.isArray(q)) {
        this.addVocabulary(q);
        return;
      }
      this.logger.warn("keywords option as map is deprecated, pass array");
      for (const P in q) {
        const j = q[P];
        j.keyword || (j.keyword = P), this.addKeyword(j);
      }
    }
    function z() {
      const q = { ...this.opts };
      for (const P of w)
        delete q[P];
      return q;
    }
    const C = { log() {
    }, warn() {
    }, error() {
    } };
    function F(q) {
      if (q === !1)
        return C;
      if (q === void 0)
        return console;
      if (q.log && q.warn && q.error)
        return q;
      throw new Error("logger must implement log, warn and error methods");
    }
    const G = /^[a-z_$][a-z0-9_$:-]*$/i;
    function A(q, P) {
      const { RULES: j } = this;
      if ((0, a.eachItem)(q, (I) => {
        if (j.keywords[I])
          throw new Error(`Keyword ${I} is already defined`);
        if (!G.test(I))
          throw new Error(`Keyword ${I} has invalid name`);
      }), !!P && P.$data && !("code" in P || "validate" in P))
        throw new Error('$data keyword must have "code" or "validate" function');
    }
    function D(q, P, j) {
      var I;
      const $ = P == null ? void 0 : P.post;
      if (j && $)
        throw new Error('keyword with "post" flag cannot have "type"');
      const { RULES: R } = this;
      let k = $ ? R.post : R.rules.find(({ type: x }) => x === j);
      if (k || (k = { type: j, rules: [] }, R.rules.push(k)), R.keywords[q] = !0, !P)
        return;
      const W = {
        keyword: q,
        definition: {
          ...P,
          type: (0, l.getJSONTypes)(P.type),
          schemaType: (0, l.getJSONTypes)(P.schemaType)
        }
      };
      P.before ? X.call(this, k, W, P.before) : k.rules.push(W), R.all[q] = W, (I = P.implements) === null || I === void 0 || I.forEach((x) => this.addKeyword(x));
    }
    function X(q, P, j) {
      const I = q.rules.findIndex(($) => $.keyword === j);
      I >= 0 ? q.rules.splice(I, 0, P) : (q.rules.push(P), this.logger.warn(`rule ${j} is not defined`));
    }
    function K(q) {
      let { metaSchema: P } = q;
      P !== void 0 && (q.$data && this.opts.$data && (P = H(P)), q.validateSchema = this.compile(P, !0));
    }
    const U = {
      $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
    };
    function H(q) {
      return { anyOf: [q, U] };
    }
  })(qr)), qr;
}
var $t = {}, _t = {}, Et = {}, qs;
function rc() {
  if (qs) return Et;
  qs = 1, Object.defineProperty(Et, "__esModule", { value: !0 });
  const e = {
    keyword: "id",
    code() {
      throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
  };
  return Et.default = e, Et;
}
var Le = {}, ks;
function Gn() {
  if (ks) return Le;
  ks = 1, Object.defineProperty(Le, "__esModule", { value: !0 }), Le.callRef = Le.getValidate = void 0;
  const e = ft(), t = Re(), r = J(), n = be(), i = wr(), s = ee(), c = {
    keyword: "$ref",
    schemaType: "string",
    code(l) {
      const { gen: a, schema: g, it: d } = l, { baseId: y, schemaEnv: w, validateName: _, opts: h, self: v } = d, { root: f } = w;
      if ((g === "#" || g === "#/") && y === f.baseId)
        return S();
      const p = i.resolveRef.call(v, f, y, g);
      if (p === void 0)
        throw new e.default(d.opts.uriResolver, y, g);
      if (p instanceof i.SchemaEnv)
        return m(p);
      return E(p);
      function S() {
        if (w === f)
          return u(l, _, w, w.$async);
        const b = a.scopeValue("root", { ref: f });
        return u(l, (0, r._)`${b}.validate`, f, f.$async);
      }
      function m(b) {
        const O = o(l, b);
        u(l, O, b, b.$async);
      }
      function E(b) {
        const O = a.scopeValue("schema", h.code.source === !0 ? { ref: b, code: (0, r.stringify)(b) } : { ref: b }), M = a.name("valid"), z = l.subschema({
          schema: b,
          dataTypes: [],
          schemaPath: r.nil,
          topSchemaRef: O,
          errSchemaPath: g
        }, M);
        l.mergeEvaluated(z), l.ok(M);
      }
    }
  };
  function o(l, a) {
    const { gen: g } = l;
    return a.validate ? g.scopeValue("validate", { ref: a.validate }) : (0, r._)`${g.scopeValue("wrapper", { ref: a })}.validate`;
  }
  Le.getValidate = o;
  function u(l, a, g, d) {
    const { gen: y, it: w } = l, { allErrors: _, schemaEnv: h, opts: v } = w, f = v.passContext ? n.default.this : r.nil;
    d ? p() : S();
    function p() {
      if (!h.$async)
        throw new Error("async schema referenced by sync schema");
      const b = y.let("valid");
      y.try(() => {
        y.code((0, r._)`await ${(0, t.callValidateCode)(l, a, f)}`), E(a), _ || y.assign(b, !0);
      }, (O) => {
        y.if((0, r._)`!(${O} instanceof ${w.ValidationError})`, () => y.throw(O)), m(O), _ || y.assign(b, !1);
      }), l.ok(b);
    }
    function S() {
      l.result((0, t.callValidateCode)(l, a, f), () => E(a), () => m(a));
    }
    function m(b) {
      const O = (0, r._)`${b}.errors`;
      y.assign(n.default.vErrors, (0, r._)`${n.default.vErrors} === null ? ${O} : ${n.default.vErrors}.concat(${O})`), y.assign(n.default.errors, (0, r._)`${n.default.vErrors}.length`);
    }
    function E(b) {
      var O;
      if (!w.opts.unevaluated)
        return;
      const M = (O = g == null ? void 0 : g.validate) === null || O === void 0 ? void 0 : O.evaluated;
      if (w.props !== !0)
        if (M && !M.dynamicProps)
          M.props !== void 0 && (w.props = s.mergeEvaluated.props(y, M.props, w.props));
        else {
          const z = y.var("props", (0, r._)`${b}.evaluated.props`);
          w.props = s.mergeEvaluated.props(y, z, w.props, r.Name);
        }
      if (w.items !== !0)
        if (M && !M.dynamicItems)
          M.items !== void 0 && (w.items = s.mergeEvaluated.items(y, M.items, w.items));
        else {
          const z = y.var("items", (0, r._)`${b}.evaluated.items`);
          w.items = s.mergeEvaluated.items(y, z, w.items, r.Name);
        }
    }
  }
  return Le.callRef = u, Le.default = c, Le;
}
var Cs;
function Bi() {
  if (Cs) return _t;
  Cs = 1, Object.defineProperty(_t, "__esModule", { value: !0 });
  const e = rc(), t = Gn(), r = [
    "$schema",
    "$id",
    "$defs",
    "$vocabulary",
    { keyword: "$comment" },
    "definitions",
    e.default,
    t.default
  ];
  return _t.default = r, _t;
}
var wt = {}, St = {}, Ds;
function nc() {
  if (Ds) return St;
  Ds = 1, Object.defineProperty(St, "__esModule", { value: !0 });
  const e = J(), t = e.operators, r = {
    maximum: { okStr: "<=", ok: t.LTE, fail: t.GT },
    minimum: { okStr: ">=", ok: t.GTE, fail: t.LT },
    exclusiveMaximum: { okStr: "<", ok: t.LT, fail: t.GTE },
    exclusiveMinimum: { okStr: ">", ok: t.GT, fail: t.LTE }
  }, n = {
    message: ({ keyword: s, schemaCode: c }) => (0, e.str)`must be ${r[s].okStr} ${c}`,
    params: ({ keyword: s, schemaCode: c }) => (0, e._)`{comparison: ${r[s].okStr}, limit: ${c}}`
  }, i = {
    keyword: Object.keys(r),
    type: "number",
    schemaType: "number",
    $data: !0,
    error: n,
    code(s) {
      const { keyword: c, data: o, schemaCode: u } = s;
      s.fail$data((0, e._)`${o} ${r[c].fail} ${u} || isNaN(${o})`);
    }
  };
  return St.default = i, St;
}
var bt = {}, Ls;
function sc() {
  if (Ls) return bt;
  Ls = 1, Object.defineProperty(bt, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: "multipleOf",
    type: "number",
    schemaType: "number",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must be multiple of ${n}`,
      params: ({ schemaCode: n }) => (0, e._)`{multipleOf: ${n}}`
    },
    code(n) {
      const { gen: i, data: s, schemaCode: c, it: o } = n, u = o.opts.multipleOfPrecision, l = i.let("res"), a = u ? (0, e._)`Math.abs(Math.round(${l}) - ${l}) > 1e-${u}` : (0, e._)`${l} !== parseInt(${l})`;
      n.fail$data((0, e._)`(${c} === 0 || (${l} = ${s}/${c}, ${a}))`);
    }
  };
  return bt.default = r, bt;
}
var Rt = {}, Pt = {}, Ms;
function ac() {
  if (Ms) return Pt;
  Ms = 1, Object.defineProperty(Pt, "__esModule", { value: !0 });
  function e(t) {
    const r = t.length;
    let n = 0, i = 0, s;
    for (; i < r; )
      n++, s = t.charCodeAt(i++), s >= 55296 && s <= 56319 && i < r && (s = t.charCodeAt(i), (s & 64512) === 56320 && i++);
    return n;
  }
  return Pt.default = e, e.code = 'require("ajv/dist/runtime/ucs2length").default', Pt;
}
var Vs;
function ic() {
  if (Vs) return Rt;
  Vs = 1, Object.defineProperty(Rt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = ac(), i = {
    keyword: ["maxLength", "minLength"],
    type: "string",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: s, schemaCode: c }) {
        const o = s === "maxLength" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${o} than ${c} characters`;
      },
      params: ({ schemaCode: s }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { keyword: c, data: o, schemaCode: u, it: l } = s, a = c === "maxLength" ? e.operators.GT : e.operators.LT, g = l.opts.unicode === !1 ? (0, e._)`${o}.length` : (0, e._)`${(0, t.useFunc)(s.gen, r.default)}(${o})`;
      s.fail$data((0, e._)`${g} ${a} ${u}`);
    }
  };
  return Rt.default = i, Rt;
}
var It = {}, Fs;
function oc() {
  if (Fs) return It;
  Fs = 1, Object.defineProperty(It, "__esModule", { value: !0 });
  const e = Re(), t = J(), n = {
    keyword: "pattern",
    type: "string",
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: i }) => (0, t.str)`must match pattern "${i}"`,
      params: ({ schemaCode: i }) => (0, t._)`{pattern: ${i}}`
    },
    code(i) {
      const { data: s, $data: c, schema: o, schemaCode: u, it: l } = i, a = l.opts.unicodeRegExp ? "u" : "", g = c ? (0, t._)`(new RegExp(${u}, ${a}))` : (0, e.usePattern)(i, o);
      i.fail$data((0, t._)`!${g}.test(${s})`);
    }
  };
  return It.default = n, It;
}
var Nt = {}, Us;
function cc() {
  if (Us) return Nt;
  Us = 1, Object.defineProperty(Nt, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: ["maxProperties", "minProperties"],
    type: "object",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const s = n === "maxProperties" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${i} properties`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: s, schemaCode: c } = n, o = i === "maxProperties" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`Object.keys(${s}).length ${o} ${c}`);
    }
  };
  return Nt.default = r, Nt;
}
var Ot = {}, zs;
function uc() {
  if (zs) return Ot;
  zs = 1, Object.defineProperty(Ot, "__esModule", { value: !0 });
  const e = Re(), t = J(), r = ee(), i = {
    keyword: "required",
    type: "object",
    schemaType: "array",
    $data: !0,
    error: {
      message: ({ params: { missingProperty: s } }) => (0, t.str)`must have required property '${s}'`,
      params: ({ params: { missingProperty: s } }) => (0, t._)`{missingProperty: ${s}}`
    },
    code(s) {
      const { gen: c, schema: o, schemaCode: u, data: l, $data: a, it: g } = s, { opts: d } = g;
      if (!a && o.length === 0)
        return;
      const y = o.length >= d.loopRequired;
      if (g.allErrors ? w() : _(), d.strictRequired) {
        const f = s.parentSchema.properties, { definedProperties: p } = s.it;
        for (const S of o)
          if ((f == null ? void 0 : f[S]) === void 0 && !p.has(S)) {
            const m = g.schemaEnv.baseId + g.errSchemaPath, E = `required property "${S}" is not defined at "${m}" (strictRequired)`;
            (0, r.checkStrictMode)(g, E, g.opts.strictRequired);
          }
      }
      function w() {
        if (y || a)
          s.block$data(t.nil, h);
        else
          for (const f of o)
            (0, e.checkReportMissingProp)(s, f);
      }
      function _() {
        const f = c.let("missing");
        if (y || a) {
          const p = c.let("valid", !0);
          s.block$data(p, () => v(f, p)), s.ok(p);
        } else
          c.if((0, e.checkMissingProp)(s, o, f)), (0, e.reportMissingProp)(s, f), c.else();
      }
      function h() {
        c.forOf("prop", u, (f) => {
          s.setParams({ missingProperty: f }), c.if((0, e.noPropertyInData)(c, l, f, d.ownProperties), () => s.error());
        });
      }
      function v(f, p) {
        s.setParams({ missingProperty: f }), c.forOf(f, u, () => {
          c.assign(p, (0, e.propertyInData)(c, l, f, d.ownProperties)), c.if((0, t.not)(p), () => {
            s.error(), c.break();
          });
        }, t.nil);
      }
    }
  };
  return Ot.default = i, Ot;
}
var Tt = {}, Gs;
function lc() {
  if (Gs) return Tt;
  Gs = 1, Object.defineProperty(Tt, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: ["maxItems", "minItems"],
    type: "array",
    schemaType: "number",
    $data: !0,
    error: {
      message({ keyword: n, schemaCode: i }) {
        const s = n === "maxItems" ? "more" : "fewer";
        return (0, e.str)`must NOT have ${s} than ${i} items`;
      },
      params: ({ schemaCode: n }) => (0, e._)`{limit: ${n}}`
    },
    code(n) {
      const { keyword: i, data: s, schemaCode: c } = n, o = i === "maxItems" ? e.operators.GT : e.operators.LT;
      n.fail$data((0, e._)`${s}.length ${o} ${c}`);
    }
  };
  return Tt.default = r, Tt;
}
var jt = {}, At = {}, Ks;
function Kn() {
  if (Ks) return At;
  Ks = 1, Object.defineProperty(At, "__esModule", { value: !0 });
  const e = Hi();
  return e.code = 'require("ajv/dist/runtime/equal").default', At.default = e, At;
}
var Hs;
function fc() {
  if (Hs) return jt;
  Hs = 1, Object.defineProperty(jt, "__esModule", { value: !0 });
  const e = vr(), t = J(), r = ee(), n = Kn(), s = {
    keyword: "uniqueItems",
    type: "array",
    schemaType: "boolean",
    $data: !0,
    error: {
      message: ({ params: { i: c, j: o } }) => (0, t.str)`must NOT have duplicate items (items ## ${o} and ${c} are identical)`,
      params: ({ params: { i: c, j: o } }) => (0, t._)`{i: ${c}, j: ${o}}`
    },
    code(c) {
      const { gen: o, data: u, $data: l, schema: a, parentSchema: g, schemaCode: d, it: y } = c;
      if (!l && !a)
        return;
      const w = o.let("valid"), _ = g.items ? (0, e.getSchemaTypes)(g.items) : [];
      c.block$data(w, h, (0, t._)`${d} === false`), c.ok(w);
      function h() {
        const S = o.let("i", (0, t._)`${u}.length`), m = o.let("j");
        c.setParams({ i: S, j: m }), o.assign(w, !0), o.if((0, t._)`${S} > 1`, () => (v() ? f : p)(S, m));
      }
      function v() {
        return _.length > 0 && !_.some((S) => S === "object" || S === "array");
      }
      function f(S, m) {
        const E = o.name("item"), b = (0, e.checkDataTypes)(_, E, y.opts.strictNumbers, e.DataType.Wrong), O = o.const("indices", (0, t._)`{}`);
        o.for((0, t._)`;${S}--;`, () => {
          o.let(E, (0, t._)`${u}[${S}]`), o.if(b, (0, t._)`continue`), _.length > 1 && o.if((0, t._)`typeof ${E} == "string"`, (0, t._)`${E} += "_"`), o.if((0, t._)`typeof ${O}[${E}] == "number"`, () => {
            o.assign(m, (0, t._)`${O}[${E}]`), c.error(), o.assign(w, !1).break();
          }).code((0, t._)`${O}[${E}] = ${S}`);
        });
      }
      function p(S, m) {
        const E = (0, r.useFunc)(o, n.default), b = o.name("outer");
        o.label(b).for((0, t._)`;${S}--;`, () => o.for((0, t._)`${m} = ${S}; ${m}--;`, () => o.if((0, t._)`${E}(${u}[${S}], ${u}[${m}])`, () => {
          c.error(), o.assign(w, !1).break(b);
        })));
      }
    }
  };
  return jt.default = s, jt;
}
var qt = {}, Xs;
function dc() {
  if (Xs) return qt;
  Xs = 1, Object.defineProperty(qt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Kn(), i = {
    keyword: "const",
    $data: !0,
    error: {
      message: "must be equal to constant",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValue: ${s}}`
    },
    code(s) {
      const { gen: c, data: o, $data: u, schemaCode: l, schema: a } = s;
      u || a && typeof a == "object" ? s.fail$data((0, e._)`!${(0, t.useFunc)(c, r.default)}(${o}, ${l})`) : s.fail((0, e._)`${a} !== ${o}`);
    }
  };
  return qt.default = i, qt;
}
var kt = {}, Ws;
function hc() {
  if (Ws) return kt;
  Ws = 1, Object.defineProperty(kt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Kn(), i = {
    keyword: "enum",
    schemaType: "array",
    $data: !0,
    error: {
      message: "must be equal to one of the allowed values",
      params: ({ schemaCode: s }) => (0, e._)`{allowedValues: ${s}}`
    },
    code(s) {
      const { gen: c, data: o, $data: u, schema: l, schemaCode: a, it: g } = s;
      if (!u && l.length === 0)
        throw new Error("enum must have non-empty array");
      const d = l.length >= g.opts.loopEnum;
      let y;
      const w = () => y ?? (y = (0, t.useFunc)(c, r.default));
      let _;
      if (d || u)
        _ = c.let("valid"), s.block$data(_, h);
      else {
        if (!Array.isArray(l))
          throw new Error("ajv implementation error");
        const f = c.const("vSchema", a);
        _ = (0, e.or)(...l.map((p, S) => v(f, S)));
      }
      s.pass(_);
      function h() {
        c.assign(_, !1), c.forOf("v", a, (f) => c.if((0, e._)`${w()}(${o}, ${f})`, () => c.assign(_, !0).break()));
      }
      function v(f, p) {
        const S = l[p];
        return typeof S == "object" && S !== null ? (0, e._)`${w()}(${o}, ${f}[${p}])` : (0, e._)`${o} === ${S}`;
      }
    }
  };
  return kt.default = i, kt;
}
var Bs;
function xi() {
  if (Bs) return wt;
  Bs = 1, Object.defineProperty(wt, "__esModule", { value: !0 });
  const e = nc(), t = sc(), r = ic(), n = oc(), i = cc(), s = uc(), c = lc(), o = fc(), u = dc(), l = hc(), a = [
    // number
    e.default,
    t.default,
    // string
    r.default,
    n.default,
    // object
    i.default,
    s.default,
    // array
    c.default,
    o.default,
    // any
    { keyword: "type", schemaType: ["string", "array"] },
    { keyword: "nullable", schemaType: "boolean" },
    u.default,
    l.default
  ];
  return wt.default = a, wt;
}
var Ct = {}, We = {}, xs;
function Ji() {
  if (xs) return We;
  xs = 1, Object.defineProperty(We, "__esModule", { value: !0 }), We.validateAdditionalItems = void 0;
  const e = J(), t = ee(), n = {
    keyword: "additionalItems",
    type: "array",
    schemaType: ["boolean", "object"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: s } }) => (0, e.str)`must NOT have more than ${s} items`,
      params: ({ params: { len: s } }) => (0, e._)`{limit: ${s}}`
    },
    code(s) {
      const { parentSchema: c, it: o } = s, { items: u } = c;
      if (!Array.isArray(u)) {
        (0, t.checkStrictMode)(o, '"additionalItems" is ignored when "items" is not an array of schemas');
        return;
      }
      i(s, u);
    }
  };
  function i(s, c) {
    const { gen: o, schema: u, data: l, keyword: a, it: g } = s;
    g.items = !0;
    const d = o.const("len", (0, e._)`${l}.length`);
    if (u === !1)
      s.setParams({ len: c.length }), s.pass((0, e._)`${d} <= ${c.length}`);
    else if (typeof u == "object" && !(0, t.alwaysValidSchema)(g, u)) {
      const w = o.var("valid", (0, e._)`${d} <= ${c.length}`);
      o.if((0, e.not)(w), () => y(w)), s.ok(w);
    }
    function y(w) {
      o.forRange("i", c.length, d, (_) => {
        s.subschema({ keyword: a, dataProp: _, dataPropType: t.Type.Num }, w), g.allErrors || o.if((0, e.not)(w), () => o.break());
      });
    }
  }
  return We.validateAdditionalItems = i, We.default = n, We;
}
var Dt = {}, Be = {}, Js;
function Yi() {
  if (Js) return Be;
  Js = 1, Object.defineProperty(Be, "__esModule", { value: !0 }), Be.validateTuple = void 0;
  const e = J(), t = ee(), r = Re(), n = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "array", "boolean"],
    before: "uniqueItems",
    code(s) {
      const { schema: c, it: o } = s;
      if (Array.isArray(c))
        return i(s, "additionalItems", c);
      o.items = !0, !(0, t.alwaysValidSchema)(o, c) && s.ok((0, r.validateArray)(s));
    }
  };
  function i(s, c, o = s.schema) {
    const { gen: u, parentSchema: l, data: a, keyword: g, it: d } = s;
    _(l), d.opts.unevaluated && o.length && d.items !== !0 && (d.items = t.mergeEvaluated.items(u, o.length, d.items));
    const y = u.name("valid"), w = u.const("len", (0, e._)`${a}.length`);
    o.forEach((h, v) => {
      (0, t.alwaysValidSchema)(d, h) || (u.if((0, e._)`${w} > ${v}`, () => s.subschema({
        keyword: g,
        schemaProp: v,
        dataProp: v
      }, y)), s.ok(y));
    });
    function _(h) {
      const { opts: v, errSchemaPath: f } = d, p = o.length, S = p === h.minItems && (p === h.maxItems || h[c] === !1);
      if (v.strictTuples && !S) {
        const m = `"${g}" is ${p}-tuple, but minItems or maxItems/${c} are not specified or different at path "${f}"`;
        (0, t.checkStrictMode)(d, m, v.strictTuples);
      }
    }
  }
  return Be.validateTuple = i, Be.default = n, Be;
}
var Ys;
function mc() {
  if (Ys) return Dt;
  Ys = 1, Object.defineProperty(Dt, "__esModule", { value: !0 });
  const e = Yi(), t = {
    keyword: "prefixItems",
    type: "array",
    schemaType: ["array"],
    before: "uniqueItems",
    code: (r) => (0, e.validateTuple)(r, "items")
  };
  return Dt.default = t, Dt;
}
var Lt = {}, Zs;
function pc() {
  if (Zs) return Lt;
  Zs = 1, Object.defineProperty(Lt, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = Re(), n = Ji(), s = {
    keyword: "items",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    error: {
      message: ({ params: { len: c } }) => (0, e.str)`must NOT have more than ${c} items`,
      params: ({ params: { len: c } }) => (0, e._)`{limit: ${c}}`
    },
    code(c) {
      const { schema: o, parentSchema: u, it: l } = c, { prefixItems: a } = u;
      l.items = !0, !(0, t.alwaysValidSchema)(l, o) && (a ? (0, n.validateAdditionalItems)(c, a) : c.ok((0, r.validateArray)(c)));
    }
  };
  return Lt.default = s, Lt;
}
var Mt = {}, Qs;
function yc() {
  if (Qs) return Mt;
  Qs = 1, Object.defineProperty(Mt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "contains",
    type: "array",
    schemaType: ["object", "boolean"],
    before: "uniqueItems",
    trackErrors: !0,
    error: {
      message: ({ params: { min: i, max: s } }) => s === void 0 ? (0, e.str)`must contain at least ${i} valid item(s)` : (0, e.str)`must contain at least ${i} and no more than ${s} valid item(s)`,
      params: ({ params: { min: i, max: s } }) => s === void 0 ? (0, e._)`{minContains: ${i}}` : (0, e._)`{minContains: ${i}, maxContains: ${s}}`
    },
    code(i) {
      const { gen: s, schema: c, parentSchema: o, data: u, it: l } = i;
      let a, g;
      const { minContains: d, maxContains: y } = o;
      l.opts.next ? (a = d === void 0 ? 1 : d, g = y) : a = 1;
      const w = s.const("len", (0, e._)`${u}.length`);
      if (i.setParams({ min: a, max: g }), g === void 0 && a === 0) {
        (0, t.checkStrictMode)(l, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
        return;
      }
      if (g !== void 0 && a > g) {
        (0, t.checkStrictMode)(l, '"minContains" > "maxContains" is always invalid'), i.fail();
        return;
      }
      if ((0, t.alwaysValidSchema)(l, c)) {
        let p = (0, e._)`${w} >= ${a}`;
        g !== void 0 && (p = (0, e._)`${p} && ${w} <= ${g}`), i.pass(p);
        return;
      }
      l.items = !0;
      const _ = s.name("valid");
      g === void 0 && a === 1 ? v(_, () => s.if(_, () => s.break())) : a === 0 ? (s.let(_, !0), g !== void 0 && s.if((0, e._)`${u}.length > 0`, h)) : (s.let(_, !1), h()), i.result(_, () => i.reset());
      function h() {
        const p = s.name("_valid"), S = s.let("count", 0);
        v(p, () => s.if(p, () => f(S)));
      }
      function v(p, S) {
        s.forRange("i", 0, w, (m) => {
          i.subschema({
            keyword: "contains",
            dataProp: m,
            dataPropType: t.Type.Num,
            compositeRule: !0
          }, p), S();
        });
      }
      function f(p) {
        s.code((0, e._)`${p}++`), g === void 0 ? s.if((0, e._)`${p} >= ${a}`, () => s.assign(_, !0).break()) : (s.if((0, e._)`${p} > ${g}`, () => s.assign(_, !1).break()), a === 1 ? s.assign(_, !0) : s.if((0, e._)`${p} >= ${a}`, () => s.assign(_, !0)));
      }
    }
  };
  return Mt.default = n, Mt;
}
var zr = {}, ea;
function Hn() {
  return ea || (ea = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.validateSchemaDeps = e.validatePropertyDeps = e.error = void 0;
    const t = J(), r = ee(), n = Re();
    e.error = {
      message: ({ params: { property: u, depsCount: l, deps: a } }) => {
        const g = l === 1 ? "property" : "properties";
        return (0, t.str)`must have ${g} ${a} when property ${u} is present`;
      },
      params: ({ params: { property: u, depsCount: l, deps: a, missingProperty: g } }) => (0, t._)`{property: ${u},
    missingProperty: ${g},
    depsCount: ${l},
    deps: ${a}}`
      // TODO change to reference
    };
    const i = {
      keyword: "dependencies",
      type: "object",
      schemaType: "object",
      error: e.error,
      code(u) {
        const [l, a] = s(u);
        c(u, l), o(u, a);
      }
    };
    function s({ schema: u }) {
      const l = {}, a = {};
      for (const g in u) {
        if (g === "__proto__")
          continue;
        const d = Array.isArray(u[g]) ? l : a;
        d[g] = u[g];
      }
      return [l, a];
    }
    function c(u, l = u.schema) {
      const { gen: a, data: g, it: d } = u;
      if (Object.keys(l).length === 0)
        return;
      const y = a.let("missing");
      for (const w in l) {
        const _ = l[w];
        if (_.length === 0)
          continue;
        const h = (0, n.propertyInData)(a, g, w, d.opts.ownProperties);
        u.setParams({
          property: w,
          depsCount: _.length,
          deps: _.join(", ")
        }), d.allErrors ? a.if(h, () => {
          for (const v of _)
            (0, n.checkReportMissingProp)(u, v);
        }) : (a.if((0, t._)`${h} && (${(0, n.checkMissingProp)(u, _, y)})`), (0, n.reportMissingProp)(u, y), a.else());
      }
    }
    e.validatePropertyDeps = c;
    function o(u, l = u.schema) {
      const { gen: a, data: g, keyword: d, it: y } = u, w = a.name("valid");
      for (const _ in l)
        (0, r.alwaysValidSchema)(y, l[_]) || (a.if(
          (0, n.propertyInData)(a, g, _, y.opts.ownProperties),
          () => {
            const h = u.subschema({ keyword: d, schemaProp: _ }, w);
            u.mergeValidEvaluated(h, w);
          },
          () => a.var(w, !0)
          // TODO var
        ), u.ok(w));
    }
    e.validateSchemaDeps = o, e.default = i;
  })(zr)), zr;
}
var Vt = {}, ta;
function vc() {
  if (ta) return Vt;
  ta = 1, Object.defineProperty(Vt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "propertyNames",
    type: "object",
    schemaType: ["object", "boolean"],
    error: {
      message: "property name must be valid",
      params: ({ params: i }) => (0, e._)`{propertyName: ${i.propertyName}}`
    },
    code(i) {
      const { gen: s, schema: c, data: o, it: u } = i;
      if ((0, t.alwaysValidSchema)(u, c))
        return;
      const l = s.name("valid");
      s.forIn("key", o, (a) => {
        i.setParams({ propertyName: a }), i.subschema({
          keyword: "propertyNames",
          data: a,
          dataTypes: ["string"],
          propertyName: a,
          compositeRule: !0
        }, l), s.if((0, e.not)(l), () => {
          i.error(!0), u.allErrors || s.break();
        });
      }), i.ok(l);
    }
  };
  return Vt.default = n, Vt;
}
var Ft = {}, ra;
function Zi() {
  if (ra) return Ft;
  ra = 1, Object.defineProperty(Ft, "__esModule", { value: !0 });
  const e = Re(), t = J(), r = be(), n = ee(), s = {
    keyword: "additionalProperties",
    type: ["object"],
    schemaType: ["boolean", "object"],
    allowUndefined: !0,
    trackErrors: !0,
    error: {
      message: "must NOT have additional properties",
      params: ({ params: c }) => (0, t._)`{additionalProperty: ${c.additionalProperty}}`
    },
    code(c) {
      const { gen: o, schema: u, parentSchema: l, data: a, errsCount: g, it: d } = c;
      if (!g)
        throw new Error("ajv implementation error");
      const { allErrors: y, opts: w } = d;
      if (d.props = !0, w.removeAdditional !== "all" && (0, n.alwaysValidSchema)(d, u))
        return;
      const _ = (0, e.allSchemaProperties)(l.properties), h = (0, e.allSchemaProperties)(l.patternProperties);
      v(), c.ok((0, t._)`${g} === ${r.default.errors}`);
      function v() {
        o.forIn("key", a, (E) => {
          !_.length && !h.length ? S(E) : o.if(f(E), () => S(E));
        });
      }
      function f(E) {
        let b;
        if (_.length > 8) {
          const O = (0, n.schemaRefOrVal)(d, l.properties, "properties");
          b = (0, e.isOwnProperty)(o, O, E);
        } else _.length ? b = (0, t.or)(..._.map((O) => (0, t._)`${E} === ${O}`)) : b = t.nil;
        return h.length && (b = (0, t.or)(b, ...h.map((O) => (0, t._)`${(0, e.usePattern)(c, O)}.test(${E})`))), (0, t.not)(b);
      }
      function p(E) {
        o.code((0, t._)`delete ${a}[${E}]`);
      }
      function S(E) {
        if (w.removeAdditional === "all" || w.removeAdditional && u === !1) {
          p(E);
          return;
        }
        if (u === !1) {
          c.setParams({ additionalProperty: E }), c.error(), y || o.break();
          return;
        }
        if (typeof u == "object" && !(0, n.alwaysValidSchema)(d, u)) {
          const b = o.name("valid");
          w.removeAdditional === "failing" ? (m(E, b, !1), o.if((0, t.not)(b), () => {
            c.reset(), p(E);
          })) : (m(E, b), y || o.if((0, t.not)(b), () => o.break()));
        }
      }
      function m(E, b, O) {
        const M = {
          keyword: "additionalProperties",
          dataProp: E,
          dataPropType: n.Type.Str
        };
        O === !1 && Object.assign(M, {
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }), c.subschema(M, b);
      }
    }
  };
  return Ft.default = s, Ft;
}
var Ut = {}, na;
function gc() {
  if (na) return Ut;
  na = 1, Object.defineProperty(Ut, "__esModule", { value: !0 });
  const e = lt(), t = Re(), r = ee(), n = Zi(), i = {
    keyword: "properties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: c, schema: o, parentSchema: u, data: l, it: a } = s;
      a.opts.removeAdditional === "all" && u.additionalProperties === void 0 && n.default.code(new e.KeywordCxt(a, n.default, "additionalProperties"));
      const g = (0, t.allSchemaProperties)(o);
      for (const h of g)
        a.definedProperties.add(h);
      a.opts.unevaluated && g.length && a.props !== !0 && (a.props = r.mergeEvaluated.props(c, (0, r.toHash)(g), a.props));
      const d = g.filter((h) => !(0, r.alwaysValidSchema)(a, o[h]));
      if (d.length === 0)
        return;
      const y = c.name("valid");
      for (const h of d)
        w(h) ? _(h) : (c.if((0, t.propertyInData)(c, l, h, a.opts.ownProperties)), _(h), a.allErrors || c.else().var(y, !0), c.endIf()), s.it.definedProperties.add(h), s.ok(y);
      function w(h) {
        return a.opts.useDefaults && !a.compositeRule && o[h].default !== void 0;
      }
      function _(h) {
        s.subschema({
          keyword: "properties",
          schemaProp: h,
          dataProp: h
        }, y);
      }
    }
  };
  return Ut.default = i, Ut;
}
var zt = {}, sa;
function $c() {
  if (sa) return zt;
  sa = 1, Object.defineProperty(zt, "__esModule", { value: !0 });
  const e = Re(), t = J(), r = ee(), n = ee(), i = {
    keyword: "patternProperties",
    type: "object",
    schemaType: "object",
    code(s) {
      const { gen: c, schema: o, data: u, parentSchema: l, it: a } = s, { opts: g } = a, d = (0, e.allSchemaProperties)(o), y = d.filter((S) => (0, r.alwaysValidSchema)(a, o[S]));
      if (d.length === 0 || y.length === d.length && (!a.opts.unevaluated || a.props === !0))
        return;
      const w = g.strictSchema && !g.allowMatchingProperties && l.properties, _ = c.name("valid");
      a.props !== !0 && !(a.props instanceof t.Name) && (a.props = (0, n.evaluatedPropsToName)(c, a.props));
      const { props: h } = a;
      v();
      function v() {
        for (const S of d)
          w && f(S), a.allErrors ? p(S) : (c.var(_, !0), p(S), c.if(_));
      }
      function f(S) {
        for (const m in w)
          new RegExp(S).test(m) && (0, r.checkStrictMode)(a, `property ${m} matches pattern ${S} (use allowMatchingProperties)`);
      }
      function p(S) {
        c.forIn("key", u, (m) => {
          c.if((0, t._)`${(0, e.usePattern)(s, S)}.test(${m})`, () => {
            const E = y.includes(S);
            E || s.subschema({
              keyword: "patternProperties",
              schemaProp: S,
              dataProp: m,
              dataPropType: n.Type.Str
            }, _), a.opts.unevaluated && h !== !0 ? c.assign((0, t._)`${h}[${m}]`, !0) : !E && !a.allErrors && c.if((0, t.not)(_), () => c.break());
          });
        });
      }
    }
  };
  return zt.default = i, zt;
}
var Gt = {}, aa;
function _c() {
  if (aa) return Gt;
  aa = 1, Object.defineProperty(Gt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: "not",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    code(r) {
      const { gen: n, schema: i, it: s } = r;
      if ((0, e.alwaysValidSchema)(s, i)) {
        r.fail();
        return;
      }
      const c = n.name("valid");
      r.subschema({
        keyword: "not",
        compositeRule: !0,
        createErrors: !1,
        allErrors: !1
      }, c), r.failResult(c, () => r.reset(), () => r.error());
    },
    error: { message: "must NOT be valid" }
  };
  return Gt.default = t, Gt;
}
var Kt = {}, ia;
function Ec() {
  if (ia) return Kt;
  ia = 1, Object.defineProperty(Kt, "__esModule", { value: !0 });
  const t = {
    keyword: "anyOf",
    schemaType: "array",
    trackErrors: !0,
    code: Re().validateUnion,
    error: { message: "must match a schema in anyOf" }
  };
  return Kt.default = t, Kt;
}
var Ht = {}, oa;
function wc() {
  if (oa) return Ht;
  oa = 1, Object.defineProperty(Ht, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "oneOf",
    schemaType: "array",
    trackErrors: !0,
    error: {
      message: "must match exactly one schema in oneOf",
      params: ({ params: i }) => (0, e._)`{passingSchemas: ${i.passing}}`
    },
    code(i) {
      const { gen: s, schema: c, parentSchema: o, it: u } = i;
      if (!Array.isArray(c))
        throw new Error("ajv implementation error");
      if (u.opts.discriminator && o.discriminator)
        return;
      const l = c, a = s.let("valid", !1), g = s.let("passing", null), d = s.name("_valid");
      i.setParams({ passing: g }), s.block(y), i.result(a, () => i.reset(), () => i.error(!0));
      function y() {
        l.forEach((w, _) => {
          let h;
          (0, t.alwaysValidSchema)(u, w) ? s.var(d, !0) : h = i.subschema({
            keyword: "oneOf",
            schemaProp: _,
            compositeRule: !0
          }, d), _ > 0 && s.if((0, e._)`${d} && ${a}`).assign(a, !1).assign(g, (0, e._)`[${g}, ${_}]`).else(), s.if(d, () => {
            s.assign(a, !0), s.assign(g, _), h && i.mergeEvaluated(h, e.Name);
          });
        });
      }
    }
  };
  return Ht.default = n, Ht;
}
var Xt = {}, ca;
function Sc() {
  if (ca) return Xt;
  ca = 1, Object.defineProperty(Xt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: "allOf",
    schemaType: "array",
    code(r) {
      const { gen: n, schema: i, it: s } = r;
      if (!Array.isArray(i))
        throw new Error("ajv implementation error");
      const c = n.name("valid");
      i.forEach((o, u) => {
        if ((0, e.alwaysValidSchema)(s, o))
          return;
        const l = r.subschema({ keyword: "allOf", schemaProp: u }, c);
        r.ok(c), r.mergeEvaluated(l);
      });
    }
  };
  return Xt.default = t, Xt;
}
var Wt = {}, ua;
function bc() {
  if (ua) return Wt;
  ua = 1, Object.defineProperty(Wt, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "if",
    schemaType: ["object", "boolean"],
    trackErrors: !0,
    error: {
      message: ({ params: s }) => (0, e.str)`must match "${s.ifClause}" schema`,
      params: ({ params: s }) => (0, e._)`{failingKeyword: ${s.ifClause}}`
    },
    code(s) {
      const { gen: c, parentSchema: o, it: u } = s;
      o.then === void 0 && o.else === void 0 && (0, t.checkStrictMode)(u, '"if" without "then" and "else" is ignored');
      const l = i(u, "then"), a = i(u, "else");
      if (!l && !a)
        return;
      const g = c.let("valid", !0), d = c.name("_valid");
      if (y(), s.reset(), l && a) {
        const _ = c.let("ifClause");
        s.setParams({ ifClause: _ }), c.if(d, w("then", _), w("else", _));
      } else l ? c.if(d, w("then")) : c.if((0, e.not)(d), w("else"));
      s.pass(g, () => s.error(!0));
      function y() {
        const _ = s.subschema({
          keyword: "if",
          compositeRule: !0,
          createErrors: !1,
          allErrors: !1
        }, d);
        s.mergeEvaluated(_);
      }
      function w(_, h) {
        return () => {
          const v = s.subschema({ keyword: _ }, d);
          c.assign(g, d), s.mergeValidEvaluated(v, g), h ? c.assign(h, (0, e._)`${_}`) : s.setParams({ ifClause: _ });
        };
      }
    }
  };
  function i(s, c) {
    const o = s.schema[c];
    return o !== void 0 && !(0, t.alwaysValidSchema)(s, o);
  }
  return Wt.default = n, Wt;
}
var Bt = {}, la;
function Rc() {
  if (la) return Bt;
  la = 1, Object.defineProperty(Bt, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["then", "else"],
    schemaType: ["object", "boolean"],
    code({ keyword: r, parentSchema: n, it: i }) {
      n.if === void 0 && (0, e.checkStrictMode)(i, `"${r}" without "if" is ignored`);
    }
  };
  return Bt.default = t, Bt;
}
var fa;
function Qi() {
  if (fa) return Ct;
  fa = 1, Object.defineProperty(Ct, "__esModule", { value: !0 });
  const e = Ji(), t = mc(), r = Yi(), n = pc(), i = yc(), s = Hn(), c = vc(), o = Zi(), u = gc(), l = $c(), a = _c(), g = Ec(), d = wc(), y = Sc(), w = bc(), _ = Rc();
  function h(v = !1) {
    const f = [
      // any
      a.default,
      g.default,
      d.default,
      y.default,
      w.default,
      _.default,
      // object
      c.default,
      o.default,
      s.default,
      u.default,
      l.default
    ];
    return v ? f.push(t.default, n.default) : f.push(e.default, r.default), f.push(i.default), f;
  }
  return Ct.default = h, Ct;
}
var xt = {}, xe = {}, da;
function eo() {
  if (da) return xe;
  da = 1, Object.defineProperty(xe, "__esModule", { value: !0 }), xe.dynamicAnchor = void 0;
  const e = J(), t = be(), r = wr(), n = Gn(), i = {
    keyword: "$dynamicAnchor",
    schemaType: "string",
    code: (o) => s(o, o.schema)
  };
  function s(o, u) {
    const { gen: l, it: a } = o;
    a.schemaEnv.root.dynamicAnchors[u] = !0;
    const g = (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(u)}`, d = a.errSchemaPath === "#" ? a.validateName : c(o);
    l.if((0, e._)`!${g}`, () => l.assign(g, d));
  }
  xe.dynamicAnchor = s;
  function c(o) {
    const { schemaEnv: u, schema: l, self: a } = o.it, { root: g, baseId: d, localRefs: y, meta: w } = u.root, { schemaId: _ } = a.opts, h = new r.SchemaEnv({ schema: l, schemaId: _, root: g, baseId: d, localRefs: y, meta: w });
    return r.compileSchema.call(a, h), (0, n.getValidate)(o, h);
  }
  return xe.default = i, xe;
}
var Je = {}, ha;
function to() {
  if (ha) return Je;
  ha = 1, Object.defineProperty(Je, "__esModule", { value: !0 }), Je.dynamicRef = void 0;
  const e = J(), t = be(), r = Gn(), n = {
    keyword: "$dynamicRef",
    schemaType: "string",
    code: (s) => i(s, s.schema)
  };
  function i(s, c) {
    const { gen: o, keyword: u, it: l } = s;
    if (c[0] !== "#")
      throw new Error(`"${u}" only supports hash fragment reference`);
    const a = c.slice(1);
    if (l.allErrors)
      g();
    else {
      const y = o.let("valid", !1);
      g(y), s.ok(y);
    }
    function g(y) {
      if (l.schemaEnv.root.dynamicAnchors[a]) {
        const w = o.let("_v", (0, e._)`${t.default.dynamicAnchors}${(0, e.getProperty)(a)}`);
        o.if(w, d(w, y), d(l.validateName, y));
      } else
        d(l.validateName, y)();
    }
    function d(y, w) {
      return w ? () => o.block(() => {
        (0, r.callRef)(s, y), o.let(w, !0);
      }) : () => (0, r.callRef)(s, y);
    }
  }
  return Je.dynamicRef = i, Je.default = n, Je;
}
var Jt = {}, ma;
function Pc() {
  if (ma) return Jt;
  ma = 1, Object.defineProperty(Jt, "__esModule", { value: !0 });
  const e = eo(), t = ee(), r = {
    keyword: "$recursiveAnchor",
    schemaType: "boolean",
    code(n) {
      n.schema ? (0, e.dynamicAnchor)(n, "") : (0, t.checkStrictMode)(n.it, "$recursiveAnchor: false is ignored");
    }
  };
  return Jt.default = r, Jt;
}
var Yt = {}, pa;
function Ic() {
  if (pa) return Yt;
  pa = 1, Object.defineProperty(Yt, "__esModule", { value: !0 });
  const e = to(), t = {
    keyword: "$recursiveRef",
    schemaType: "string",
    code: (r) => (0, e.dynamicRef)(r, r.schema)
  };
  return Yt.default = t, Yt;
}
var ya;
function Nc() {
  if (ya) return xt;
  ya = 1, Object.defineProperty(xt, "__esModule", { value: !0 });
  const e = eo(), t = to(), r = Pc(), n = Ic(), i = [e.default, t.default, r.default, n.default];
  return xt.default = i, xt;
}
var Zt = {}, Qt = {}, va;
function Oc() {
  if (va) return Qt;
  va = 1, Object.defineProperty(Qt, "__esModule", { value: !0 });
  const e = Hn(), t = {
    keyword: "dependentRequired",
    type: "object",
    schemaType: "object",
    error: e.error,
    code: (r) => (0, e.validatePropertyDeps)(r)
  };
  return Qt.default = t, Qt;
}
var er = {}, ga;
function Tc() {
  if (ga) return er;
  ga = 1, Object.defineProperty(er, "__esModule", { value: !0 });
  const e = Hn(), t = {
    keyword: "dependentSchemas",
    type: "object",
    schemaType: "object",
    code: (r) => (0, e.validateSchemaDeps)(r)
  };
  return er.default = t, er;
}
var tr = {}, $a;
function jc() {
  if ($a) return tr;
  $a = 1, Object.defineProperty(tr, "__esModule", { value: !0 });
  const e = ee(), t = {
    keyword: ["maxContains", "minContains"],
    type: "array",
    schemaType: "number",
    code({ keyword: r, parentSchema: n, it: i }) {
      n.contains === void 0 && (0, e.checkStrictMode)(i, `"${r}" without "contains" is ignored`);
    }
  };
  return tr.default = t, tr;
}
var _a;
function Ac() {
  if (_a) return Zt;
  _a = 1, Object.defineProperty(Zt, "__esModule", { value: !0 });
  const e = Oc(), t = Tc(), r = jc(), n = [e.default, t.default, r.default];
  return Zt.default = n, Zt;
}
var rr = {}, nr = {}, Ea;
function qc() {
  if (Ea) return nr;
  Ea = 1, Object.defineProperty(nr, "__esModule", { value: !0 });
  const e = J(), t = ee(), r = be(), i = {
    keyword: "unevaluatedProperties",
    type: "object",
    schemaType: ["boolean", "object"],
    trackErrors: !0,
    error: {
      message: "must NOT have unevaluated properties",
      params: ({ params: s }) => (0, e._)`{unevaluatedProperty: ${s.unevaluatedProperty}}`
    },
    code(s) {
      const { gen: c, schema: o, data: u, errsCount: l, it: a } = s;
      if (!l)
        throw new Error("ajv implementation error");
      const { allErrors: g, props: d } = a;
      d instanceof e.Name ? c.if((0, e._)`${d} !== true`, () => c.forIn("key", u, (h) => c.if(w(d, h), () => y(h)))) : d !== !0 && c.forIn("key", u, (h) => d === void 0 ? y(h) : c.if(_(d, h), () => y(h))), a.props = !0, s.ok((0, e._)`${l} === ${r.default.errors}`);
      function y(h) {
        if (o === !1) {
          s.setParams({ unevaluatedProperty: h }), s.error(), g || c.break();
          return;
        }
        if (!(0, t.alwaysValidSchema)(a, o)) {
          const v = c.name("valid");
          s.subschema({
            keyword: "unevaluatedProperties",
            dataProp: h,
            dataPropType: t.Type.Str
          }, v), g || c.if((0, e.not)(v), () => c.break());
        }
      }
      function w(h, v) {
        return (0, e._)`!${h} || !${h}[${v}]`;
      }
      function _(h, v) {
        const f = [];
        for (const p in h)
          h[p] === !0 && f.push((0, e._)`${v} !== ${p}`);
        return (0, e.and)(...f);
      }
    }
  };
  return nr.default = i, nr;
}
var sr = {}, wa;
function kc() {
  if (wa) return sr;
  wa = 1, Object.defineProperty(sr, "__esModule", { value: !0 });
  const e = J(), t = ee(), n = {
    keyword: "unevaluatedItems",
    type: "array",
    schemaType: ["boolean", "object"],
    error: {
      message: ({ params: { len: i } }) => (0, e.str)`must NOT have more than ${i} items`,
      params: ({ params: { len: i } }) => (0, e._)`{limit: ${i}}`
    },
    code(i) {
      const { gen: s, schema: c, data: o, it: u } = i, l = u.items || 0;
      if (l === !0)
        return;
      const a = s.const("len", (0, e._)`${o}.length`);
      if (c === !1)
        i.setParams({ len: l }), i.fail((0, e._)`${a} > ${l}`);
      else if (typeof c == "object" && !(0, t.alwaysValidSchema)(u, c)) {
        const d = s.var("valid", (0, e._)`${a} <= ${l}`);
        s.if((0, e.not)(d), () => g(d, l)), i.ok(d);
      }
      u.items = !0;
      function g(d, y) {
        s.forRange("i", y, a, (w) => {
          i.subschema({ keyword: "unevaluatedItems", dataProp: w, dataPropType: t.Type.Num }, d), u.allErrors || s.if((0, e.not)(d), () => s.break());
        });
      }
    }
  };
  return sr.default = n, sr;
}
var Sa;
function Cc() {
  if (Sa) return rr;
  Sa = 1, Object.defineProperty(rr, "__esModule", { value: !0 });
  const e = qc(), t = kc(), r = [e.default, t.default];
  return rr.default = r, rr;
}
var ar = {}, ir = {}, ba;
function Dc() {
  if (ba) return ir;
  ba = 1, Object.defineProperty(ir, "__esModule", { value: !0 });
  const e = J(), r = {
    keyword: "format",
    type: ["number", "string"],
    schemaType: "string",
    $data: !0,
    error: {
      message: ({ schemaCode: n }) => (0, e.str)`must match format "${n}"`,
      params: ({ schemaCode: n }) => (0, e._)`{format: ${n}}`
    },
    code(n, i) {
      const { gen: s, data: c, $data: o, schema: u, schemaCode: l, it: a } = n, { opts: g, errSchemaPath: d, schemaEnv: y, self: w } = a;
      if (!g.validateFormats)
        return;
      o ? _() : h();
      function _() {
        const v = s.scopeValue("formats", {
          ref: w.formats,
          code: g.code.formats
        }), f = s.const("fDef", (0, e._)`${v}[${l}]`), p = s.let("fType"), S = s.let("format");
        s.if((0, e._)`typeof ${f} == "object" && !(${f} instanceof RegExp)`, () => s.assign(p, (0, e._)`${f}.type || "string"`).assign(S, (0, e._)`${f}.validate`), () => s.assign(p, (0, e._)`"string"`).assign(S, f)), n.fail$data((0, e.or)(m(), E()));
        function m() {
          return g.strictSchema === !1 ? e.nil : (0, e._)`${l} && !${S}`;
        }
        function E() {
          const b = y.$async ? (0, e._)`(${f}.async ? await ${S}(${c}) : ${S}(${c}))` : (0, e._)`${S}(${c})`, O = (0, e._)`(typeof ${S} == "function" ? ${b} : ${S}.test(${c}))`;
          return (0, e._)`${S} && ${S} !== true && ${p} === ${i} && !${O}`;
        }
      }
      function h() {
        const v = w.formats[u];
        if (!v) {
          m();
          return;
        }
        if (v === !0)
          return;
        const [f, p, S] = E(v);
        f === i && n.pass(b());
        function m() {
          if (g.strictSchema === !1) {
            w.logger.warn(O());
            return;
          }
          throw new Error(O());
          function O() {
            return `unknown format "${u}" ignored in schema at path "${d}"`;
          }
        }
        function E(O) {
          const M = O instanceof RegExp ? (0, e.regexpCode)(O) : g.code.formats ? (0, e._)`${g.code.formats}${(0, e.getProperty)(u)}` : void 0, z = s.scopeValue("formats", { key: u, ref: O, code: M });
          return typeof O == "object" && !(O instanceof RegExp) ? [O.type || "string", O.validate, (0, e._)`${z}.validate`] : ["string", O, z];
        }
        function b() {
          if (typeof v == "object" && !(v instanceof RegExp) && v.async) {
            if (!y.$async)
              throw new Error("async format in sync schema");
            return (0, e._)`await ${S}(${c})`;
          }
          return typeof p == "function" ? (0, e._)`${S}(${c})` : (0, e._)`${S}.test(${c})`;
        }
      }
    }
  };
  return ir.default = r, ir;
}
var Ra;
function ro() {
  if (Ra) return ar;
  Ra = 1, Object.defineProperty(ar, "__esModule", { value: !0 });
  const t = [Dc().default];
  return ar.default = t, ar;
}
var Ke = {}, Pa;
function no() {
  return Pa || (Pa = 1, Object.defineProperty(Ke, "__esModule", { value: !0 }), Ke.contentVocabulary = Ke.metadataVocabulary = void 0, Ke.metadataVocabulary = [
    "title",
    "description",
    "default",
    "deprecated",
    "readOnly",
    "writeOnly",
    "examples"
  ], Ke.contentVocabulary = [
    "contentMediaType",
    "contentEncoding",
    "contentSchema"
  ]), Ke;
}
var Ia;
function Lc() {
  if (Ia) return $t;
  Ia = 1, Object.defineProperty($t, "__esModule", { value: !0 });
  const e = Bi(), t = xi(), r = Qi(), n = Nc(), i = Ac(), s = Cc(), c = ro(), o = no(), u = [
    n.default,
    e.default,
    t.default,
    (0, r.default)(!0),
    c.default,
    o.metadataVocabulary,
    o.contentVocabulary,
    i.default,
    s.default
  ];
  return $t.default = u, $t;
}
var or = {}, ut = {}, Na;
function Mc() {
  if (Na) return ut;
  Na = 1, Object.defineProperty(ut, "__esModule", { value: !0 }), ut.DiscrError = void 0;
  var e;
  return (function(t) {
    t.Tag = "tag", t.Mapping = "mapping";
  })(e || (ut.DiscrError = e = {})), ut;
}
var Oa;
function so() {
  if (Oa) return or;
  Oa = 1, Object.defineProperty(or, "__esModule", { value: !0 });
  const e = J(), t = Mc(), r = wr(), n = ft(), i = ee(), c = {
    keyword: "discriminator",
    type: "object",
    schemaType: "object",
    error: {
      message: ({ params: { discrError: o, tagName: u } }) => o === t.DiscrError.Tag ? `tag "${u}" must be string` : `value of tag "${u}" must be in oneOf`,
      params: ({ params: { discrError: o, tag: u, tagName: l } }) => (0, e._)`{error: ${o}, tag: ${l}, tagValue: ${u}}`
    },
    code(o) {
      const { gen: u, data: l, schema: a, parentSchema: g, it: d } = o, { oneOf: y } = g;
      if (!d.opts.discriminator)
        throw new Error("discriminator: requires discriminator option");
      const w = a.propertyName;
      if (typeof w != "string")
        throw new Error("discriminator: requires propertyName");
      if (a.mapping)
        throw new Error("discriminator: mapping is not supported");
      if (!y)
        throw new Error("discriminator: requires oneOf keyword");
      const _ = u.let("valid", !1), h = u.const("tag", (0, e._)`${l}${(0, e.getProperty)(w)}`);
      u.if((0, e._)`typeof ${h} == "string"`, () => v(), () => o.error(!1, { discrError: t.DiscrError.Tag, tag: h, tagName: w })), o.ok(_);
      function v() {
        const S = p();
        u.if(!1);
        for (const m in S)
          u.elseIf((0, e._)`${h} === ${m}`), u.assign(_, f(S[m]));
        u.else(), o.error(!1, { discrError: t.DiscrError.Mapping, tag: h, tagName: w }), u.endIf();
      }
      function f(S) {
        const m = u.name("valid"), E = o.subschema({ keyword: "oneOf", schemaProp: S }, m);
        return o.mergeEvaluated(E, e.Name), m;
      }
      function p() {
        var S;
        const m = {}, E = O(g);
        let b = !0;
        for (let C = 0; C < y.length; C++) {
          let F = y[C];
          if (F != null && F.$ref && !(0, i.schemaHasRulesButRef)(F, d.self.RULES)) {
            const A = F.$ref;
            if (F = r.resolveRef.call(d.self, d.schemaEnv.root, d.baseId, A), F instanceof r.SchemaEnv && (F = F.schema), F === void 0)
              throw new n.default(d.opts.uriResolver, d.baseId, A);
          }
          const G = (S = F == null ? void 0 : F.properties) === null || S === void 0 ? void 0 : S[w];
          if (typeof G != "object")
            throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${w}"`);
          b = b && (E || O(F)), M(G, C);
        }
        if (!b)
          throw new Error(`discriminator: "${w}" must be required`);
        return m;
        function O({ required: C }) {
          return Array.isArray(C) && C.includes(w);
        }
        function M(C, F) {
          if (C.const)
            z(C.const, F);
          else if (C.enum)
            for (const G of C.enum)
              z(G, F);
          else
            throw new Error(`discriminator: "properties/${w}" must have "const" or "enum"`);
        }
        function z(C, F) {
          if (typeof C != "string" || C in m)
            throw new Error(`discriminator: "${w}" values must be unique strings`);
          m[C] = F;
        }
      }
    }
  };
  return or.default = c, or;
}
var cr = {};
const Vc = "https://json-schema.org/draft/2020-12/schema", Fc = "https://json-schema.org/draft/2020-12/schema", Uc = { "https://json-schema.org/draft/2020-12/vocab/core": !0, "https://json-schema.org/draft/2020-12/vocab/applicator": !0, "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0, "https://json-schema.org/draft/2020-12/vocab/validation": !0, "https://json-schema.org/draft/2020-12/vocab/meta-data": !0, "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0, "https://json-schema.org/draft/2020-12/vocab/content": !0 }, zc = "meta", Gc = "Core and Validation specifications meta-schema", Kc = [{ $ref: "meta/core" }, { $ref: "meta/applicator" }, { $ref: "meta/unevaluated" }, { $ref: "meta/validation" }, { $ref: "meta/meta-data" }, { $ref: "meta/format-annotation" }, { $ref: "meta/content" }], Hc = ["object", "boolean"], Xc = "This meta-schema also defines keywords that have appeared in previous drafts in order to prevent incompatible extensions as they remain in common use.", Wc = { definitions: { $comment: '"definitions" has been replaced by "$defs".', type: "object", additionalProperties: { $dynamicRef: "#meta" }, deprecated: !0, default: {} }, dependencies: { $comment: '"dependencies" has been split and replaced by "dependentSchemas" and "dependentRequired" in order to serve their differing semantics.', type: "object", additionalProperties: { anyOf: [{ $dynamicRef: "#meta" }, { $ref: "meta/validation#/$defs/stringArray" }] }, deprecated: !0, default: {} }, $recursiveAnchor: { $comment: '"$recursiveAnchor" has been replaced by "$dynamicAnchor".', $ref: "meta/core#/$defs/anchorString", deprecated: !0 }, $recursiveRef: { $comment: '"$recursiveRef" has been replaced by "$dynamicRef".', $ref: "meta/core#/$defs/uriReferenceString", deprecated: !0 } }, Bc = {
  $schema: Vc,
  $id: Fc,
  $vocabulary: Uc,
  $dynamicAnchor: zc,
  title: Gc,
  allOf: Kc,
  type: Hc,
  $comment: Xc,
  properties: Wc
}, xc = "https://json-schema.org/draft/2020-12/schema", Jc = "https://json-schema.org/draft/2020-12/meta/applicator", Yc = { "https://json-schema.org/draft/2020-12/vocab/applicator": !0 }, Zc = "meta", Qc = "Applicator vocabulary meta-schema", eu = ["object", "boolean"], tu = { prefixItems: { $ref: "#/$defs/schemaArray" }, items: { $dynamicRef: "#meta" }, contains: { $dynamicRef: "#meta" }, additionalProperties: { $dynamicRef: "#meta" }, properties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, propertyNames: { format: "regex" }, default: {} }, dependentSchemas: { type: "object", additionalProperties: { $dynamicRef: "#meta" }, default: {} }, propertyNames: { $dynamicRef: "#meta" }, if: { $dynamicRef: "#meta" }, then: { $dynamicRef: "#meta" }, else: { $dynamicRef: "#meta" }, allOf: { $ref: "#/$defs/schemaArray" }, anyOf: { $ref: "#/$defs/schemaArray" }, oneOf: { $ref: "#/$defs/schemaArray" }, not: { $dynamicRef: "#meta" } }, ru = { schemaArray: { type: "array", minItems: 1, items: { $dynamicRef: "#meta" } } }, nu = {
  $schema: xc,
  $id: Jc,
  $vocabulary: Yc,
  $dynamicAnchor: Zc,
  title: Qc,
  type: eu,
  properties: tu,
  $defs: ru
}, su = "https://json-schema.org/draft/2020-12/schema", au = "https://json-schema.org/draft/2020-12/meta/unevaluated", iu = { "https://json-schema.org/draft/2020-12/vocab/unevaluated": !0 }, ou = "meta", cu = "Unevaluated applicator vocabulary meta-schema", uu = ["object", "boolean"], lu = { unevaluatedItems: { $dynamicRef: "#meta" }, unevaluatedProperties: { $dynamicRef: "#meta" } }, fu = {
  $schema: su,
  $id: au,
  $vocabulary: iu,
  $dynamicAnchor: ou,
  title: cu,
  type: uu,
  properties: lu
}, du = "https://json-schema.org/draft/2020-12/schema", hu = "https://json-schema.org/draft/2020-12/meta/content", mu = { "https://json-schema.org/draft/2020-12/vocab/content": !0 }, pu = "meta", yu = "Content vocabulary meta-schema", vu = ["object", "boolean"], gu = { contentEncoding: { type: "string" }, contentMediaType: { type: "string" }, contentSchema: { $dynamicRef: "#meta" } }, $u = {
  $schema: du,
  $id: hu,
  $vocabulary: mu,
  $dynamicAnchor: pu,
  title: yu,
  type: vu,
  properties: gu
}, _u = "https://json-schema.org/draft/2020-12/schema", Eu = "https://json-schema.org/draft/2020-12/meta/core", wu = { "https://json-schema.org/draft/2020-12/vocab/core": !0 }, Su = "meta", bu = "Core vocabulary meta-schema", Ru = ["object", "boolean"], Pu = { $id: { $ref: "#/$defs/uriReferenceString", $comment: "Non-empty fragments not allowed.", pattern: "^[^#]*#?$" }, $schema: { $ref: "#/$defs/uriString" }, $ref: { $ref: "#/$defs/uriReferenceString" }, $anchor: { $ref: "#/$defs/anchorString" }, $dynamicRef: { $ref: "#/$defs/uriReferenceString" }, $dynamicAnchor: { $ref: "#/$defs/anchorString" }, $vocabulary: { type: "object", propertyNames: { $ref: "#/$defs/uriString" }, additionalProperties: { type: "boolean" } }, $comment: { type: "string" }, $defs: { type: "object", additionalProperties: { $dynamicRef: "#meta" } } }, Iu = { anchorString: { type: "string", pattern: "^[A-Za-z_][-A-Za-z0-9._]*$" }, uriString: { type: "string", format: "uri" }, uriReferenceString: { type: "string", format: "uri-reference" } }, Nu = {
  $schema: _u,
  $id: Eu,
  $vocabulary: wu,
  $dynamicAnchor: Su,
  title: bu,
  type: Ru,
  properties: Pu,
  $defs: Iu
}, Ou = "https://json-schema.org/draft/2020-12/schema", Tu = "https://json-schema.org/draft/2020-12/meta/format-annotation", ju = { "https://json-schema.org/draft/2020-12/vocab/format-annotation": !0 }, Au = "meta", qu = "Format vocabulary meta-schema for annotation results", ku = ["object", "boolean"], Cu = { format: { type: "string" } }, Du = {
  $schema: Ou,
  $id: Tu,
  $vocabulary: ju,
  $dynamicAnchor: Au,
  title: qu,
  type: ku,
  properties: Cu
}, Lu = "https://json-schema.org/draft/2020-12/schema", Mu = "https://json-schema.org/draft/2020-12/meta/meta-data", Vu = { "https://json-schema.org/draft/2020-12/vocab/meta-data": !0 }, Fu = "meta", Uu = "Meta-data vocabulary meta-schema", zu = ["object", "boolean"], Gu = { title: { type: "string" }, description: { type: "string" }, default: !0, deprecated: { type: "boolean", default: !1 }, readOnly: { type: "boolean", default: !1 }, writeOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 } }, Ku = {
  $schema: Lu,
  $id: Mu,
  $vocabulary: Vu,
  $dynamicAnchor: Fu,
  title: Uu,
  type: zu,
  properties: Gu
}, Hu = "https://json-schema.org/draft/2020-12/schema", Xu = "https://json-schema.org/draft/2020-12/meta/validation", Wu = { "https://json-schema.org/draft/2020-12/vocab/validation": !0 }, Bu = "meta", xu = "Validation vocabulary meta-schema", Ju = ["object", "boolean"], Yu = { type: { anyOf: [{ $ref: "#/$defs/simpleTypes" }, { type: "array", items: { $ref: "#/$defs/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, const: !0, enum: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/$defs/nonNegativeInteger" }, minLength: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, maxItems: { $ref: "#/$defs/nonNegativeInteger" }, minItems: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, maxContains: { $ref: "#/$defs/nonNegativeInteger" }, minContains: { $ref: "#/$defs/nonNegativeInteger", default: 1 }, maxProperties: { $ref: "#/$defs/nonNegativeInteger" }, minProperties: { $ref: "#/$defs/nonNegativeIntegerDefault0" }, required: { $ref: "#/$defs/stringArray" }, dependentRequired: { type: "object", additionalProperties: { $ref: "#/$defs/stringArray" } } }, Zu = { nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { $ref: "#/$defs/nonNegativeInteger", default: 0 }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, Qu = {
  $schema: Hu,
  $id: Xu,
  $vocabulary: Wu,
  $dynamicAnchor: Bu,
  title: xu,
  type: Ju,
  properties: Yu,
  $defs: Zu
};
var Ta;
function el() {
  if (Ta) return cr;
  Ta = 1, Object.defineProperty(cr, "__esModule", { value: !0 });
  const e = Bc, t = nu, r = fu, n = $u, i = Nu, s = Du, c = Ku, o = Qu, u = ["/properties"];
  function l(a) {
    return [
      e,
      t,
      r,
      n,
      i,
      g(this, s),
      c,
      g(this, o)
    ].forEach((d) => this.addMetaSchema(d, void 0, !1)), this;
    function g(d, y) {
      return a ? d.$dataMetaSchema(y, u) : y;
    }
  }
  return cr.default = l, cr;
}
var ja;
function tl() {
  return ja || (ja = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv2020 = void 0;
    const r = Wi(), n = Lc(), i = so(), s = el(), c = "https://json-schema.org/draft/2020-12/schema";
    class o extends r.default {
      constructor(y = {}) {
        super({
          ...y,
          dynamicRef: !0,
          next: !0,
          unevaluated: !0
        });
      }
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((y) => this.addVocabulary(y)), this.opts.discriminator && this.addKeyword(i.default);
      }
      _addDefaultMetaSchema() {
        super._addDefaultMetaSchema();
        const { $data: y, meta: w } = this.opts;
        w && (s.default.call(this, y), this.refs["http://json-schema.org/schema"] = c);
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(c) ? c : void 0);
      }
    }
    t.Ajv2020 = o, e.exports = t = o, e.exports.Ajv2020 = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
    var u = lt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return u.KeywordCxt;
    } });
    var l = J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return l._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return l.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return l.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return l.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return l.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return l.CodeGen;
    } });
    var a = Er();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return a.default;
    } });
    var g = ft();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return g.default;
    } });
  })(mt, mt.exports)), mt.exports;
}
var rl = tl(), ur = { exports: {} }, Gr = {}, Aa;
function nl() {
  return Aa || (Aa = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatNames = e.fastFormats = e.fullFormats = void 0;
    function t(C, F) {
      return { validate: C, compare: F };
    }
    e.fullFormats = {
      // date: http://tools.ietf.org/html/rfc3339#section-5.6
      date: t(s, c),
      // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
      time: t(u(!0), l),
      "date-time": t(d(!0), y),
      "iso-time": t(u(), a),
      "iso-date-time": t(d(), w),
      // duration: https://tools.ietf.org/html/rfc3339#appendix-A
      duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: v,
      "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      // uri-template: https://tools.ietf.org/html/rfc6570
      "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      // For the source: https://gist.github.com/dperini/729294
      // For test cases: https://mathiasbynens.be/demo/url-regex
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: z,
      // uuid: http://tools.ietf.org/html/rfc4122
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      // JSON-pointer: https://tools.ietf.org/html/rfc6901
      // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
      "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
      // byte: https://github.com/miguelmota/is-base64
      byte: p,
      // signed 32 bit integer
      int32: { type: "number", validate: E },
      // signed 64 bit integer
      int64: { type: "number", validate: b },
      // C-type float
      float: { type: "number", validate: O },
      // C-type double
      double: { type: "number", validate: O },
      // hint to the UI to hide input strings
      password: !0,
      // unchecked string payload
      binary: !0
    }, e.fastFormats = {
      ...e.fullFormats,
      date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, c),
      time: t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, l),
      "date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, y),
      "iso-time": t(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, a),
      "iso-date-time": t(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, w),
      // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
      uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
      "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
      // email (sources from jsen validator):
      // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
      // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
      email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
    }, e.formatNames = Object.keys(e.fullFormats);
    function r(C) {
      return C % 4 === 0 && (C % 100 !== 0 || C % 400 === 0);
    }
    const n = /^(\d\d\d\d)-(\d\d)-(\d\d)$/, i = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function s(C) {
      const F = n.exec(C);
      if (!F)
        return !1;
      const G = +F[1], A = +F[2], D = +F[3];
      return A >= 1 && A <= 12 && D >= 1 && D <= (A === 2 && r(G) ? 29 : i[A]);
    }
    function c(C, F) {
      if (C && F)
        return C > F ? 1 : C < F ? -1 : 0;
    }
    const o = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function u(C) {
      return function(G) {
        const A = o.exec(G);
        if (!A)
          return !1;
        const D = +A[1], X = +A[2], K = +A[3], U = A[4], H = A[5] === "-" ? -1 : 1, q = +(A[6] || 0), P = +(A[7] || 0);
        if (q > 23 || P > 59 || C && !U)
          return !1;
        if (D <= 23 && X <= 59 && K < 60)
          return !0;
        const j = X - P * H, I = D - q * H - (j < 0 ? 1 : 0);
        return (I === 23 || I === -1) && (j === 59 || j === -1) && K < 61;
      };
    }
    function l(C, F) {
      if (!(C && F))
        return;
      const G = (/* @__PURE__ */ new Date("2020-01-01T" + C)).valueOf(), A = (/* @__PURE__ */ new Date("2020-01-01T" + F)).valueOf();
      if (G && A)
        return G - A;
    }
    function a(C, F) {
      if (!(C && F))
        return;
      const G = o.exec(C), A = o.exec(F);
      if (G && A)
        return C = G[1] + G[2] + G[3], F = A[1] + A[2] + A[3], C > F ? 1 : C < F ? -1 : 0;
    }
    const g = /t|\s/i;
    function d(C) {
      const F = u(C);
      return function(A) {
        const D = A.split(g);
        return D.length === 2 && s(D[0]) && F(D[1]);
      };
    }
    function y(C, F) {
      if (!(C && F))
        return;
      const G = new Date(C).valueOf(), A = new Date(F).valueOf();
      if (G && A)
        return G - A;
    }
    function w(C, F) {
      if (!(C && F))
        return;
      const [G, A] = C.split(g), [D, X] = F.split(g), K = c(G, D);
      if (K !== void 0)
        return K || l(A, X);
    }
    const _ = /\/|:/, h = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function v(C) {
      return _.test(C) && h.test(C);
    }
    const f = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function p(C) {
      return f.lastIndex = 0, f.test(C);
    }
    const S = -2147483648, m = 2 ** 31 - 1;
    function E(C) {
      return Number.isInteger(C) && C <= m && C >= S;
    }
    function b(C) {
      return Number.isInteger(C);
    }
    function O() {
      return !0;
    }
    const M = /[^\\]\\Z/;
    function z(C) {
      if (M.test(C))
        return !1;
      try {
        return new RegExp(C), !0;
      } catch {
        return !1;
      }
    }
  })(Gr)), Gr;
}
var Kr = {}, lr = { exports: {} }, fr = {}, qa;
function sl() {
  if (qa) return fr;
  qa = 1, Object.defineProperty(fr, "__esModule", { value: !0 });
  const e = Bi(), t = xi(), r = Qi(), n = ro(), i = no(), s = [
    e.default,
    t.default,
    (0, r.default)(),
    n.default,
    i.metadataVocabulary,
    i.contentVocabulary
  ];
  return fr.default = s, fr;
}
const al = "http://json-schema.org/draft-07/schema#", il = "http://json-schema.org/draft-07/schema#", ol = "Core schema meta-schema", cl = { schemaArray: { type: "array", minItems: 1, items: { $ref: "#" } }, nonNegativeInteger: { type: "integer", minimum: 0 }, nonNegativeIntegerDefault0: { allOf: [{ $ref: "#/definitions/nonNegativeInteger" }, { default: 0 }] }, simpleTypes: { enum: ["array", "boolean", "integer", "null", "number", "object", "string"] }, stringArray: { type: "array", items: { type: "string" }, uniqueItems: !0, default: [] } }, ul = ["object", "boolean"], ll = { $id: { type: "string", format: "uri-reference" }, $schema: { type: "string", format: "uri" }, $ref: { type: "string", format: "uri-reference" }, $comment: { type: "string" }, title: { type: "string" }, description: { type: "string" }, default: !0, readOnly: { type: "boolean", default: !1 }, examples: { type: "array", items: !0 }, multipleOf: { type: "number", exclusiveMinimum: 0 }, maximum: { type: "number" }, exclusiveMaximum: { type: "number" }, minimum: { type: "number" }, exclusiveMinimum: { type: "number" }, maxLength: { $ref: "#/definitions/nonNegativeInteger" }, minLength: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, pattern: { type: "string", format: "regex" }, additionalItems: { $ref: "#" }, items: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/schemaArray" }], default: !0 }, maxItems: { $ref: "#/definitions/nonNegativeInteger" }, minItems: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, uniqueItems: { type: "boolean", default: !1 }, contains: { $ref: "#" }, maxProperties: { $ref: "#/definitions/nonNegativeInteger" }, minProperties: { $ref: "#/definitions/nonNegativeIntegerDefault0" }, required: { $ref: "#/definitions/stringArray" }, additionalProperties: { $ref: "#" }, definitions: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, properties: { type: "object", additionalProperties: { $ref: "#" }, default: {} }, patternProperties: { type: "object", additionalProperties: { $ref: "#" }, propertyNames: { format: "regex" }, default: {} }, dependencies: { type: "object", additionalProperties: { anyOf: [{ $ref: "#" }, { $ref: "#/definitions/stringArray" }] } }, propertyNames: { $ref: "#" }, const: !0, enum: { type: "array", items: !0, minItems: 1, uniqueItems: !0 }, type: { anyOf: [{ $ref: "#/definitions/simpleTypes" }, { type: "array", items: { $ref: "#/definitions/simpleTypes" }, minItems: 1, uniqueItems: !0 }] }, format: { type: "string" }, contentMediaType: { type: "string" }, contentEncoding: { type: "string" }, if: { $ref: "#" }, then: { $ref: "#" }, else: { $ref: "#" }, allOf: { $ref: "#/definitions/schemaArray" }, anyOf: { $ref: "#/definitions/schemaArray" }, oneOf: { $ref: "#/definitions/schemaArray" }, not: { $ref: "#" } }, fl = {
  $schema: al,
  $id: il,
  title: ol,
  definitions: cl,
  type: ul,
  properties: ll,
  default: !0
};
var ka;
function dl() {
  return ka || (ka = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 }), t.MissingRefError = t.ValidationError = t.CodeGen = t.Name = t.nil = t.stringify = t.str = t._ = t.KeywordCxt = t.Ajv = void 0;
    const r = Wi(), n = sl(), i = so(), s = fl, c = ["/properties"], o = "http://json-schema.org/draft-07/schema";
    class u extends r.default {
      _addVocabularies() {
        super._addVocabularies(), n.default.forEach((w) => this.addVocabulary(w)), this.opts.discriminator && this.addKeyword(i.default);
      }
      _addDefaultMetaSchema() {
        if (super._addDefaultMetaSchema(), !this.opts.meta)
          return;
        const w = this.opts.$data ? this.$dataMetaSchema(s, c) : s;
        this.addMetaSchema(w, o, !1), this.refs["http://json-schema.org/schema"] = o;
      }
      defaultMeta() {
        return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(o) ? o : void 0);
      }
    }
    t.Ajv = u, e.exports = t = u, e.exports.Ajv = u, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = u;
    var l = lt();
    Object.defineProperty(t, "KeywordCxt", { enumerable: !0, get: function() {
      return l.KeywordCxt;
    } });
    var a = J();
    Object.defineProperty(t, "_", { enumerable: !0, get: function() {
      return a._;
    } }), Object.defineProperty(t, "str", { enumerable: !0, get: function() {
      return a.str;
    } }), Object.defineProperty(t, "stringify", { enumerable: !0, get: function() {
      return a.stringify;
    } }), Object.defineProperty(t, "nil", { enumerable: !0, get: function() {
      return a.nil;
    } }), Object.defineProperty(t, "Name", { enumerable: !0, get: function() {
      return a.Name;
    } }), Object.defineProperty(t, "CodeGen", { enumerable: !0, get: function() {
      return a.CodeGen;
    } });
    var g = Er();
    Object.defineProperty(t, "ValidationError", { enumerable: !0, get: function() {
      return g.default;
    } });
    var d = ft();
    Object.defineProperty(t, "MissingRefError", { enumerable: !0, get: function() {
      return d.default;
    } });
  })(lr, lr.exports)), lr.exports;
}
var Ca;
function hl() {
  return Ca || (Ca = 1, (function(e) {
    Object.defineProperty(e, "__esModule", { value: !0 }), e.formatLimitDefinition = void 0;
    const t = dl(), r = J(), n = r.operators, i = {
      formatMaximum: { okStr: "<=", ok: n.LTE, fail: n.GT },
      formatMinimum: { okStr: ">=", ok: n.GTE, fail: n.LT },
      formatExclusiveMaximum: { okStr: "<", ok: n.LT, fail: n.GTE },
      formatExclusiveMinimum: { okStr: ">", ok: n.GT, fail: n.LTE }
    }, s = {
      message: ({ keyword: o, schemaCode: u }) => (0, r.str)`should be ${i[o].okStr} ${u}`,
      params: ({ keyword: o, schemaCode: u }) => (0, r._)`{comparison: ${i[o].okStr}, limit: ${u}}`
    };
    e.formatLimitDefinition = {
      keyword: Object.keys(i),
      type: "string",
      schemaType: "string",
      $data: !0,
      error: s,
      code(o) {
        const { gen: u, data: l, schemaCode: a, keyword: g, it: d } = o, { opts: y, self: w } = d;
        if (!y.validateFormats)
          return;
        const _ = new t.KeywordCxt(d, w.RULES.all.format.definition, "format");
        _.$data ? h() : v();
        function h() {
          const p = u.scopeValue("formats", {
            ref: w.formats,
            code: y.code.formats
          }), S = u.const("fmt", (0, r._)`${p}[${_.schemaCode}]`);
          o.fail$data((0, r.or)((0, r._)`typeof ${S} != "object"`, (0, r._)`${S} instanceof RegExp`, (0, r._)`typeof ${S}.compare != "function"`, f(S)));
        }
        function v() {
          const p = _.schema, S = w.formats[p];
          if (!S || S === !0)
            return;
          if (typeof S != "object" || S instanceof RegExp || typeof S.compare != "function")
            throw new Error(`"${g}": format "${p}" does not define "compare" function`);
          const m = u.scopeValue("formats", {
            key: p,
            ref: S,
            code: y.code.formats ? (0, r._)`${y.code.formats}${(0, r.getProperty)(p)}` : void 0
          });
          o.fail$data(f(m));
        }
        function f(p) {
          return (0, r._)`${p}.compare(${l}, ${a}) ${i[g].fail} 0`;
        }
      },
      dependencies: ["format"]
    };
    const c = (o) => (o.addKeyword(e.formatLimitDefinition), o);
    e.default = c;
  })(Kr)), Kr;
}
var Da;
function ml() {
  return Da || (Da = 1, (function(e, t) {
    Object.defineProperty(t, "__esModule", { value: !0 });
    const r = nl(), n = hl(), i = J(), s = new i.Name("fullFormats"), c = new i.Name("fastFormats"), o = (l, a = { keywords: !0 }) => {
      if (Array.isArray(a))
        return u(l, a, r.fullFormats, s), l;
      const [g, d] = a.mode === "fast" ? [r.fastFormats, c] : [r.fullFormats, s], y = a.formats || r.formatNames;
      return u(l, y, g, d), a.keywords && (0, n.default)(l), l;
    };
    o.get = (l, a = "full") => {
      const d = (a === "fast" ? r.fastFormats : r.fullFormats)[l];
      if (!d)
        throw new Error(`Unknown format "${l}"`);
      return d;
    };
    function u(l, a, g, d) {
      var y, w;
      (y = (w = l.opts.code).formats) !== null && y !== void 0 || (w.formats = (0, i._)`require("ajv-formats/dist/formats").${d}`);
      for (const _ of a)
        l.addFormat(_, g[_]);
    }
    e.exports = t = o, Object.defineProperty(t, "__esModule", { value: !0 }), t.default = o;
  })(ur, ur.exports)), ur.exports;
}
var pl = ml();
const yl = /* @__PURE__ */ zi(pl), vl = (e, t, r, n) => {
  if (r === "length" || r === "prototype" || r === "arguments" || r === "caller")
    return;
  const i = Object.getOwnPropertyDescriptor(e, r), s = Object.getOwnPropertyDescriptor(t, r);
  !gl(i, s) && n || Object.defineProperty(e, r, s);
}, gl = function(e, t) {
  return e === void 0 || e.configurable || e.writable === t.writable && e.enumerable === t.enumerable && e.configurable === t.configurable && (e.writable || e.value === t.value);
}, $l = (e, t) => {
  const r = Object.getPrototypeOf(t);
  r !== Object.getPrototypeOf(e) && Object.setPrototypeOf(e, r);
}, _l = (e, t) => `/* Wrapped ${e}*/
${t}`, El = Object.getOwnPropertyDescriptor(Function.prototype, "toString"), wl = Object.getOwnPropertyDescriptor(Function.prototype.toString, "name"), Sl = (e, t, r) => {
  const n = r === "" ? "" : `with ${r.trim()}() `, i = _l.bind(null, n, t.toString());
  Object.defineProperty(i, "name", wl);
  const { writable: s, enumerable: c, configurable: o } = El;
  Object.defineProperty(e, "toString", { value: i, writable: s, enumerable: c, configurable: o });
};
function bl(e, t, { ignoreNonConfigurable: r = !1 } = {}) {
  const { name: n } = e;
  for (const i of Reflect.ownKeys(t))
    vl(e, t, i, r);
  return $l(e, t), Sl(e, t, n), e;
}
const La = (e, t = {}) => {
  if (typeof e != "function")
    throw new TypeError(`Expected the first argument to be a function, got \`${typeof e}\``);
  const {
    wait: r = 0,
    maxWait: n = Number.POSITIVE_INFINITY,
    before: i = !1,
    after: s = !0
  } = t;
  if (r < 0 || n < 0)
    throw new RangeError("`wait` and `maxWait` must not be negative.");
  if (!i && !s)
    throw new Error("Both `before` and `after` are false, function wouldn't be called.");
  let c, o, u;
  const l = function(...a) {
    const g = this, d = () => {
      c = void 0, o && (clearTimeout(o), o = void 0), s && (u = e.apply(g, a));
    }, y = () => {
      o = void 0, c && (clearTimeout(c), c = void 0), s && (u = e.apply(g, a));
    }, w = i && !c;
    return clearTimeout(c), c = setTimeout(d, r), n > 0 && n !== Number.POSITIVE_INFINITY && !o && (o = setTimeout(y, n)), w && (u = e.apply(g, a)), u;
  };
  return bl(l, e), l.cancel = () => {
    c && (clearTimeout(c), c = void 0), o && (clearTimeout(o), o = void 0);
  }, l;
};
var dr = { exports: {} }, Hr, Ma;
function Sr() {
  if (Ma) return Hr;
  Ma = 1;
  const e = "2.0.0", t = 256, r = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
  9007199254740991, n = 16, i = t - 6;
  return Hr = {
    MAX_LENGTH: t,
    MAX_SAFE_COMPONENT_LENGTH: n,
    MAX_SAFE_BUILD_LENGTH: i,
    MAX_SAFE_INTEGER: r,
    RELEASE_TYPES: [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ],
    SEMVER_SPEC_VERSION: e,
    FLAG_INCLUDE_PRERELEASE: 1,
    FLAG_LOOSE: 2
  }, Hr;
}
var Xr, Va;
function br() {
  return Va || (Va = 1, Xr = typeof process == "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...t) => console.error("SEMVER", ...t) : () => {
  }), Xr;
}
var Fa;
function dt() {
  return Fa || (Fa = 1, (function(e, t) {
    const {
      MAX_SAFE_COMPONENT_LENGTH: r,
      MAX_SAFE_BUILD_LENGTH: n,
      MAX_LENGTH: i
    } = Sr(), s = br();
    t = e.exports = {};
    const c = t.re = [], o = t.safeRe = [], u = t.src = [], l = t.safeSrc = [], a = t.t = {};
    let g = 0;
    const d = "[a-zA-Z0-9-]", y = [
      ["\\s", 1],
      ["\\d", i],
      [d, n]
    ], w = (h) => {
      for (const [v, f] of y)
        h = h.split(`${v}*`).join(`${v}{0,${f}}`).split(`${v}+`).join(`${v}{1,${f}}`);
      return h;
    }, _ = (h, v, f) => {
      const p = w(v), S = g++;
      s(h, S, v), a[h] = S, u[S] = v, l[S] = p, c[S] = new RegExp(v, f ? "g" : void 0), o[S] = new RegExp(p, f ? "g" : void 0);
    };
    _("NUMERICIDENTIFIER", "0|[1-9]\\d*"), _("NUMERICIDENTIFIERLOOSE", "\\d+"), _("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${d}*`), _("MAINVERSION", `(${u[a.NUMERICIDENTIFIER]})\\.(${u[a.NUMERICIDENTIFIER]})\\.(${u[a.NUMERICIDENTIFIER]})`), _("MAINVERSIONLOOSE", `(${u[a.NUMERICIDENTIFIERLOOSE]})\\.(${u[a.NUMERICIDENTIFIERLOOSE]})\\.(${u[a.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASEIDENTIFIER", `(?:${u[a.NONNUMERICIDENTIFIER]}|${u[a.NUMERICIDENTIFIER]})`), _("PRERELEASEIDENTIFIERLOOSE", `(?:${u[a.NONNUMERICIDENTIFIER]}|${u[a.NUMERICIDENTIFIERLOOSE]})`), _("PRERELEASE", `(?:-(${u[a.PRERELEASEIDENTIFIER]}(?:\\.${u[a.PRERELEASEIDENTIFIER]})*))`), _("PRERELEASELOOSE", `(?:-?(${u[a.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${u[a.PRERELEASEIDENTIFIERLOOSE]})*))`), _("BUILDIDENTIFIER", `${d}+`), _("BUILD", `(?:\\+(${u[a.BUILDIDENTIFIER]}(?:\\.${u[a.BUILDIDENTIFIER]})*))`), _("FULLPLAIN", `v?${u[a.MAINVERSION]}${u[a.PRERELEASE]}?${u[a.BUILD]}?`), _("FULL", `^${u[a.FULLPLAIN]}$`), _("LOOSEPLAIN", `[v=\\s]*${u[a.MAINVERSIONLOOSE]}${u[a.PRERELEASELOOSE]}?${u[a.BUILD]}?`), _("LOOSE", `^${u[a.LOOSEPLAIN]}$`), _("GTLT", "((?:<|>)?=?)"), _("XRANGEIDENTIFIERLOOSE", `${u[a.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`), _("XRANGEIDENTIFIER", `${u[a.NUMERICIDENTIFIER]}|x|X|\\*`), _("XRANGEPLAIN", `[v=\\s]*(${u[a.XRANGEIDENTIFIER]})(?:\\.(${u[a.XRANGEIDENTIFIER]})(?:\\.(${u[a.XRANGEIDENTIFIER]})(?:${u[a.PRERELEASE]})?${u[a.BUILD]}?)?)?`), _("XRANGEPLAINLOOSE", `[v=\\s]*(${u[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[a.XRANGEIDENTIFIERLOOSE]})(?:\\.(${u[a.XRANGEIDENTIFIERLOOSE]})(?:${u[a.PRERELEASELOOSE]})?${u[a.BUILD]}?)?)?`), _("XRANGE", `^${u[a.GTLT]}\\s*${u[a.XRANGEPLAIN]}$`), _("XRANGELOOSE", `^${u[a.GTLT]}\\s*${u[a.XRANGEPLAINLOOSE]}$`), _("COERCEPLAIN", `(^|[^\\d])(\\d{1,${r}})(?:\\.(\\d{1,${r}}))?(?:\\.(\\d{1,${r}}))?`), _("COERCE", `${u[a.COERCEPLAIN]}(?:$|[^\\d])`), _("COERCEFULL", u[a.COERCEPLAIN] + `(?:${u[a.PRERELEASE]})?(?:${u[a.BUILD]})?(?:$|[^\\d])`), _("COERCERTL", u[a.COERCE], !0), _("COERCERTLFULL", u[a.COERCEFULL], !0), _("LONETILDE", "(?:~>?)"), _("TILDETRIM", `(\\s*)${u[a.LONETILDE]}\\s+`, !0), t.tildeTrimReplace = "$1~", _("TILDE", `^${u[a.LONETILDE]}${u[a.XRANGEPLAIN]}$`), _("TILDELOOSE", `^${u[a.LONETILDE]}${u[a.XRANGEPLAINLOOSE]}$`), _("LONECARET", "(?:\\^)"), _("CARETTRIM", `(\\s*)${u[a.LONECARET]}\\s+`, !0), t.caretTrimReplace = "$1^", _("CARET", `^${u[a.LONECARET]}${u[a.XRANGEPLAIN]}$`), _("CARETLOOSE", `^${u[a.LONECARET]}${u[a.XRANGEPLAINLOOSE]}$`), _("COMPARATORLOOSE", `^${u[a.GTLT]}\\s*(${u[a.LOOSEPLAIN]})$|^$`), _("COMPARATOR", `^${u[a.GTLT]}\\s*(${u[a.FULLPLAIN]})$|^$`), _("COMPARATORTRIM", `(\\s*)${u[a.GTLT]}\\s*(${u[a.LOOSEPLAIN]}|${u[a.XRANGEPLAIN]})`, !0), t.comparatorTrimReplace = "$1$2$3", _("HYPHENRANGE", `^\\s*(${u[a.XRANGEPLAIN]})\\s+-\\s+(${u[a.XRANGEPLAIN]})\\s*$`), _("HYPHENRANGELOOSE", `^\\s*(${u[a.XRANGEPLAINLOOSE]})\\s+-\\s+(${u[a.XRANGEPLAINLOOSE]})\\s*$`), _("STAR", "(<|>)?=?\\s*\\*"), _("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$"), _("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  })(dr, dr.exports)), dr.exports;
}
var Wr, Ua;
function Xn() {
  if (Ua) return Wr;
  Ua = 1;
  const e = Object.freeze({ loose: !0 }), t = Object.freeze({});
  return Wr = (n) => n ? typeof n != "object" ? e : n : t, Wr;
}
var Br, za;
function ao() {
  if (za) return Br;
  za = 1;
  const e = /^[0-9]+$/, t = (n, i) => {
    if (typeof n == "number" && typeof i == "number")
      return n === i ? 0 : n < i ? -1 : 1;
    const s = e.test(n), c = e.test(i);
    return s && c && (n = +n, i = +i), n === i ? 0 : s && !c ? -1 : c && !s ? 1 : n < i ? -1 : 1;
  };
  return Br = {
    compareIdentifiers: t,
    rcompareIdentifiers: (n, i) => t(i, n)
  }, Br;
}
var xr, Ga;
function pe() {
  if (Ga) return xr;
  Ga = 1;
  const e = br(), { MAX_LENGTH: t, MAX_SAFE_INTEGER: r } = Sr(), { safeRe: n, t: i } = dt(), s = Xn(), { compareIdentifiers: c } = ao();
  class o {
    constructor(l, a) {
      if (a = s(a), l instanceof o) {
        if (l.loose === !!a.loose && l.includePrerelease === !!a.includePrerelease)
          return l;
        l = l.version;
      } else if (typeof l != "string")
        throw new TypeError(`Invalid version. Must be a string. Got type "${typeof l}".`);
      if (l.length > t)
        throw new TypeError(
          `version is longer than ${t} characters`
        );
      e("SemVer", l, a), this.options = a, this.loose = !!a.loose, this.includePrerelease = !!a.includePrerelease;
      const g = l.trim().match(a.loose ? n[i.LOOSE] : n[i.FULL]);
      if (!g)
        throw new TypeError(`Invalid Version: ${l}`);
      if (this.raw = l, this.major = +g[1], this.minor = +g[2], this.patch = +g[3], this.major > r || this.major < 0)
        throw new TypeError("Invalid major version");
      if (this.minor > r || this.minor < 0)
        throw new TypeError("Invalid minor version");
      if (this.patch > r || this.patch < 0)
        throw new TypeError("Invalid patch version");
      g[4] ? this.prerelease = g[4].split(".").map((d) => {
        if (/^[0-9]+$/.test(d)) {
          const y = +d;
          if (y >= 0 && y < r)
            return y;
        }
        return d;
      }) : this.prerelease = [], this.build = g[5] ? g[5].split(".") : [], this.format();
    }
    format() {
      return this.version = `${this.major}.${this.minor}.${this.patch}`, this.prerelease.length && (this.version += `-${this.prerelease.join(".")}`), this.version;
    }
    toString() {
      return this.version;
    }
    compare(l) {
      if (e("SemVer.compare", this.version, this.options, l), !(l instanceof o)) {
        if (typeof l == "string" && l === this.version)
          return 0;
        l = new o(l, this.options);
      }
      return l.version === this.version ? 0 : this.compareMain(l) || this.comparePre(l);
    }
    compareMain(l) {
      return l instanceof o || (l = new o(l, this.options)), this.major < l.major ? -1 : this.major > l.major ? 1 : this.minor < l.minor ? -1 : this.minor > l.minor ? 1 : this.patch < l.patch ? -1 : this.patch > l.patch ? 1 : 0;
    }
    comparePre(l) {
      if (l instanceof o || (l = new o(l, this.options)), this.prerelease.length && !l.prerelease.length)
        return -1;
      if (!this.prerelease.length && l.prerelease.length)
        return 1;
      if (!this.prerelease.length && !l.prerelease.length)
        return 0;
      let a = 0;
      do {
        const g = this.prerelease[a], d = l.prerelease[a];
        if (e("prerelease compare", a, g, d), g === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (g === void 0)
          return -1;
        if (g === d)
          continue;
        return c(g, d);
      } while (++a);
    }
    compareBuild(l) {
      l instanceof o || (l = new o(l, this.options));
      let a = 0;
      do {
        const g = this.build[a], d = l.build[a];
        if (e("build compare", a, g, d), g === void 0 && d === void 0)
          return 0;
        if (d === void 0)
          return 1;
        if (g === void 0)
          return -1;
        if (g === d)
          continue;
        return c(g, d);
      } while (++a);
    }
    // preminor will bump the version up to the next minor release, and immediately
    // down to pre-release. premajor and prepatch work the same way.
    inc(l, a, g) {
      if (l.startsWith("pre")) {
        if (!a && g === !1)
          throw new Error("invalid increment argument: identifier is empty");
        if (a) {
          const d = `-${a}`.match(this.options.loose ? n[i.PRERELEASELOOSE] : n[i.PRERELEASE]);
          if (!d || d[1] !== a)
            throw new Error(`invalid identifier: ${a}`);
        }
      }
      switch (l) {
        case "premajor":
          this.prerelease.length = 0, this.patch = 0, this.minor = 0, this.major++, this.inc("pre", a, g);
          break;
        case "preminor":
          this.prerelease.length = 0, this.patch = 0, this.minor++, this.inc("pre", a, g);
          break;
        case "prepatch":
          this.prerelease.length = 0, this.inc("patch", a, g), this.inc("pre", a, g);
          break;
        // If the input is a non-prerelease version, this acts the same as
        // prepatch.
        case "prerelease":
          this.prerelease.length === 0 && this.inc("patch", a, g), this.inc("pre", a, g);
          break;
        case "release":
          if (this.prerelease.length === 0)
            throw new Error(`version ${this.raw} is not a prerelease`);
          this.prerelease.length = 0;
          break;
        case "major":
          (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) && this.major++, this.minor = 0, this.patch = 0, this.prerelease = [];
          break;
        case "minor":
          (this.patch !== 0 || this.prerelease.length === 0) && this.minor++, this.patch = 0, this.prerelease = [];
          break;
        case "patch":
          this.prerelease.length === 0 && this.patch++, this.prerelease = [];
          break;
        // This probably shouldn't be used publicly.
        // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
        case "pre": {
          const d = Number(g) ? 1 : 0;
          if (this.prerelease.length === 0)
            this.prerelease = [d];
          else {
            let y = this.prerelease.length;
            for (; --y >= 0; )
              typeof this.prerelease[y] == "number" && (this.prerelease[y]++, y = -2);
            if (y === -1) {
              if (a === this.prerelease.join(".") && g === !1)
                throw new Error("invalid increment argument: identifier already exists");
              this.prerelease.push(d);
            }
          }
          if (a) {
            let y = [a, d];
            g === !1 && (y = [a]), c(this.prerelease[0], a) === 0 ? isNaN(this.prerelease[1]) && (this.prerelease = y) : this.prerelease = y;
          }
          break;
        }
        default:
          throw new Error(`invalid increment argument: ${l}`);
      }
      return this.raw = this.format(), this.build.length && (this.raw += `+${this.build.join(".")}`), this;
    }
  }
  return xr = o, xr;
}
var Jr, Ka;
function tt() {
  if (Ka) return Jr;
  Ka = 1;
  const e = pe();
  return Jr = (r, n, i = !1) => {
    if (r instanceof e)
      return r;
    try {
      return new e(r, n);
    } catch (s) {
      if (!i)
        return null;
      throw s;
    }
  }, Jr;
}
var Yr, Ha;
function Rl() {
  if (Ha) return Yr;
  Ha = 1;
  const e = tt();
  return Yr = (r, n) => {
    const i = e(r, n);
    return i ? i.version : null;
  }, Yr;
}
var Zr, Xa;
function Pl() {
  if (Xa) return Zr;
  Xa = 1;
  const e = tt();
  return Zr = (r, n) => {
    const i = e(r.trim().replace(/^[=v]+/, ""), n);
    return i ? i.version : null;
  }, Zr;
}
var Qr, Wa;
function Il() {
  if (Wa) return Qr;
  Wa = 1;
  const e = pe();
  return Qr = (r, n, i, s, c) => {
    typeof i == "string" && (c = s, s = i, i = void 0);
    try {
      return new e(
        r instanceof e ? r.version : r,
        i
      ).inc(n, s, c).version;
    } catch {
      return null;
    }
  }, Qr;
}
var en, Ba;
function Nl() {
  if (Ba) return en;
  Ba = 1;
  const e = tt();
  return en = (r, n) => {
    const i = e(r, null, !0), s = e(n, null, !0), c = i.compare(s);
    if (c === 0)
      return null;
    const o = c > 0, u = o ? i : s, l = o ? s : i, a = !!u.prerelease.length;
    if (!!l.prerelease.length && !a) {
      if (!l.patch && !l.minor)
        return "major";
      if (l.compareMain(u) === 0)
        return l.minor && !l.patch ? "minor" : "patch";
    }
    const d = a ? "pre" : "";
    return i.major !== s.major ? d + "major" : i.minor !== s.minor ? d + "minor" : i.patch !== s.patch ? d + "patch" : "prerelease";
  }, en;
}
var tn, xa;
function Ol() {
  if (xa) return tn;
  xa = 1;
  const e = pe();
  return tn = (r, n) => new e(r, n).major, tn;
}
var rn, Ja;
function Tl() {
  if (Ja) return rn;
  Ja = 1;
  const e = pe();
  return rn = (r, n) => new e(r, n).minor, rn;
}
var nn, Ya;
function jl() {
  if (Ya) return nn;
  Ya = 1;
  const e = pe();
  return nn = (r, n) => new e(r, n).patch, nn;
}
var sn, Za;
function Al() {
  if (Za) return sn;
  Za = 1;
  const e = tt();
  return sn = (r, n) => {
    const i = e(r, n);
    return i && i.prerelease.length ? i.prerelease : null;
  }, sn;
}
var an, Qa;
function Pe() {
  if (Qa) return an;
  Qa = 1;
  const e = pe();
  return an = (r, n, i) => new e(r, i).compare(new e(n, i)), an;
}
var on, ei;
function ql() {
  if (ei) return on;
  ei = 1;
  const e = Pe();
  return on = (r, n, i) => e(n, r, i), on;
}
var cn, ti;
function kl() {
  if (ti) return cn;
  ti = 1;
  const e = Pe();
  return cn = (r, n) => e(r, n, !0), cn;
}
var un, ri;
function Wn() {
  if (ri) return un;
  ri = 1;
  const e = pe();
  return un = (r, n, i) => {
    const s = new e(r, i), c = new e(n, i);
    return s.compare(c) || s.compareBuild(c);
  }, un;
}
var ln, ni;
function Cl() {
  if (ni) return ln;
  ni = 1;
  const e = Wn();
  return ln = (r, n) => r.sort((i, s) => e(i, s, n)), ln;
}
var fn, si;
function Dl() {
  if (si) return fn;
  si = 1;
  const e = Wn();
  return fn = (r, n) => r.sort((i, s) => e(s, i, n)), fn;
}
var dn, ai;
function Rr() {
  if (ai) return dn;
  ai = 1;
  const e = Pe();
  return dn = (r, n, i) => e(r, n, i) > 0, dn;
}
var hn, ii;
function Bn() {
  if (ii) return hn;
  ii = 1;
  const e = Pe();
  return hn = (r, n, i) => e(r, n, i) < 0, hn;
}
var mn, oi;
function io() {
  if (oi) return mn;
  oi = 1;
  const e = Pe();
  return mn = (r, n, i) => e(r, n, i) === 0, mn;
}
var pn, ci;
function oo() {
  if (ci) return pn;
  ci = 1;
  const e = Pe();
  return pn = (r, n, i) => e(r, n, i) !== 0, pn;
}
var yn, ui;
function xn() {
  if (ui) return yn;
  ui = 1;
  const e = Pe();
  return yn = (r, n, i) => e(r, n, i) >= 0, yn;
}
var vn, li;
function Jn() {
  if (li) return vn;
  li = 1;
  const e = Pe();
  return vn = (r, n, i) => e(r, n, i) <= 0, vn;
}
var gn, fi;
function co() {
  if (fi) return gn;
  fi = 1;
  const e = io(), t = oo(), r = Rr(), n = xn(), i = Bn(), s = Jn();
  return gn = (o, u, l, a) => {
    switch (u) {
      case "===":
        return typeof o == "object" && (o = o.version), typeof l == "object" && (l = l.version), o === l;
      case "!==":
        return typeof o == "object" && (o = o.version), typeof l == "object" && (l = l.version), o !== l;
      case "":
      case "=":
      case "==":
        return e(o, l, a);
      case "!=":
        return t(o, l, a);
      case ">":
        return r(o, l, a);
      case ">=":
        return n(o, l, a);
      case "<":
        return i(o, l, a);
      case "<=":
        return s(o, l, a);
      default:
        throw new TypeError(`Invalid operator: ${u}`);
    }
  }, gn;
}
var $n, di;
function Ll() {
  if (di) return $n;
  di = 1;
  const e = pe(), t = tt(), { safeRe: r, t: n } = dt();
  return $n = (s, c) => {
    if (s instanceof e)
      return s;
    if (typeof s == "number" && (s = String(s)), typeof s != "string")
      return null;
    c = c || {};
    let o = null;
    if (!c.rtl)
      o = s.match(c.includePrerelease ? r[n.COERCEFULL] : r[n.COERCE]);
    else {
      const y = c.includePrerelease ? r[n.COERCERTLFULL] : r[n.COERCERTL];
      let w;
      for (; (w = y.exec(s)) && (!o || o.index + o[0].length !== s.length); )
        (!o || w.index + w[0].length !== o.index + o[0].length) && (o = w), y.lastIndex = w.index + w[1].length + w[2].length;
      y.lastIndex = -1;
    }
    if (o === null)
      return null;
    const u = o[2], l = o[3] || "0", a = o[4] || "0", g = c.includePrerelease && o[5] ? `-${o[5]}` : "", d = c.includePrerelease && o[6] ? `+${o[6]}` : "";
    return t(`${u}.${l}.${a}${g}${d}`, c);
  }, $n;
}
var _n, hi;
function Ml() {
  if (hi) return _n;
  hi = 1;
  class e {
    constructor() {
      this.max = 1e3, this.map = /* @__PURE__ */ new Map();
    }
    get(r) {
      const n = this.map.get(r);
      if (n !== void 0)
        return this.map.delete(r), this.map.set(r, n), n;
    }
    delete(r) {
      return this.map.delete(r);
    }
    set(r, n) {
      if (!this.delete(r) && n !== void 0) {
        if (this.map.size >= this.max) {
          const s = this.map.keys().next().value;
          this.delete(s);
        }
        this.map.set(r, n);
      }
      return this;
    }
  }
  return _n = e, _n;
}
var En, mi;
function Ie() {
  if (mi) return En;
  mi = 1;
  const e = /\s+/g;
  class t {
    constructor(D, X) {
      if (X = i(X), D instanceof t)
        return D.loose === !!X.loose && D.includePrerelease === !!X.includePrerelease ? D : new t(D.raw, X);
      if (D instanceof s)
        return this.raw = D.value, this.set = [[D]], this.formatted = void 0, this;
      if (this.options = X, this.loose = !!X.loose, this.includePrerelease = !!X.includePrerelease, this.raw = D.trim().replace(e, " "), this.set = this.raw.split("||").map((K) => this.parseRange(K.trim())).filter((K) => K.length), !this.set.length)
        throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
      if (this.set.length > 1) {
        const K = this.set[0];
        if (this.set = this.set.filter((U) => !_(U[0])), this.set.length === 0)
          this.set = [K];
        else if (this.set.length > 1) {
          for (const U of this.set)
            if (U.length === 1 && h(U[0])) {
              this.set = [U];
              break;
            }
        }
      }
      this.formatted = void 0;
    }
    get range() {
      if (this.formatted === void 0) {
        this.formatted = "";
        for (let D = 0; D < this.set.length; D++) {
          D > 0 && (this.formatted += "||");
          const X = this.set[D];
          for (let K = 0; K < X.length; K++)
            K > 0 && (this.formatted += " "), this.formatted += X[K].toString().trim();
        }
      }
      return this.formatted;
    }
    format() {
      return this.range;
    }
    toString() {
      return this.range;
    }
    parseRange(D) {
      const K = ((this.options.includePrerelease && y) | (this.options.loose && w)) + ":" + D, U = n.get(K);
      if (U)
        return U;
      const H = this.options.loose, q = H ? u[l.HYPHENRANGELOOSE] : u[l.HYPHENRANGE];
      D = D.replace(q, F(this.options.includePrerelease)), c("hyphen replace", D), D = D.replace(u[l.COMPARATORTRIM], a), c("comparator trim", D), D = D.replace(u[l.TILDETRIM], g), c("tilde trim", D), D = D.replace(u[l.CARETTRIM], d), c("caret trim", D);
      let P = D.split(" ").map((R) => f(R, this.options)).join(" ").split(/\s+/).map((R) => C(R, this.options));
      H && (P = P.filter((R) => (c("loose invalid filter", R, this.options), !!R.match(u[l.COMPARATORLOOSE])))), c("range list", P);
      const j = /* @__PURE__ */ new Map(), I = P.map((R) => new s(R, this.options));
      for (const R of I) {
        if (_(R))
          return [R];
        j.set(R.value, R);
      }
      j.size > 1 && j.has("") && j.delete("");
      const $ = [...j.values()];
      return n.set(K, $), $;
    }
    intersects(D, X) {
      if (!(D instanceof t))
        throw new TypeError("a Range is required");
      return this.set.some((K) => v(K, X) && D.set.some((U) => v(U, X) && K.every((H) => U.every((q) => H.intersects(q, X)))));
    }
    // if ANY of the sets match ALL of its comparators, then pass
    test(D) {
      if (!D)
        return !1;
      if (typeof D == "string")
        try {
          D = new o(D, this.options);
        } catch {
          return !1;
        }
      for (let X = 0; X < this.set.length; X++)
        if (G(this.set[X], D, this.options))
          return !0;
      return !1;
    }
  }
  En = t;
  const r = Ml(), n = new r(), i = Xn(), s = Pr(), c = br(), o = pe(), {
    safeRe: u,
    t: l,
    comparatorTrimReplace: a,
    tildeTrimReplace: g,
    caretTrimReplace: d
  } = dt(), { FLAG_INCLUDE_PRERELEASE: y, FLAG_LOOSE: w } = Sr(), _ = (A) => A.value === "<0.0.0-0", h = (A) => A.value === "", v = (A, D) => {
    let X = !0;
    const K = A.slice();
    let U = K.pop();
    for (; X && K.length; )
      X = K.every((H) => U.intersects(H, D)), U = K.pop();
    return X;
  }, f = (A, D) => (A = A.replace(u[l.BUILD], ""), c("comp", A, D), A = E(A, D), c("caret", A), A = S(A, D), c("tildes", A), A = O(A, D), c("xrange", A), A = z(A, D), c("stars", A), A), p = (A) => !A || A.toLowerCase() === "x" || A === "*", S = (A, D) => A.trim().split(/\s+/).map((X) => m(X, D)).join(" "), m = (A, D) => {
    const X = D.loose ? u[l.TILDELOOSE] : u[l.TILDE];
    return A.replace(X, (K, U, H, q, P) => {
      c("tilde", A, K, U, H, q, P);
      let j;
      return p(U) ? j = "" : p(H) ? j = `>=${U}.0.0 <${+U + 1}.0.0-0` : p(q) ? j = `>=${U}.${H}.0 <${U}.${+H + 1}.0-0` : P ? (c("replaceTilde pr", P), j = `>=${U}.${H}.${q}-${P} <${U}.${+H + 1}.0-0`) : j = `>=${U}.${H}.${q} <${U}.${+H + 1}.0-0`, c("tilde return", j), j;
    });
  }, E = (A, D) => A.trim().split(/\s+/).map((X) => b(X, D)).join(" "), b = (A, D) => {
    c("caret", A, D);
    const X = D.loose ? u[l.CARETLOOSE] : u[l.CARET], K = D.includePrerelease ? "-0" : "";
    return A.replace(X, (U, H, q, P, j) => {
      c("caret", A, U, H, q, P, j);
      let I;
      return p(H) ? I = "" : p(q) ? I = `>=${H}.0.0${K} <${+H + 1}.0.0-0` : p(P) ? H === "0" ? I = `>=${H}.${q}.0${K} <${H}.${+q + 1}.0-0` : I = `>=${H}.${q}.0${K} <${+H + 1}.0.0-0` : j ? (c("replaceCaret pr", j), H === "0" ? q === "0" ? I = `>=${H}.${q}.${P}-${j} <${H}.${q}.${+P + 1}-0` : I = `>=${H}.${q}.${P}-${j} <${H}.${+q + 1}.0-0` : I = `>=${H}.${q}.${P}-${j} <${+H + 1}.0.0-0`) : (c("no pr"), H === "0" ? q === "0" ? I = `>=${H}.${q}.${P}${K} <${H}.${q}.${+P + 1}-0` : I = `>=${H}.${q}.${P}${K} <${H}.${+q + 1}.0-0` : I = `>=${H}.${q}.${P} <${+H + 1}.0.0-0`), c("caret return", I), I;
    });
  }, O = (A, D) => (c("replaceXRanges", A, D), A.split(/\s+/).map((X) => M(X, D)).join(" ")), M = (A, D) => {
    A = A.trim();
    const X = D.loose ? u[l.XRANGELOOSE] : u[l.XRANGE];
    return A.replace(X, (K, U, H, q, P, j) => {
      c("xRange", A, K, U, H, q, P, j);
      const I = p(H), $ = I || p(q), R = $ || p(P), k = R;
      return U === "=" && k && (U = ""), j = D.includePrerelease ? "-0" : "", I ? U === ">" || U === "<" ? K = "<0.0.0-0" : K = "*" : U && k ? ($ && (q = 0), P = 0, U === ">" ? (U = ">=", $ ? (H = +H + 1, q = 0, P = 0) : (q = +q + 1, P = 0)) : U === "<=" && (U = "<", $ ? H = +H + 1 : q = +q + 1), U === "<" && (j = "-0"), K = `${U + H}.${q}.${P}${j}`) : $ ? K = `>=${H}.0.0${j} <${+H + 1}.0.0-0` : R && (K = `>=${H}.${q}.0${j} <${H}.${+q + 1}.0-0`), c("xRange return", K), K;
    });
  }, z = (A, D) => (c("replaceStars", A, D), A.trim().replace(u[l.STAR], "")), C = (A, D) => (c("replaceGTE0", A, D), A.trim().replace(u[D.includePrerelease ? l.GTE0PRE : l.GTE0], "")), F = (A) => (D, X, K, U, H, q, P, j, I, $, R, k) => (p(K) ? X = "" : p(U) ? X = `>=${K}.0.0${A ? "-0" : ""}` : p(H) ? X = `>=${K}.${U}.0${A ? "-0" : ""}` : q ? X = `>=${X}` : X = `>=${X}${A ? "-0" : ""}`, p(I) ? j = "" : p($) ? j = `<${+I + 1}.0.0-0` : p(R) ? j = `<${I}.${+$ + 1}.0-0` : k ? j = `<=${I}.${$}.${R}-${k}` : A ? j = `<${I}.${$}.${+R + 1}-0` : j = `<=${j}`, `${X} ${j}`.trim()), G = (A, D, X) => {
    for (let K = 0; K < A.length; K++)
      if (!A[K].test(D))
        return !1;
    if (D.prerelease.length && !X.includePrerelease) {
      for (let K = 0; K < A.length; K++)
        if (c(A[K].semver), A[K].semver !== s.ANY && A[K].semver.prerelease.length > 0) {
          const U = A[K].semver;
          if (U.major === D.major && U.minor === D.minor && U.patch === D.patch)
            return !0;
        }
      return !1;
    }
    return !0;
  };
  return En;
}
var wn, pi;
function Pr() {
  if (pi) return wn;
  pi = 1;
  const e = Symbol("SemVer ANY");
  class t {
    static get ANY() {
      return e;
    }
    constructor(a, g) {
      if (g = r(g), a instanceof t) {
        if (a.loose === !!g.loose)
          return a;
        a = a.value;
      }
      a = a.trim().split(/\s+/).join(" "), c("comparator", a, g), this.options = g, this.loose = !!g.loose, this.parse(a), this.semver === e ? this.value = "" : this.value = this.operator + this.semver.version, c("comp", this);
    }
    parse(a) {
      const g = this.options.loose ? n[i.COMPARATORLOOSE] : n[i.COMPARATOR], d = a.match(g);
      if (!d)
        throw new TypeError(`Invalid comparator: ${a}`);
      this.operator = d[1] !== void 0 ? d[1] : "", this.operator === "=" && (this.operator = ""), d[2] ? this.semver = new o(d[2], this.options.loose) : this.semver = e;
    }
    toString() {
      return this.value;
    }
    test(a) {
      if (c("Comparator.test", a, this.options.loose), this.semver === e || a === e)
        return !0;
      if (typeof a == "string")
        try {
          a = new o(a, this.options);
        } catch {
          return !1;
        }
      return s(a, this.operator, this.semver, this.options);
    }
    intersects(a, g) {
      if (!(a instanceof t))
        throw new TypeError("a Comparator is required");
      return this.operator === "" ? this.value === "" ? !0 : new u(a.value, g).test(this.value) : a.operator === "" ? a.value === "" ? !0 : new u(this.value, g).test(a.semver) : (g = r(g), g.includePrerelease && (this.value === "<0.0.0-0" || a.value === "<0.0.0-0") || !g.includePrerelease && (this.value.startsWith("<0.0.0") || a.value.startsWith("<0.0.0")) ? !1 : !!(this.operator.startsWith(">") && a.operator.startsWith(">") || this.operator.startsWith("<") && a.operator.startsWith("<") || this.semver.version === a.semver.version && this.operator.includes("=") && a.operator.includes("=") || s(this.semver, "<", a.semver, g) && this.operator.startsWith(">") && a.operator.startsWith("<") || s(this.semver, ">", a.semver, g) && this.operator.startsWith("<") && a.operator.startsWith(">")));
    }
  }
  wn = t;
  const r = Xn(), { safeRe: n, t: i } = dt(), s = co(), c = br(), o = pe(), u = Ie();
  return wn;
}
var Sn, yi;
function Ir() {
  if (yi) return Sn;
  yi = 1;
  const e = Ie();
  return Sn = (r, n, i) => {
    try {
      n = new e(n, i);
    } catch {
      return !1;
    }
    return n.test(r);
  }, Sn;
}
var bn, vi;
function Vl() {
  if (vi) return bn;
  vi = 1;
  const e = Ie();
  return bn = (r, n) => new e(r, n).set.map((i) => i.map((s) => s.value).join(" ").trim().split(" ")), bn;
}
var Rn, gi;
function Fl() {
  if (gi) return Rn;
  gi = 1;
  const e = pe(), t = Ie();
  return Rn = (n, i, s) => {
    let c = null, o = null, u = null;
    try {
      u = new t(i, s);
    } catch {
      return null;
    }
    return n.forEach((l) => {
      u.test(l) && (!c || o.compare(l) === -1) && (c = l, o = new e(c, s));
    }), c;
  }, Rn;
}
var Pn, $i;
function Ul() {
  if ($i) return Pn;
  $i = 1;
  const e = pe(), t = Ie();
  return Pn = (n, i, s) => {
    let c = null, o = null, u = null;
    try {
      u = new t(i, s);
    } catch {
      return null;
    }
    return n.forEach((l) => {
      u.test(l) && (!c || o.compare(l) === 1) && (c = l, o = new e(c, s));
    }), c;
  }, Pn;
}
var In, _i;
function zl() {
  if (_i) return In;
  _i = 1;
  const e = pe(), t = Ie(), r = Rr();
  return In = (i, s) => {
    i = new t(i, s);
    let c = new e("0.0.0");
    if (i.test(c) || (c = new e("0.0.0-0"), i.test(c)))
      return c;
    c = null;
    for (let o = 0; o < i.set.length; ++o) {
      const u = i.set[o];
      let l = null;
      u.forEach((a) => {
        const g = new e(a.semver.version);
        switch (a.operator) {
          case ">":
            g.prerelease.length === 0 ? g.patch++ : g.prerelease.push(0), g.raw = g.format();
          /* fallthrough */
          case "":
          case ">=":
            (!l || r(g, l)) && (l = g);
            break;
          case "<":
          case "<=":
            break;
          /* istanbul ignore next */
          default:
            throw new Error(`Unexpected operation: ${a.operator}`);
        }
      }), l && (!c || r(c, l)) && (c = l);
    }
    return c && i.test(c) ? c : null;
  }, In;
}
var Nn, Ei;
function Gl() {
  if (Ei) return Nn;
  Ei = 1;
  const e = Ie();
  return Nn = (r, n) => {
    try {
      return new e(r, n).range || "*";
    } catch {
      return null;
    }
  }, Nn;
}
var On, wi;
function Yn() {
  if (wi) return On;
  wi = 1;
  const e = pe(), t = Pr(), { ANY: r } = t, n = Ie(), i = Ir(), s = Rr(), c = Bn(), o = Jn(), u = xn();
  return On = (a, g, d, y) => {
    a = new e(a, y), g = new n(g, y);
    let w, _, h, v, f;
    switch (d) {
      case ">":
        w = s, _ = o, h = c, v = ">", f = ">=";
        break;
      case "<":
        w = c, _ = u, h = s, v = "<", f = "<=";
        break;
      default:
        throw new TypeError('Must provide a hilo val of "<" or ">"');
    }
    if (i(a, g, y))
      return !1;
    for (let p = 0; p < g.set.length; ++p) {
      const S = g.set[p];
      let m = null, E = null;
      if (S.forEach((b) => {
        b.semver === r && (b = new t(">=0.0.0")), m = m || b, E = E || b, w(b.semver, m.semver, y) ? m = b : h(b.semver, E.semver, y) && (E = b);
      }), m.operator === v || m.operator === f || (!E.operator || E.operator === v) && _(a, E.semver))
        return !1;
      if (E.operator === f && h(a, E.semver))
        return !1;
    }
    return !0;
  }, On;
}
var Tn, Si;
function Kl() {
  if (Si) return Tn;
  Si = 1;
  const e = Yn();
  return Tn = (r, n, i) => e(r, n, ">", i), Tn;
}
var jn, bi;
function Hl() {
  if (bi) return jn;
  bi = 1;
  const e = Yn();
  return jn = (r, n, i) => e(r, n, "<", i), jn;
}
var An, Ri;
function Xl() {
  if (Ri) return An;
  Ri = 1;
  const e = Ie();
  return An = (r, n, i) => (r = new e(r, i), n = new e(n, i), r.intersects(n, i)), An;
}
var qn, Pi;
function Wl() {
  if (Pi) return qn;
  Pi = 1;
  const e = Ir(), t = Pe();
  return qn = (r, n, i) => {
    const s = [];
    let c = null, o = null;
    const u = r.sort((d, y) => t(d, y, i));
    for (const d of u)
      e(d, n, i) ? (o = d, c || (c = d)) : (o && s.push([c, o]), o = null, c = null);
    c && s.push([c, null]);
    const l = [];
    for (const [d, y] of s)
      d === y ? l.push(d) : !y && d === u[0] ? l.push("*") : y ? d === u[0] ? l.push(`<=${y}`) : l.push(`${d} - ${y}`) : l.push(`>=${d}`);
    const a = l.join(" || "), g = typeof n.raw == "string" ? n.raw : String(n);
    return a.length < g.length ? a : n;
  }, qn;
}
var kn, Ii;
function Bl() {
  if (Ii) return kn;
  Ii = 1;
  const e = Ie(), t = Pr(), { ANY: r } = t, n = Ir(), i = Pe(), s = (g, d, y = {}) => {
    if (g === d)
      return !0;
    g = new e(g, y), d = new e(d, y);
    let w = !1;
    e: for (const _ of g.set) {
      for (const h of d.set) {
        const v = u(_, h, y);
        if (w = w || v !== null, v)
          continue e;
      }
      if (w)
        return !1;
    }
    return !0;
  }, c = [new t(">=0.0.0-0")], o = [new t(">=0.0.0")], u = (g, d, y) => {
    if (g === d)
      return !0;
    if (g.length === 1 && g[0].semver === r) {
      if (d.length === 1 && d[0].semver === r)
        return !0;
      y.includePrerelease ? g = c : g = o;
    }
    if (d.length === 1 && d[0].semver === r) {
      if (y.includePrerelease)
        return !0;
      d = o;
    }
    const w = /* @__PURE__ */ new Set();
    let _, h;
    for (const O of g)
      O.operator === ">" || O.operator === ">=" ? _ = l(_, O, y) : O.operator === "<" || O.operator === "<=" ? h = a(h, O, y) : w.add(O.semver);
    if (w.size > 1)
      return null;
    let v;
    if (_ && h) {
      if (v = i(_.semver, h.semver, y), v > 0)
        return null;
      if (v === 0 && (_.operator !== ">=" || h.operator !== "<="))
        return null;
    }
    for (const O of w) {
      if (_ && !n(O, String(_), y) || h && !n(O, String(h), y))
        return null;
      for (const M of d)
        if (!n(O, String(M), y))
          return !1;
      return !0;
    }
    let f, p, S, m, E = h && !y.includePrerelease && h.semver.prerelease.length ? h.semver : !1, b = _ && !y.includePrerelease && _.semver.prerelease.length ? _.semver : !1;
    E && E.prerelease.length === 1 && h.operator === "<" && E.prerelease[0] === 0 && (E = !1);
    for (const O of d) {
      if (m = m || O.operator === ">" || O.operator === ">=", S = S || O.operator === "<" || O.operator === "<=", _) {
        if (b && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === b.major && O.semver.minor === b.minor && O.semver.patch === b.patch && (b = !1), O.operator === ">" || O.operator === ">=") {
          if (f = l(_, O, y), f === O && f !== _)
            return !1;
        } else if (_.operator === ">=" && !n(_.semver, String(O), y))
          return !1;
      }
      if (h) {
        if (E && O.semver.prerelease && O.semver.prerelease.length && O.semver.major === E.major && O.semver.minor === E.minor && O.semver.patch === E.patch && (E = !1), O.operator === "<" || O.operator === "<=") {
          if (p = a(h, O, y), p === O && p !== h)
            return !1;
        } else if (h.operator === "<=" && !n(h.semver, String(O), y))
          return !1;
      }
      if (!O.operator && (h || _) && v !== 0)
        return !1;
    }
    return !(_ && S && !h && v !== 0 || h && m && !_ && v !== 0 || b || E);
  }, l = (g, d, y) => {
    if (!g)
      return d;
    const w = i(g.semver, d.semver, y);
    return w > 0 ? g : w < 0 || d.operator === ">" && g.operator === ">=" ? d : g;
  }, a = (g, d, y) => {
    if (!g)
      return d;
    const w = i(g.semver, d.semver, y);
    return w < 0 ? g : w > 0 || d.operator === "<" && g.operator === "<=" ? d : g;
  };
  return kn = s, kn;
}
var Cn, Ni;
function xl() {
  if (Ni) return Cn;
  Ni = 1;
  const e = dt(), t = Sr(), r = pe(), n = ao(), i = tt(), s = Rl(), c = Pl(), o = Il(), u = Nl(), l = Ol(), a = Tl(), g = jl(), d = Al(), y = Pe(), w = ql(), _ = kl(), h = Wn(), v = Cl(), f = Dl(), p = Rr(), S = Bn(), m = io(), E = oo(), b = xn(), O = Jn(), M = co(), z = Ll(), C = Pr(), F = Ie(), G = Ir(), A = Vl(), D = Fl(), X = Ul(), K = zl(), U = Gl(), H = Yn(), q = Kl(), P = Hl(), j = Xl(), I = Wl(), $ = Bl();
  return Cn = {
    parse: i,
    valid: s,
    clean: c,
    inc: o,
    diff: u,
    major: l,
    minor: a,
    patch: g,
    prerelease: d,
    compare: y,
    rcompare: w,
    compareLoose: _,
    compareBuild: h,
    sort: v,
    rsort: f,
    gt: p,
    lt: S,
    eq: m,
    neq: E,
    gte: b,
    lte: O,
    cmp: M,
    coerce: z,
    Comparator: C,
    Range: F,
    satisfies: G,
    toComparators: A,
    maxSatisfying: D,
    minSatisfying: X,
    minVersion: K,
    validRange: U,
    outside: H,
    gtr: q,
    ltr: P,
    intersects: j,
    simplifyRange: I,
    subset: $,
    SemVer: r,
    re: e.re,
    src: e.src,
    tokens: e.t,
    SEMVER_SPEC_VERSION: t.SEMVER_SPEC_VERSION,
    RELEASE_TYPES: t.RELEASE_TYPES,
    compareIdentifiers: n.compareIdentifiers,
    rcompareIdentifiers: n.rcompareIdentifiers
  }, Cn;
}
var Jl = xl();
const Ye = /* @__PURE__ */ zi(Jl), Yl = Object.prototype.toString, Zl = "[object Uint8Array]", Ql = "[object ArrayBuffer]";
function uo(e, t, r) {
  return e ? e.constructor === t ? !0 : Yl.call(e) === r : !1;
}
function lo(e) {
  return uo(e, Uint8Array, Zl);
}
function ef(e) {
  return uo(e, ArrayBuffer, Ql);
}
function tf(e) {
  return lo(e) || ef(e);
}
function rf(e) {
  if (!lo(e))
    throw new TypeError(`Expected \`Uint8Array\`, got \`${typeof e}\``);
}
function nf(e) {
  if (!tf(e))
    throw new TypeError(`Expected \`Uint8Array\` or \`ArrayBuffer\`, got \`${typeof e}\``);
}
function Oi(e, t) {
  if (e.length === 0)
    return new Uint8Array(0);
  t ?? (t = e.reduce((i, s) => i + s.length, 0));
  const r = new Uint8Array(t);
  let n = 0;
  for (const i of e)
    rf(i), r.set(i, n), n += i.length;
  return r;
}
const hr = {
  utf8: new globalThis.TextDecoder("utf8")
};
function Ti(e, t = "utf8") {
  return nf(e), hr[t] ?? (hr[t] = new globalThis.TextDecoder(t)), hr[t].decode(e);
}
function sf(e) {
  if (typeof e != "string")
    throw new TypeError(`Expected \`string\`, got \`${typeof e}\``);
}
const af = new globalThis.TextEncoder();
function Dn(e) {
  return sf(e), af.encode(e);
}
Array.from({ length: 256 }, (e, t) => t.toString(16).padStart(2, "0"));
const of = yl.default, ji = "aes-256-cbc", Ze = () => /* @__PURE__ */ Object.create(null), cf = (e) => e != null, uf = (e, t) => {
  const r = /* @__PURE__ */ new Set([
    "undefined",
    "symbol",
    "function"
  ]), n = typeof t;
  if (r.has(n))
    throw new TypeError(`Setting a value of type \`${n}\` for key \`${e}\` is not allowed as it's not supported by JSON`);
}, mr = "__internal__", Ln = `${mr}.migrations.version`;
var Fe, Ae, _e, qe;
class lf {
  constructor(t = {}) {
    nt(this, "path");
    nt(this, "events");
    st(this, Fe);
    st(this, Ae);
    st(this, _e);
    st(this, qe, {});
    nt(this, "_deserialize", (t) => JSON.parse(t));
    nt(this, "_serialize", (t) => JSON.stringify(t, void 0, "	"));
    const r = {
      configName: "config",
      fileExtension: "json",
      projectSuffix: "nodejs",
      clearInvalidConfig: !1,
      accessPropertiesByDotNotation: !0,
      configFileMode: 438,
      ...t
    };
    if (!r.cwd) {
      if (!r.projectName)
        throw new Error("Please specify the `projectName` option.");
      r.cwd = Po(r.projectName, { suffix: r.projectSuffix }).config;
    }
    if (at(this, _e, r), r.schema ?? r.ajvOptions ?? r.rootSchema) {
      if (r.schema && typeof r.schema != "object")
        throw new TypeError("The `schema` option must be an object.");
      const c = new rl.Ajv2020({
        allErrors: !0,
        useDefaults: !0,
        ...r.ajvOptions
      });
      of(c);
      const o = {
        ...r.rootSchema,
        type: "object",
        properties: r.schema
      };
      at(this, Fe, c.compile(o));
      for (const [u, l] of Object.entries(r.schema ?? {}))
        l != null && l.default && (ae(this, qe)[u] = l.default);
    }
    r.defaults && at(this, qe, {
      ...ae(this, qe),
      ...r.defaults
    }), r.serialize && (this._serialize = r.serialize), r.deserialize && (this._deserialize = r.deserialize), this.events = new EventTarget(), at(this, Ae, r.encryptionKey);
    const n = r.fileExtension ? `.${r.fileExtension}` : "";
    this.path = se.resolve(r.cwd, `${r.configName ?? "config"}${n}`);
    const i = this.store, s = Object.assign(Ze(), r.defaults, i);
    if (r.migrations) {
      if (!r.projectVersion)
        throw new Error("Please specify the `projectVersion` option.");
      this._migrate(r.migrations, r.projectVersion, r.beforeEachMigration);
    }
    this._validate(s);
    try {
      go.deepEqual(i, s);
    } catch {
      this.store = s;
    }
    r.watch && this._watch();
  }
  get(t, r) {
    if (ae(this, _e).accessPropertiesByDotNotation)
      return this._get(t, r);
    const { store: n } = this;
    return t in n ? n[t] : r;
  }
  set(t, r) {
    if (typeof t != "string" && typeof t != "object")
      throw new TypeError(`Expected \`key\` to be of type \`string\` or \`object\`, got ${typeof t}`);
    if (typeof t != "object" && r === void 0)
      throw new TypeError("Use `delete()` to clear values");
    if (this._containsReservedKey(t))
      throw new TypeError(`Please don't use the ${mr} key, as it's used to manage this module internal operations.`);
    const { store: n } = this, i = (s, c) => {
      uf(s, c), ae(this, _e).accessPropertiesByDotNotation ? rs(n, s, c) : n[s] = c;
    };
    if (typeof t == "object") {
      const s = t;
      for (const [c, o] of Object.entries(s))
        i(c, o);
    } else
      i(t, r);
    this.store = n;
  }
  has(t) {
    return ae(this, _e).accessPropertiesByDotNotation ? wo(this.store, t) : t in this.store;
  }
  /**
      Reset items to their default values, as defined by the `defaults` or `schema` option.
  
      @see `clear()` to reset all items.
  
      @param keys - The keys of the items to reset.
      */
  reset(...t) {
    for (const r of t)
      cf(ae(this, qe)[r]) && this.set(r, ae(this, qe)[r]);
  }
  delete(t) {
    const { store: r } = this;
    ae(this, _e).accessPropertiesByDotNotation ? Eo(r, t) : delete r[t], this.store = r;
  }
  /**
      Delete all items.
  
      This resets known items to their default values, if defined by the `defaults` or `schema` option.
      */
  clear() {
    this.store = Ze();
    for (const t of Object.keys(ae(this, qe)))
      this.reset(t);
  }
  onDidChange(t, r) {
    if (typeof t != "string")
      throw new TypeError(`Expected \`key\` to be of type \`string\`, got ${typeof t}`);
    if (typeof r != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof r}`);
    return this._handleChange(() => this.get(t), r);
  }
  /**
      Watches the whole config object, calling `callback` on any changes.
  
      @param callback - A callback function that is called on any changes. When a `key` is first set `oldValue` will be `undefined`, and when a key is deleted `newValue` will be `undefined`.
      @returns A function, that when called, will unsubscribe.
      */
  onDidAnyChange(t) {
    if (typeof t != "function")
      throw new TypeError(`Expected \`callback\` to be of type \`function\`, got ${typeof t}`);
    return this._handleChange(() => this.store, t);
  }
  get size() {
    return Object.keys(this.store).length;
  }
  /**
      Get all the config as an object or replace the current config with an object.
  
      @example
      ```
      console.log(config.store);
      //=> {name: 'John', age: 30}
      ```
  
      @example
      ```
      config.store = {
          hello: 'world'
      };
      ```
      */
  get store() {
    try {
      const t = Y.readFileSync(this.path, ae(this, Ae) ? null : "utf8"), r = this._encryptData(t), n = this._deserialize(r);
      return this._validate(n), Object.assign(Ze(), n);
    } catch (t) {
      if ((t == null ? void 0 : t.code) === "ENOENT")
        return this._ensureDirectory(), Ze();
      if (ae(this, _e).clearInvalidConfig && t.name === "SyntaxError")
        return Ze();
      throw t;
    }
  }
  set store(t) {
    this._ensureDirectory(), this._validate(t), this._write(t), this.events.dispatchEvent(new Event("change"));
  }
  *[Symbol.iterator]() {
    for (const [t, r] of Object.entries(this.store))
      yield [t, r];
  }
  _encryptData(t) {
    if (!ae(this, Ae))
      return typeof t == "string" ? t : Ti(t);
    try {
      const r = t.slice(0, 16), n = it.pbkdf2Sync(ae(this, Ae), r.toString(), 1e4, 32, "sha512"), i = it.createDecipheriv(ji, n, r), s = t.slice(17), c = typeof s == "string" ? Dn(s) : s;
      return Ti(Oi([i.update(c), i.final()]));
    } catch {
    }
    return t.toString();
  }
  _handleChange(t, r) {
    let n = t();
    const i = () => {
      const s = n, c = t();
      vo(c, s) || (n = c, r.call(this, c, s));
    };
    return this.events.addEventListener("change", i), () => {
      this.events.removeEventListener("change", i);
    };
  }
  _validate(t) {
    if (!ae(this, Fe) || ae(this, Fe).call(this, t) || !ae(this, Fe).errors)
      return;
    const n = ae(this, Fe).errors.map(({ instancePath: i, message: s = "" }) => `\`${i.slice(1)}\` ${s}`);
    throw new Error("Config schema violation: " + n.join("; "));
  }
  _ensureDirectory() {
    Y.mkdirSync(se.dirname(this.path), { recursive: !0 });
  }
  _write(t) {
    let r = this._serialize(t);
    if (ae(this, Ae)) {
      const n = it.randomBytes(16), i = it.pbkdf2Sync(ae(this, Ae), n.toString(), 1e4, 32, "sha512"), s = it.createCipheriv(ji, i, n);
      r = Oi([n, Dn(":"), s.update(Dn(r)), s.final()]);
    }
    if (ie.env.SNAP)
      Y.writeFileSync(this.path, r, { mode: ae(this, _e).configFileMode });
    else
      try {
        Ui(this.path, r, { mode: ae(this, _e).configFileMode });
      } catch (n) {
        if ((n == null ? void 0 : n.code) === "EXDEV") {
          Y.writeFileSync(this.path, r, { mode: ae(this, _e).configFileMode });
          return;
        }
        throw n;
      }
  }
  _watch() {
    this._ensureDirectory(), Y.existsSync(this.path) || this._write(Ze()), ie.platform === "win32" ? Y.watch(this.path, { persistent: !1 }, La(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 100 })) : Y.watchFile(this.path, { persistent: !1 }, La(() => {
      this.events.dispatchEvent(new Event("change"));
    }, { wait: 5e3 }));
  }
  _migrate(t, r, n) {
    let i = this._get(Ln, "0.0.0");
    const s = Object.keys(t).filter((o) => this._shouldPerformMigration(o, i, r));
    let c = { ...this.store };
    for (const o of s)
      try {
        n && n(this, {
          fromVersion: i,
          toVersion: o,
          finalVersion: r,
          versions: s
        });
        const u = t[o];
        u == null || u(this), this._set(Ln, o), i = o, c = { ...this.store };
      } catch (u) {
        throw this.store = c, new Error(`Something went wrong during the migration! Changes applied to the store until this failed migration will be restored. ${u}`);
      }
    (this._isVersionInRangeFormat(i) || !Ye.eq(i, r)) && this._set(Ln, r);
  }
  _containsReservedKey(t) {
    return typeof t == "object" && Object.keys(t)[0] === mr ? !0 : typeof t != "string" ? !1 : ae(this, _e).accessPropertiesByDotNotation ? !!t.startsWith(`${mr}.`) : !1;
  }
  _isVersionInRangeFormat(t) {
    return Ye.clean(t) === null;
  }
  _shouldPerformMigration(t, r, n) {
    return this._isVersionInRangeFormat(t) ? r !== "0.0.0" && Ye.satisfies(r, t) ? !1 : Ye.satisfies(n, t) : !(Ye.lte(t, r) || Ye.gt(t, n));
  }
  _get(t, r) {
    return _o(this.store, t, r);
  }
  _set(t, r) {
    const { store: n } = this;
    rs(n, t, r), this.store = n;
  }
}
Fe = new WeakMap(), Ae = new WeakMap(), _e = new WeakMap(), qe = new WeakMap();
const { app: pr, ipcMain: Vn, shell: ff } = Di;
let Ai = !1;
const qi = () => {
  if (!Vn || !pr)
    throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
  const e = {
    defaultCwd: pr.getPath("userData"),
    appVersion: pr.getVersion()
  };
  return Ai || (Vn.on("electron-store-get-data", (t) => {
    t.returnValue = e;
  }), Ai = !0), e;
};
class df extends lf {
  constructor(t) {
    let r, n;
    if (ie.type === "renderer") {
      const i = Di.ipcRenderer.sendSync("electron-store-get-data");
      if (!i)
        throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
      ({ defaultCwd: r, appVersion: n } = i);
    } else Vn && pr && ({ defaultCwd: r, appVersion: n } = qi());
    t = {
      name: "config",
      ...t
    }, t.projectVersion || (t.projectVersion = n), t.cwd ? t.cwd = se.isAbsolute(t.cwd) ? t.cwd : se.join(r, t.cwd) : t.cwd = r, t.configName = t.name, delete t.name, super(t);
  }
  static initRenderer() {
    qi();
  }
  async openInEditor() {
    const t = await ff.openPath(this.path);
    if (t)
      throw new Error(t);
  }
}
const hf = new df();
let Me = null;
const ki = process.env.VITE_DEV_SERVER_URL;
function Ci() {
  Me = new Li({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: Mn.join(__dirname, "preload.js"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), ki ? (Me.loadURL(ki), Me.webContents.openDevTools()) : Me.loadFile(Mn.join(__dirname, "../dist/index.html")), Me.on("closed", () => {
    Me = null;
  });
}
function mf() {
  process.defaultApp ? process.argv.length >= 2 && Ue.setAsDefaultProtocolClient("operone", process.execPath, [Mn.resolve(process.argv[1])]) : Ue.setAsDefaultProtocolClient("operone");
}
function fo(e) {
  if (!e.startsWith("operone://")) return;
  const t = new URL(e);
  if (t.pathname === "auth" || t.host === "auth") {
    const r = t.searchParams.get("token");
    r && Me && (hf.set("authToken", r), Me.webContents.send("auth-success", { token: r }));
  }
}
Ue.whenReady().then(() => {
  mf(), Ci(), Ue.on("activate", () => {
    Li.getAllWindows().length === 0 && Ci();
  });
});
Ue.on("window-all-closed", () => {
  process.platform !== "darwin" && Ue.quit();
});
Ue.on("open-url", (e, t) => {
  e.preventDefault(), fo(t);
});
if (process.platform === "win32" || process.platform === "linux") {
  const e = process.argv.find((t) => t.startsWith("operone://"));
  e && fo(e);
}
Ue.on("web-contents-created", (e, t) => {
  t.setWindowOpenHandler(({ url: r }) => r.startsWith("http://") || r.startsWith("https://") ? (yo.openExternal(r), { action: "deny" }) : { action: "allow" });
});

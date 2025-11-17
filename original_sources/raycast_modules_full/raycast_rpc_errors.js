function (e, t, r) {
  (Object.defineProperty(r, "__esModule", { value: !0 }),
    (r.InternalError =
      r.InvalidParams =
      r.MethodNotFound =
      r.InvalidRequest =
      r.ParseError =
        void 0));
  class s extends Error {
    data;
    code;
    constructor(e) {
      (super(e), (this.data = e), (this.code = -1));
    }
  }
  ((r.default = s),
    (r.ParseError = class extends s {
      constructor(e) {
        (super(e || "Parse error"),
          (this.data = e),
          (this.code = -32700));
      }
    }),
    (r.InvalidRequest = class extends s {
      constructor(e) {
        (super(e || "Invalid Request"),
          (this.data = e),
          (this.code = -32600));
      }
    }),
    (r.MethodNotFound = class extends s {
      constructor(e) {
        (super(e || "Method not found"),
          (this.data = e),
          (this.code = -32601));
      }
    }),
    (r.InvalidParams = class extends s {
      constructor(e) {
        (super(e || "Invalid params"),
          (this.data = e),
          (this.code = -32602));
      }
    }),
    (r.InternalError = class extends s {
      constructor(e, t) {
        (super(e || "Internal error"),
          (this.data = t),
          (this.code = -32603));
      }
    }));
})

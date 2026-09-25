
/* =========================================================
   WHITEHAT CYBERRANGE
   NATIVE AGENT ANDROID BRIDGE
   ========================================================= */

(() => {
  "use strict";

  const NativeAgent = {

    connected: false,
    transport: "none",
    version: null,
    capabilities: [],
    pending: new Map(),
    requestCounter: 0,

    init() {
      this.detect();
      this.bindAndroidCallbacks();
      return this.getStatus();
    },

    detect() {
      /*
       * Android WebView peut exposer l'agent sous plusieurs
       * formes. On privilégie l'interface JavaScript native.
       */

      if (
        window.AndroidNativeAgent &&
        typeof window.AndroidNativeAgent === "object"
      ) {
        this.connected = true;
        this.transport = "AndroidNativeAgent";
        return;
      }

      if (
        window.NativeAgent &&
        typeof window.NativeAgent === "object"
      ) {
        this.connected = true;
        this.transport = "NativeAgent";
        return;
      }

      /*
       * Interface WebView moderne éventuellement exposée
       * sous window.android.
       */

      if (
        window.android &&
        typeof window.android === "object"
      ) {
        this.connected = true;
        this.transport = "android";
        return;
      }

      this.connected = false;
      this.transport = "none";
    },

    bindAndroidCallbacks() {

      window.__whitehatNativeResponse = (payload) => {

        let data = payload;

        if (typeof payload === "string") {
          try {
            data = JSON.parse(payload);
          } catch {
            data = {
              success: false,
              message: payload
            };
          }
        }

        if (!data || typeof data !== "object") {
          return;
        }

        const requestId = data.requestId;

        if (
          requestId &&
          this.pending.has(requestId)
        ) {
          const request = this.pending.get(requestId);

          this.pending.delete(requestId);

          if (data.success === false) {
            request.reject(
              new Error(
                data.message || "Erreur de l'agent natif."
              )
            );
          } else {
            request.resolve(data.result ?? data);
          }
        }

        document.dispatchEvent(
          new CustomEvent(
            "whitehat:native-response",
            {
              detail: data
            }
          )
        );
      };

      window.__whitehatNativeEvent = (payload) => {

        let data = payload;

        if (typeof payload === "string") {
          try {
            data = JSON.parse(payload);
          } catch {
            data = {
              type: "message",
              message: payload
            };
          }
        }

        document.dispatchEvent(
          new CustomEvent(
            "whitehat:native-event",
            {
              detail: data
            }
          )
        );
      };
    },

    getStatus() {

      this.detect();

      let status = {
        connected: this.connected,
        transport: this.transport,
        version: this.version,
        capabilities: [...this.capabilities]
      };

      if (!this.connected) {
        return status;
      }

      try {

        const agent =
          window.AndroidNativeAgent ||
          window.NativeAgent ||
          window.android;

        if (
          typeof agent.getStatus === "function"
        ) {
          const result = agent.getStatus();

          if (
            result &&
            typeof result === "object"
          ) {
            status = {
              ...status,
              ...result
            };
          }
        }

      } catch (error) {

        console.warn(
          "Native Agent status error:",
          error
        );

      }

      return status;
    },

    call(method, args = {}) {

      return new Promise((resolve, reject) => {

        this.detect();

        if (!this.connected) {

          reject(
            new Error(
              "Agent natif Android non connecté."
            )
          );

          return;
        }

        const agent =
          window.AndroidNativeAgent ||
          window.NativeAgent ||
          window.android;

        if (
          !agent ||
          typeof agent[method] !== "function"
        ) {

          reject(
            new Error(
              `Méthode native indisponible : ${method}`
            )
          );

          return;
        }

        const requestId =
          `wh-${Date.now()}-${++this.requestCounter}`;

        this.pending.set(
          requestId,
          {
            resolve,
            reject
          }
        );

        try {

          const serialized =
            JSON.stringify({
              requestId,
              ...args
            });

          const result =
            agent[method](serialized);

          /*
           * Certains bridges Android retournent directement
           * une chaîne JSON au lieu d'utiliser le callback.
           */

          if (result !== undefined) {

            let parsed = result;

            if (typeof result === "string") {
              try {
                parsed = JSON.parse(result);
              } catch {
                parsed = {
                  success: true,
                  value: result
                };
              }
            }

            this.pending.delete(requestId);

            if (
              parsed &&
              parsed.success === false
            ) {

              reject(
                new Error(
                  parsed.message ||
                  "Erreur native."
                )
              );

            } else {

              resolve(
                parsed?.result ??
                parsed
              );

            }
          }

        } catch (error) {

          this.pending.delete(requestId);

          reject(error);
        }

        setTimeout(() => {

          if (
            this.pending.has(requestId)
          ) {

            this.pending.delete(requestId);

            reject(
              new Error(
                "Délai dépassé pour l'agent natif Android."
              )
            );
          }

        }, 15000);

      });
    },

    async checkAdapter() {
      return this.call("checkAdapter");
    },

    async scanWifi() {
      return this.call("scanWifi");
    },

    async stopScan() {
      return this.call("stopScan");
    },

    async fingerprint(target) {
      return this.call(
        "fingerprint",
        {
          target
        }
      );
    },

    async credentialAudit(target) {
      return this.call(
        "credentialAudit",
        {
          target
        }
      );
    },

    async executeLabAction(
      action,
      target
    ) {

      return this.call(
        "executeLabAction",
        {
          action,
          target
        }
      );
    },

    async getTelemetry() {
      return this.call("getTelemetry");
    }
  };

  window.WhiteHatNativeAgent = NativeAgent;

  document.dispatchEvent(
    new CustomEvent(
      "whitehat:native-ready"
    )
  );

})();




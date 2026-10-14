import React, { useEffect, useRef, useState } from "react";
import { api } from "./api";
import { nativeApp, publicOrigin } from "./native";
import "./google-signin.css";
let scriptPromise, nativeInitialization;
function loadGoogle() {
  if (window.google?.accounts?.id) return Promise.resolve();
  scriptPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = resolve;
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(
        new Error("Google giriş ekranı yüklenemedi. Bağlantını kontrol et."),
      );
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}
async function challenge() {
  const binding = Array.from(crypto.getRandomValues(new Uint8Array(32)), (n) =>
    n.toString(16).padStart(2, "0"),
  ).join("");
  return { ...(await api("google_challenge", { binding })), binding };
}
export default function GoogleSignIn({ onDone, onAvailability }) {
  const container = useRef(null),
    done = useRef(onDone);
  done.current = onDone;
  const [clientId, setClientId] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api("status")
      .then((s) => {
        if (active) {
          const id =
            nativeApp && !s.googleNativeEnabled ? "" : s.googleClientId || "";
          setClientId(id);
          onAvailability?.(!!id);
        }
      })
      .catch((e) => {
        if (active) {
          setClientId("");
          setError(e.message);
        }
      });
    return () => {
      active = false;
    };
  }, []);
  async function finish(token, c) {
    setBusy(true);
    setError("");
    try {
      done.current(
        await api("google_login", {
          idToken: token,
          challengeId: c.challengeId,
          binding: c.binding,
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!clientId || nativeApp) return;
    let active = true;
    (async () => {
      const [c] = await Promise.all([challenge(), loadGoogle()]);
      if (!active || !container.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        nonce: c.nonce,
        auto_select: false,
        context: "signup",
        callback: (r) => {
          if (active) finish(r.credential, c);
        },
      });
      window.google.accounts.id.renderButton(container.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: Math.min(360, container.current.clientWidth || 280),
        locale: "tr",
      });
    })().catch((e) => {
      if (active) setError(e.message);
    });
    return () => {
      active = false;
    };
  }, [clientId, attempt]);
  async function nativeLogin() {
    setBusy(true);
    setError("");
    try {
      const c = await challenge();
      const { SocialLogin } = await import("@capgo/capacitor-social-login");
      nativeInitialization ||= SocialLogin.initialize({
        google: { webClientId: clientId, mode: "online" },
      }).catch((e) => {
        nativeInitialization = null;
        throw e;
      });
      await nativeInitialization;
      const { result } = await SocialLogin.login({
        provider: "google",
        options: {
          nonce: c.nonce,
          scopes: ["openid", "email"],
          filterByAuthorizedAccounts: false,
          autoSelectEnabled: false,
        },
      });
      if (!result.idToken)
        throw new Error("Google girişi tamamlanamadı. Yeniden deneyin.");
      await finish(result.idToken, c);
    } catch (e) {
      setError(
        /cancel/i.test(e.message)
          ? "Giriş iptal edildi."
          : "Google girişi tamamlanamadı. Hesabını ve bağlantını kontrol edip tekrar dene.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (clientId === "" && !error) return null;
  return (
    <section className="google-signin" aria-label="Google ile kayıt ve giriş">
      {clientId === null ? (
        <p role="status">Giriş seçenekleri yükleniyor…</p>
      ) : !clientId ? null : (
        <>
          {nativeApp ? (
            <button
              type="button"
              className="google-native-button"
              onClick={nativeLogin}
              disabled={busy}
            >
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 38.03 46.98 31.87 46.98 24.55Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.78-4.59l-7.98-6.19A23.87 23.87 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                />
              </svg>
              {busy ? "Giriş yapılıyor…" : "Google ile devam et"}
            </button>
          ) : (
            <div
              ref={container}
              className="google-button-slot"
              aria-busy={busy}
            />
          )}
          <p className="google-signin-note">
            İlk girişte hesabın oluşturulur. Gerçek adın yerine takma ad
            kullanabilirsin. 13 yaş ve üzeri.
          </p>
          <a
            href={`${publicOrigin}/privacy.html`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={async (e) => {
              if (!nativeApp) return;
              e.preventDefault();
              try {
                const { Browser } = await import("@capacitor/browser");
                await Browser.open({ url: `${publicOrigin}/privacy.html` });
              } catch {
                setError(
                  "Gizlilik sayfası açılamadı. ailecekeglen.com.tr/privacy.html adresinden ulaşabilirsin.",
                );
              }
            }}
          >
            Gizlilik ve veri kullanımı
          </a>
        </>
      )}
      {error && (
        <div role="alert">
          <p className="account-error">{error}</p>
          {!nativeApp && clientId && (
            <button
              className="text-btn"
              type="button"
              onClick={() => {
                setError("");
                setAttempt((v) => v + 1);
              }}
            >
              Yeniden dene
            </button>
          )}
        </div>
      )}
    </section>
  );
}

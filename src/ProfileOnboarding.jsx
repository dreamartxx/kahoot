import React, { useEffect, useRef, useState } from "react";
import { Settings, ArrowRight, Sparkles } from "lucide-react";
import ProfileIdentity from "./ProfileIdentity";

export default function ProfileOnboarding({ user, onUpdate, onLogout }) {
  const [editing, setEditing] = useState(false);
  const dialog = useRef(null);
  const returnRoute = useRef(location.hash);
  useEffect(() => {
    if (editing) return;
    const element = dialog.current;
    const keepOpen = () => {
      if (element.isConnected && !element.open) element.showModal();
    };
    const preventClose = (event) => event.preventDefault();
    element.addEventListener("cancel", preventClose);
    element.addEventListener("close", keepOpen);
    keepOpen();
    return () => {
      element.removeEventListener("cancel", preventClose);
      element.removeEventListener("close", keepOpen);
    };
  }, [editing]);
  function openSettings() {
    setEditing(true);
    location.hash = "studio/profile";
  }
  return (
    <main className="profile-onboarding">
      {editing ? (
        <>
          <span className="profile-setup-title">
            <Settings size={18} /> Profil ayarları · İlk adım
          </span>
          <ProfileIdentity
            user={user}
            onboarding
            onUpdate={(next) => {
              onUpdate(next);
              location.hash =
                returnRoute.current === "#studio/profile"
                  ? ""
                  : returnRoute.current;
            }}
          />
          <button className="identity-exit" onClick={onLogout}>
            Çıkış yap
          </button>
        </>
      ) : (
        <dialog
          ref={dialog}
          className="profile-setup-dialog"
          aria-labelledby="profile-setup-title"
          onCancel={(e) => e.preventDefault()}
        >
          <span className="profile-setup-icon">
            <Sparkles size={32} />
          </span>
          <h1 id="profile-setup-title">Önce seni tanıyalım!</h1>
          <p>
            Kullanıcı adını ve simgeni <strong>profil ayarlarından</strong>{" "}
            seçebilirsin. Daha sonra istediğin zaman değiştirebilirsin.
          </p>
          <p>Bir kez tamamla; bütün oyunlara bu profilinle katıl.</p>
          <button className="btn full" onClick={openSettings}>
            Profil ayarlarına git <ArrowRight size={19} />
          </button>
          <small>Devam etmek için adını ve simgeni kaydetmelisin.</small>
          <button className="text-btn" onClick={onLogout}>
            Çıkış yap
          </button>
        </dialog>
      )}
    </main>
  );
}

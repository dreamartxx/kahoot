package com.ailecekeglen.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "SecureSession")
public class SecureSessionPlugin extends Plugin {
    private static final String ALIAS = "ailecek-eglen-session-v1";
    private SharedPreferences prefs() { return getContext().getSharedPreferences("secure_session", Context.MODE_PRIVATE); }
    private SecretKey key() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null);
        if (store.containsAlias(ALIAS)) return (SecretKey) store.getKey(ALIAS, null);
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).build());
        return generator.generateKey();
    }
    @PluginMethod public synchronized void get(PluginCall call) {
        String value = prefs().getString("token", ""); String token = "";
        try {
            if (!value.isEmpty()) {
                String[] parts = value.split(":", 2);
                Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
                cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)));
                token = new String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), StandardCharsets.UTF_8);
            }
            if (!token.isEmpty() && !token.matches("[a-f0-9]{64}")) throw new IllegalStateException();
        } catch (Exception e) { prefs().edit().clear().commit(); token = ""; }
        JSObject result = new JSObject(); result.put("token", token); call.resolve(result);
    }
    @PluginMethod public synchronized void set(PluginCall call) {
        String token = call.getString("token", "");
        if (!token.matches("[a-f0-9]{64}")) { call.reject("Geçersiz oturum."); return; }
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key());
            String value = Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP) + ":" + Base64.encodeToString(cipher.doFinal(token.getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP);
            if (!prefs().edit().putString("token", value).commit()) throw new IllegalStateException();
            call.resolve();
        } catch (Exception e) { call.reject("Oturum güvenli olarak kaydedilemedi."); }
    }
    @PluginMethod public synchronized void clear(PluginCall call) {
        if (prefs().edit().clear().commit()) call.resolve(); else call.reject("Oturum kapatılamadı.");
    }
}

"use client";
import { startAuthentication } from "@simplewebauthn/browser";
import { authenticationOptions, verifyAuth } from "./(main)/register/auth";

export default function LoginButton() {
  async function login() {
    const optionsJSON = await authenticationOptions();
    const authResp = await startAuthentication({ optionsJSON });
    const authed = await verifyAuth(authResp);
    if (authed.kind === "ok") {
      alert("Authentication successful!");
      // Reload the page to show the authenticated state
      location.reload();
    } else {
      alert(`Authentication failed: ${authed.error}`);
    }
  }
  return <button onClick={login}>Login</button>;
}

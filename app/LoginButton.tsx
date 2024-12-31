"use client";
import { startAuthentication } from "@simplewebauthn/browser";
import { authenticationOptions, verifyAuth } from "./register/auth";

export default function LoginButton() {
  async function login() {
    const optionsJSON = await authenticationOptions();
    const authResp = await startAuthentication({ optionsJSON });
    const authed = await verifyAuth(authResp);
    if (authed) {
      alert("Authentication successful!");
      // Reload the page to show the authenticated state
      location.reload();
    } else {
      alert("Authentication failed.");
    }
  }
  return <button onClick={login}>Login</button>;
}

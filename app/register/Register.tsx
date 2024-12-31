"use client";
import {
  RegistrationResponseJSON,
  startRegistration,
} from "@simplewebauthn/browser";
import { registrationOptions, verifyRegistration } from "./auth";

export default function LoginButton() {
  async function register(e) {
    e.preventDefault();
    const username = e.target.username.value;
    if (!username) {
      alert("Please enter a username");
      return;
    }
    const optionsJSON = await registrationOptions(username);
    let regResp: RegistrationResponseJSON;
    try {
      regResp = await startRegistration({ optionsJSON });
    } catch (e) {
      if (e.name === "InvalidStateError") {
        alert("Error: Authenticator was probably already registered by user");
      } else {
        alert("Error: " + e.message);
      }
      return;
    }
    const verified = await verifyRegistration(regResp, username);
    if (verified.kind === "ok") {
      alert("Registration successful!");
    } else {
      alert("Error: " + verified.error);
    }
  }

  return (
    <div className="markdown">
      <h1>Register</h1>
      <hr />
      <form onSubmit={register}>
        <p>
          <input type="text" placeholder="Username" name="username" required />
          <input type="submit" value="Register" />
        </p>
      </form>
    </div>
  );
}

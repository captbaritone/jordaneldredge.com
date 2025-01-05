"use client";
import {
  RegistrationResponseJSON,
  startRegistration,
} from "@simplewebauthn/browser";
import { registrationOptions, verifyRegistration } from "./auth";

export default function LoginButton() {
  async function register(e) {
    e.preventDefault();
    const email = e.target.email.value;
    if (!email) {
      alert("Please enter a username");
      return;
    }
    const optionsJSON = await registrationOptions(email);
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
    const verified = await verifyRegistration(regResp, email);
    if (verified.kind === "ok") {
      alert("Registration successful!");
    } else {
      alert("Error: " + verified.error);
    }
  }

  return (
    <div className="markdown">
      <form className="flex flex-col py-4" onSubmit={register}>
        <h1>Register</h1>
        <p>
          Accounts can currently only be created with passkeys. Registering an
          account may (or may not) allow access to additional features.
        </p>
        <div className="flex flex-col bg-gray-100 rounded-lg border border-gray-400">
          <input
            id="email"
            type="email"
            required
            placeholder="Enter your email address"
            className="py-1 px-4 m-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          />
        </div>
        <input
          type="submit"
          value="Create Passkey"
          className="self-end my-4 bg-green-700 active:bg-green-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        />
      </form>
    </div>
  );
}

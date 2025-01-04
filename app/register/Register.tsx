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
      <h1>Register</h1>
      <p>
        Accounts can currently only be created with passkeys. Registering an
        account may (or may not) allow access to additional features.
      </p>
      <div className="w-full max-w-sm pb-6">
        <form onSubmit={register}>
          <div className="mb-4">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Enter your email address"
            />
          </div>
          <div className="flex items-center justify-between">
            <input
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              value="Create Passkey"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

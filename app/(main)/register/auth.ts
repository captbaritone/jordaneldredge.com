"use server";
import {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { getSession } from "../../../lib/session";
import { prepare, sql } from "../../../lib/db";
import { User } from "../../../lib/data/User";

/**
 * Human-readable title for your website
 */
const rpName = "JordanEldredge.com";

/**
 * A unique identifier for your website. 'localhost' is okay for
 * local dev
 */
const _rpID = process.env.WEBAUTHN_RP_ID;
/**
 * The URL at which registrations and authentications should occur.
 * 'http://localhost' and 'http://localhost:PORT' are also valid.
 * Do NOT include any trailing /
 */
const _origin = process.env.WEBAUTHN_ORIGIN;

if (_rpID == null || !_origin) {
  throw new Error("WEBAUTHN_RP_ID and WEBAUTHN_ORIGIN must be set");
}

// Reassign to help with type refinement
const rpID = _rpID;
const origin = _origin;

export async function logout() {
  const session = await getSession();
  session.destroy();
}

export async function authenticationOptions() {
  const options = await generateAuthenticationOptions({
    rpID,
    // https://simplewebauthn.dev/docs/advanced/passkeys#generateauthenticationoptions
    userVerification: "preferred",
    // Require users to use a previously-registered authenticator
    allowCredentials: [],
  });

  const session = await getSession();
  session.challenge = options.challenge;
  await session.save();

  return options;
}

export async function verifyAuth(
  response: AuthenticationResponseJSON,
): Promise<Response> {
  const session = await getSession();
  const challenge = session.challenge;
  if (challenge == null) {
    throw new Error("No challenge found in session");
  }
  session.challenge = undefined;
  await session.save();

  const getPasskeyStmt = prepare<
    [string],
    {
      credential_id: string;
      user_id: number;
      public_key: string;
      sign_count: number;
      transports: string;
    }
  >(sql`
    SELECT
      *
    FROM
      webauthn_credentials
    WHERE
      credential_id = ?
  `);

  const passkey = getPasskeyStmt.get(response.id);
  if (passkey == null) {
    return { kind: "error", error: "Unknown Passkey." };
  }

  // Get user from User model
  const user = User.findById(passkey.user_id);

  if (user == null) {
    throw new Error("No user found for this passkey");
  }

  const verification = await verifyAuthenticationResponse({
    response: response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    credential: {
      id: passkey.credential_id,
      publicKey: new Uint8Array(Buffer.from(passkey.public_key, "base64")),
      counter: passkey.sign_count,
      transports: passkey.transports.split(
        ",",
      ) as AuthenticatorTransportFuture[],
    },
    //https://simplewebauthn.dev/docs/advanced/passkeys#verifyauthenticationresponse
    requireUserVerification: false,
  });

  if (!verification.verified) {
    return { kind: "error", error: "Verification failed" };
  }

  // Update user's last login time using User model
  User.updateLastLogin(passkey.user_id);

  session.username = user.username;
  session.userId = passkey.user_id;

  await session.save();

  return { kind: "ok" };
}

export async function registrationOptions(
  username: string,
): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const session = await getSession();
  // (Pseudocode) Retrieve any of the user's previously-
  // registered authenticators

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userName: username,
    // Don't prompt users for additional information about the authenticator
    // (Recommended for smoother UX)
    attestationType: "none",
    // Prevent users from re-registering existing authenticators
    excludeCredentials: [],
    // See "Guiding use of authenticators via authenticatorSelection" below
    authenticatorSelection: {
      // Defaults
      // Set "required" to force users to use a platform authenticator
      residentKey: "required",
      userVerification: "preferred",
      // Optional
      authenticatorAttachment: "platform",
    },
  });

  session.challenge = options.challenge;

  await session.save();

  return options;
}

export type Response = { kind: "ok" } | { kind: "error"; error: string };

export async function verifyRegistration(
  response: RegistrationResponseJSON,
  username: string,
): Promise<Response> {
  const session = await getSession();

  const challenge = session.challenge;
  if (challenge == null) {
    throw new Error("No challenge found in session");
  }
  session.challenge = undefined;
  await session.save();

  // Check if user already exists using User model
  const existingUser = User.findByUsername(username);
  if (existingUser != null) {
    return {
      kind: "error",
      error: `A user with the name "${username}" already exists. Please try a different username.`,
    };
  }

  const verificationResponse = await verifyRegistrationResponse({
    response: response,
    expectedChallenge: challenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    // https://simplewebauthn.dev/docs/advanced/passkeys#verifyregistrationresponse
    requireUserVerification: false,
  });

  const { registrationInfo } = verificationResponse;
  if (registrationInfo == null) {
    return { kind: "error", error: "No registration info found" };
  }

  if (!verificationResponse.verified) {
    return { kind: "error", error: "Verification failed" };
  }
  const { credential, credentialDeviceType: _credentialDeviceType, credentialBackedUp: _credentialBackedUp } =
    registrationInfo;

  // Create user using User model
  const newUser = User.create({
    username,
    display_name: username, // For now the display name is the same as the username
  });

  if (!newUser) {
    throw new Error("Failed to create user");
  }

  const insertCredentialStmt = prepare<
    [number, string, string, number, string | undefined],
    void
  >(sql`
    INSERT INTO
      webauthn_credentials (
        user_id,
        credential_id,
        public_key,
        sign_count,
        transports
      )
    VALUES
      (?, ?, ?, ?, ?)
  `);

  insertCredentialStmt.run(
    newUser.id,
    credential.id,
    Buffer.from(credential.publicKey).toString("base64"),
    credential.counter,
    credential.transports?.join(","),
  );

  return { kind: "ok" };
}

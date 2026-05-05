import { Command } from "commander";
import { setToken, getBaseUrl } from "../config";
import { info } from "../output";
import { EXIT_AUTH, EXIT_API } from "../graphql";

export const loginCommand = new Command("login")
  .description("Authenticate via browser")
  .action(async () => {
    const base = getBaseUrl();
    info("Requesting authorization code...");

    const res = await fetch(`${base}/api/auth/cli/`, { method: "POST" });
    if (!res.ok) {
      info("Failed to initiate login");
      process.exit(EXIT_API);
    }

    const { code } = await res.json();
    const auth_url = `${base}/auth/cli/${code}`;

    info(`\nOpen this URL in your browser to authorize:\n`);
    info(`  ${auth_url}\n`);
    info("Waiting for approval...");

    // Try to open the browser
    const { spawn } = await import("child_process");
    try {
      spawn("open", [auth_url], { stdio: "ignore", detached: true }).unref();
    } catch {
      // Ignore if we can't open the browser
    }

    // Poll for approval
    for (let i = 0; i < 120; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const statusRes = await fetch(
        `${base}/api/auth/cli/status/?code=${code}`,
      );
      if (!statusRes.ok) {
        if (statusRes.status === 410) {
          info("Code expired. Please try again.");
          process.exit(EXIT_AUTH);
        }
        continue;
      }

      const data = await statusRes.json();
      if (data.status === "approved" && data.token) {
        setToken(data.token);
        info("Logged in successfully!");
        return;
      }
    }

    info("Timed out waiting for approval.");
    process.exit(EXIT_AUTH);
  });

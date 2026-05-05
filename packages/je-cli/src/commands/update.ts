import { Command } from "commander";
import { getBaseUrl } from "../config";
import { info } from "../output";
import { EXIT_API } from "../graphql";

export const updateCommand = new Command("update")
  .description("Update je to the latest version")
  .action(async () => {
    const base = getBaseUrl();
    info("Downloading install script...");

    const res = await fetch(`${base}/je/install/`);
    if (!res.ok) {
      info("Failed to fetch install script");
      process.exit(EXIT_API);
    }

    const script = await res.text();

    const { spawn } = await import("child_process");
    const child = spawn("bash", ["-s"], {
      stdio: ["pipe", "inherit", "inherit"],
    });
    child.stdin.write(script);
    child.stdin.end();

    await new Promise<void>((resolve, reject) => {
      child.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Install script exited with code ${code}`));
      });
    });
  });

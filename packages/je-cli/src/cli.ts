#!/usr/bin/env bun

import { Command } from "commander";
import { setQuiet } from "./output";
import { loginCommand } from "./commands/login";
import { pasteCommand } from "./commands/paste";
import { contentCommand } from "./commands/content";
import { updateCommand } from "./commands/update";
import { schemaCommand } from "./commands/schema";

const program = new Command()
  .name("je")
  .description("CLI for interacting with jordaneldredge.com")
  .version("0.1.0")
  .option("-q, --quiet", "Suppress informational messages on stderr")
  .hook("preAction", (thisCommand) => {
    setQuiet(thisCommand.opts().quiet ?? false);
  });

program.addCommand(loginCommand);
program.addCommand(pasteCommand);
program.addCommand(contentCommand);
program.addCommand(updateCommand);
program.addCommand(schemaCommand);

program.parse();

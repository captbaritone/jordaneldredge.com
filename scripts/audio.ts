import "dotenv/config";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { Content, ContentConnection } from "../lib/data";
import { execSync } from "child_process";
import { Node } from "unist";
import { CONTINUE, visit } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import TTSAudio from "../lib/data/TTSAudio";
import { VC } from "../lib/VC";
import { db } from "../lib/db";

// Open AI only allows TTS queries with a maximum of 4096 characters.
const MAX_CHAR_LENGTH = 4096;
const MODEL = "tts-1-hd";
const VOICE = "echo";

// A safety net for the scheduled run: if something makes every item look
// changed, we record a handful rather than the whole site. The rest are picked
// up on later runs.
const DEFAULT_MAX_RECORDINGS = 10;

const openai = new OpenAI();
const tempDir = path.resolve("./temp");

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const maxArg = process.argv.find((arg) => arg.startsWith("--max="));
  const maxRecordings = maxArg
    ? parseInt(maxArg.split("=")[1], 10)
    : DEFAULT_MAX_RECORDINGS;

  // Create a VC with admin role for script usage
  const vc = VC.forScripts();

  const allContent = ContentConnection.all(vc, { sort: "latest", filters: [] });
  let recorded = 0;
  let failed = 0;
  let pending = 0;
  for (const content of allContent) {
    // Drafts change often and aren't public, so recording them is wasted.
    if (content.isDraft()) {
      continue;
    }
    if (
      content.slug() ===
      "barbershop-multi-track-wholl-take-my-place-when-im-gone"
    ) {
      continue;
    }
    const writer = new ScriptWriter(vc);
    const sections = writer.script(content);
    const textHash = hashScript(sections);
    const ttsAudio = content.ttsAudio();
    if (ttsAudio != null) {
      const existingHash = GET_TTS_HASH.get({
        contentId: parseInt(content.id(), 10),
      })?.text_hash;
      if (existingHash === textHash) {
        continue;
      }
      // Audio recorded before we tracked hashes. If it's newer than the last
      // edit, assume it matches the current text and adopt the hash rather
      // than paying to record it again.
      if (
        existingHash == null &&
        ttsAudio.lastUpdated() > content.lastModified()
      ) {
        console.log(`Adopting existing audio for ${content.slug()}`);
        if (!dryRun) {
          SET_TTS_HASH.run({ contentId: parseInt(content.id(), 10), textHash });
        }
        continue;
      }
    }
    if (recorded >= maxRecordings) {
      pending++;
      continue;
    }
    recorded++;
    if (dryRun) {
      console.log(`Would record ${content.slug()}`);
      continue;
    }
    try {
      await writer.record(content, sections);
      SET_TTS_HASH.run({ contentId: parseInt(content.id(), 10), textHash });
    } catch (error) {
      failed++;
      console.error(`Failed to record ${content.slug()}:`, error);
    }
  }
  console.log(
    `${dryRun ? "Would record" : "Recorded"} ${recorded - failed}, failed ${failed}, deferred ${pending} past --max=${maxRecordings}.`,
  );
  if (failed > 0) {
    process.exitCode = 1;
  }
}

// Everything that determines what the recording sounds like. If none of it has
// changed, neither has the audio.
function hashScript(sections: ContentSection[]): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ model: MODEL, voice: VOICE, sections }))
    .digest("hex");
}

const GET_TTS_HASH = db.prepare<
  { contentId: number },
  { text_hash: string | null }
>(`SELECT text_hash FROM tts WHERE content_id = :contentId;`);

const SET_TTS_HASH = db.prepare<{ contentId: number; textHash: string }>(
  `UPDATE tts SET text_hash = :textHash WHERE content_id = :contentId;`,
);

function getBylineDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type ContentSection =
  | {
      kind: "string";
      text: string;
    }
  | {
      kind: "audio";
      path: string;
    };

class ScriptWriter {
  private _vc: VC;

  constructor(vc: VC) {
    this._vc = vc;
  }

  // The sections that will be spoken, in order.
  script(content: Content): ContentSection[] {
    const node = content.content().cloneAst();
    this.cleanForRecording(node);
    const header: ContentSection = {
      kind: "string",
      text: `${content.title()}\n\nBy Jordan Eldredge\n${getBylineDate(
        new Date(content.date()),
      )}\n\n`,
    };
    const sections = this.asSections(node);
    return this.mergeSections([header, ...sections]);
  }

  async record(content: Content, mergedSections: ContentSection[]) {
    console.log(`Recording ${content.title()}`);
    const files = await this.generateAudioChunks(mergedSections);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const outputFile = path.resolve(path.join(tempDir, `${content.id()}.mp3`));
    this.mergeAudioFiles(files, outputFile);

    await TTSAudio.upload(this._vc, content.id(), outputFile);
    fs.rmSync(outputFile);
    for (const file of files) {
      if (file.startsWith(tempDir)) {
        fs.rmSync(file);
      }
    }
    return;
  }

  mergeAudioFiles(files: string[], outputFile: string) {
    const fileList = path.join(tempDir, "file_list.txt");
    const fileListContent = files.map((file) => `file '${file}'`).join("\n");
    fs.writeFileSync(fileList, fileListContent);

    execSync(
      `ffmpeg -y -f concat -safe 0 -i ${fileList} -acodec libmp3lame -b:a 192k ${outputFile}`,
      { stdio: "pipe" },
    );
    fs.rmSync(fileList);
  }

  async generateAudioChunks(segments: ContentSection[]) {
    const files: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      switch (segment.kind) {
        case "string":
          const mp3 = await openai.audio.speech.create({
            model: MODEL,
            voice: VOICE,
            input: segment.text,
          });

          if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
          }

          const buffer = Buffer.from(await mp3.arrayBuffer());
          const tempFile = path.join(tempDir, `chunk_${i}.mp3`);
          await fs.promises.writeFile(tempFile, buffer);
          files.push(tempFile);
          break;
        case "audio":
          files.push(segment.path);
      }
    }
    return files;
  }

  // Combine adjacent text blocks into a single text block up to MAX_CHAR_LENGTH chars in length.
  mergeSections(sections: ContentSection[]): ContentSection[] {
    const mergedSections: ContentSection[] = [];
    let buffer: string[] = [];
    for (const section of sections) {
      if (section.kind === "audio") {
        if (buffer.length > 0) {
          mergedSections.push({ kind: "string", text: buffer.join("\n") });
          buffer = [];
        }
        mergedSections.push(section);
      } else {
        const totalLength =
          buffer.reduce((acc, str) => acc + str.length + 1, 0) +
          section.text.length;
        if (totalLength > MAX_CHAR_LENGTH) {
          mergedSections.push({ kind: "string", text: buffer.join("\n") });
          buffer = [section.text];
        } else {
          buffer.push(section.text);
        }
      }
    }
    if (buffer.length > 0) {
      mergedSections.push({ kind: "string", text: buffer.join("\n") });
    }
    return mergedSections;
  }

  // Break each markdown section into either a text block or an audio block.
  asSections(node: Node): ContentSection[] {
    const sections: ContentSection[] = [];
    for (const child of node.children) {
      switch (child.type) {
        case "leafDirective":
          if (child.name === "audio") {
            if (child.attributes.src.startsWith("/")) {
              sections.push({
                kind: "audio",
                path: path.resolve(path.join("./public", child.attributes.src)),
              });
            }
          }
          break;
        default:
          const markdownString = toString(child, {
            includeImageAlt: false,
            includeHtml: false,
          });
          if (markdownString === "") {
            continue;
          }
          sections.push({ kind: "string", text: markdownString });
          break;
      }
    }
    return sections;
  }

  // Strip links from the AST
  cleanForRecording(ast: Node) {
    visit(ast, (node, index, parent) => {
      switch (node.type) {
        case "link":
          // Replace this node in the parent with all of the link's children.
          // @ts-ignore
          parent.children.splice(index, 1, ...node.children);
          return CONTINUE;
      }
    });
  }
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});

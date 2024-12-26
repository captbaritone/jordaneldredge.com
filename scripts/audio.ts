import "dotenv/config";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { Content } from "../lib/data";
import { execSync } from "child_process";
import { Node } from "unist";
import { Options, toMarkdown } from "mdast-util-to-markdown";
import { CONTINUE, visit } from "unist-util-visit";
import TTSAudio from "../lib/data/TTSAudio";

// Open AI only allows TTS queries with a maximum of 4096 characters.
const MAX_CHAR_LENGTH = 4096;

const openai = new OpenAI();
const tempDir = path.resolve("./temp");

async function main() {
  const allContent = Content.all({ sort: "latest", filters: [] });
  for (const content of allContent) {
    const ttsAudio = content.ttsAudio();
    if (ttsAudio != null && ttsAudio.lastUpdated() > content.lastModified()) {
      console.log(
        `Skipping ${content.title()} because it already has up to date audio.`,
      );
      continue;
    }
    if (
      content.slug() ===
      "barbershop-multi-track-wholl-take-my-place-when-im-gone"
    ) {
      continue;
    }
    const writer = new ScriptWriter();
    await writer.transcribe(content);
  }
}

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
  async transcribe(content: Content) {
    console.log(`Transcribing ${content.title()}`);
    const node = content.content().cloneAst();
    this.cleanForRecording(node);
    const header: ContentSection = {
      kind: "string",
      text: `# ${content.title()}\n\n*By Jordan Eldredge*\n*${getBylineDate(
        new Date(content.date()),
      )}*\n\n---\n\n`,
    };
    const sections = this.asSections(node);
    const mergedSections = this.mergeSections([header, ...sections]);
    const files = await this.generateAudioChunks(mergedSections);

    const outputFile = path.resolve(path.join(tempDir, `${content.id()}.mp3`));
    this.mergeAudioFiles(files, outputFile);

    await TTSAudio.upload(content.id(), outputFile);
    fs.rmSync(outputFile);
    for (const file of files) {
      if (file.startsWith(tempDir)) {
        fs.rmSync(file);
      }
    }
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
            model: "tts-1-hd",
            voice: "echo",
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
          const markdownString = toMarkdown(child, SERIALIZE_MARKDOWN_OPTIONS);
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

const SERIALIZE_MARKDOWN_OPTIONS: Options = {
  bullet: "-",
  emphasis: "_",
  rule: "-",
  handlers: {
    // @ts-ignore
    textDirective(node) {
      return node.name;
    },
    image(node) {
      return "";
    },
    leafDirective(node) {
      throw new Error(
        "Unexpected leaf directive when serializing markdown for audio.",
      );
    },
  },
};

main().catch((error) => {
  console.error("Error:", error);
});

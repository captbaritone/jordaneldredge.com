// Data goes to stdout. Messages go to stderr.
// When piped, stdout outputs JSON automatically.

export const isInteractive = process.stdout.isTTY ?? false;
let _quiet = false;

export function setQuiet(value: boolean) {
  _quiet = value;
}

export function info(msg: string) {
  if (!_quiet) {
    process.stderr.write(msg + "\n");
  }
}

export function outputData(data: unknown, humanFormat?: () => void) {
  if (isInteractive && humanFormat) {
    humanFormat();
  } else {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

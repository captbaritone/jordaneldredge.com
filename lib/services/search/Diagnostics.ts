export class ValidationError extends Error {
  loc: Loc;
  constructor(message: string, loc: Loc) {
    super(message);
    this.name = "ValidationError";
    this.loc = loc;
  }
}

export type Loc = {
  start: number;
  end: number;
};

export type Result<T> = {
  value: T;
  warnings: ValidationError[];
};

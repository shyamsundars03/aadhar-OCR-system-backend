export interface IOcrEngine {
  recognize(buffer: Buffer): Promise<string>;
}

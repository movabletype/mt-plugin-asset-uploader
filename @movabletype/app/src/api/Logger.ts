export class Logger {
  static debug(data): void {
    this.write("error", data);
  }

  static info(data): void {
    this.write("error", data);
  }

  static error(data): void {
    this.write("error", data);
  }

  private static async write(level, data): Promise<void> {
    console[level](data);
  }
}

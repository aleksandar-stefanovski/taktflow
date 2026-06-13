export class RecurringTask {
  private timer: NodeJS.Timeout | null = null;
  private active: Promise<void> | null = null;
  private stopped = true;

  constructor(
    private readonly intervalMs: number,
    private readonly run: () => Promise<void>,
    private readonly onError: (error: Error) => void,
  ) {}

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.schedule();
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.active) await this.active;
  }

  private schedule(): void {
    this.timer = setTimeout(() => {
      this.active = this.execute().finally(() => {
        this.active = null;
        if (!this.stopped) this.schedule();
      });
    }, this.intervalMs);
  }

  private async execute(): Promise<void> {
    try {
      await this.run();
    } catch (error) {
      this.onError(error as Error);
    }
  }
}

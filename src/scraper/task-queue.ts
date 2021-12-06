import PQueue from 'p-queue';
import { injectable } from 'tsyringe';

@injectable()
export class TaskQueue {
  private readonly queue = new PQueue({ concurrency: 5 });

  add<T>(fn: () => Promise<T>): Promise<T> {
    return this.queue.add(fn);
  }
}

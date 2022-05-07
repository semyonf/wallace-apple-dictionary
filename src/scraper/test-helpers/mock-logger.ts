import { container } from 'tsyringe';
import { Logger } from '../logger';

export function mockLogger(): void {
  container.registerInstance(Logger, {
    debug: Function(),
    error: Function(),
    info: Function(),
    warn: Function(),
    log: Function(),
  } as Logger);
}
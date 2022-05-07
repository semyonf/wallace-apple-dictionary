import { container } from 'tsyringe';
import { Logger } from '../logger';

export function useDummyLogger(): void {
  container.registerInstance(Logger, {
    debug: new Function(),
    error: new Function(),
    info: new Function(),
    warn: new Function(),
    log: new Function(),
  } as Logger);
}

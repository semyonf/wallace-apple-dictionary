import { singleton } from 'tsyringe';

@singleton()
export class Logger {
  debug = console.debug;
  error = console.error;
  info = console.info;
  warn = console.warn;
  log = console.log;
}

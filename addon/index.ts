import './-private/devtools';
import { trackedImmutable as _trackedImmutable } from './-private/decorator';

// Make sure TS recognizes this as a decorator, even when the Babel Stage 1 decorator types and TS' decorator variant don't match
export const trackedImmutable =
  _trackedImmutable as unknown as PropertyDecorator;

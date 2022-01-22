import { assert } from '@ember/debug';
import { createNode, updateNode } from './proxy';
import { Node } from './tracking';

function assertObjectOrArray(
  value: unknown
): asserts value is Array<unknown> | Record<string, unknown> {
  assert(
    '@immutableTracked expects an object or array.',
    Array.isArray(value) || (typeof value === 'object' && value !== null)
  );
}

export function immutableTracked(
  this: unknown,
  _obj: object,
  _key: string | symbol,
  desc: PropertyDescriptor & { initializer?: () => unknown }
): PropertyDescriptor {
  let rootNode: Node;

  if (desc.initializer) {
    const value = desc.initializer.call(this);
    assertObjectOrArray(value);
    rootNode = createNode(value);
  }

  return {
    get(): unknown {
      return rootNode?.proxy;
    },
    set(value: unknown): void {
      assertObjectOrArray(value);
      if (!rootNode) {
        rootNode = createNode(value);
      } else {
        updateNode(rootNode, value);
      }
    },
  };
}

import { DEBUG } from '@glimmer/env';
import {
  createTag,
  consumeTag,
  dirtyTag,
  consumeCollection,
  dirtyCollection,
  Node,
  Tag,
} from './tracking';

export const REDUX_PROXY_LABEL = Symbol();

class ObjectTreeNode<T extends Record<string, unknown>> implements Node<T> {
  proxy: T = new Proxy(this, objectProxyHandler) as unknown as T;
  tag = createTag();
  tags = Object.create(null) as Record<string, Tag>;
  children = Object.create(null) as Record<string, Node>;
  collectionTag = null;

  constructor(public value: T) {}

  toString(): string {
    return 'testing';
  }
}

const objectProxyHandler = {
  get(node: Node, key: string | symbol): unknown {
    if (DEBUG && key === REDUX_PROXY_LABEL) {
      return true;
    }

    const { value } = node;
    const childValue = Reflect.get(value, key);

    if (typeof key === 'symbol') {
      return childValue;
    }

    if (typeof childValue === 'object' && childValue !== null) {
      let childNode = node.children[key];

      if (childNode === undefined) {
        childNode = node.children[key] = createNode(childValue);
      }

      if (childNode.tag) {
        consumeTag(childNode.tag);
      }

      return childNode.proxy;
    } else {
      let tag = node.tags[key];

      if (tag === undefined) {
        tag = node.tags[key] = createTag();
      }

      consumeTag(tag);

      return childValue;
    }
  },

  ownKeys(node: Node): (string | symbol)[] {
    consumeCollection(node);
    return Reflect.ownKeys(node.value);
  },

  getOwnPropertyDescriptor(
    node: Node,
    prop: string | symbol
  ): PropertyDescriptor | undefined {
    return Reflect.getOwnPropertyDescriptor(node.value, prop);
  },

  has(node: Node, prop: string | symbol): boolean {
    return Reflect.has(node.value, prop);
  },

  set(node: Node, key: PropertyKey, value: unknown): boolean {
    return Reflect.set(node.value, key, value);
  },

  getPrototypeOf(node: Node): object | null {
    return Reflect.getPrototypeOf(node.value);
  },
};

class ArrayTreeNode<T extends Array<unknown>> implements Node<T> {
  proxy: T = new Proxy([this], arrayProxyHandler) as unknown as T;
  tag = createTag();
  tags = Object.create(null);
  children = Object.create(null);
  collectionTag = null;

  constructor(public value: T) {}
}

const arrayProxyHandler = {
  get([node]: [Node], key: string | symbol): unknown {
    if (key === 'length') {
      consumeCollection(node);
    }

    return objectProxyHandler.get(node, key);
  },

  ownKeys([node]: [Node]): (string | symbol)[] {
    return objectProxyHandler.ownKeys(node);
  },

  getOwnPropertyDescriptor(
    [node]: [Node],
    prop: string | symbol
  ): PropertyDescriptor | undefined {
    return Reflect.getOwnPropertyDescriptor(node.value, prop);
  },

  has([node]: [Node], prop: string | symbol): boolean {
    return Reflect.has(node.value, prop);
  },

  set([node]: [Node], key: PropertyKey, value: unknown): boolean {
    return Reflect.set(node.value, key, value);
  },
};

export function createNode<T extends Array<unknown> | Record<string, unknown>>(
  value: T
): Node<T> {
  if (Array.isArray(value)) {
    return new ArrayTreeNode(value);
  }

  return new ObjectTreeNode(value) as Node<T>;
}

export function updateNode<T extends Array<unknown> | Record<string, unknown>>(
  node: Node<T>,
  newValue: T
): void {
  const { value, tags, children } = node;

  node.value = newValue;

  if (
    Array.isArray(value) &&
    Array.isArray(newValue) &&
    value.length !== newValue.length
  ) {
    dirtyCollection(node);
  } else {
    const oldKeys = Object.keys(value);
    const newKeys = Object.keys(newValue);

    if (
      oldKeys.length !== newKeys.length ||
      oldKeys.some((k) => !newKeys.includes(k))
    ) {
      dirtyCollection(node);
    }
  }

  for (const key in tags) {
    const childValue = (value as Record<string, unknown>)[key];
    const newChildValue = (newValue as Record<string, unknown>)[key];

    if (childValue !== newChildValue) {
      dirtyCollection(node);
      dirtyTag(tags[key]);
    }

    if (typeof newChildValue === 'object' && newChildValue !== null) {
      delete tags[key];
    }
  }

  for (const key in children) {
    const childNode = children[key];
    const newChildValue = (newValue as Record<string, unknown>)[key];

    const childValue = childNode.value;

    if (childValue === newChildValue) {
      continue;
    } else if (
      typeof newChildValue === 'object' &&
      newChildValue !== null &&
      Object.getPrototypeOf(newChildValue) === Object.getPrototypeOf(childValue)
    ) {
      updateNode(childNode, newChildValue as Record<string, unknown>);
    } else {
      deleteNode(childNode);
      delete children[key];
    }
  }
}

function deleteNode(node: Node): void {
  if (node.tag) {
    dirtyTag(node.tag);
  }
  dirtyCollection(node);
  Object.values(node.tags).map(dirtyTag);
  Object.values(node.children).map(deleteNode);
}

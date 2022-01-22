import { get, notifyPropertyChange } from '@ember/object';
import {
  createStorage,
  getValue,
  setValue,
  TrackedStorage,
} from 'ember-tracked-storage-polyfill';

export type Tag = TrackedStorage<unknown>;

export interface Node<
  T extends Array<unknown> | Record<string, unknown> =
    | Array<unknown>
    | Record<string, unknown>
> {
  collectionTag: Tag | null;
  tag: Tag | null;
  tags: Record<string, Tag>;
  children: Record<string, Node>;
  proxy: T;
  value: T;
}

const neverEq = (): boolean => false;

export function createTag(): Tag {
  return createStorage(null, neverEq);
}
export const consumeTag = getValue;
export function dirtyTag(tag: Tag): void {
  setValue(tag, null);
}

/*
export let consumeCollection = (node: Node): void => {
  let tag = node.collectionTag;

  if (tag === null) {
    tag = node.collectionTag = createStorage(null, neverEq);
  }

  getValue(tag);
};

export let dirtyCollection = (node: Node): void => {
  const tag = node.collectionTag;

  if (tag !== null) {
    setValue(tag, null);
  }
};
*/

// @todo do wee need this? See https://github.com/pzuraq/tracked-redux/pull/115#discussion_r780486136
export const consumeCollection = (node: Node): void => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  get(node.proxy, '[]'); // eslint-disable-line ember/no-get
};
export const dirtyCollection = (node: Node): void =>
  notifyPropertyChange(node.proxy, '[]');

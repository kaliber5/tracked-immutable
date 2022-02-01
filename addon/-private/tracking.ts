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

export const consumeCollection = (node: Node): void => {
  let tag = node.collectionTag;

  if (tag === null) {
    tag = node.collectionTag = createStorage(null, neverEq);
  }

  getValue(tag);
};

export const dirtyCollection = (node: Node): void => {
  const tag = node.collectionTag;

  if (tag !== null) {
    setValue(tag, null);
  }
};

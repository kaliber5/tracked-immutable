import { module, test } from 'qunit';
import { immutableTracked } from 'ember-immutable-tracked';
import {
  createCache as _createCache,
  getValue,
} from '@glimmer/tracking/primitives/cache';

const CACHE_CALL_COUNTS = new WeakMap();

function callCount(cache) {
  return CACHE_CALL_COUNTS.get(cache);
}

function createCache(fn) {
  let cache = _createCache(() => {
    CACHE_CALL_COUNTS.set(cache, CACHE_CALL_COUNTS.get(cache) + 1);

    return fn();
  });

  CACHE_CALL_COUNTS.set(cache, 0);

  return cache;
}

module('Unit | basic', () => {
  module('primitive root', () => {
    test('it throws for simple values', function (assert) {
      class TestClass {
        @immutableTracked
        value;
      }
      const instance = new TestClass();

      assert.throws(() => (instance.value = 1));
    });
  });

  module('object root', () => {
    test('object updates correctly, does not invalidate cache', function (assert) {
      class TestClass {
        @immutableTracked
        value = { static: 123, count: 1 };
      }

      const instance = new TestClass();
      const cache = createCache(() => instance.value);

      assert.deepEqual(
        getValue(cache),
        { static: 123, count: 1 },
        'initial value is correct'
      );
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { static: 123, count: 2 };

      assert.deepEqual(
        getValue(cache),
        { static: 123, count: 2 },
        'initial value is correct'
      );
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');
    });

    test('cache updates correctly if dynamic value used', function (assert) {
      class TestClass {
        @immutableTracked
        value = { static: 123, count: 1 };
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value.count);

      assert.deepEqual(getValue(cache), 1, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { static: 123, count: 2 };

      assert.deepEqual(getValue(cache), 2, 'initial value is correct');
      assert.strictEqual(callCount(cache), 2, 'cache call count correct');
    });

    test('cache not invalidated if static value used', function (assert) {
      class TestClass {
        @immutableTracked
        value = { static: 123, count: 1 };
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value.static);

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { static: 123, count: 2 };

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');
    });

    test('cache invalidated correctly if collection used and keys changed', function (assert) {
      class TestClass {
        @immutableTracked
        value = { foo: 1 };
      }

      const instance = new TestClass();
      let cache = createCache(() => Object.keys(instance.value));

      assert.deepEqual(getValue(cache), ['foo'], 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { foo: 1, bar: 1 };

      assert.deepEqual(
        getValue(cache),
        ['foo', 'bar'],
        'initial value is correct'
      );
      assert.strictEqual(callCount(cache), 2, 'cache call count correct');
    });

    test('cache invalidated correctly if collection used and keys changed, same number of keys', function (assert) {
      class TestClass {
        @immutableTracked
        value = { foo: 1 };
      }

      const instance = new TestClass();
      let cache = createCache(() => Object.keys(instance.value));

      assert.deepEqual(getValue(cache), ['foo'], 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { bar: 1 };

      assert.deepEqual(getValue(cache), ['bar'], 'initial value is correct');
      assert.strictEqual(callCount(cache), 2, 'cache call count correct');
    });
  });

  module('array root', () => {
    test('array updates correctly, does not invalidate cache', function (assert) {
      class TestClass {
        @immutableTracked
        value = [1];
      }

      const instance = new TestClass();
      const cache = createCache(() => instance.value);

      assert.deepEqual(getValue(cache), [1], 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = [1, 2];

      assert.deepEqual(getValue(cache), [1, 2], 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');
    });

    test('cache updates correctly if dynamic value used', function (assert) {
      class TestClass {
        @immutableTracked
        value = [1];
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value[0]);

      assert.deepEqual(getValue(cache), 1, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = [2];

      assert.deepEqual(getValue(cache), 2, 'initial value is correct');
      assert.strictEqual(callCount(cache), 2, 'cache call count correct');
    });

    test('cache not invalidated if static value used', function (assert) {
      class TestClass {
        @immutableTracked
        value = [123, 1];
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value[0]);

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = [123, 2];

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');
    });

    test('cache invalidated correctly if iteration used and items added', function (assert) {
      class TestClass {
        @immutableTracked
        value = [1];
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value.map((v) => v + 1));

      assert.deepEqual(getValue(cache), [2], 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = [1, 2];

      assert.deepEqual(getValue(cache), [2, 3], 'initial value is correct');
      assert.strictEqual(callCount(cache), 2, 'cache call count correct');
    });

    test('cache invalidated correctly if iteration used and items changed', function (assert) {
      class TestClass {
        @immutableTracked
        value = [1];
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value.map((v) => v + 1));

      assert.deepEqual(getValue(cache), [2], 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = [2];

      assert.deepEqual(getValue(cache), [3], 'initial value is correct');
      assert.strictEqual(callCount(cache), 2, 'cache call count correct');
    });
  });

  module('nested values', () => {
    test('object updates correctly, does not invalidate cache', function (assert) {
      class TestClass {
        @immutableTracked
        value = { arr: [{ foo: 123 }] };
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value);

      assert.deepEqual(
        getValue(cache),
        { arr: [{ foo: 123 }] },
        'initial value is correct'
      );
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { arr: [{ foo: 456 }] };

      assert.deepEqual(
        getValue(cache),
        { arr: [{ foo: 456 }] },
        'initial value is correct'
      );
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');
    });

    test('cache updates correctly if dynamic value used', function (assert) {
      class TestClass {
        @immutableTracked
        value = { arr: [{ foo: 123 }] };
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value.arr[0].foo);

      assert.deepEqual(getValue(cache), 123, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { arr: [{ foo: 456 }] };

      assert.deepEqual(getValue(cache), 456, 'initial value is correct');
      assert.strictEqual(callCount(cache), 2, 'cache call count correct');
    });

    test('cache not invalidated if static value used', function (assert) {
      class TestClass {
        @immutableTracked
        value = { arr: [{ foo: 123 }, { bar: 456 }] };
      }

      const instance = new TestClass();
      let cache = createCache(() => instance.value.arr[1].bar);

      assert.deepEqual(getValue(cache), 456, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');

      instance.value = { arr: [{ foo: 321 }, { bar: 456 }] };

      assert.deepEqual(getValue(cache), 456, 'initial value is correct');
      assert.strictEqual(callCount(cache), 1, 'cache call count correct');
    });
  });
});

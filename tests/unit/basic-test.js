import { module, test } from 'qunit';
import { immutableTracked } from 'tracked-immutable';
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

module('Unit | basic', function () {
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

  module('object root', function () {
    module('object behavior', function () {
      test('is an array', function (assert) {
        class TestClass {
          @immutableTracked
          value = { foo: 0 };
        }

        const instance = new TestClass();

        assert.strictEqual(typeof instance.value, 'object');
        assert.true(instance.value instanceof Object);
      });

      test('is iterable', function (assert) {
        class TestClass {
          @immutableTracked
          value = { foo: 0, bar: 1 };
        }

        const instance = new TestClass();

        assert.deepEqual({ ...instance.value }, { foo: 0, bar: 1 });
      });

      test('supports Object methods', function (assert) {
        class TestClass {
          @immutableTracked
          value = { foo: 0, bar: 1 };
        }

        const instance = new TestClass();
        assert.deepEqual(Object.keys(instance.value), ['foo', 'bar']);
        assert.deepEqual(Object.entries(instance.value), [
          ['foo', 0],
          ['bar', 1],
        ]);
      });
    });

    module('reactivity', function () {
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
  });

  module('array root', function () {
    module('array behavior', function () {
      test('is an array', function (assert) {
        class TestClass {
          @immutableTracked
          value = [1];
        }

        const instance = new TestClass();

        assert.true(Array.isArray(instance.value));
        assert.true(instance.value instanceof Array);
      });

      test('is iterable', function (assert) {
        class TestClass {
          @immutableTracked
          value = [1, 2];
        }

        const instance = new TestClass();

        assert.deepEqual([...instance.value], [1, 2]);
      });

      test('supports Array methods', function (assert) {
        class TestClass {
          @immutableTracked
          value = [1, 2];
        }

        const instance = new TestClass();

        assert.deepEqual(
          instance.value.map((i) => i + 1),
          [2, 3]
        );
        assert.strictEqual(instance.value.length, 2);
      });
    });

    module('reactivity', function () {
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
  });

  module('class root', function () {
    module('class behavior', function () {
      test('is a class', function (assert) {
        class SubClass {}

        class TestClass {
          @immutableTracked
          value = new SubClass();
        }

        const instance = new TestClass();

        assert.strictEqual(typeof instance.value, 'object');
        assert.true(instance.value instanceof SubClass);
      });

      test('supports simple properties', function (assert) {
        class SubClass {
          foo = 1;
        }

        window.sub = new SubClass();
        class TestClass {
          @immutableTracked
          value = window.sub;
        }

        const instance = new TestClass();

        assert.strictEqual(instance.value.foo, 1);

        instance.value.foo = 2;
        assert.strictEqual(instance.value.foo, 2);
      });

      test('supports getters', function (assert) {
        class SubClass {
          _foo = 1;
          get foo() {
            return this._foo;
          }
        }

        class TestClass {
          @immutableTracked
          value = new SubClass();
        }

        const instance = new TestClass();

        assert.strictEqual(instance.value.foo, 1);
      });

      test('supports setters', function (assert) {
        class SubClass {
          _foo = 1;
          get foo() {
            return this._foo;
          }
          set foo(value) {
            this._foo = value;
          }
        }

        class TestClass {
          @immutableTracked
          value = new SubClass();
        }

        const instance = new TestClass();
        instance.value.foo = 2;

        assert.strictEqual(instance.value.foo, 2);
      });

      test('supports methods', function (assert) {
        let calledArgs;
        let calledThis;
        class SubClass {
          called = false;
          foo(...args) {
            calledArgs = args;
            calledThis = this;
            this.called = true;
          }
        }

        class TestClass {
          @immutableTracked
          value = new SubClass();
        }

        const instance = new TestClass();
        instance.value.foo(123, true, null);

        assert.deepEqual(calledThis, instance.value);
        assert.deepEqual(calledArgs, [123, true, null]);
        assert.true(instance.value.called);
      });
    });
    module('reactivity', function () {
      test('class instance updates correctly, does not invalidate cache', function (assert) {
        class SubClass {
          static = 123;
          count = 1;
        }
        class TestClass {
          @immutableTracked
          value = new SubClass();
        }

        const instance = new TestClass();
        const cache = createCache(() => instance.value);

        assert.strictEqual(
          getValue(cache).static,
          123,
          'initial value is correct'
        );
        assert.strictEqual(
          getValue(cache).count,
          1,
          'initial value is correct'
        );
        assert.strictEqual(callCount(cache), 1, 'cache call count correct');

        const newValue = new SubClass();
        newValue.count = 2;
        instance.value = newValue;

        assert.strictEqual(
          getValue(cache).static,
          123,
          'initial value is correct'
        );
        assert.strictEqual(
          getValue(cache).count,
          2,
          'initial value is correct'
        );
        assert.strictEqual(callCount(cache), 1, 'cache call count correct');
      });

      test('cache updates correctly if dynamic value used', function (assert) {
        class SubClass {
          static = 123;
          count = 1;
        }
        class TestClass {
          @immutableTracked
          value = new SubClass();
        }

        const instance = new TestClass();
        let cache = createCache(() => instance.value.count);

        assert.deepEqual(getValue(cache), 1, 'initial value is correct');
        assert.strictEqual(callCount(cache), 1, 'cache call count correct');

        const newValue = new SubClass();
        newValue.count = 2;
        instance.value = newValue;

        assert.deepEqual(getValue(cache), 2, 'changed value is correct');
        assert.strictEqual(callCount(cache), 2, 'cache call count correct');
      });

      test('cache not invalidated if static value used', function (assert) {
        class SubClass {
          static = 123;
          count = 1;
        }
        class TestClass {
          @immutableTracked
          value = new SubClass();
        }

        const instance = new TestClass();
        let cache = createCache(() => instance.value.static);

        assert.deepEqual(getValue(cache), 123, 'initial value is correct');
        assert.strictEqual(callCount(cache), 1, 'cache call count correct');

        const newValue = new SubClass();
        newValue.count = 2;
        instance.value = newValue;

        assert.deepEqual(getValue(cache), 123, 'initial value is correct');
        assert.strictEqual(callCount(cache), 1, 'cache call count correct');
      });

      test('cache invalidated correctly if collection used and keys changed', function (assert) {
        class SubClass1 {
          foo = 1;
        }
        class SubClass2 {
          foo = 1;
          bar = 1;
        }
        class TestClass {
          @immutableTracked
          value = new SubClass1();
        }

        const instance = new TestClass();
        let cache = createCache(() => Object.keys(instance.value));

        assert.deepEqual(getValue(cache), ['foo'], 'initial value is correct');
        assert.strictEqual(callCount(cache), 1, 'cache call count correct');

        instance.value = new SubClass2();

        assert.deepEqual(
          getValue(cache),
          ['foo', 'bar'],
          'initial value is correct'
        );
        assert.strictEqual(callCount(cache), 2, 'cache call count correct');
      });

      test('cache invalidated correctly if collection used and keys changed, same number of keys', function (assert) {
        class SubClass1 {
          foo = 1;
        }
        class SubClass2 {
          bar = 1;
        }
        class TestClass {
          @immutableTracked
          value = new SubClass1();
        }

        const instance = new TestClass();
        let cache = createCache(() => Object.keys(instance.value));

        assert.deepEqual(getValue(cache), ['foo'], 'initial value is correct');
        assert.strictEqual(callCount(cache), 1, 'cache call count correct');

        instance.value = new SubClass2();

        assert.deepEqual(getValue(cache), ['bar'], 'initial value is correct');
        assert.strictEqual(callCount(cache), 2, 'cache call count correct');
      });
    });
  });

  module('nested values', function () {
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

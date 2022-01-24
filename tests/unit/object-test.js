import Component from '@glimmer/component';
import { trackedImmutable } from 'tracked-immutable';

import { setupRenderingTest } from 'ember-qunit';
import { module } from 'qunit';
import { reactivityTest } from '../helpers/reactivity';
import { eachInReactivityTest } from '../helpers/collection-reactivity';

module('Object reactivity', function (hooks) {
  setupRenderingTest(hooks);

  eachInReactivityTest(
    '{{each-in}} works with new items',
    class extends Component {
      @trackedImmutable
      state = { 0: 0 };

      get collection() {
        return this.state;
      }

      update() {
        this.state = { ...this.state, 1: 0 };
      }
    }
  );

  eachInReactivityTest(
    '{{each-in}} works when updating old items',
    class extends Component {
      @trackedImmutable
      state = { foo: 0 };

      get collection() {
        return this.state;
      }

      update() {
        this.state = { foo: 1 };
      }
    }
  );

  reactivityTest(
    'individual index',
    class extends Component {
      @trackedImmutable
      state = { foo: 0 };

      get value() {
        return this.state.foo + 1;
      }

      update() {
        this.state = { foo: 1 };
      }
    }
  );

  reactivityTest(
    'iterating using for-in',
    class extends Component {
      @trackedImmutable
      state = { 1: 0 };

      get value() {
        let state = this.state;

        let value = 0;

        for (let foo in state) {
          value = state[foo];
        }

        return value;
      }

      update() {
        this.state = { ...this.state, 2: 0 };
      }
    }
  );

  reactivityTest(
    'Object.keys',
    class extends Component {
      @trackedImmutable
      state = { 1: 0 };

      get value() {
        return Object.keys(this.state).join();
      }

      update() {
        this.state = { ...this.state, 2: 0 };
      }
    }
  );
});

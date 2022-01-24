import Component from '@glimmer/component';
import { trackedImmutable } from 'tracked-immutable';

import { setupRenderingTest } from 'ember-qunit';
import { module } from 'qunit';
import { reactivityTest } from '../helpers/reactivity';
import {
  eachReactivityTest,
  eachInReactivityTest,
} from '../helpers/collection-reactivity';

const ARRAY_GETTER_METHODS = [
  'concat',
  'entries',
  'every',
  'filter',
  'find',
  'findIndex',
  'flat',
  'flatMap',
  'forEach',
  'includes',
  'indexOf',
  'join',
  'keys',
  'lastIndexOf',
  'map',
  'reduce',
  'reduceRight',
  'slice',
  'some',
  'values',
];

module('Array reactivity', function (hooks) {
  setupRenderingTest(hooks);

  eachReactivityTest(
    '{{each}} works with new items',
    class extends Component {
      @trackedImmutable
      state = [0];

      get collection() {
        return this.state;
      }

      update() {
        this.state = [0, 1];
      }
    }
  );

  eachReactivityTest(
    '{{each}} works when updating old items',
    class extends Component {
      @trackedImmutable
      state = [0];

      get collection() {
        return this.state;
      }

      update() {
        this.state = [1];
      }
    }
  );

  eachInReactivityTest(
    '{{each-in}} works with new items',
    class extends Component {
      @trackedImmutable
      state = [0];

      get collection() {
        return this.state;
      }

      update() {
        this.state = [0, 1];
      }
    }
  );

  eachInReactivityTest(
    '{{each-in}} works when updating old items',
    class extends Component {
      @trackedImmutable
      state = [0];

      get collection() {
        return this.state;
      }

      update() {
        this.state = [1];
      }
    }
  );

  ARRAY_GETTER_METHODS.forEach((method) => {
    if (method !== 'keys') {
      reactivityTest(
        `${method} individual index`,
        class extends Component {
          @trackedImmutable
          state = [0];

          get value() {
            let value = this.state[method](() => {});

            if (value && value.next) {
              value.next();
            }

            return value;
          }

          update() {
            this.state = [1];
          }
        }
      );
    }

    reactivityTest(
      `${method} collection`,
      class extends Component {
        @trackedImmutable
        state = [0];

        get value() {
          let value = this.state[method](() => {});

          if (value && value.next) {
            value.next();
          }

          return value;
        }

        update() {
          this.state = [0, 1];
        }
      }
    );
  });
});

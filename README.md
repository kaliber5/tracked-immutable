tracked-immutable
==============================================================================

Enable deep, deduped auto-tracking of immutable data.

When you are working with immutable data (POJOs, Arrays, rich class instances, or a mix thereof), which means every time
the data changes you get a completely new instance instead of directly mutating properties, you can make this work with
Ember's autotracking by assigning the new instance to a `@tracked` property as usual. However, that comes with the caveat
that *everything* depending on that data will rerender, whether the actually used value has changed or not.

```js
class MyComponent extends Component {
  @tracked person = { 
    firstName: null,
    lastName: null
  };
  
  @action
  updateFirstName(firstName) {
    this.person = {
      ...this.person,
      firstName
    };
  }

  @action
  updateLastName(lastName) {
    this.person = {
      ...this.person,
      lastName
    };
  }
}
```

Here whenever the user updates e.g. the first name, the template that consumes these values will correctly
update, however it will re-render both the first and last name (as the whole person object has changed), even is the 
last name's *actual value* hasn't changed.

In this trivial example, this is not a big issue. But when things are more complex, and re-rendering becomes a costly 
operation, you want *only* what has really changed to re-render. 

This is what `@trackedImmutable` is for. It will automatically track all the (nested) properties at a granular level, 
causing only changed values to re-render.

Compatibility
------------------------------------------------------------------------------

* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above


Installation
------------------------------------------------------------------------------

```
ember install tracked-immutable
```


Usage
------------------------------------------------------------------------------

Import the `@trackedImmutable` decorator:

```js
import { trackedImmutable } from 'tracked-immutable';
```

And use it for updates of immutable data (POJOs, Arrays, rich class instances, or a mix thereof) instead of `@tracked`.



Credits
------------------------------------------------------------------------------

This work is largely inspired by and borrows a lot of code from [tracked-redux](https://github.com/pzuraq/tracked-redux),
which share a lot of the same concerns. So credits to [pzuraq](https://github.com/pzuraq) for his prior work!

Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

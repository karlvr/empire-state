---
"react-immutable-state-controller": major
---

Rename useController to useNewController, and add a new useController to re-render components when anything in the controller changes

To update your code for this new version:

* Search existing code for `useController` using a case-sensitive and match-whole-word search; replace with `useNewController`
* Where you've used `controller.map`, consider adding a `useController` beforehand to ensure that your component re-renders when the controller's value changes.

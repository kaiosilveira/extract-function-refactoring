[![Continuous Integration](https://github.com/kaiosilveira/extract-function-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/extract-function-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my "refactoring" catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Extract function

**Formerly: Extract Method**

<table>
<thead>
<tr>
<th>Before</th>
<th>After</th>
</tr>
</thread>
<tobdy>
<tr>
<td>

```javascript
function printOwing(invoice) {
  printBanner();
  let outstanding = calculateOutstanding();

  // print details
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

</td>

<td>

```javascript
function printOwing(invoice) {
  printBanner();
  let outstanding = calculateOutstanding();
  printDetails(outstanding);

  function printDetails(outstanding) {
    console.log(`name: ${invoice.customer}`);
    console.log(`amount: ${outstanding}`);
  }
}
```

</td>

</tr>
</tobdy>
</table>

**Inverse of: [Inline Function](https://github.com/kaiosilveira/inline-function-refactoring)**

Extracting a block of code into a function is one of the most common refactorings out there. It helps give more meaning to a given piece of code, as you'll be effectively naming a code block after its intent.

## Working example

The working example for this refactoring is pretty simple: a function that prints the outstanding amount for a given invoice.

### Before

This is the code block that we will be refactoring:

```javascript
function printOwing(invoice) {
  let outstanding = 0;

  console.log('***********************');
  console.log('**** Customer owes ****');
  console.log('***********************');

  // calculate outstanding
  for (const o of invoice.orders) {
    outstanding += o.amount;
  }

  // record due date
  const today = Clock.today;
  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

  // print details
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
}
```

### After

This is the end result after all the refactoring steps being made:

```javascript
function printOwing(invoice) {
  printBanner();

  const outstanding = calculateOutstanding(invoice);
  recordDueDate(invoice);
  printDetails(invoice, outstanding);
}
```

## Test suite

A simple test suite with four tests was added. These tests cover the main behaviors of the `printOwing` function:

- printing a banner
- printing the customer's name
- printing the outstanding amount
- printing the due date

For the implementation details, see [index.test.js](./index.test.js).

## Steps

**No variables out of scope**

It's easy to extract a function for the upper part of `printOwing`, as it's just a sequence of `console.log` statements. The steps are:

- introduce a `printBanner` function:

```diff
diff --git a/index.js b/index.js
@@ -22,4 +22,10 @@ function printOwing(invoice) {
   console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
 }

+function printBanner() {
+  console.log('***********************');
+  console.log('**** Customer owes ****');
+  console.log('***********************');
+}
+
 module.exports = { printOwing };
```

- replace banner code block with the new function

```diff
diff --git a/index.js b/index.js
@@ -3,9 +3,7 @@ const Clock = { today: new Date() };
 function printOwing(invoice) {
   let outstanding = 0;

-  console.log('***********************');
-  console.log('**** Customer owes ****');
-  console.log('***********************');
+  printBanner();

   // calculate outstanding
   for (const o of invoice.orders) {
```

**Using local variables**

As for the bottom part, the details, it's a little bit more involved: we can create a `printDetails` function and encapsulate the `console.log` statements, but we can't yet move it to the top level, as it is using variables declared in the parent scope:

- Introduce the `printDetails` function

```diff
diff --git a/index.js b/index.js
@@ -18,6 +18,12 @@ function printOwing(invoice) {
   console.log(`name: ${invoice.customer}`);
   console.log(`amount: ${outstanding}`);
   console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
+
+  function printDetails() {
+    console.log(`name: ${invoice.customer}`);
+    console.log(`amount: ${outstanding}`);
+    console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
+  }
 }

 function printBanner() {
```

- Replace the details code block with the new function:

```diff
diff --git a/index.js b/index.js
@@ -14,10 +14,7 @@ function printOwing(invoice) {
   const today = Clock.today;
   invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()
 + 30);

-  // print details
-  console.log(`name: ${invoice.customer}`);
-  console.log(`amount: ${outstanding}`);
-  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
+  printDetails();

   function printDetails() {
     console.log(`name: ${invoice.customer}`);
```

Then, to move the function to the top level, we need to pass down the variables it depends on as parameters, in this case, these variables are `invoice` and `outstanding`:

```diff
diff --git a/index.js b/index.js
@@ -14,9 +14,9 @@ function printOwing(invoice) {
   const today = Clock.today;
   invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()
 + 30);

-  printDetails();
+  printDetails(invoice, outstanding);

-  function printDetails() {
+  function printDetails(invoice, outstanding) {
     console.log(`name: ${invoice.customer}`);
     console.log(`amount: ${outstanding}`);
     console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
```

The same mechanics apply to the code that records the due date:

- introduce the `recordDueDate` function:

```diff
diff --git a/index.js b/index.js
@@ -16,6 +16,11 @@ function printOwing(invoice) {

   printDetails(invoice, outstanding);

+  function recordDueDate(invoice) {
+    const today = Clock.today;
+    invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
+  }
+
   function printDetails(invoice, outstanding) {
     console.log(`name: ${invoice.customer}`);
     console.log(`amount: ${outstanding}`);
```

- replace due date recording with the new function:

```diff
diff --git a/index.js b/index.js
@@ -10,10 +10,7 @@ function printOwing(invoice) {
     outstanding += o.amount;
   }

-  // record due date
-  const today = Clock.today;
-  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
-
+  recordDueDate(invoice);
   printDetails(invoice, outstanding);

   function recordDueDate(invoice) {
```

**Reassigning a local variable**

Things get trickier when it comes to extracting a function for the calculation of the `outstanding` amount, as it's being declared and then incremented later on.

We start with a tiny variable sliding:

```diff
diff --git a/index.js b/index.js
@@ -1,11 +1,10 @@
 const Clock = { today: new Date() };

 function printOwing(invoice) {
-  let outstanding = 0;
-
   printBanner();

   // calculate outstanding
+  let outstanding = 0;
   for (const o of invoice.orders) {
     outstanding += o.amount;
   }
```

Then, we can copy this whole code block and put it into its own function:

```diff
diff --git a/index.js b/index.js
@@ -30,4 +30,14 @@ function printBanner() {
   console.log('***********************');
 }

+function calculateOutstanding(invoice) {
+  let outstanding = 0;
+
+  for (const o of invoice.orders) {
+    outstanding += o.amount;
+  }
+
+  return outstanding;
+}
+
 module.exports = { printOwing };
```

Finally, we can replace the first assignment with `outstanding` as being directly the result of a function call:

```diff
diff --git a/index.js b/index.js
@@ -3,12 +3,7 @@ const Clock = { today: new Date() };
 function printOwing(invoice) {
   printBanner();

-  // calculate outstanding
-  let outstanding = 0;
-  for (const o of invoice.orders) {
-    outstanding += o.amount;
-  }
-
+  let outstanding = calculateOutstanding(invoice);
   recordDueDate(invoice);
   printDetails(invoice, outstanding);
```

This looks way better now, but there are still some tidy up we can do:

- make the `outstanding` variable constant:

```diff
diff --git a/index.js b/index.js
@@ -3,7 +3,7 @@ const Clock = { today: new Date() };
 function printOwing(invoice) {
   printBanner();

-  let outstanding = calculateOutstanding(invoice);
+  const outstanding = calculateOutstanding(invoice);
   recordDueDate();
   printDetails(invoice, outstanding);
```

- rename the temp variable inside `calculateOutstanding` as `result`:

```diff
diff --git a/index.js b/index.js
index 6fd76d3..e9baa55 100644
@@ -26,13 +26,13 @@ function printBanner() {
 }

 function calculateOutstanding(invoice) {
-  let outstanding = 0;
+  let result = 0;

   for (const o of invoice.orders) {
-    outstanding += o.amount;
+    result += o.amount;
   }

-  return outstanding;
+  return result;
 }

 module.exports = { printOwing };
```

- move `printDetails` out of `printOwing`:

```diff
diff --git a/index.js b/index.js
@@ -11,12 +11,12 @@ function printOwing(invoice) {
     const today = Clock.today;
     invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
   }
+}

-  function printDetails(invoice, outstanding) {
-    console.log(`name: ${invoice.customer}`);
-    console.log(`amount: ${outstanding}`);
-    console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
-  }
+function printDetails(invoice, outstanding) {
+  console.log(`name: ${invoice.customer}`);
+  console.log(`amount: ${outstanding}`);
+  console.log(`due: ${invoice.dueDate.toLocaleDateString()}`);
 }

 function printBanner() {
```

- move `recordDueDate` out of `printOwing`:

```diff
diff --git a/index.js b/index.js
@@ -6,11 +6,11 @@ function printOwing(invoice) {
   const outstanding = calculateOutstanding(invoice);
   recordDueDate(invoice);
   printDetails(invoice, outstanding);
+}

-  function recordDueDate(invoice) {
-    const today = Clock.today;
-    invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
-  }
+function recordDueDate(invoice) {
+  const today = Clock.today;
+  invoice.dueDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
 }

 function printDetails(invoice, outstanding) {
```

And that's it for this refactoring!

### Commit history

See below a chronology (from top to bottom) of all the refactoring steps:

| Commit SHA                                                                                                              | Message                                                             |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| [f721ce9](https://github.com/kaiosilveira/extract-function-refactoring/commit/bafd55b41f1f56758300f91fe4939a12a7dcc408) | introduce printBanner function                                      |
| [e894f28](https://github.com/kaiosilveira/extract-function-refactoring/commit/bacc27348bd04841998aa70c1f2e697e9d85e336) | replace banner code block by the printBanner function               |
| [74ec05e](https://github.com/kaiosilveira/extract-function-refactoring/commit/4888c66dec1e5a2d543ecdba482db9f7c82ba163) | introduce printDetails function                                     |
| [609736f](https://github.com/kaiosilveira/extract-function-refactoring/commit/ba85fa8258abd98391edb80f3b8a92d4a6f4b1c4) | replace details code block with function                            |
| [8c3be6c](https://github.com/kaiosilveira/extract-function-refactoring/commit/2c63868b10d7cf5fcbde0054c53b344651f47467) | pass down printDetails dependencies as parameters                   |
| [8106bbc](https://github.com/kaiosilveira/extract-function-refactoring/commit/61da53c6334bc2aab564128d012be0b5bca548cf) | introduce recordDueDate function                                    |
| [7bdf838](https://github.com/kaiosilveira/extract-function-refactoring/commit/84121f47a71678c9c7c773bd436991c9e66fb35d) | replace due date recording code block by recordDueDate function     |
| [13df230](https://github.com/kaiosilveira/extract-function-refactoring/commit/8cedde0d5b15f3b00680bc956f13d4b4f80f0774) | slide the declaration of the outstanding variable near to its usage |
| [ac1952e](https://github.com/kaiosilveira/extract-function-refactoring/commit/9aaf5ce6f81a8069d781c0852b00981e621b8996) | introduce calculateOutstanding function                             |
| [de65877](https://github.com/kaiosilveira/extract-function-refactoring/commit/c4b496b0d4f22f931eac5c870433298b746446bc) | replace outstanding calculation by function call                    |
| [daef722](https://github.com/kaiosilveira/extract-function-refactoring/commit/dcb2a3a306e07e6965986f9b614ec9966ffd76d9) | make the outstanding variable a const                               |
| [aa465d9](https://github.com/kaiosilveira/extract-function-refactoring/commit/e93f42903cf75b45ad062e359855ef615733a093) | rename outstanding to result in calculateOutstanding                |
| [1b662cd](https://github.com/kaiosilveira/extract-function-refactoring/commit/e52e86df65bf3f5c9d89cf3908da924b2708acef) | move printDetails out of printOwing                                 |
| [1b662cd](https://github.com/kaiosilveira/extract-function-refactoring/commit/52ce3ee10119fd27678bee0ef7ce407eb48154c0) | move recordDueDate out of printOwing                                |

The full commit history can be seen in the [Commit history tab](https://github.com/kaiosilveira/extract-function-refactoring/commits/main).

1️⃣ What is the difference between var, let, and const?

Answer:
var, let, and const are used to declare variables in JavaScript.

var is the old way to declare a variable. It is function scoped, which means it can be accessed anywhere inside the function where it is declared. It can also be redeclared and updated.

let is block scoped. That means it only works inside the block where it is declared, like inside a loop or an if statement. It can be updated but cannot be redeclared in the same scope.

const is also block scoped like let. The difference is that const cannot be updated or redeclared after it is assigned a value. It is usually used for values that should not change.

2️⃣ What is the spread operator (...)?

Answer:
The spread operator (...) is used to expand or spread elements of an array or object. It allows you to copy, combine, or pass elements easily.

Example:
If you have an array [1,2,3] and use ...array, it spreads the values 1,2,3.

It is often used to copy arrays, merge arrays, or copy objects without changing the original data.

3️⃣ What is the difference between map(), filter(), and forEach()?

Answer:
map(), filter(), and forEach() are array methods used to work with array elements.

map() is used to create a new array by applying a function to every element of the original array.

filter() is used to create a new array that contains only the elements that pass a specific condition.

forEach() is used to run a function for every element in the array, but it does not return a new array.

4️⃣ What is an arrow function?

Answer:
An arrow function is a shorter way to write a function in JavaScript. It uses the arrow symbol => instead of the traditional function keyword.

It makes the code shorter and cleaner, especially for small functions.

Example:
Instead of writing function add(a,b){ return a+b } you can write (a,b) => a+b.

5️⃣ What are template literals?

Answer:
Template literals are a way to write strings in JavaScript using backticks ( ) instead of single or double quotes.

They allow you to insert variables or expressions inside a string using ${ }.

Example:
If name = "Sakib" then you can write:
Hello ${name}
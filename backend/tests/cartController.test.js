const test = require("node:test");
const assert = require("node:assert/strict");
const { __testables } = require("../controllers/cartController");

test("calculateSubtotal sums totalPrice values correctly", () => {
  const subtotal = __testables.calculateSubtotal([
    { totalPrice: 8.5 },
    { totalPrice: 7.25 },
    { totalPrice: 4 },
  ]);

  assert.equal(subtotal, 19.75);
});

test("mapCartItem exposes id and cart item fields", () => {
  const mapped = __testables.mapCartItem({
    _id: "abc123",
    foodName: "Orange Juice",
    price: 3.5,
    quantity: 2,
    totalPrice: 7,
  });

  assert.deepEqual(mapped, {
    id: "abc123",
    foodName: "Orange Juice",
    image: undefined,
    price: 3.5,
    quantity: 2,
    totalPrice: 7,
  });
});

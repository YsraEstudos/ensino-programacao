# Transfer task: order reservation

Implement `reserve(orders, stock, orderId, quantity)` without copying the comment authorization solution. The operation returns `{ok:true, stock:remaining}` when the order is new, quantity is a positive integer, and enough stock exists. It returns `{ok:false, reason}` and leaves the input unchanged for duplicate IDs, invalid quantity, missing stock, or insufficient stock. Order IDs are case-sensitive. No database or process execution is part of the task.

Input contract: `orders` is a `Set<string>`, `stock` is a nonnegative integer, `orderId` is a nonempty string, `quantity` is a positive safe integer. Implement the operation as a pure function.

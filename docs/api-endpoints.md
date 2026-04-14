# Planned API Endpoints

## Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

## Menu
- GET /api/menu
- POST /api/menu
- PUT /api/menu/:id
- DELETE /api/menu/:id

## Cart
- GET /api/cart
- POST /api/cart
- PUT /api/cart/:id
- DELETE /api/cart/:id

## Orders
- POST /api/orders
- GET /api/orders
- GET /api/orders/:id
- PUT /api/orders/:id/status

## Payments
- POST /api/payments
- GET /api/payments

## Reviews
- POST /api/reviews
- GET /api/reviews/:foodId

## Delivery
- GET /api/delivery/:orderId
- PUT /api/delivery/:id/status
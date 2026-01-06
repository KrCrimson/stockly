# API Documentation

## Overview
This document contains the REST API documentation for the Stock Management System.

## Endpoints

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product (soft delete)

### Movements
- `POST /api/movements` - Register stock movement
- `GET /api/movements/{productId}` - Get movement history

### Reports
- `GET /api/reports/stock-status` - Current stock status
- `GET /api/reports/low-stock` - Products with low stock alerts
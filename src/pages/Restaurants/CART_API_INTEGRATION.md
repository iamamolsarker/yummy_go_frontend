# Cart API Integration Guide

## 📋 Quick Reference

### Base URL
```
https://yummy-go-server.vercel.app/api
```

---

## 🛒 Cart Endpoints

### 1. Create Cart
```typescript
POST /carts
Body: {
  user_email: string,
  restaurant_id: string
}
Response: {
  _id: string,
  user_email: string,
  restaurant_id: string,
  items: [],
  total_amount: 0,
  status: 'active',
  created_at: string,
  updated_at: string
}
```

### 2. Get User Cart
```typescript
GET /carts/user/:userEmail
Response: {
  _id: string,
  user_email: string,
  restaurant_id: string,
  items: [
    {
      menu_id: string,
      quantity: number,
      price: number,
      notes?: string
    }
  ],
  total_amount: number,
  status: 'active',
  created_at: string,
  updated_at: string
}
```

### 3. Add Item to Cart
```typescript
POST /carts/:cartId/items
Body: {
  menu_id: string,
  quantity: number,
  price: number,
  notes?: string
}
Response: Updated cart object
```

### 4. Update Item Quantity
```typescript
PATCH /carts/:cartId/items/:menuId/quantity
Body: {
  quantity: number
}
Response: Updated cart object
```

### 5. Remove Item from Cart
```typescript
DELETE /carts/:cartId/items/:menuId
Response: Updated cart object
```

### 6. Clear Cart
```typescript
DELETE /carts/:cartId/clear
Response: Updated cart object with empty items array
```

### 7. Update Cart Status
```typescript
PATCH /carts/:cartId/status
Body: {
  status: 'active' | 'checkout' | 'ordered' | 'cancelled'
}
Response: Updated cart object
```

---

## 🔐 Authentication

All cart endpoints require JWT authentication:

```typescript
// Automatically handled by useAxiosSecure hook
const axiosSecure = useAxiosSecure();

// Token is auto-attached in request header:
Authorization: Bearer <firebase-jwt-token>
```

---

## 🎯 Implementation Example

```typescript
// 1. Create cart when user first adds item
const createCart = async () => {
  const response = await axiosSecure.post('/carts', {
    user_email: user.email,
    restaurant_id: restaurantId
  });
  return response.data.data;
};

// 2. Add item to cart
const addItem = async (cartId: string, item: MenuItem) => {
  const response = await axiosSecure.post(`/carts/${cartId}/items`, {
    menu_id: item._id,
    quantity: 1,
    price: item.price,
    notes: 'Extra spicy'  // Optional
  });
  return response.data.data;
};

// 3. Update quantity
const updateQuantity = async (cartId: string, menuId: string, qty: number) => {
  const response = await axiosSecure.patch(
    `/carts/${cartId}/items/${menuId}/quantity`,
    { quantity: qty }
  );
  return response.data.data;
};

// 4. Remove item
const removeItem = async (cartId: string, menuId: string) => {
  const response = await axiosSecure.delete(
    `/carts/${cartId}/items/${menuId}`
  );
  return response.data.data;
};

// 5. Clear entire cart
const clearCart = async (cartId: string) => {
  const response = await axiosSecure.delete(`/carts/${cartId}/clear`);
  return response.data.data;
};

// 6. Proceed to checkout
const checkout = async (cartId: string) => {
  const response = await axiosSecure.patch(`/carts/${cartId}/status`, {
    status: 'checkout'
  });
  return response.data.data;
};
```

---

## 📊 Response Structure

### Success Response
```typescript
{
  success: true,
  data: {
    _id: "cart_id",
    user_email: "user@example.com",
    restaurant_id: "restaurant_id",
    items: [...],
    total_amount: 500,
    status: "active",
    created_at: "2025-10-21T10:00:00Z",
    updated_at: "2025-10-21T10:00:00Z"
  }
}
```

### Error Response
```typescript
{
  success: false,
  message: "Error description",
  error: {
    code: "ERROR_CODE",
    details: "Additional details"
  }
}
```

---

## ⚠️ Error Codes

| Status | Code | Description | Action |
|--------|------|-------------|--------|
| 400 | BAD_REQUEST | Invalid request data | Validate input |
| 401 | UNAUTHORIZED | Not authenticated | Redirect to login |
| 403 | FORBIDDEN | Access denied | Show error message |
| 404 | NOT_FOUND | Cart/item not found | Create new cart |
| 409 | CONFLICT | Cart from different restaurant | Prompt user |
| 500 | SERVER_ERROR | Internal error | Retry or contact support |

---

## 🔄 Data Flow

```
User Action
    ↓
Local State Update (Optimistic)
    ↓
API Call (via React Query mutation)
    ↓
Backend Processing
    ↓
Success Response
    ↓
Query Invalidation
    ↓
Refetch Cart Data
    ↓
UI Update
```

---

## 🎯 Best Practices

### 1. Always Check User Authentication
```typescript
if (!user) {
  navigate('/auth/login');
  return;
}
```

### 2. Handle Cart Creation
```typescript
// Check if cart exists
if (!backendCart) {
  const newCart = await createCart();
  cartId = newCart._id;
}
```

### 3. Validate Restaurant
```typescript
// Prevent mixing restaurants
if (backendCart.restaurant_id !== currentRestaurantId) {
  // Prompt user to clear cart
  const confirmed = window.confirm('Clear cart?');
  if (confirmed) {
    await clearCart(backendCart._id);
  }
}
```

### 4. Use Optimistic Updates
```typescript
// Update local state immediately
setLocalCart(prevCart => [...prevCart, newItem]);

// Then sync with backend
await addItemMutation.mutateAsync({ cartId, item });
```

### 5. Handle Errors Gracefully
```typescript
try {
  await updateQuantity(cartId, menuId, quantity);
} catch (error) {
  // Revert local state
  setLocalCart(previousState);
  showToast('Failed to update quantity');
}
```

---

## 🧪 Testing

### Test Scenarios:

1. **Create Cart**
   - First item add → Cart created
   - Verify cart ID saved

2. **Add Multiple Items**
   - Add 3 different items
   - Verify total_amount calculation

3. **Update Quantity**
   - Increase from 1 to 3
   - Decrease from 3 to 1
   - Verify total_amount updates

4. **Remove Items**
   - Remove single item
   - Verify item removed from items array
   - Verify total_amount updates

5. **Clear Cart**
   - Add multiple items
   - Clear cart
   - Verify items array is empty
   - Verify total_amount is 0

6. **Restaurant Switch**
   - Add item from Restaurant A
   - Try adding from Restaurant B
   - Verify prompt shown
   - Verify cart cleared if confirmed

7. **Checkout**
   - Status changes to 'checkout'
   - Navigation to checkout page
   - Cart ID passed in route state

---

## 📦 React Query Setup

```typescript
// Query Client Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: true,
    },
  },
});

// Cart Query
const { data: cart } = useQuery({
  queryKey: ['cart', user?.email],
  queryFn: () => fetchCart(user.email),
  enabled: !!user?.email,
});

// Add Item Mutation
const addItemMutation = useMutation({
  mutationFn: (data) => addItemToCart(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['cart'] });
    showToast('Item added!');
  },
  onError: (error) => {
    showToast('Failed to add item');
  },
});
```

---

## 🔐 Security Notes

1. **JWT Validation**: All requests validated on backend
2. **User Ownership**: Backend verifies user owns cart
3. **Price Verification**: Backend validates menu item prices
4. **Quantity Limits**: Backend enforces reasonable limits
5. **Restaurant Validation**: Backend checks restaurant exists

---

## 📈 Performance Tips

1. **Cache Cart Data**: Use React Query's caching
2. **Optimistic Updates**: Update UI before API response
3. **Debounce Quantity**: Prevent rapid API calls
4. **Batch Operations**: Clear + Add instead of multiple removes
5. **Lazy Load Menu**: Only fetch when viewing restaurant

---

## 🎓 Advanced Features

### 1. Cart Recovery
```typescript
// Save cart to localStorage as backup
useEffect(() => {
  if (backendCart) {
    localStorage.setItem('cart_backup', JSON.stringify(backendCart));
  }
}, [backendCart]);
```

### 2. Cart Expiry
```typescript
// Backend auto-expires carts after 24 hours
// Frontend can show warning before expiry
const hoursUntilExpiry = calculateHours(cart.updated_at);
if (hoursUntilExpiry < 2) {
  showWarning('Cart expires soon!');
}
```

### 3. Multi-Device Sync
```typescript
// React Query automatically syncs across tabs
// refetchOnWindowFocus ensures fresh data
```

---

## 🚀 Next Steps

After implementing cart:
1. Implement checkout page
2. Integrate payment gateway
3. Create order from cart
4. Handle delivery assignment
5. Add order tracking

---

## 📞 Troubleshooting

### Cart not creating?
- Check user authentication
- Verify restaurant_id is valid
- Check Firebase token is fresh

### Items not adding?
- Verify menu_id exists
- Check cart_id is correct
- Ensure price matches menu item

### Quantity not updating?
- Check menuId matches
- Verify quantity is positive integer
- Ensure cart status is 'active'

### Total amount wrong?
- Backend auto-calculates
- Check individual item prices
- Verify quantities are correct

---

## 📚 Resources

- [Backend API Docs](../YummyGo_API_Routes_Guide.md)
- [React Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)

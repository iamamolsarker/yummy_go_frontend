# 🎨 Visual Feature Guide - Restaurant Details Page

## 📸 Component Breakdown

### 1. **Restaurant Header** (Top Section)
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]  Restaurant Name                    [♡] [Share]     │
│          Cuisine Types                                       │
│          ⭐ 4.5 (120+) · Min. order Tk 200                  │
│          🕐 20-30 min · 📍 Dhanmondi, Dhaka                 │
│                                                              │
│  ⚠️ [Temporarily Unavailable Banner] (if closed)            │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Logo/Image (24x24 rounded)
- Restaurant name (3xl bold)
- Cuisine types (gray text)
- Rating with star icon
- Delivery time estimate
- Location display
- Favorite/Share buttons (top-right)
- Unavailable warning (conditional)

---

### 2. **Search & Category Tabs** (Sticky)
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 [Search in menu........................]                │
├─────────────────────────────────────────────────────────────┤
│  All | Pizza | Burgers | Pasta | Drinks | Desserts         │
│  ━━                                    (horizontal scroll)   │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Search bar with icon
- Horizontal scrolling categories
- Active category underline (primary color)
- Sticky on scroll
- Real-time filtering

---

### 3. **Menu Item Card** (Main Content)
```
┌─────────────────────────────────────────────────────────────┐
│  Chicken Burger                              [Image]         │
│  from Tk 250                                 128x128         │
│  Juicy grilled chicken with fresh...        rounded         │
│                                                              │
│  [🌿 Veg] [🥕 Vegan] [✓ Halal]                              │
│  250 cal · 25g protein                                       │
│  ⭐ 4.8 (45) · 🕐 15 min                                     │
│                                                              │
│  [Add]  or  [- 2 +]                                         │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Item name (lg bold)
- Price (primary color)
- Description (2 lines max)
- Dietary badges (green/blue)
- Nutrition info (compact)
- Rating & prep time
- Add button or quantity controls
- Image on right (Foodpanda style)

---

### 4. **Sidebar** (Desktop Only)
```
┌──────────────────────────────┐
│  Restaurant Info             │
├──────────────────────────────┤
│  📍 Address                  │
│  123 Restaurant St           │
│  Gulshan, Dhaka - 1212      │
│                              │
│  📞 Phone                    │
│  +880 1234-567890           │
│                              │
│  ──────────────────          │
│  Delivery Fee    ৳50         │
│  Minimum Order   ৳200        │
└──────────────────────────────┘
```

**Features:**
- Sticky position
- Address with icon
- Phone with link
- Delivery info
- Clean card design

---

### 5. **Floating Cart Button** (Bottom-Right)
```
┌──────────────────────────┐
│  🛒  3 items  ৳750       │
└──────────────────────────┘
  (Pulse animation on add)
```

**Features:**
- Fixed bottom-right
- Shows item count + total
- Scale on hover
- Click opens cart modal
- Only shows when cart has items

---

### 6. **Cart Modal** (Overlay)
```
┌─────────────────────────────────────────────────────────────┐
│  Your Cart                                              [X]  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Img] Chicken Burger                [-  2  +]  ৳500 │   │
│  │       ৳250                                          │   │
│  │       Note: No onions                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Img] Pepsi                         [-  1  +]  ৳50  │   │
│  │       ৳50                                           │   │
│  └─────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  Subtotal                                          ৳550     │
│  Delivery Fee                                      ৳50      │
│  ─────────────────────────────────────────────────────      │
│  Total                                            ৳600      │
│                                                              │
│  [ Proceed to Checkout ]                                    │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Full-screen overlay (mobile)
- Max-width card (desktop)
- Item list with images
- Quantity controls per item
- Special notes display
- Cost breakdown
- Minimum order warning (if needed)
- Large checkout button

---

### 7. **Item Customization Modal**
```
┌─────────────────────────────────────────────────────────────┐
│  [Full-width Item Image]                                [X] │
├─────────────────────────────────────────────────────────────┤
│  Chicken Burger                                             │
│  ৳250                                                        │
│                                                              │
│  Juicy grilled chicken patty with lettuce, tomato...       │
│                                                              │
│  [🌿 Vegetarian] [🥕 Vegan] [✓ Halal]                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Nutrition Information                                │  │
│  │ Calories: 450    Protein: 25g                        │  │
│  │ Carbs: 35g       Fat: 15g                           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Allergens: Gluten, Dairy                                   │
│                                                              │
│  Special Instructions (Optional)                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ E.g., No onions, extra spicy...                      │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [ Add to Cart - ৳250 ]                                     │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- Large hero image
- Complete item details
- Nutrition facts grid
- Allergen warnings
- Multi-line notes input
- Large add button

---

### 8. **Success Toast** (Top-Center)
```
┌──────────────────────────────┐
│  ✓  Item added to cart!      │
└──────────────────────────────┘
    (Slides down, auto-dismiss)
```

**Features:**
- Green background
- Check icon
- Centered at top
- Slide-down animation
- Auto-dismiss 3s

---

## 🎨 Color Scheme

```css
/* Primary Actions */
--primary: #EF451C;      /* Orange - buttons, badges */
--primary-hover: #D63A16; /* Darker orange */

/* Text Colors */
--dark-title: #363636;    /* Headings */
--gray-800: #1F2937;      /* Body text */
--gray-600: #4B5563;      /* Secondary text */
--gray-400: #9CA3AF;      /* Disabled text */

/* Status Colors */
--success: #10B981;       /* Green - success toast */
--error: #EF4444;         /* Red - error messages */
--warning: #F59E0B;       /* Yellow - warnings */
--info: #3B82F6;          /* Blue - info badges */

/* Backgrounds */
--white: #FFFFFF;
--gray-50: #F9FAFB;       /* Light background */
--gray-100: #F3F4F6;      /* Card backgrounds */
```

---

## 📐 Spacing System

```css
/* Tailwind Classes Used */
gap-2   = 8px   /* Tight spacing */
gap-3   = 12px  /* Small spacing */
gap-4   = 16px  /* Standard spacing */
gap-6   = 24px  /* Large spacing */
gap-8   = 32px  /* Extra large */

p-4     = 16px padding
p-6     = 24px padding
px-4    = 16px horizontal
py-3    = 12px vertical
```

---

## 🔤 Typography

```css
/* Headings */
text-3xl font-bold        /* Restaurant name */
text-2xl font-bold        /* Category titles */
text-xl font-bold         /* Modal titles */
text-lg font-bold         /* Item names */

/* Body */
text-base                 /* Standard text */
text-sm                   /* Secondary info */
text-xs                   /* Tiny text, badges */

/* Special */
font-semibold             /* Prices, totals */
font-medium               /* Badges, labels */
```

---

## 🎭 Animations

### 1. **Slide Down** (Toast)
```css
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}
Duration: 300ms
Easing: ease-out
```

### 2. **Scale** (Buttons)
```css
hover:scale-110
transition-transform
Duration: 200ms
```

### 3. **Pulse** (Floating Cart)
```css
/* On item add */
animation: pulse 0.5s
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
Base:         0px - 639px   (Stack everything)
sm:         640px - 767px   (Small tablets)
md:         768px - 1023px  (Tablets)
lg:        1024px - 1279px  (Desktop - sidebar shows)
xl:        1280px+          (Large desktop)

/* Key Changes */
- lg: Sidebar appears
- lg: 3-column grid (menu + sidebar)
- sm: Cart modal full-width
- lg: Cart modal max-w-2xl
```

---

## 🎯 Interactive States

### Button States:
```css
Default:   bg-primary text-white
Hover:     bg-primary/90 scale-105
Active:    scale-95
Disabled:  bg-gray-300 cursor-not-allowed
Loading:   opacity-50 cursor-wait
```

### Input States:
```css
Default:   border-gray-300
Focus:     ring-2 ring-primary border-transparent
Error:     border-red-500 ring-2 ring-red-200
```

### Card States:
```css
Default:   shadow-sm border-gray-100
Hover:     shadow-md
Active:    shadow-lg
```

---

## 🖼️ Image Handling

```typescript
// Item Images
Size: 128x128 (compact)
Border-radius: 8px (rounded-lg)
Object-fit: cover

// Restaurant Logo
Size: 96x96 (w-24 h-24)
Border-radius: 12px (rounded-xl)
Border: 2px gray

// Modal Hero
Width: 100%
Height: 192px (h-48)
Object-fit: cover

// Fallback
Gradient background with icon
```

---

## 🎬 User Interaction Flow

### Adding Item:
```
1. Hover item → Card shadow increases
2. Click "Add" → Button scale down (active)
3. API call → Show loading spinner
4. Success → Toast slides down
5. Button changes to [- 1 +]
6. Floating cart button appears with count
```

### Opening Cart:
```
1. Click floating button → Scale effect
2. Modal slides up from bottom (mobile)
3. Modal fades in (desktop)
4. Item list scrollable if many items
5. Click outside → Modal closes
```

### Checkout:
```
1. Click "Proceed" → Button loading state
2. Validate minimum order
3. Update cart status → API call
4. Navigate to checkout → Page transition
5. Toast: "Redirecting to checkout..."
```

---

## 📏 Component Dimensions

```css
/* Restaurant Header */
Height: auto (compact)
Padding: 24px (py-6)

/* Search Bar */
Height: 44px
Max-width: 448px (max-w-md)

/* Category Tabs */
Height: 48px per tab
Padding: 12px vertical

/* Menu Item Card */
Min-height: 180px
Padding: 16px

/* Cart Modal */
Max-width: 672px (max-w-2xl)
Max-height: 90vh

/* Floating Cart Button */
Height: 64px
Padding: 16px 24px
Bottom: 24px, Right: 24px

/* Toast */
Padding: 16px 24px
Top: 80px (below navbar)
```

---

## 🎨 Visual Hierarchy

### 1. **Primary Focus**
- Restaurant name (3xl bold)
- Item names (lg bold)
- Prices (primary color, semibold)
- Checkout button (large, primary)

### 2. **Secondary Focus**
- Ratings & reviews
- Delivery time
- Category tabs
- Quantity controls

### 3. **Tertiary**
- Descriptions
- Nutrition info
- Allergens
- Special notes

---

## 🌈 Badge System

### Dietary Badges:
```css
Vegetarian: bg-green-100 text-green-700
Vegan:      bg-green-100 text-green-700
Halal:      bg-blue-100 text-blue-700
```

### Status Badges:
```css
Available:     bg-green-50 border-green-200
Unavailable:   bg-red-50 border-red-200
Featured:      bg-yellow-50 border-yellow-200
```

---

## 🎯 Call-to-Action Hierarchy

### Primary CTAs:
- "Add to Cart" button
- "Proceed to Checkout" button
- Quantity increment buttons

### Secondary CTAs:
- Share button
- Favorite button
- Clear cart button

### Tertiary CTAs:
- Search input
- Category filters
- Special instructions

---

## 📐 Grid Layout

```css
/* Desktop Layout (lg+) */
┌────────────────────────────────────┐
│  [Header - Full Width]            │
├────────────────────────────────────┤
│  [Search & Categories - Sticky]   │
├─────────────────────┬──────────────┤
│  Menu Items         │  Sidebar    │
│  (lg:col-span-2)    │  (1 col)    │
│                     │             │
│  [Item]  [Item]     │  Info Card  │
│  [Item]  [Item]     │             │
│  [Item]  [Item]     │             │
└─────────────────────┴──────────────┘

/* Mobile Layout */
┌────────────────┐
│  [Header]      │
├────────────────┤
│  [Search]      │
│  [Categories]  │
├────────────────┤
│  [Item]        │
│  [Item]        │
│  [Item]        │
└────────────────┘
```

---

## 🎨 Icon System

```typescript
// Using Lucide React Icons
Clock          → Delivery time
Star           → Ratings
MapPin         → Location
Phone          → Contact
Heart          → Favorites
Share2         → Share
Search         → Search
ShoppingCart   → Cart
Plus / Minus   → Quantity
X              → Close
ChevronRight   → Breadcrumb
AlertCircle    → Warnings
Check          → Success

// Using React Icons (FA)
FaLeaf         → Vegetarian
FaCarrot       → Vegan
FaCheckCircle  → Halal
FaUtensils     → Food default
```

---

## 🌟 Polish Details

### Micro-interactions:
- ✅ Button scale on click
- ✅ Card lift on hover
- ✅ Toast slide animation
- ✅ Smooth category scroll
- ✅ Quantity button pulse

### Loading States:
- ✅ Skeleton screens (ready)
- ✅ Spinner on actions
- ✅ Disabled button states
- ✅ Optimistic updates

### Empty States:
- ✅ Empty cart message
- ✅ No search results
- ✅ No menu items
- ✅ Restaurant unavailable

---

## 🎭 Emotional Design

### Colors:
- **Orange** = Energy, appetite, action
- **Green** = Health, fresh, organic
- **Gray** = Clean, minimal, modern

### Typography:
- **Bold** = Confidence, clarity
- **Medium** = Balance
- **Light** = Elegance, space

### Spacing:
- **Generous** = Comfort, breathing room
- **Compact** = Efficiency, density
- **Consistent** = Professional, polished

---

This visual guide helps understand the complete UI/UX design! 🎨✨

# Node.js Lesson 22 - Pug Template Engine

## What I Learned

### 1. Pug Template Engine Basics

**What is Pug?**
- A template engine that compiles to HTML
- Uses **indentation** instead of closing tags (like Python)
- Supports variables, loops, conditionals, and inheritance
- Makes HTML more readable and less verbose

**Syntax Comparison:**

```pug
// Pug - Clean and concise
doctype html
html(lang="en")
    head
        meta(charset="UTF-8")
        title My Page
    body
        header.main-header
            h1 Welcome
        main
            p This is a paragraph
```

```html
<!-- Rendered HTML -->
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>My Page</title>
    </head>
    <body>
        <header class="main-header">
            <h1>Welcome</h1>
        </header>
        <main>
            <p>This is a paragraph</p>
        </main>
    </body>
</html>
```

---

### 2. Layout Inheritance with `extends`

**This was the most challenging concept!**

#### Why Use Layout Inheritance?

Without inheritance, every page repeats the same HTML structure:

```pug
// BAD: shop.pug (lots of repetition)
doctype html
html(lang="en")
    head
        title Shop
        link(rel="stylesheet", href="/css/main.css")
    body
        header.main-header
            nav
                // Navigation menu
        main
            // Shop content here
```

```pug
// BAD: add-product.pug (same repetition again!)
doctype html
html(lang="en")
    head
        title Add Product
        link(rel="stylesheet", href="/css/main.css")
    body
        header.main-header
            nav
                // Same navigation menu again!
        main
            // Product form here
```

**Problems with this approach:**
- Code duplication (navigation, header, footer repeated everywhere)
- Hard to maintain (change navigation = edit every file)
- Easy to make mistakes (forget to update one page)

#### Solution: Create a Parent Layout

**Step 1: Create Parent Layout (layouts/main-layout.pug)**

```pug
doctype html
html(lang="en")
    head
        meta(charset="UTF-8")
        meta(name="viewport", content="width=device-width, initial-scale=1.0")
        title Page Not Found
        link(rel="stylesheet", href="/css/main.css")

        //- Block: Child templates can add extra CSS here
        block styles

    body
        header.main-header
            nav.main-header__nav
                ul.main-header__item-list
                    li.main-header__item
                        a(href="/") Shop
                    li.main-header__item
                        a(href="/admin/add-product") Add Product

        //- Block: Child templates put their main content here
        block content
```

**Step 2: Child Templates Extend the Parent**

```pug
// GOOD: add-product.pug (much cleaner!)
extends layouts/main-layout.pug

//- Add page-specific CSS by filling the "styles" block
block styles
    link(rel="stylesheet", href="/css/forms.css")
    link(rel="stylesheet", href="/css/product.css")

//- Add page content by filling the "content" block
block content
    main
        form.product-form(action="/admin/add-product", method="POST")
            .form-control
                label(for="title") Title
                input(type="text", name="title")#title
            button.btn(type="submit") Add Product
```

```pug
// GOOD: 404.pug (even simpler!)
extends layouts/main-layout.pug

block content
    h1 Page Not Found!!
```

**Benefits:**
- Write navigation/header/footer **once** in parent
- Child templates only define **unique content**
- Change navigation in **one place** = updates all pages
- Consistent structure across all pages

---

### 3. Understanding `block`

**What is a `block`?**
- A **placeholder** in the parent template
- Child templates can **fill or override** these placeholders
- Think of it like a **slot** where children inject their content

**How it works:**

| Component | Role | Example |
|-----------|------|---------|
| **Parent defines block** | Creates a placeholder | `block styles` |
| **Child fills block** | Provides content for that placeholder | `block styles` + CSS links |
| **Result** | Child's content appears where parent defined the block | Additional CSS loads for that page only |

**Visual Flow:**

```
Parent (main-layout.pug):
┌─────────────────────┐
│ <head>              │
│   <link main.css>   │
│   [block styles]  ← │ Placeholder for child CSS
│ </head>             │
│ <body>              │
│   <header>...</>    │
│   [block content] ← │ Placeholder for child content
│ </body>             │
└─────────────────────┘

Child (add-product.pug):
┌─────────────────────┐
│ extends parent      │
│                     │
│ block styles:       │
│   forms.css       →│ Fills parent's "styles" block
│   product.css     →│
│                     │
│ block content:      │
│   <form>...</>    →│ Fills parent's "content" block
└─────────────────────┘

Final Output:
┌─────────────────────┐
│ <head>              │
│   <link main.css>   │
│   <link forms.css>  │← From child's "styles" block
│   <link product.css>│
│ </head>             │
│ <body>              │
│   <header>...</>    │
│   <form>...</>      │← From child's "content" block
│ </body>             │
└─────────────────────┘
```

---

### 4. Passing Data from Server to Template

**Server Side (routes/shop.js):**

```javascript
router.get('/', (req, res, next) => {
  const products = adminData.products;

  // res.render(templateName, dataObject)
  res.render('shop', {
    prods: products,        // prods: variable name in template
    docTitle: 'Shop'        // docTitle: page title
  });
});
```

**Template Side (shop.pug):**

```pug
//- Access variables passed from server
title #{docTitle}

//- Use conditionals
if prods.length > 0
    .grid
        //- Loop through array
        //- "each [item] in [array]" syntax
        each product in prods
            article.card.product-item
                h1.product__title #{product.title}
else
    h1 No Products
```

**Data Flow:**

```
Server (shop.js)
    ↓
res.render('shop', { prods: [...], docTitle: 'Shop' })
    ↓
Template receives: { prods: [...], docTitle: 'Shop' }
    ↓
Can use: #{docTitle}, #{product.title}, etc.
```

---

### 5. Pug Syntax Essentials

#### Tags and Nesting

```pug
// Just write tag name - no angle brackets
div
    p Hello
    p World

// Nesting by indentation (like Python)
ul
    li Item 1
    li Item 2
    li Item 3
```

#### Attributes

```pug
// Attributes in parentheses
a(href="/", class="link") Click here
input(type="text", name="title", id="title")

// ID and class shortcuts
div#myId.myClass.anotherClass
// Becomes: <div id="myId" class="myClass anotherClass"></div>

// Mix both
form.product-form(action="/admin/add-product", method="POST")
```

#### Variables and Interpolation

```pug
//- 1. Inline interpolation with #{}
p Welcome to #{docTitle}
p User: #{user.name}, Age: #{user.age}

//- 2. Entire content as variable with =
p= description
// If description = "Hello", output: <p>Hello</p>

//- 3. Unescaped HTML with !{}
p !{htmlContent}
// Dangerous! Only use with trusted content
```

#### Comments

```pug
//- This is a Pug comment (won't appear in HTML output)

// This is an HTML comment (will appear as <!-- comment -->)
```

#### Conditionals

```pug
if user.isLoggedIn
    p Welcome back!
else if user.isGuest
    p Hello, guest!
else
    p Please log in

//- Inline conditional
p(class=(isActive ? 'active' : 'inactive'))
```

#### Loops

```pug
//- Loop through array
each item in items
    li= item

//- Loop with index
each item, index in items
    li #{index}: #{item}

//- Handle empty arrays
each product in products
    p= product.title
else
    p No products found
```

---

### 6. Express Configuration

```javascript
// app.js

const express = require('express');
const app = express();

// Tell Express to use Pug as the template engine
app.set('view engine', 'pug');

// Specify where to find templates (default: 'views' folder)
app.set('views', 'views');

// Render a template
app.get('/', (req, res) => {
    // Express automatically:
    // 1. Looks for views/shop.pug
    // 2. Compiles it to HTML
    // 3. Sends HTML to client
    res.render('shop', { prods: [], docTitle: 'Shop' });
});
```

---

## Project Structure

```
nodejs-lesson-22/
│
├── app.js                          # Main application entry point
│   └── Sets up Express, Pug, routes
│
├── routes/
│   ├── admin.js                   # Admin routes (/admin/add-product)
│   │   └── Handles GET/POST for adding products
│   └── shop.js                    # Shop routes (/)
│       └── Displays products list
│
├── views/                          # Pug templates
│   ├── layouts/
│   │   └── main-layout.pug       # Parent template with blocks
│   │       ├── block styles      # For child-specific CSS
│   │       └── block content     # For child page content
│   │
│   ├── add-product.pug            # Extends main-layout
│   │   ├── Adds forms.css + product.css to styles block
│   │   └── Product form in content block
│   │
│   ├── shop.pug                   # Standalone (doesn't extend)
│   │   └── Displays all products or "No Products"
│   │
│   └── 404.pug                    # Extends main-layout
│       └── Simple error message
│
├── public/                        # Static files served by Express
│   └── css/
│       ├── main.css              # Global styles (header, buttons, cards)
│       ├── forms.css             # Form input styles
│       └── product.css           # Product-specific styles
│
└── util/
    └── path.js                    # Helper to get project root directory
```

---

## Q&A - Common Questions

### Q1: Why use `extends` and layout inheritance? Why not just copy/paste HTML?

**A:** Three main reasons:

1. **DRY Principle (Don't Repeat Yourself)**
   - Without inheritance: Navigation code exists in 10 files
   - With inheritance: Navigation code exists in 1 file
   - Change navigation = edit 1 file vs 10 files

2. **Consistency**
   - All pages automatically have the same header/footer/navigation
   - Impossible to accidentally have different navs on different pages

3. **Easier Maintenance**
   - Add a new menu item? Change one line in main-layout.pug
   - All pages instantly updated

**Example:**
```
Without inheritance:
shop.pug (200 lines) → 150 lines are duplicated HTML
404.pug (200 lines) → 150 lines are duplicated HTML
add-product.pug (220 lines) → 150 lines are duplicated HTML

With inheritance:
main-layout.pug (150 lines) ← All common HTML here
shop.pug (50 lines) ← Only unique content
404.pug (10 lines) ← Only unique content
add-product.pug (20 lines) ← Only unique content
```

---

### Q2: What exactly is a `block`? Why do I need it?

**A:** A `block` is like a **customizable slot** in your template.

**Analogy:** Think of a house blueprint:
- The blueprint (parent template) shows: foundation, walls, roof
- But it has **blank spaces** for: "put kitchen appliances here", "put bedroom furniture here"
- Each homeowner (child template) fills those blank spaces differently

**In Pug:**
```pug
// Parent (blueprint)
html
    head
        link(rel="stylesheet", href="/css/main.css")
        block styles     ← Blank space for extra CSS
    body
        block content    ← Blank space for page content

// Child 1 (shop page)
extends parent
block styles
    link(href="/css/shop.css")   ← Fills the styles slot
block content
    h1 Shop                       ← Fills the content slot

// Child 2 (product page)
extends parent
block styles
    link(href="/css/product.css") ← Fills the styles slot differently
block content
    h1 Add Product                ← Fills the content slot differently
```

**Without blocks:**
- Every child would have the exact same content
- No way to customize anything
- Defeats the purpose of templates!

---

### Q3: Why use Pug instead of plain HTML?

**A:** Pug advantages:

| Feature | HTML | Pug |
|---------|------|-----|
| **Syntax** | Verbose, many closing tags | Clean, minimal, indentation-based |
| **Repetition** | Must copy common code | Template inheritance with `extends` |
| **Dynamic content** | Need separate templating system | Built-in: variables, loops, conditionals |
| **Errors** | Easy to forget closing tags | Indentation makes structure obvious |
| **Maintenance** | Change navigation = edit 10 files | Change once in parent template |

**Code comparison:**

```html
<!-- HTML: 8 lines -->
<div class="card product-item">
    <header class="card__header">
        <h1 class="product__title">Book Title</h1>
    </header>
    <div class="card__content">
        <p class="product__price">$19.99</p>
    </div>
</div>
```

```pug
// Pug: 5 lines (37% shorter)
.card.product-item
    header.card__header
        h1.product__title Book Title
    .card__content
        p.product__price $19.99
```

---

### Q4: When should I use different variable interpolation methods?

**A:**

```pug
//- 1. #{variable} - Use INSIDE text when mixing text and variables
p The user #{username} has #{count} items
// Output: <p>The user john has 5 items</p>

//- 2. = variable - Use when ENTIRE content is a variable
p= description
// If description = "Hello", Output: <p>Hello</p>

//- 3. !{variable} - Use ONLY with trusted HTML (dangerous!)
div !{htmlContent}
// If htmlContent = "<strong>Bold</strong>", Output: <div><strong>Bold</strong></div>
// WARNING: User input = XSS vulnerability! Only use with safe content
```

**Rule of thumb:**
- **#{var}** → Default choice for most cases
- **= var** → When variable is the only thing in the tag
- **!{var}** → Avoid unless absolutely necessary (security risk)

---

### Q5: What happens if I mess up indentation?

**A:** Pug will either throw an error or generate wrong HTML.

```pug
// WRONG
div
    p Line 1
      p Line 2    // 2 extra spaces
    p Line 3

// Generates:
<div>
    <p>Line 1
        <p>Line 2</p>    ← Nested inside Line 1!
    </p>
    <p>Line 3</p>
</div>
```

```pug
// CORRECT
div
    p Line 1
    p Line 2
    p Line 3

// Generates:
<div>
    <p>Line 1</p>
    <p>Line 2</p>
    <p>Line 3</p>
</div>
```

**Fix:** Use a code editor that shows indentation guides (VS Code, etc.)

---

### Q6: Can I use multiple `extends`? Can a child extend another child?

**A:**

```pug
// NO - Can't extend multiple parents
extends layout1.pug
extends layout2.pug  // ERROR!

// YES - Can chain extends (grandparent → parent → child)
// base-layout.pug (grandparent)
block content

// main-layout.pug (parent)
extends base-layout.pug
block content
    header
        block header

// shop.pug (child)
extends main-layout.pug
block header
    h1 Shop
```

**Rule:** One `extends` per file, but you can chain them

---

### Q7: Why does `shop.pug` not extend the layout in this project?

**A:** Good catch! Looking at the code:

```pug
// shop.pug - Has its own full HTML structure
doctype html
html(lang="en")
    head
        // Full head section
    body
        // Full body with navigation
        main
            // Shop content
```

**This is actually inconsistent!**

- `add-product.pug` extends `main-layout.pug` (correct)
- `404.pug` extends `main-layout.pug` (correct)
- `shop.pug` doesn't extend anything (incorrect)

**It should be refactored to:**

```pug
// shop.pug (refactored)
extends layouts/main-layout.pug

block content
    main
        if prods.length > 0
            .grid
                each product in prods
                    // Product cards
        else
            h1 No Products
```

This is probably left over from when you were learning and hadn't implemented layouts yet!

---

### Q8: Do I always need `block styles` and `block content`? Can I have more blocks?

**A:** You can have as many blocks as you want!

```pug
// layouts/main-layout.pug
doctype html
html
    head
        block title
            title Default Title    // Default content for block
        block meta
        block styles
    body
        header
            block header
        main
            block content
        footer
            block footer
```

```pug
// child.pug
extends layouts/main-layout.pug

block title
    title My Custom Page Title

block header
    h1 Custom Header

block content
    p Page content here

// No need to fill ALL blocks - unfilled blocks use default or stay empty
```

**Common blocks:**
- `block title` - Page title
- `block meta` - Meta tags
- `block styles` - Additional CSS
- `block scripts` - Additional JavaScript
- `block header` - Header content
- `block content` - Main content
- `block footer` - Footer content

---

### Q9: How do I pass complex data (objects, arrays) to templates?

**A:** Just pass JavaScript objects/arrays normally:

```javascript
// Server side
res.render('shop', {
    products: [
        { id: 1, title: 'Book', price: 19.99 },
        { id: 2, title: 'Pen', price: 2.99 }
    ],
    user: {
        name: 'John',
        isAdmin: true
    },
    settings: {
        theme: 'dark',
        language: 'en'
    }
});
```

```pug
//- Template side - Access with dot notation
p Welcome, #{user.name}!

if user.isAdmin
    a(href="/admin") Admin Panel

each product in products
    .product
        h2= product.title
        p $#{product.price}
```

---

### Q10: Pug vs EJS vs Handlebars - which should I use?

**A:**

| Feature | Pug | EJS | Handlebars |
|---------|-----|-----|------------|
| **Syntax** | Indentation-based, no closing tags | HTML-like with `<% %>` tags | HTML-like with `{{ }}` |
| **Learning curve** | Steeper (new syntax) | Easier (similar to HTML) | Medium |
| **Template inheritance** | Built-in with `extends` | Manual with `include` | Built-in with layouts |
| **Logic in templates** | Full JavaScript | Full JavaScript | Limited (helpers only) |
| **Best for** | Clean, minimal HTML | Quick start, HTML-like | Logic-less templates |

**My recommendation:**
- **Learning Node.js?** → Start with **EJS** (easiest, closest to HTML)
- **Want clean code?** → Use **Pug** (this lesson)
- **Working with designers?** → Use **Handlebars** (closer to HTML, less logic)

---

## How to Run

```bash
# Install dependencies
npm install

# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

Then open your browser to: **http://localhost:3000**

---

## Key Takeaways

- **Pug eliminates repetitive HTML** with template inheritance
- **`extends` + `block`** = powerful way to share common structure
- **Indentation matters** - be consistent with spaces/tabs
- **Pass data from server** with `res.render(template, data)`
- **Use layouts** for navigation, headers, footers - write once, use everywhere
- **Variables, loops, conditionals** - all built into Pug

**Most important concept:** Template inheritance lets you write common HTML (header, nav, footer) **once** and reuse it everywhere, making maintenance much easier!

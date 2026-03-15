# Infinity Pearls - E-Commerce Website

A fully responsive e-commerce website for handcrafted jewelry with modern features.

## 🚀 Features

- **Top Navigation Bar** - Fixed header with logo and navigation links
- **Hamburger Menu** - Responsive mobile navigation
- **Shopping Cart** - Side panel with add/remove functionality
- **Product Grid** - Responsive card layout for 10 products
- **Product Modal** - Detailed product view pop-up
- **Notifications** - Toast notifications for user actions
- **Mobile Responsive** - Works on all screen sizes
- **Local Storage** - Cart persists between sessions

## 📁 Project Structure

```
infinity-pearls-project/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # All styles
├── js/
│   └── script.js       # All JavaScript functionality
├── images/             # Product images folder
│   └── logo.jpg        # Logo (place your logo here)
│   └── [product images]
└── README.md           # This file
```

## 🎨 How to Set Up in VS Code

### 1. Open the Project
- Open VS Code
- Click `File` > `Open Folder`
- Navigate to and select the `infinity-pearls-project` folder

### 2. Add Your Images
- Place all your product images in the `images/` folder
- Rename the logo image to `logo.jpg` or update the path in `index.html`
- Update image filenames in `js/script.js` to match your actual image files

### 3. Install Live Server (Recommended)
- Open VS Code Extensions (Ctrl+Shift+X or Cmd+Shift+X)
- Search for "Live Server" by Ritwick Dey
- Click Install
- Right-click on `index.html` and select "Open with Live Server"

### 4. Alternative - Open Directly
- Navigate to the project folder
- Double-click `index.html` to open in your default browser

## 🛠️ Customization Guide

### Changing Colors
Edit `css/style.css` - Look for the `:root` variables at the top:
```css
:root {
    --primary-color: #2c3e50;      /* Main dark color */
    --secondary-color: #d4af37;    /* Gold accent */
    --accent-color: #e74c3c;       /* Red for badges */
    --bg-color: #f8f9fa;           /* Background */
}
```

### Adding/Editing Products
Edit `js/script.js` - Find the `products` array and modify:
```javascript
const products = [
    {
        id: 1,
        name: "Product Name",
        description: "Product description",
        price: 60,
        image: "images/your-image.jpg"
    },
    // Add more products here
];
```

### Changing Text Content
Edit `index.html` - All text content is in the HTML file:
- Hero section text
- Product section headers
- Footer information
- Contact details

## 📱 Mobile Testing

### Browser DevTools
- Press F12 in your browser
- Click the device toggle button (Ctrl+Shift+M)
- Test different screen sizes

### VS Code Extensions for Mobile Testing
- Install "Browser Preview" extension
- Test responsive design within VS Code

## 🔧 VS Code Recommended Extensions

1. **Live Server** - Live reload for instant preview
2. **Prettier** - Code formatter
3. **Auto Rename Tag** - Automatically rename paired HTML tags
4. **CSS Peek** - Jump to CSS definitions
5. **JavaScript (ES6) code snippets** - Code snippets for JavaScript

## 🎯 Key Features Explained

### Navigation
- **Desktop**: Full horizontal menu
- **Mobile**: Hamburger menu with slide-in navigation

### Shopping Cart
- Click cart icon to open side panel
- Add/remove items
- Cart persists using localStorage
- Shows total price and item count

### Product Cards
- Click any card to open detailed modal
- Hover effects for better UX
- Responsive grid layout

### Notifications
- Auto-show on page load
- Show when adding items to cart
- Auto-dismiss after 3 seconds

## 💡 Tips for Development

### Hot Reload
Use Live Server for automatic browser refresh when you save files.

### Console Debugging
Open browser console (F12) to see any JavaScript errors.

### Mobile-First Approach
Test on mobile view first, then scale up to desktop.

### File Organization
- Keep HTML structure clean
- CSS is organized by sections with comments
- JavaScript functions are grouped logically

## 🐛 Troubleshooting

### Images Not Showing?
- Check image paths in `js/script.js`
- Ensure images are in the `images/` folder
- Check browser console for 404 errors

### Cart Not Working?
- Check browser console for JavaScript errors
- Ensure script.js is properly linked in HTML
- Clear browser cache and reload

### Styling Issues?
- Verify style.css is linked in HTML
- Check for CSS syntax errors
- Clear browser cache

### Mobile Menu Not Working?
- Ensure JavaScript is loading
- Check that IDs in HTML match those in JavaScript
- Test in different browsers

## 📝 Customization Checklist

- [ ] Replace logo image
- [ ] Add all product images
- [ ] Update product data in script.js
- [ ] Customize colors in style.css
- [ ] Update contact information
- [ ] Update social media links
- [ ] Test on mobile devices
- [ ] Test cart functionality
- [ ] Test all navigation links

## 🚀 Deployment Options

### GitHub Pages (Free)
1. Create a GitHub repository
2. Push your code
3. Enable GitHub Pages in repository settings   




### Netlify (Free)
1. Drag and drop your project folder to netlify.com
2. Get instant deployment

### Vercel (Free)
1. Install Vercel CLI
2. Run `vercel` in project directory

## 📞 Support

For questions or issues:
- Check the browser console for errors
- Review this README thoroughly
- Test in multiple browsers
 

## 🎉 Features to Add (Future Enhancements)

- [ ] Search functionality
- [ ] Product filtering
- [ ] Wishlist feature
- [ ] User reviews
- [ ] Payment integration
- [ ] Order tracking
- [ ] Admin panel
- [ ] Database integration

## 📜 License

This project is created for Infinity Pearls. All rights reserved.

---

**Made with ❤️ for Infinity Pearls** 

# Splita Coming Soon Page

A beautiful, animated coming soon page for Splita built with React, Vite, TypeScript, and Tailwind CSS.

## 🚀 Features

- ✨ Animated gradient background with floating particles
- 🎨 Light/Dark mode toggle
- 🔒 Password-protected early access button
- 📝 Contact form with validation (React Hook Form + Zod)
- ⏰ Countdown timer to pilot launch
- 📊 Social proof stats with animations
- 💬 Floating chat bubble animation
- 📱 Fully responsive design
- 🎭 Smooth scroll-triggered animations (Framer Motion)

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

4. **Preview production build:**
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
splita-coming-soon/
├── src/
│   ├── components/
│   │   ├── Hero.tsx              # Hero section with logo and headline
│   │   ├── ContactForm.tsx       # Email subscription form
│   │   ├── SocialProof.tsx       # Stats display
│   │   ├── Countdown.tsx         # Launch countdown timer
│   │   ├── Footer.tsx            # Footer with links
│   │   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   │   ├── FloatingChatBubble.tsx # Animated chat button
│   │   └── EarlyAccessButton.tsx # Password-protected early access
│   ├── App.tsx                   # Main app component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## 🎨 Customization

### Update Launch Date
Edit the `LAUNCH_DATE` constant in `src/components/Countdown.tsx`:
```typescript
const LAUNCH_DATE = new Date("2025-06-01T00:00:00").getTime();
```

### Replace Logo
Replace the logo placeholder in `src/components/Hero.tsx` with your actual Splita logo:
```tsx
<img 
  src="/path-to-your-logo.png" 
  alt="Splita Logo" 
  className="w-32 h-32"
/>
```

### Update Early Access Password
Change the password in `src/components/EarlyAccessButton.tsx`:
```typescript
const EARLY_ACCESS_PASSWORD = "your-password-here";
```

You can also update the redirect URL after successful authentication:
```typescript
window.location.href = "/your-early-access-url";
```

### Update API Endpoint
Update the API endpoint in `src/components/ContactForm.tsx`:
```typescript
const response = await fetch("YOUR_API_ENDPOINT", {
  method: "POST",
  // ...
});
```

### Modify Colors
Update colors in `tailwind.config.ts`:
```typescript
colors: {
  "sea-green": "#02B7A0",
  "teal-500": "#14B8A6",
  "purple-600": "#9333EA",
}
```

## 📦 Dependencies

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Lucide React** - Icons

## 🚢 Deployment

This project can be deployed to:
- **Vercel** - `vercel deploy`
- **Netlify** - `netlify deploy`
- **GitHub Pages** - Build and push `dist` folder
- **Any static hosting** - Build and serve the `dist` folder

## 📝 Notes

- The contact form currently uses a placeholder API endpoint. Update it to connect to your backend.
- The logo is currently a placeholder. Replace it with your actual Splita logo.
- All animations are optimized for performance using Framer Motion.
- The page is fully responsive and works on all device sizes.

## 📄 License

© Splita 2025. All rights reserved.


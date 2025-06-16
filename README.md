# Infinite Grid Component

A high-performance, interactive 3D infinite grid component built with Vue 3, TresJS (Three.js), and Konva for dynamic card rendering. This component creates a seamless, infinitely scrollable grid of cards with smooth animations and hover effects.

## Features

- 🌊 **Infinite Scrolling**: Seamless scrolling in all directions with dynamic tile repositioning
- 🎨 **Dynamic Card Rendering**: Cards are generated using Konva.js with customizable content and styling
- ✨ **Smooth Animations**: GSAP-powered hover effects and transitions
- 📱 **Touch & Mouse Support**: Full support for desktop and mobile interactions
- 🔧 **Highly Configurable**: Customizable grid dimensions, tile sizes, and camera settings
- 🎯 **Performance Optimized**: Efficient rendering with cached textures and uniforms
- 🌟 **Gaussian Blur Effects**: Beautiful shader-based background blur effects on hover

## Basic Usage

```vue
<template>
  <InfiniteGrid :cardData="cards" :options="gridOptions" />
</template>

<script setup>
import InfiniteGrid from './components/InfiniteGrid.vue';

const cards = [
  {
    title: 'Card Title',
    badge: 'NEW',
    description: 'Card description text',
    tags: ['tag1', 'tag2'],
    date: '2024-01-15',
    imageUrl: '/path/to/image.jpg'
  }
  // ... more cards
];

const gridOptions = {
  gridCols: 3,
  gridRows: 3,
  tileSize: 3,
  baseCameraZ: 10
};
</script>
```

## Props

### `cardData` (required)

Array of card objects with the following structure:

```typescript
interface CardData {
  title: string; // Card title text
  badge: string; // Optional badge text (e.g., "NEW", "FEATURED")
  description: string; // Card description
  tags: string[]; // Array of tag strings
  date: string; // Date string
  imageUrl?: string; // Optional image URL
}
```

### `options` (optional)

Configuration object for grid behavior:

```typescript
interface Options {
  gridCols?: number; // Number of columns (default: 3)
  gridRows?: number; // Number of rows (default: 3)
  gridGap?: number; // Gap between tiles (default: 0)
  tileSize?: number; // Size of each tile (default: 3)
  baseCameraZ?: number; // Base camera Z position (default: 10)
}
```

## Styling

The component includes default styling with a dark theme and vignette overlay:

```css
.infinite-grid-container {
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.vignette-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(/* vignette effect */);
  pointer-events: none;
}
```

## Interaction Controls

- **Mouse/Touch Drag**: Pan around the infinite grid
- **Mouse Wheel**: Scroll through the grid
- **Hover**: Activate blur background effects
- **Click**: Trigger tile click events (customizable)

## Technical Details

### Architecture

- **Frontend**: Vue 3 with Composition API
- **3D Rendering**: TresJS (Three.js wrapper for Vue)
- **Canvas Generation**: Konva.js for dynamic card textures
- **Animations**: GSAP for smooth transitions
- **Shaders**: Custom GLSL shaders for blur effects

### Performance Optimizations

- Cached texture generation to prevent re-rendering
- Static uniform caching for shader materials
- Efficient infinite scroll algorithm with tile repositioning
- Debounced scroll and hover events
- Optimized render loop with selective updates

### Shader Effects

The component includes custom GLSL shaders for:

- Gaussian blur background effects
- Dynamic opacity transitions
- High-quality texture rendering

## Customization

### Custom Card Styling

Modify the `generateForegroundTexture` and `generateBackgroundTexture` functions in `utils/createTexture.ts` to customize card appearance:

```typescript
// Example: Custom card styling
const titleText = new Konva.Text({
  text: data.title,
  fontSize: 28,
  fontFamily: 'Custom Font',
  fill: '#custom-color'
  // ... other properties
});
```

### Custom Hover Effects

Modify hover animation parameters:

```typescript
const hoverTransitionDuration = 0.6;
const hoverEase = 'power2.out';
const hoveredBackgroundOpacity = 1.0;
```

### Grid Layout

Adjust grid parameters through the options prop:

```javascript
const customOptions = {
  gridCols: 4, // 4x4 grid
  gridRows: 4,
  tileSize: 2.5, // Smaller tiles
  gridGap: 0.5, // Add spacing between tiles
  baseCameraZ: 15 // Pull camera back
};
```

## Browser Support

- Modern browsers with WebGL support
- Mobile browsers (iOS Safari, Chrome Mobile)
- Desktop browsers (Chrome, Firefox, Safari, Edge)

## Dependencies

- **Vue 3**: Reactive framework
- **TresJS**: Three.js integration for Vue
- **Three.js**: 3D graphics library
- **Konva.js**: 2D canvas library for card generation
- **GSAP**: Animation library
- **VueUse**: Vue composition utilities

## Performance Considerations

- Card textures are cached after initial generation
- Infinite scroll uses efficient tile repositioning rather than creating new elements
- Hover effects are debounced to prevent excessive re-renders
- Shader uniforms are cached to prevent recreation

## Troubleshooting

### Common Issues

**Cards not displaying:**

- Ensure `cardData` prop is properly formatted
- Check browser console for texture loading errors
- Verify image URLs are accessible

**Performance issues:**

- Reduce grid size (`gridCols` × `gridRows`)
- Optimize image sizes and formats
- Consider reducing `hoverTransitionDuration`

**Touch events not working:**

- Ensure passive event listeners are properly configured
- Check for CSS `touch-action` conflicts

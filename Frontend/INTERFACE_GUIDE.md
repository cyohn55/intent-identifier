# Visual Interface Guide

## Interface Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Intent Identifier Chat Interface                         │
│                     Powered by Llama 3.2 via Ollama                        │
└─────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────┬──────────────────────────────────────────┐
│          Chat Panel              │         Intent Analysis Panel            │
│  ┌────────────────────────────┐  │  ┌────────────────────────────────────┐ │
│  │ Chat       [Clear Chat]    │  │  │ Intent Analysis    [Confidence: 92%]│ │
│  └────────────────────────────┘  │  └────────────────────────────────────┘ │
│  ┌────────────────────────────┐  │  ┌────────────────────────────────────┐ │
│  │                            │  │  │  {                                  │ │
│  │  Welcome! Send a message   │  │  │    "intent": "greeting",           │ │
│  │  to see intent             │  │  │    "confidence": 0.92,             │ │
│  │  classification...          │  │  │    "entities": {},                 │ │
│  │                            │  │  │    "error": null                   │ │
│  │  ┌──────────────────────┐ │  │  │  }                                  │ │
│  │  │ Hello there!         │ │  │  │                                     │ │
│  │  └──────────────────────┘ │  │  │                                     │ │
│  │                            │  │  │                                     │ │
│  │  ┌──────────────────────┐ │  │  │                                     │ │
│  │  │ Hello! How can I     │ │  │  │                                     │ │
│  │  │ assist you today?    │ │  │  │                                     │ │
│  │  └──────────────────────┘ │  │  └────────────────────────────────────┘ │
│  │                            │  │  ┌────────────────────────────────────┐ │
│  │  ┌──────────────────────┐ │  │  │ Intent: greeting                   │ │
│  │  │ What's the weather?  │ │  │  │ Confidence: 92.0%                  │ │
│  │  └──────────────────────┘ │  │  │ Entities: None detected            │ │
│  │                            │  │  └────────────────────────────────────┘ │
│  └────────────────────────────┘  │                                          │
│  ┌────────────────────────────┐  │                                          │
│  │ Type your message...       │  │                                          │
│  │                            │  │                                          │
│  └────────────────────────────┘  │                                          │
│        [Send]                     │                                          │
└──────────────────────────────────┴──────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────────┐
│ ● Connected to Intent Identifier Server              Messages: 2            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header Section
```
┌─────────────────────────────────────────────────────────────┐
│      Intent Identifier Chat Interface                       │
│      Powered by Llama 3.2 via Ollama                       │
└─────────────────────────────────────────────────────────────┘
```
- **Purple gradient background**
- **White text**
- Centered title and subtitle

### 2. Left Panel - Chat Window

#### Panel Header
```
┌─────────────────────────────────────────────────────┐
│ Chat                                [Clear Chat]     │
└─────────────────────────────────────────────────────┘
```
- Light gray background
- Clear Chat button (red)

#### Message Area
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│  Welcome message (center, yellow background)        │
│                                                      │
│  ┌──────────────────────────────┐                   │
│  │ User message (right aligned) │                   │
│  └──────────────────────────────┘                   │
│                                                      │
│  ┌──────────────────────────────┐                   │
│  │ Bot message (left aligned)   │                   │
│  └──────────────────────────────┘                   │
│                                                      │
│  [Loading indicator when processing]                │
└─────────────────────────────────────────────────────┘
```
- **User messages**: Right-aligned, purple gradient
- **Bot messages**: Left-aligned, white with border
- **System messages**: Center, yellow background
- **Error messages**: Red background
- Auto-scrolls to bottom

#### Input Section
```
┌─────────────────────────────────────────────────────┐
│ ┌───────────────────────────────────────────────┐   │
│ │ Type your message...                          │   │
│ │                                               │   │
│ └───────────────────────────────────────────────┘   │
│                                        [Send]       │
└─────────────────────────────────────────────────────┘
```
- Multi-line text input
- Auto-resizing (up to 3 lines)
- Purple Send button
- Enter to send, Shift+Enter for new line

### 3. Right Panel - Intent Display

#### Panel Header
```
┌─────────────────────────────────────────────────────┐
│ Intent Analysis                      [Confidence%]  │
└─────────────────────────────────────────────────────┘
```
- Confidence badge changes color:
  - 🔴 Red: < 60%
  - 🟠 Orange: 60-80%
  - 🟢 Green: > 80%

#### JSON Display Area
```
┌─────────────────────────────────────────────────────┐
│  {                                                   │
│    "intent": "greeting",                            │
│    "confidence": 0.92,                              │
│    "entities": {},                                  │
│    "error": null                                    │
│  }                                                   │
│                                                      │
│  (Dark background, light text, monospace font)      │
└─────────────────────────────────────────────────────┘
```
- Black/dark gray background
- Light text color
- Monospace font (Courier New)
- Proper JSON indentation
- Scrollable for long responses

#### Summary Section
```
┌─────────────────────────────────────────────────────┐
│  Intent: greeting                                   │
│  Confidence: 92.0%                                  │
│  Entities: None detected                            │
└─────────────────────────────────────────────────────┘
```
- Quick summary of key metrics
- Easy-to-read format
- Updates with each classification

### 4. Status Bar
```
┌─────────────────────────────────────────────────────┐
│ ● Connected to Server              Messages: 5      │
└─────────────────────────────────────────────────────┘
```
- Connection status indicator:
  - 🟢 Green: Connected
  - 🟠 Orange: Connecting
  - 🔴 Red: Disconnected
- Message counter
- Light gray background

## Color Scheme

### Primary Colors
- **Purple**: `#667eea` - Primary actions, user messages
- **Dark Purple**: `#764ba2` - Secondary gradient
- **Green**: `#4caf50` - High confidence, success states
- **Red**: `#ff4757` - Low confidence, errors, warnings
- **Orange**: `#ffa502` - Medium confidence, connecting state

### Background Colors
- **Main Background**: `#9dc08b` - Light green
- **Panel Background**: `#ffffff` - White
- **Chat Background**: `#fafafa` - Light gray
- **Intent Display**: `#1e1e1e` - Dark gray (code editor style)
- **System Message**: `#fff3cd` - Light yellow

### Text Colors
- **Primary Text**: `#333333` - Dark gray
- **Secondary Text**: `#666666` - Medium gray
- **Light Text**: `#d4d4d4` - Light gray (on dark backgrounds)
- **White Text**: `#ffffff` - White (on colored backgrounds)

## Animations

### Message Animations
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```
- New messages slide in from bottom
- Smooth 0.3s transition
- Opacity fade-in

### Loading Animation
```
[●○○○○] → [○●○○○] → [○○●○○] → [○○○●○] → [○○○○●]
```
- Rotating spinner
- White on colored background
- Appears in Send button when processing

### Status Dot Animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
- Pulsing animation when connecting
- Solid when connected or disconnected

## Responsive Behavior

### Desktop (> 1024px)
```
┌────────────┬────────────┐
│            │            │
│    Chat    │   Intent   │
│            │            │
└────────────┴────────────┘
```
- Side-by-side panels
- Equal width distribution

### Tablet (768px - 1024px)
```
┌────────────────────────┐
│         Chat           │
├────────────────────────┤
│        Intent          │
└────────────────────────┘
```
- Stacked vertically
- Full width panels

### Mobile (< 768px)
```
┌──────────────┐
│    Chat      │
├──────────────┤
│   Intent     │
└──────────────┘
```
- Fully stacked
- Optimized spacing
- Larger touch targets

## User Interactions

### Keyboard Shortcuts
- **Enter**: Send message
- **Shift+Enter**: New line in input
- **Tab**: Navigate between elements

### Mouse Interactions
- **Click Send**: Send message
- **Click Clear Chat**: Reset conversation
- **Scroll**: View message history
- **Hover Send Button**: Subtle lift animation
- **Hover Clear Button**: Color darkens

### Touch Interactions (Mobile)
- **Tap**: Same as click
- **Swipe**: Scroll messages
- **Pinch**: Zoom (respects viewport settings)

## State Indicators

### Connection States
1. **Checking** (yellow dot): Initial check
2. **Connected** (green dot): Server available
3. **Disconnected** (red dot): Server unavailable
4. **Demo Mode** (green dot): Using mock classification

### Processing States
1. **Idle**: Send button enabled, normal state
2. **Processing**: Send button disabled, spinner visible
3. **Error**: Error message displayed in chat
4. **Success**: Response added to chat

### Confidence States
1. **Low** (< 60%): Red badge
2. **Medium** (60-80%): Orange badge
3. **High** (> 80%): Green badge

## Accessibility Features

- **Semantic HTML**: Proper element usage
- **Color Contrast**: WCAG AA compliant
- **Keyboard Navigation**: Full keyboard support
- **Focus Indicators**: Visible focus states
- **Alt Text**: Meaningful descriptions (where applicable)
- **ARIA Labels**: Screen reader support

## Browser Support

✅ Chrome/Edge 90+
✅ Firefox 88+
✅ Safari 14+
✅ Opera 76+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- **Lazy Loading**: Images and resources on demand
- **Debouncing**: Auto-resize and status checks
- **Efficient DOM**: Minimal reflows
- **CSS Animations**: GPU-accelerated
- **Fetch API**: Modern, efficient HTTP requests

## Best Practices Implemented

✅ Mobile-first design
✅ Progressive enhancement
✅ Graceful degradation
✅ Error boundary handling
✅ Loading states
✅ User feedback
✅ Clean separation of concerns
✅ Modular CSS
✅ Semantic markup
✅ Accessibility considerations

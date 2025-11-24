# @repo/ui Usage Guide

This guide demonstrates how to use the shadcn/ui components across all applications in the Operone monorepo.

## 📦 Setup Overview

The `@repo/ui` package contains **55 shadcn/ui components** that can be imported and used across all three applications:

- **@/apps/web** - Next.js web application
- **@/apps/docs** - Next.js documentation site  
- **@/apps/operone** - Electron desktop application

## 🚀 Quick Start

### 1. Import Components

```tsx
// Import individual components
import { Button, Card, Input } from '@repo/ui'

// Import all components
import * as UI from '@repo/ui'

// Import utilities
import { cn } from '@repo/ui'
```

### 2. Import CSS (Required)

Add this import to your app's main CSS file or layout:

```tsx
import '@repo/ui/globals.css'
```

## 🎯 Usage Examples

### Web Application (`apps/web`)

```tsx
// apps/web/app/ui-demo/page.tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

export default function UIDemoPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>UI Components Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Documentation Site (`apps/docs`)

```tsx
// apps/docs/app/page.tsx
import { Button } from '@repo/ui'

export default function Home() {
  return (
    <main>
      <Button className="my-button">
        Click me!
      </Button>
    </main>
  )
}
```

### Desktop Application (`apps/operone`)

```tsx
// apps/operone/src/components/UIDemo.tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '@repo/ui'

export function UIDemo() {
  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Desktop UI Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>Desktop Button</Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

## 🎨 Available Components

### Form & Input
- Button, Input, Input OTP, Label, Textarea, Select
- Checkbox, Radio Group, Switch, Slider
- Form, Field, Input Group, Item

### Layout & Containers  
- Card, Sheet, Sidebar, Separator, Scroll Area
- Resizable, Aspect Ratio, Skeleton

### Navigation
- Tabs, Breadcrumb, Pagination, Navigation Menu
- Menubar, Command, Context Menu

### Feedback & Overlays
- Dialog, Alert Dialog, Alert, Toast, Toaster, Sonner
- Popover, Tooltip, Hover Card, Progress, Spinner

### Data Display
- Table, Badge, Avatar, Carousel, Calendar, Chart
- Empty, Kbd

### Interactive
- Dropdown Menu, Drawer, Collapsible, Accordion
- Toggle, Toggle Group, Button Group

## 🛠 Hooks

### useToast Hook

```tsx
import { useToast, Toast } from '@repo/ui'

function MyComponent() {
  const { toast } = useToast()

  const showToast = () => {
    toast({
      title: "Success!",
      description: "Action completed successfully.",
    })
  }

  return (
    <div>
      <Button onClick={showToast}>Show Toast</Button>
      <Toast />
    </div>
  )
}
```

### useMobile Hook

```tsx
import { useMobile } from '@repo/ui'

function MyComponent() {
  const isMobile = useMobile()

  return (
    <div>
      {isMobile ? "Mobile view" : "Desktop view"}
    </div>
  )
}
```

## 🎯 Styling with Tailwind

All components use Tailwind CSS with shadcn/ui design tokens:

```tsx
// Using design tokens
<div className="bg-background text-foreground border-border">
  <Button className="bg-primary text-primary-foreground">
    Styled Button
  </Button>
</div>
```

## 🔧 Configuration

Each app is configured with:

1. **Tailwind CSS** - With shadcn/ui design tokens
2. **CSS Variables** - For consistent theming
3. **PostCSS** - For CSS processing
4. **TypeScript** - Full type support

## 📱 Demo Pages

Visit these routes to see the components in action:

- **Web App**: `http://localhost:3000/ui-demo`
- **Docs**: `http://localhost:3001/ui-demo`  
- **Desktop**: Navigate to "UI Demo" in the app sidebar

## 🚀 Development

### Adding New Components

```bash
cd packages/ui
npx shadcn@latest add [component-name]
```

### Updating Components

Components are automatically available across all apps after installation.

### Type Safety

Full TypeScript support with proper exports and imports.

## 🎨 Theming

All apps share the same design system:

```css
/* Light theme */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 222.2 47.4% 11.2%;
--secondary: 210 40% 96%;

/* Dark theme */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 210 40% 98%;
--secondary: 217.2 32.6% 17.5%;
```

## ✅ Best Practices

1. **Always import CSS**: `import '@repo/ui/globals.css'`
2. **Use semantic imports**: `import { Button } from '@repo/ui'`
3. **Leverage design tokens**: Use `bg-primary`, `text-foreground`, etc.
4. **Maintain consistency**: Use the same components across apps
5. **Type safety**: All components are fully typed

## 🎯 Success!

Your monorepo now has a unified UI component system that works seamlessly across all three applications! 🎉

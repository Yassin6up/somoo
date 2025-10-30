# Design Guidelines for Sumou Platform (سُمُوّ)

## Design Approach
**Reference-Based Approach**: Modern SaaS aesthetic inspired by Figma and Notion, with emphasis on clean interfaces, clear information hierarchy, and professional presentation suitable for a B2B/B2C marketplace platform.

## Core Visual Language

### Color Palette
- **Primary Green**: #4CAF50 (medium green for positive actions, CTAs, and highlights)
- **Secondary Light Green**: #E8F5E9 (soft green tint for accents and backgrounds)
- **Background**: #FAFAFA (soft white, easy on eyes)
- **Text Primary**: #222222
- **Neutral Grays**: Use for borders, secondary text, and subtle UI elements

### Typography
- **Primary Font**: Cairo (Arabic) or Inter (fallback for Latin)
- **Hierarchy**:
  - Hero Headlines: Very large, bold weights
  - Section Headers: Large, semibold
  - Body Text: Regular weight, comfortable reading size
  - Metadata/Captions: Smaller, lighter weight
- **Direction**: Full RTL support for Arabic, switchable to LTR for English

### Spacing System
Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, and 32 for consistent rhythm throughout the application.

### Border Radius & Shadows
- **All Buttons**: rounded-2xl (very rounded corners)
- **Cards & Sections**: rounded-2xl with soft shadow (shadow-md)
- **Input Fields**: rounded-xl
- **Interactive Elements**: Subtle hover scale (scale-105) with smooth transitions

## Page-Specific Layouts

### Landing Page
**Hero Section**: Full-width with centered content
- Large, impactful headline centered
- Descriptive subheadline
- Two prominent CTA buttons side-by-side (for freelancers and product owners)
- Illustrative imagery showing platform users and digital products

**How It Works Section**: Three-column grid on desktop, single column on mobile
- Icon-driven cards with numbered steps
- Clear, concise descriptions
- Visual flow indicators between steps

**Footer**: Comprehensive with links organized in columns
- Platform policies and legal links
- Support contact information
- Copyright notice

### Account Type Selection
**Layout**: Centered, minimal page with two large cards
- Cards positioned side-by-side on desktop, stacked on mobile
- Equal visual weight for both options
- Hover state: Enhanced shadow and subtle lift effect

**Card Content**:
- Large, clear icon at top
- Bold role title
- Three bullet points explaining benefits
- Primary CTA button at bottom

### Freelancer Multi-Step Signup

**Step 1 - Basic Information**:
- Clean form layout with proper spacing
- Password strength indicator (visual bar)
- Country code selector for phone input
- Form validation feedback

**Step 2 - Professional Profile**:
- **Bio Section**: Large textarea with example placeholder
- **Job Title Field**: Icon-enhanced input
- **Team Size**: Numeric input with helper text
- **Services Multi-Select**: Dropdown with checkbox options for:
  - App testing
  - Google Maps reviews
  - Android/iOS app reviews
  - Website reviews
  - Software testing
  - UX/UI reviews
  - Social media engagement

**Step 3 - Verification**:
- **Profile Picture Upload**: Circular preview with camera icon
- **ID Verification**: Optional file upload with pending/verified badge display

**Step 4 - Payment Settings**:
- Light background card (#F5F9FC)
- Payment method dropdown (Sumou Wallet, PayPal, STC Pay, Bank Transfer)
- Account number input field
- Save button with icon

### Product Owner Signup

**Multi-Step Form**:
- Company/product information inputs
- Product type selector (app, website, system, store)
- URL validation for live products
- APK/TestFlight upload option for unreleased products

**Service Selection**:
- Checkbox grid for multiple service types
- Pre-configured package cards (Basic, Pro, Growth)
- Each package shows: user count, features list, and pricing indication

**Budget Section**:
- Amount input or package selection
- Timeline estimate field
- Terms acceptance checkbox with clear text

### Post-Registration Dashboard

**Sidebar Navigation**:
- Fixed left sidebar (RTL: right sidebar)
- Menu items: Profile, Campaigns/Tasks, Notifications, Wallet, Support
- Active state highlighting with green accent

**Main Content Area**:
- Welcome message personalized by user type
- Quick action cards for common tasks
- Empty state illustrations for new users

## Component Patterns

### Buttons
- **Primary Actions**: Green background (#4CAF50), white text, rounded-2xl, shadow-md
- **Hover State**: Slight scale (1.05) with smooth transition
- **Secondary Actions**: White background, green border and text
- **Disabled State**: Reduced opacity, no hover effects

### Form Inputs
- Border: gray-300 color
- Rounded: rounded-xl
- Focus State: Green ring (ring-green-300)
- Icons: Positioned inside inputs on the right (RTL) for context
- Error State: Red border with error message below

### Cards
- White background
- Soft shadow (shadow-md)
- Rounded corners (rounded-2xl)
- Padding: p-6 or p-8
- Hover state where interactive: Enhanced shadow

### Multi-Select Tags
- Chip-style selected items
- Remove option on each tag
- Dropdown with checkboxes for selection

### File Upload Components
- Drag-and-drop area with dashed border
- Instant preview for images
- File name display for documents
- Upload progress indicator

### AI Suggestion Features
- Subtle suggestion cards appearing contextually
- Question format with action buttons
- Light background to distinguish from main content
- Quick dismiss option

## Responsive Behavior
- **Desktop (lg+)**: Multi-column layouts, side-by-side forms
- **Tablet (md)**: Two-column grids, adjusted spacing
- **Mobile (base)**: Single column, stacked elements, full-width buttons

## Images
**Hero Section**: Include illustrative imagery showing diverse freelancers and digital product interfaces. Style should be modern, friendly, and professional—consider illustration style or high-quality photography with soft treatment.

**Throughout Platform**: Use icons from Heroicons or Lucide React for consistent iconography.

## Accessibility & Interactions
- Clear focus states on all interactive elements
- Sufficient color contrast for text
- Keyboard navigation support
- Screen reader friendly labels (especially for RTL)
- OTP verification modal: Centered overlay with 6-digit input boxes

## Animation Philosophy
Use sparingly and purposefully:
- Smooth page transitions between signup steps
- Gentle hover effects on cards and buttons
- Progress indicators for multi-step forms
- Success animations for completed actions
- Avoid distracting or excessive motion
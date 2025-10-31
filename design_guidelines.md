# Sumou Platform Design Guidelines (سُمُوّ)

## Design Philosophy

**Reference-Based Approach**: Modern SaaS aesthetic inspired by Figma/Notion—clean interfaces, clear hierarchy, professional presentation, RTL-first with seamless LTR adaptation.

**Core Principles**: Spacious layouts, professional yet approachable, clear visual hierarchy, breathing room between elements.

## Brand Identity

**Primary Color**: Teal/Turquoise (#58D1B7 - HSL: 167, 60%, 58%) - A modern, professional cyan-green that conveys trust, innovation, and growth.

**Color Psychology**: The teal color represents reliability (from blue) combined with growth and vitality (from green), perfectly suited for a platform connecting professionals and digital product owners.

## Typography

**Fonts**: Cairo (Arabic primary, RTL-optimized) + Inter (Latin fallback) via Google Fonts CDN

**Scale**:
- Hero: 3.5-4.5rem, weight 700-800
- Page Titles: 2.5-3rem, weight 700
- Section Headers: 1.875-2.25rem, weight 600
- Card Titles: 1.25-1.5rem, weight 600
- Body: 1rem, weight 400
- Small/Captions: 0.875rem, weight 400-500

**RTL/LTR**: Use `dir="rtl"` for Arabic, mirror spacing/padding/margins, flip directional icons, right-align RTL text.

## Layout & Spacing

**Spacing Units**: 2, 4, 6, 8, 12, 16, 20, 24, 32 (Tailwind)

**Common Patterns**:
- Component padding: p-6/p-8
- Section spacing: py-16 to py-24 (desktop), py-12 (mobile)
- Card gaps: gap-6/gap-8
- Form fields: space-y-6
- Buttons: px-8 py-3 (large), px-6 py-2.5 (medium)

**Grids**:
- Features: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Dashboard: grid-cols-1 md:grid-cols-2 xl:grid-cols-3
- Pricing: grid-cols-1 lg:grid-cols-3

**Containers**: Full-width with max-w-7xl mx-auto px-6 | Forms: max-w-2xl mx-auto | Modals: max-w-lg to max-w-3xl

**Breakpoints**: Mobile <768px | Tablet 768-1024px | Desktop >1024px | Wide >1440px

## Components

### Navigation

**Landing Header**: Fixed/sticky, backdrop-blur, logo right (RTL)/left (LTR), nav links gap-8 weight-500, CTA rounded-2xl shadow-sm

**Dashboard Sidebar**: 280px fixed, icons from Heroicons, active state with teal accent strip, collapsible mobile overlay

### Forms & Inputs

**Text Inputs**: 1px border, rounded-xl, px-4 py-3, teal ring on focus, red border for errors, icons right (RTL) with mr-3

**Multi-Step Forms**: Progress indicator with step numbers/connecting lines, current step teal, completed with checkmarks, max-w-2xl centered, prev/next buttons at bottom

**File Upload**: Dashed border rounded-xl, drag-drop zone, uploaded files list with remove button, circular preview (profile), rectangular (docs)

**Select/Multi-Select**: Custom styled matching inputs, multi-select with checkboxes, selected tags as rounded-full chips with close icon, gap-2 wrapping

**Password**: Toggle icon right (RTL), strength bar below (weak/medium/strong), requirements checklist on focus

**OTP**: 6 squared boxes rounded corners, auto-focus next, centered modal with backdrop-blur, resend timer

### Cards

**Primary Card**: White bg, rounded-2xl, shadow-md, p-6/p-8, hover: shadow-lg + scale-105

**Feature Cards**: Large circular icon (light teal bg), title weight-600 text-lg, 2-3 line description, optional "Learn more" link

**Pricing Cards**: Vertical layout, badge for "Popular", bold package name, large price, checkmark feature list, full-width CTA at bottom

**Dashboard Stats**: Large number (2.5rem, weight 700), label below, circular icon corner, trend arrow with %

### Buttons

**Primary**: Teal (#58D1B7) bg, white text weight-600, rounded-2xl, px-8 py-3/px-6 py-2.5, shadow-md, hover: scale-105 transition-all 200ms

**On Hero Images**: backdrop-blur-md, semi-transparent bg, rounded-2xl, shadow

**Secondary**: 2px teal border, transparent/white bg, teal text, same sizing

**Icon**: p-2/p-3, rounded-xl, hover bg treatment

### Dashboard Elements

**Sidebar Items**: Icon + label gap-3, px-4 py-3, rounded-xl, active: teal tint bg + teal text, hover: light bg

**Data Tables**: Header row bg tint weight-600, subtle row dividers, row hover light bg, icon buttons for actions, centered pagination

**Empty States**: Centered icon/illustration, "No [items] yet" headline, descriptive text, primary CTA

### AI Suggestions

**Card Style**: Light tint bg, lightbulb/sparkle icon, medium weight text, "Apply"/"Dismiss" buttons, close icon, positioned contextually

### Modals

**Structure**: Semi-transparent dark backdrop, centered rounded-2xl container, close button top-right (RTL: top-left), bold title, comfortable padding, action buttons aligned right (RTL: left)

**Confirmations**: Circular teal checkmark icon, centered message, single primary button

## Landing Page Sections

**Hero**: Full-width min-h-85vh, large bg image (diverse users/digital marketplace), centered content with z-index, extra-large 2-line headline, max-w-2xl subheadline, dual CTAs (side-by-side desktop/stacked mobile) with backdrop-blur-md semi-transparent bg

**How It Works**: Centered title/subtitle, 3-col grid (desktop)/single (mobile), numbered icons with titles/descriptions, connecting lines optional

**Features**: 6 cards in 2x3 grid (desktop), equal height flex layout

**Freelancer/Product Owner**: Alternating left-right image-text, headline + bullets + CTA, background alternates white/subtle tint

**Pricing**: Centered header, 3 cards side-by-side (desktop), center card elevated as "Popular"

**Social Proof**: Testimonial cards with photo/quote/name/role, 2-col grid or carousel, star ratings

**Footer**: 4-col (desktop)/stacked (mobile): About, Services, Support, Legal + logo/tagline right (RTL), social icons, language switcher, copyright

## Registration Flows

**Account Selection**: Minimal centered layout, 2 large cards side-by-side (desktop), icon + role + 3-4 bullets + button, equal weight

**Freelancer Steps**:
1. Name, email, password (strength indicator), phone (country code), terms checkbox
2. Job title (icon), bio textarea (4-5 rows), team size, services multi-select
3. Profile pic (circular preview), ID upload (rectangular), verification badges
4. Payment method dropdown, account details, info card

**Product Owner Steps**:
1. Company name, website, product type, category
2. Product URL (live) or file upload (unreleased APK/TestFlight), target audience
3. Service checkbox grid, package cards (Basic/Pro/Growth) with comparison
4. Budget input/package selection, timeline, campaign objectives textarea

## Dashboard Layouts

**Freelancer**: 280px sidebar, full-width main content, top bar (welcome + notifications + profile), 4 metric cards, filterable tasks list/grid, activity feed

**Product Owner**: Similar sidebar, campaign overview cards, active campaigns table, analytics charts, prominent wallet balance

## Images

- **Hero**: High-quality photo/illustration of diverse people collaborating in digital workspace, bright/optimistic/professional
- **Features**: Platform screenshots/illustrations showing functionality
- **Account Cards**: Icon illustrations (freelancer: person+tools, owner: person+product/chart)
- **Empty States**: Friendly, simple, guiding custom illustrations

## Accessibility

- Clear focus indicators, sufficient contrast ratios
- Full keyboard navigation, ARIA labels for RTL screen readers
- Clear form validation errors, loading states for async actions

---

**Quick Reference**: Teal primary (#58D1B7 / HSL: 167, 60%, 58%), rounded-2xl standard radius, Cairo/Inter fonts, RTL-first mirroring, shadow-md standard elevation, transition-all duration-200ms standard animation

## Color Palette

**Primary Colors**:
- Teal/Turquoise: `hsl(167, 60%, 58%)` - Main brand color
- Teal Dark (for dark mode): `hsl(167, 60%, 48%)` - Darker variant for dark backgrounds

**Accent Colors**:
- Teal Light: `hsl(167, 15%, 85%)` - For subtle backgrounds
- Teal Muted: `hsl(167, 10%, 90%)` - For muted elements

**Usage Guidelines**:
- Use primary teal for CTAs, active states, links, and key UI elements
- Use teal accents for hover states, focus rings, and highlights
- Maintain sufficient contrast ratios for accessibility (WCAG AA minimum)
- Pair with neutral grays for backgrounds and text
- Use sparingly to maintain visual hierarchy
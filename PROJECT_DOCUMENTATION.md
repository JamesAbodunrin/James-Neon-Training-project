# ThesisAnalyzer - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Pages](#pages)
3. [Components](#components)
4. [User Journey](#user-journey)
5. [Design System](#design-system)
6. [File Structure](#file-structure)

---

## 🎯 Project Overview

**ThesisAnalyzer** is an interactive thesis analysis web application built with Next.js (App Router), React, and TypeScript. It provides students with powerful tools for data analysis, visualization, and project management for their thesis research.

---

## 📄 Pages

### 1. **Home Page** (`/`)
- **Route**: `src/app/page.tsx`
- **Description**: Landing page with hero section, features, how-to guide, and testimonials
- **Components Used**: 
  - Header
  - HeroSection
  - WhySection
  - HowSection
  - TestimonialsSection
  - Footer

### 2. **Authentication Page** (`/auth`)
- **Route**: `src/app/auth/page.tsx`
- **Description**: Sign in and sign up page with multiple authentication options
- **Features**:
  - Social login (GitHub, Apple, Email)
  - Manual signup/signin
  - Gray animated background
  - Form validation
- **Components Used**: Header, Footer

### 3. **Analysis Page** (`/analysis`)
- **Route**: `src/app/analysis/page.tsx`
- **Description**: Interactive data analysis page
- **Features**:
  - Analysis type selection (Statistical, Regression, Correlation, Clustering, Time-series, Text-analysis)
  - Application selection (Python, R, Excel, MATLAB, SPSS, NLTK; filtered by type)
  - Analyses to run (options filtered by type and application; selection trimmed when type/application change)
  - Research purpose (optional)
  - Data input (manual paste, file upload with 20MB limit, or Excel-style spreadsheet)
  - Live analysis results (tables, charts, interpretation, effect sizes)
  - Copy, download .txt, download .docx (report includes charts/figures)
  - Error boundary around results; empty state when type/application not selected; large-dataset notice when input >50k characters
- **Components Used**:
  - Header, Footer
  - AnalysisTypeSelector, ApplicationSelector, AnalysisOptionsSelector
  - DataInput, AnalysisResults
  - AnalysisErrorBoundary (wraps AnalysisResults)

### 4. **Projects Page** (`/projects`)
- **Route**: `src/app/projects/page.tsx`
- **Description**: List of all projects
- **Components Used**: 
  - Header
  - Footer
  - ProjectsList
  - ProjectCard

### 5. **Project Detail Page** (`/projects/[id]`)
- **Route**: `src/app/projects/[id]/page.tsx`
- **Description**: Individual project detail page with real data and visualizations
- **Features**:
  - Real-time data from API
  - Interactive charts (bar, line)
  - Statistics dashboard
  - Editable data for in-progress projects
  - Real-time updates
- **Components Used**: 
  - Header
  - Footer
  - ProjectDetail

### 6. **Feature Detail Page** (`/features/[slug]`)
- **Route**: `src/app/features/[slug]/page.tsx`
- **Description**: Detailed feature information pages
- **Available Features**:
  - `/features/advanced-data-visualization`
  - `/features/deep-analysis-tools`
  - `/features/lightning-fast-processing`
  - `/features/precision-accuracy`
  - `/features/collaborative-workspace`
  - `/features/access-anywhere`
- **Components Used**: 
  - Header
  - Footer
  - FeatureContent

---

## 🧩 Components

### Layout Components

#### 1. **Header** (`src/components/Header.tsx`)
- **Type**: Client Component
- **Description**: Fixed navigation header with logo, navigation links, and user menu
- **Features**:
  - Fixed position while scrolling
  - Logo with 64px left padding
  - Centered navigation (Home, Projects, Analysis)
  - User persona icon (when logged in) or Sign In button
  - Dropdown menu with user info and logout

#### 2. **Footer** (`src/components/Footer.tsx`)
- **Type**: Server Component
- **Description**: Site footer with links and contact information
- **Sections**:
  - Company info
  - Quick Links
  - Resources
  - Contact & Social Media

### Home Page Components

#### 3. **HeroSection** (`src/components/HeroSection.tsx`)
- **Type**: Client Component
- **Description**: Animated hero section with interactive canvas animations
- **Features**:
  - Canvas-based animations (data points, charts, pivot points)
  - Dynamic "Get Started" / "Start a Project" button based on auth status
  - "Learn More" button that scrolls to How section

#### 4. **WhySection** (`src/components/WhySection.tsx`)
- **Type**: Server Component
- **Description**: Features showcase section
- **Features**:
  - 6 feature cards
  - Clickable cards linking to feature detail pages
  - Responsive grid layout

#### 5. **HowSection** (`src/components/HowSection.tsx`)
- **Type**: Server Component
- **Description**: Step-by-step guide section
- **Features**:
  - 4 steps with numbered indicators
  - Arrow connectors (desktop)
  - ID: `how-to-use` for anchor linking

#### 6. **TestimonialsSection** (`src/components/TestimonialsSection.tsx`)
- **Type**: Client Component
- **Description**: Horizontal scrolling testimonials
- **Features**:
  - Auto-scrolling animation
  - Seamless loop
  - Star ratings
  - User information

### Feature Components

#### 7. **FeatureContent** (`src/components/FeatureContent.tsx`)
- **Type**: Client Component
- **Description**: Detailed feature page content
- **Features**:
  - Authentication-aware CTAs
  - Visual examples (chart, diagram, screenshot)
  - Key features list
  - Use cases grid
  - Breadcrumb navigation

### Analysis Components

#### 8. **AnalysisTypeSelector** (`src/components/AnalysisTypeSelector.tsx`)
- **Type**: Server Component
- **Description**: Selection interface for analysis types
- **Options**: Statistical, Regression, Correlation, Clustering, Time Series, Text Analysis

#### 9. **ApplicationSelector** (`src/components/ApplicationSelector.tsx`)
- **Type**: Server Component
- **Description**: Selection interface for analysis applications
- **Options**: Python, R, Excel, MATLAB, SPSS, NLTK
- **Features**: Recommendations based on selected analysis type

#### 10. **DataInput** (`src/components/DataInput.tsx`)
- **Type**: Client Component
- **Description**: Data input interface with application-specific UI
- **Features**:
  - Manual input / File upload toggle
  - Excel: Spreadsheet interface
  - Python/R: Code editor
  - Other apps: Specialized input formats
  - Real-time data updates

#### 11. **AnalysisResults** (`src/components/AnalysisResults.tsx`)
- **Type**: Client Component
- **Description**: Live analysis results display
- **Features**:
  - Summary, statistics, insights, recommendations
  - Copy to clipboard
  - Download as text file
  - Real-time updates

### Project Components

#### 12. **ProjectsList** (`src/components/ProjectsList.tsx`)
- **Type**: Server Component
- **Description**: Grid of project cards
- **Features**: Responsive 2-column grid

#### 13. **ProjectCard** (`src/components/ProjectCard.tsx`)
- **Type**: Server Component
- **Description**: Individual project card
- **Features**:
  - Clickable (navigates to detail page)
  - Status badges
  - Technology tags
  - Metadata display

#### 14. **ProjectDetail** (`src/components/ProjectDetail.tsx`)
- **Type**: Client Component
- **Description**: Detailed project view with real data
- **Features**:
  - Real API data fetching
  - Interactive charts (bar, line)
  - Statistics dashboard
  - Editable data table (in-progress projects)
  - Real-time visualization updates

### Context & Utilities

#### 15. **AuthContext** (`src/contexts/AuthContext.tsx`)
- **Type**: Client Component (Context Provider)
- **Description**: Authentication state management
- **Features**:
  - User state management
  - Login/signup functions
  - Social login support
  - localStorage persistence
  - Unique user ID generation

#### 16. **analysisEngine** (`src/utils/analysisEngine.ts`)
- **Type**: Utility Function
- **Description**: Data analysis processing engine
- **Features**:
  - CSV parsing
  - Statistical calculations
  - Insights generation
  - Recommendations based on analysis type

---

## 🗺️ User Journey

### 1. **New User (Not Authenticated)**

```
Home Page (/)
  ↓
  [Click "Get Started"]
  ↓
Authentication Page (/auth)
  ↓
  [Sign Up / Sign In]
  ↓
Home Page (Authenticated)
  ↓
  [Click "Start a Project"]
  ↓
Analysis Page (/analysis)
  ↓
  [Select Analysis Type → Application → Input Data]
  ↓
  [View Results → Copy/Download]
  ↓
  [Navigate to Projects]
  ↓
Projects Page (/projects)
  ↓
  [Click Project Card]
  ↓
Project Detail Page (/projects/[id])
  ↓
  [View/Edit Data → See Real-time Updates]
```

### 2. **Returning User (Authenticated)**

```
Home Page (/)
  ↓
  [User Icon Visible in Header]
  ↓
  [Click "Start a Project" or "Analysis"]
  ↓
Analysis Page (/analysis)
  OR
Projects Page (/projects)
  ↓
  [Continue Work on Existing Projects]
  OR
  [Create New Analysis]
```

### 3. **Feature Exploration**

```
Home Page (/)
  ↓
  [Scroll to "Why Use ThesisAnalyzer"]
  ↓
  [Click Feature Card]
  ↓
Feature Detail Page (/features/[slug])
  ↓
  [View Details → Visual Examples]
  ↓
  [Click "Start Analysis" or "View Projects"]
  ↓
Analysis Page OR Projects Page
```

### 4. **Project Workflow**

```
Projects Page (/projects)
  ↓
  [Click Project Card]
  ↓
Project Detail Page (/projects/[id])
  ↓
  [For In-Progress Projects]
  ↓
  [Click "Edit Data"]
  ↓
  [Modify Values in Table]
  ↓
  [See Real-time Chart Updates]
  ↓
  [Save Changes]
```

---

## 🎨 Design System

### Color Palette

#### Primary Colors
- **Blue**: `#2563eb` (blue-600)
- **Purple**: `#9333ea` (purple-600)
- **Gradient**: `from-blue-600 to-purple-600`

#### Status Colors
- **Success/Completed**: `bg-green-100 text-green-800`
- **In Progress**: `bg-blue-100 text-blue-800`
- **Planned**: `bg-yellow-100 text-yellow-800`

#### Background Colors
- **Light**: `bg-white`, `bg-gray-50`
- **Dark**: `bg-gray-900` (auth page background)
- **Gradient**: `from-blue-50 to-purple-50`

### Typography

- **Font Family**: Geist Sans (via Next.js)
- **Headings**: 
  - H1: `text-4xl md:text-5xl font-bold`
  - H2: `text-3xl font-bold`
  - H3: `text-xl font-semibold`
- **Body**: `text-gray-600`, `text-gray-700`

### Spacing

- **Section Padding**: `py-20`
- **Container Padding**: `px-4 sm:px-6 lg:px-8`
- **Card Padding**: `p-6` or `p-8`
- **Gap**: `gap-4`, `gap-6`, `gap-8`

### Components Styling

#### Buttons
- **Primary**: `bg-gradient-to-r from-blue-600 to-purple-600 text-white`
- **Secondary**: `bg-white border-2 border-gray-300`
- **Hover**: `hover:shadow-lg transition-all duration-300`

#### Cards
- **Background**: `bg-white rounded-xl shadow-md`
- **Hover**: `hover:shadow-xl transform hover:-translate-y-2`

#### Input Fields
- **Base**: `border-2 border-gray-300 rounded-lg`
- **Focus**: `focus:border-blue-500 focus:ring-2 focus:ring-blue-200`
- **Text**: `text-gray-900 placeholder:text-gray-400`

---

## 📁 File Structure

```
my-app/
├── src/
│   ├── app/
│   │   ├── analysis/
│   │   │   └── page.tsx
│   │   ├── auth/
│   │   │   └── page.tsx
│   │   ├── features/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   ├── projects/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── AnalysisResults.tsx
│   │   ├── AnalysisTypeSelector.tsx
│   │   ├── ApplicationSelector.tsx
│   │   ├── DataInput.tsx
│   │   ├── FeatureContent.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroSection.tsx
│   │   ├── HowSection.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── ProjectsList.tsx
│   │   ├── TestimonialsSection.tsx
│   │   └── WhySection.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx
│   └── utils/
│       └── analysisEngine.ts
└── PROJECT_DOCUMENTATION.md
```

---

## ✅ Design Consistency Checklist

### Before Sign-In
- ✅ Header shows "Sign In" button
- ✅ Hero section shows "Get Started" button
- ✅ Feature pages show "Sign Up Free" and "Try Analysis" buttons
- ✅ All CTAs direct to authentication

### After Sign-In
- ✅ Header shows user persona icon with dropdown
- ✅ Hero section shows "Start a Project" button
- ✅ Feature pages show "Start Analysis" and "View Projects" buttons
- ✅ All CTAs direct to authenticated features

### Consistent Elements
- ✅ Fixed header on all pages
- ✅ Footer on all pages
- ✅ Consistent color scheme (blue-purple gradient)
- ✅ Consistent spacing and typography
- ✅ Consistent button styles
- ✅ Consistent card designs
- ✅ Consistent navigation structure

---

## 🔧 Technical Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **State Management**: React Context API
- **Data Persistence**: localStorage

---

## 🚀 Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Open browser: `http://localhost:3000`

---

## 📝 Notes

- All components use TypeScript for type safety
- Client components are marked with `'use client'`
- Authentication state persists via localStorage
- Real data is fetched from JSONPlaceholder API for projects
- Charts and visualizations update in real-time during editing


# Travel Planner Application

## Overview

This is a modern full-stack web application designed to help Korean users plan their vacations around public holidays. The application provides a comprehensive travel planning tool that integrates Korean public holidays with destination-specific holiday calendars, vacation recommendations, and travel insights. Users can manage their annual leave, add custom company holidays, select travel destinations, and receive intelligent vacation suggestions that maximize their time off.

**Recent Major Updates (July 15, 2025):**
- Implemented comprehensive SEO optimization for Google and Naver search engines
- Added Korean language support with proper meta tags and structured data
- Enhanced accessibility with semantic HTML, ARIA labels, and proper heading structure
- Added mouse hover tooltips for compact calendar view
- Implemented 2-month calendar display for better vacation planning

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript, Vite for development and building
- **Backend**: Express.js with TypeScript, ESM modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Validation**: Zod for schema validation with Drizzle integration

### Project Structure
The application follows a monorepo structure with clear separation of concerns:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Common TypeScript types and database schemas
- Database migrations in `migrations/` directory

## Key Components

### Frontend Architecture
- **Component-based React architecture** using functional components with hooks
- **shadcn/ui design system** providing consistent, accessible UI components
- **Responsive design** with mobile-first approach using Tailwind CSS
- **Type-safe API integration** using custom query client wrapper
- **Real-time UI updates** through React Query's automatic cache invalidation

### Backend Architecture
- **RESTful API design** with Express.js middleware pattern
- **Modular route handling** separated into dedicated route files
- **Type-safe request/response handling** with Zod validation
- **Development tooling** with Vite integration for hot module replacement

### Database Design
The PostgreSQL schema includes:
- **Users table** for managing user profiles and leave balances
- **Custom holidays table** for company-specific non-working days
- **Selected destinations table** for user's travel preferences
- **Vacation plans table** for storing calculated vacation recommendations
- **JSON columns** for flexible data storage (destinations array)

## Data Flow

### User Data Management
1. User profile data stored in PostgreSQL with leave balance tracking
2. Custom holidays allow users to add company-specific non-working days
3. Destination selection enables multi-country holiday calendar integration
4. Real-time updates through React Query mutations and cache invalidation

### Holiday Data Integration
1. Korean public holidays fetched from external APIs
2. International holiday data retrieved based on selected destinations
3. Custom company holidays stored in local database
4. Combined holiday calendar displayed in interactive calendar component

### Vacation Planning Algorithm
1. Analysis of Korean public holidays to identify potential long weekends
2. Calculation of optimal vacation periods based on available leave days
3. Integration with destination-specific holidays and travel insights
4. Scoring system for vacation recommendations based on efficiency ratios

## External Dependencies

### Core Framework Dependencies
- **React ecosystem**: React, React DOM, React Router alternative (Wouter)
- **State management**: TanStack Query for server state, React hooks for local state
- **UI components**: Radix UI primitives with shadcn/ui wrapper components
- **Styling**: Tailwind CSS with custom Korean-themed color variables

### Database and Backend
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking and schema validation
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build tools**: Vite for frontend, esbuild for backend bundling
- **Type checking**: TypeScript with strict configuration
- **Code formatting**: Prettier integration through package.json scripts
- **Development server**: Express with Vite middleware for HMR

## Deployment Strategy

### Build Process
- **Frontend build**: Vite builds React application to `dist/public` directory
- **Backend build**: esbuild bundles Node.js application to `dist/index.js`
- **Production optimization**: Tree shaking, code splitting, and asset optimization

### Environment Configuration
- **Database connection**: PostgreSQL URL through environment variables
- **Development mode**: NODE_ENV flag controls development features
- **Replit integration**: Special handling for Replit deployment environment

### Scalability Considerations
- **Database**: Uses connection pooling with Neon serverless PostgreSQL
- **API design**: RESTful endpoints designed for horizontal scaling
- **Frontend**: Static asset generation allows CDN deployment
- **Caching**: React Query provides intelligent client-side caching

The application is designed as a production-ready system with proper error handling, type safety throughout the stack, and a scalable architecture that can accommodate future enhancements like user authentication, real-time collaboration, and advanced travel recommendations.

## SEO Optimization

### Search Engine Optimization Features
- **Korean Language Support**: HTML lang="ko", Korean meta descriptions and keywords
- **Meta Tags**: Comprehensive title, description, and keyword optimization for Korean market
- **Open Graph & Twitter Cards**: Social media sharing optimization
- **Structured Data**: JSON-LD schema markup for web applications
- **Sitemap & Robots.txt**: Dynamic generation with Korean search engine support
- **Semantic HTML**: Proper header hierarchy (H1, H2), ARIA labels, and semantic elements
- **Accessibility**: Screen reader support, keyboard navigation, and proper contrast

### Korean Search Engine Compatibility
- **Naver SEO**: Follows Naver webmaster guidelines with proper meta tags
- **Google Korea**: Optimized for Korean language queries and local search
- **Crawl Optimization**: Robots.txt configured for Yeti, NaverBot, and Daumoa crawlers

### Key SEO Elements
- Title: "한국 공휴일 여행 플래너 2025 | 연차 계산 및 최적 여행 일정 추천"
- Description: Focus on 2025 Korean holidays, vacation planning, and travel optimization
- Keywords: 한국 공휴일, 여행 플래너, 연차 계산, 휴가 계획, 2025년 공휴일
- Canonical URLs and hreflang tags for internationalization
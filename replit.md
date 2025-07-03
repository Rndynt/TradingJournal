# TradePro Journal

## Overview

TradePro Journal is a comprehensive trading journal application built with React and Express.js. It helps traders track their trades, analyze performance, and maintain detailed records of their trading activities. The application supports multiple trading instruments (XAUUSD, BTCUSD, ETHUSD) and provides analytics, charting, and filtering capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Styling**: Tailwind CSS with shadcn/ui components
- **Theme**: Dark theme with custom color scheme
- **Build Tool**: Vite for fast development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **API Pattern**: RESTful API endpoints
- **Validation**: Zod for runtime type validation
- **Session Management**: Express sessions with PostgreSQL store

### Development Environment
- **Platform**: Replit-optimized with development plugins
- **Module System**: ES Modules throughout
- **Package Manager**: npm with package-lock.json
- **Build Process**: Vite for client, esbuild for server

## Key Components

### Database Schema
- **Primary Entity**: `trades` table with comprehensive trade tracking
- **Fields**: Instrument, session, entry/exit data, P&L calculations, technical analysis notes
- **Relationships**: Single table design with all trade data normalized
- **Migrations**: Handled through Drizzle Kit

### API Endpoints
- `GET /api/trades` - Retrieve all trades
- `GET /api/trades/filter` - Filter trades by criteria
- `GET /api/trades/stats` - Get trading statistics
- `GET /api/trades/:id` - Get specific trade
- `POST /api/trades` - Create new trade
- `PUT /api/trades/:id` - Update existing trade
- `DELETE /api/trades/:id` - Delete trade

### Core Features
1. **Trade Entry Module**: Complete trade setup with technical analysis
2. **Trade History**: Filterable table with sorting and actions
3. **Analytics Dashboard**: Performance metrics and charts
4. **Session Detection**: Automatic trading session identification
5. **Risk Management**: Position sizing and R:R ratio calculations

## Data Flow

### Trade Creation Flow
1. User fills trade entry form with instrument, bias, and order details
2. Frontend validates using Zod schema and calculates risk metrics
3. Data sent to backend via POST request
4. Backend validates and stores in PostgreSQL
5. Response triggers UI update and navigation

### Data Fetching Flow
1. React components use TanStack Query hooks
2. Queries automatically fetch from REST endpoints
3. Data cached and synchronized across components
4. Real-time updates through query invalidation

### Analytics Flow
1. Backend calculates statistics from trade data
2. Frontend renders charts using Recharts library
3. Data filtered and aggregated for different views
4. Performance metrics computed client-side

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **recharts**: Data visualization library
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development plugins

## Deployment Strategy

### Development Mode
- Vite dev server for frontend with HMR
- tsx for TypeScript execution of backend
- Automatic session detection and middleware setup
- Replit-specific plugins for development experience

### Production Build
- Vite builds optimized React bundle
- esbuild bundles server code as ES modules
- Static files served from Express
- Environment variables for database connection

### Database Management
- Drizzle Kit for schema management
- `db:push` script for schema deployment
- PostgreSQL connection via environment variables
- Automatic migration handling

## Changelog

```
Changelog:
- July 03, 2025. Initial setup with comprehensive trading journal
  - Built complete CRUD operations for trade management
  - Implemented dark theme optimized for trading
  - Added session detection for Asia/London/New York
  - Created analytics dashboard with equity curve and P&L distribution
  - Integrated filtering, export, and performance metrics
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
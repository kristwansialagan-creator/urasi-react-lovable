# URASI POS

## Overview
URASI POS is a Point of Sale System built with React, TypeScript, and Vite. The application uses Supabase as its backend for authentication and data storage.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Supabase (authentication, database, realtime)
- **Charts**: Recharts, Chart.js

## Project Structure
- `src/` - Source code
  - `components/` - React components
  - `hooks/` - Custom React hooks
  - `lib/` - Utility libraries
  - `integrations/supabase/` - Supabase client and types
  - `pages/` - Page components
- `public/` - Static assets
- `database/` - Database related files
- `supabase/` - Supabase configuration

## Development
- Run: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Preview: `npm run preview`

## Configuration
The Vite dev server is configured to:
- Run on host `0.0.0.0` and port `5000`
- Allow all hosts for Replit's proxy compatibility

## Deployment
Static deployment configured with:
- Build command: `npm run build`
- Public directory: `dist`

## Recent Changes (January 2026)

### Bug Fixes
- **Fixed thumbnail/image URL bug**: Created standardized `getStorageUrl` and `parseStorageSlug` utilities in `src/lib/utils.ts` to handle consistent URL generation for Supabase storage
- **Fixed useToast hook**: Corrected dependency array issue that was causing unnecessary re-renders
- **Fixed useTransactions**: `executeTransaction` now fetches transaction from database directly to prevent stale state issues

### Code Improvements
- Updated all components using storage URLs (POSGrid, POSPage, ProductsPage, ProductCreatePage, useMedia) to use centralized utilities
- Removed unused type files (`database.types.ts`, `database.ts`) - only `integrations/supabase/types.ts` is used
- Added documentation for POSPermissionsPopup placeholder implementation

### Architecture Notes
- Storage URL utilities support both legacy (with bucket prefix) and new (without prefix) slug formats for backwards compatibility
- Default bucket: `product-images`
- Known buckets: `product-images`, `media`, `uploads`

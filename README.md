# Urasi-React

Urasi (formerly based on NexoPOS) migration to modern React + TailwindCSS + Supabase stack.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Routing**: React Router v6
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Form Handling**: React Hook Form + Zod

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, Input, Label)
│   ├── layout/       # Layout components (Sidebar, DashboardLayout)
│   └── auth/         # Auth components (ProtectedRoute)
├── contexts/         # React contexts (AuthContext)
├── pages/            # Application pages
│   ├── auth/         # Login, Register
│   ├── dashboard/    # Dashboard
│   ├── pos/          # Point of Sale
│   ├── products/     # Product management
│   ├── orders/       # Order management
│   ├── customers/    # Customer management
│   ├── registers/    # Cash register management
│   ├── reports/      # Reports & analytics
│   └── settings/     # Settings
├── lib/              # Utilities and configs
│   ├── supabase.ts   # Supabase client
│   └── utils.ts      # Helper functions
└── types/            # TypeScript type definitions
    └── database.ts   # Supabase database types
```

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Features

### ✅ Completed
- Authentication system (Login, Register, Protected Routes)
- Dashboard with sales statistics
- POS interface with cart management
- Product management (List, Create, Categories)
- Order management
- Customer management
- Cash register operations
- Reports & analytics
- Settings page

### 🚧 In Progress
- Database schema implementation in Supabase
- API integration for all modules
- Real-time updates
- Payment processing
- Receipt printing

### 📋 Planned
- Procurement management
- Transaction accounting
- Coupons & rewards system
- Multi-language support
- Advanced reporting

## 🗄️ Database

This project uses Supabase (PostgreSQL) with the following main tables:
- profiles, products, orders, customers
- registers, payment_types, taxes
- procurements, transactions
- coupons, rewards_system

See `src/types/database.ts` for complete schema.

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Manual Build
```bash
npm run build
# Upload dist/ folder to your hosting
```

## 📄 License

This project is licensed under the **GNU General Public License v3.0** (GPL-3.0).

**Key Points:**
- ✅ Commercial use allowed
- ✅ Modification allowed  
- ✅ Distribution allowed
- ⚠️ Source code must be disclosed when distributing
- ⚠️ License and copyright notice must be preserved
- ⚠️ Same license must apply to derivative works

See the [LICENSE](LICENSE) file for the full license text.

## 🙏 Attribution

**This is a derivative work based on [NexoPOS](https://github.com/Blair2004/NexoPOS-4x).**

Urasi is a heavily modified version that migrates the original Laravel/Vue architecture to a modern React + TypeScript + Supabase stack. While the core business logic and concepts are inspired by NexoPOS, the implementation has been completely rewritten.

**Original Work:**
- **Project:** NexoPOS 4.x
- **Author:** Blair Njikam
- **License:** GNU GPL v3.0
- **Repository:** https://github.com/Blair2004/NexoPOS-4x

**Modifications by Urasi:**
- Complete technology migration (Laravel → Next.js/React)
- Database migration (MySQL → PostgreSQL/Supabase)
- UI/UX redesign with modern components
- Additional features and customizations

We are grateful to the NexoPOS team and community for creating the foundation upon which this project is built.

## 👥 Contributors

- En Raymon (@kristwansialagan-creator)

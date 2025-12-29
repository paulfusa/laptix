# Laptix Banking

A modern, full-stack banking application built with Next.js that enables users to manage their finances, connect bank accounts, transfer funds, and track transactions.  

## Features

- **Secure Authentication** - User registration and login with Appwrite
- **Bank Account Integration** - Connect multiple bank accounts via Plaid
- **Account Overview** - View all connected accounts and balances in one place
- **Financial Dashboard** - Interactive charts and analytics for spending insights
- **Payment Transfers** - Send money between accounts using Dwolla
- **Transaction History** - Detailed transaction records with search and filtering
- **Responsive Design** - Optimized for mobile, tablet, and desktop devices
- **Dark Mode Support** - Built-in theme toggle for user preference

## Future Features
- **New UI Using React Libraries (WIP)** - Make a more user friendly, but also sleek clean UI design
- **Rework Authentication for International Support** - Want to be able to add bank accounts from multiple countries


## Stack

- **Framework:** [Next.js 14+](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** Custom components with shadcn/ui
- **Authentication:** [Appwrite](https://appwrite.io/)
- **Banking API:** [Plaid](https://plaid.com/)
- **Payment Processing:** [Dwolla](https://www.dwolla.com/)
- **Charts:** Chart.js / Recharts
- **Form Handling:** React Hook Form with Zod validation

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18.x or higher
- npm or yarn
- Git

You'll also need accounts and API keys for:
- [Appwrite](https://appwrite.io/)
- [Plaid](https://plaid.com/)
- [Dwolla](https://www.dwolla.com/)

## Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd laptix_banking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your environment variables:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT=
APPWRITE_DATABASE_ID=
APPWRITE_USER_COLLECTION_ID=
APPWRITE_BANK_COLLECTION_ID=
APPWRITE_TRANSACTION_COLLECTION_ID=
APPWRITE_SECRET=

# Plaid
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox

# Dwolla
DWOLLA_KEY=
DWOLLA_SECRET=
DWOLLA_BASE_URL=https://api-sandbox.dwolla.com
DWOLLA_ENV=sandbox

# Application
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:1000](http://localhost:1000) in your browser to see the application.

## Project Structure

```
laptix_banking/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   └── (root)/                # Protected routes
│       ├── page.tsx           # Dashboard
│       ├── my-banks/
│       ├── payment-transfer/
│       └── transaction-history/
├── components/                 # React components
│   ├── ui/                    # Reusable UI components
│   ├── AuthForm.tsx
│   ├── BankCard.tsx
│   ├── DoughnutChart.tsx
│   └── ...
├── lib/                       # Utilities and actions
│   ├── actions/               # Server actions
│   │   ├── bank.actions.ts
│   │   ├── user.actions.ts
│   │   └── ...
│   ├── appwrite.ts           # Appwrite configuration
│   ├── plaid.ts              # Plaid configuration
│   └── utils.ts              # Helper functions
├── constants/                 # App constants
├── types/                     # TypeScript type definitions
└── public/                    # Static assets
```

## Development Commands

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

### Start production server
```bash
npm start
```

### Delete cache
```bash
rm -rf .next
```

### Clean build
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

---

**Note:** This application is for educational/demo purposes. Ensure you comply with all financial regulations and security requirements before deploying to production.s
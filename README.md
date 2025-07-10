# FoxQuant Frontend

A modern Next.js frontend for the FoxQuant trading platform, built with TypeScript, Tailwind CSS, and React.

## Features

- **Authentication System**: Complete user registration, login, email verification, and password reset
- **Dashboard**: Overview of portfolio performance and recent activity
- **Portfolio Management**: View holdings, performance metrics, and allocation
- **Order Management**: Place, view, and manage trading orders
- **Trading History**: Complete history of all trades and transactions
- **Settings**: User profile and account management
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Clean, professional interface with smooth animations

## Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Toast notifications
- **Lucide React**: Icon library
- **Axios**: HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend server running on `http://localhost:4000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication pages
│   ├── register/         # Registration pages
│   ├── portfolio/        # Portfolio management
│   ├── orders/           # Order management
│   ├── history/          # Trading history
│   ├── settings/         # User settings
│   └── globals.css       # Global styles
├── components/            # Reusable components
│   ├── ui/              # UI components (Button, Input, Card)
│   └── layout/          # Layout components
├── contexts/             # React contexts
├── services/             # API services
└── types/               # TypeScript type definitions
```

## API Integration

The frontend integrates with the backend API endpoints:

- **Authentication**: `/api/auth/*`
- **Portfolio**: `/api/portfolio`
- **Orders**: `/api/orders`
- **History**: `/api/history`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features Overview

### Authentication
- User registration with email verification
- Secure login with JWT tokens
- Password reset functionality
- Protected routes and session management

### Dashboard
- Portfolio overview with key metrics
- Recent trading activity
- Performance charts and statistics
- Quick access to main features

### Portfolio
- Current holdings display
- Performance tracking
- Asset allocation visualization
- Real-time portfolio value

### Orders
- Order placement interface
- Order history and status tracking
- Order management (cancel, modify)
- Order statistics and analytics

### History
- Complete trading history
- Filter and search functionality
- Performance analytics
- Export capabilities

### Settings
- Profile management
- Security settings
- Notification preferences
- Billing information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, Calendar as CalendarIcon, List } from 'lucide-react';
import AutoRefresh from '@/components/AutoRefresh';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rental Dashboard',
  description: 'Premium dashboard for rental management',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RentalDash',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="layout-container">
          {/* Mobile Header */}
          <div className="mobile-header">
            <h1>Rental<span className="accent-text">Dash</span></h1>
          </div>

          {/* Sidebar */}
          <aside className="sidebar glass-panel">
            <div className="sidebar-header">
              <h1>Rental<span className="accent-text">Dash</span></h1>
              <p>Property Management</p>
            </div>

            <nav className="sidebar-nav">
              <Link href="/" className="nav-link active">
                <LayoutDashboard size={20} />
                <span>Дашборд</span>
              </Link>
              <Link href="/calendar" className="nav-link">
                <CalendarIcon size={20} />
                <span>Календарь</span>
              </Link>
              <Link href="/list" className="nav-link">
                <List size={20} />
                <span>Список броней</span>
              </Link>
            </nav>
            
            <div className="status-widget">
              <div className="status-indicator">
                <div className="status-dot pulse"></div>
                <span>Система онлайн</span>
              </div>
              <p>Auto-sync active</p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="main-content">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
          
          <AutoRefresh intervalMs={180000} /> {/* Refresh every 3 minutes */}
        </div>
      </body>
    </html>
  );
}

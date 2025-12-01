import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Home } from 'lucide-react';

interface BreadcrumbsProps {
  selectedGameName?: string;
  selectedPublisherName?: string;
  className?: string;
  isSidebarOpen?: boolean;
}

interface BreadcrumbItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  isCurrentPage: boolean;
}

export function Breadcrumbs({ selectedGameName, selectedPublisherName, className, isSidebarOpen }: BreadcrumbsProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathname = location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    
    // Always start with Home
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Home',
        path: '/',
        icon: <Home className="w-4 h-4" />,
        isCurrentPage: pathname === '/' || pathname === '/home'
      }
    ];

    // Handle different page types
    switch (true) {
      case pathname === '/browserpage': {
        breadcrumbs.push({
          label: 'Browse Games',
          path: '/browserpage',
          isCurrentPage: true
        });
        break;
      }

      case pathname.startsWith('/games/'): {
        // Add Browse Games as intermediate step
        if (pathname !== '/browserpage') {
          breadcrumbs.push({
            label: 'Browse Games',
            path: '/browserpage',
            isCurrentPage: false
          });
        }
        breadcrumbs.push({
          label: selectedGameName || 'Game Details',
          path: pathname,
          isCurrentPage: true
        });
        break;
      }

      case pathname === '/favorites': {
        breadcrumbs.push({
          label: 'My Favorites',
          path: '/favorites',
          isCurrentPage: true
        });
        break;
      }

      case pathname === '/accessibility': {
        breadcrumbs.push({
          label: 'Accessibility',
          path: '/accessibility',
          isCurrentPage: true
        });
        break;
      }

      case pathname === '/profile': {
        breadcrumbs.push({
          label: 'Profile',
          path: '/profile',
          isCurrentPage: true
        });
        break;
      }

      case pathname === '/admin': {
        breadcrumbs.push({
          label: 'Admin Dashboard',
          path: '/admin',
          isCurrentPage: true
        });
        break;
      }

      case pathname === '/developer': {
        breadcrumbs.push({
          label: 'Developer Dashboard',
          path: '/developer',
          isCurrentPage: true
        });
        break;
      }

      case pathname === '/makeaccountpublisher': {
        breadcrumbs.push({
          label: 'Publisher Account Setup',
          path: '/makeaccountpublisher',
          isCurrentPage: true
        });
        break;
      }

      case pathname === '/publisherdashboard': {
        breadcrumbs.push({
          label: 'Publisher Dashboard',
          path: '/publisherdashboard',
          isCurrentPage: true
        });
        break;
      }      case !!(pathname.includes('publisher') && selectedPublisherName): {
        breadcrumbs.push({
          label: 'Publishers',
          path: '/publishers',
          isCurrentPage: false
        });
        breadcrumbs.push({
          label: selectedPublisherName,
          path: pathname,
          isCurrentPage: true
        });
        break;
      }

      default: {
        // For any other paths, try to create breadcrumbs from segments
        let currentPath = '';
        segments.forEach((segment, index) => {
          currentPath += `/${segment}`;
          const isLast = index === segments.length - 1;
          
          // Convert segment to readable label
          const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' ');
          
          breadcrumbs.push({
            label,
            path: currentPath,
            isCurrentPage: isLast
          });
        });
        break;
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs for login/signup pages or if there's only home
  if (location.pathname.includes('login') || 
      location.pathname.includes('signup') || 
      breadcrumbs.length <= 1) {
    return null;
  }

  const handleBreadcrumbClick = (path: string, event: React.MouseEvent) => {
    event.preventDefault();
    navigate(path);
  };

  const handleKeyDown = (path: string, event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(path);
    }
  };
  return (
    <div className={`fixed top-16 left-0 right-0 z-35 bg-card border-b px-4 lg:px-6 py-2 transition-all duration-300 ${
      isSidebarOpen ? 'lg:ml-48' : 'lg:ml-0'
    } ${className || ''}`}>
      <div className="max-w-full">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.path}>
                <BreadcrumbItem>
                  {breadcrumb.isCurrentPage ? (
                    <BreadcrumbPage className="flex items-center gap-2">
                      {breadcrumb.icon}
                      <span>{breadcrumb.label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={(e) => handleBreadcrumbClick(breadcrumb.path, e)}
                      onKeyDown={(e) => handleKeyDown(breadcrumb.path, e)}
                      className="flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-1 py-0.5"
                      tabIndex={0}
                      role="button"
                      aria-label={`Navigate to ${breadcrumb.label}`}
                    >
                      {breadcrumb.icon}
                      <span>{breadcrumb.label}</span>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}

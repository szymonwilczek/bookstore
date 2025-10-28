'use client';

import * as React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import {HamburgerIcon} from "./HamburgerIcon.tsx"
import {Logo} from "../Logo.tsx"
import {InfoMenu} from "./InfoMenu.tsx"
import {NotificationMenu} from "./NotificationMenu.tsx"
import {UserMenu} from "./UserMenu.tsx"
import { useSession } from 'next-auth/react';

export interface NavbarNavItem {
  href?: string;
  label: string;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  logoHref?: string;
  navigationLinks?: NavbarNavItem[];
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  notificationCount?: number;
  onNavItemClick?: (href: string) => void;
  onInfoItemClick?: (item: string) => void;
  onNotificationItemClick?: (item: string) => void;
  onUserItemClick?: (item: string) => void;
}

const defaultNavigationLinks: NavbarNavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/search', label: 'Search' },
  { href: '/profile', label: 'Profile' },
];

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      className,
      logo = <Logo />,
      logoHref = '#',
      navigationLinks = defaultNavigationLinks,
      userName = 'John Doe',
      userEmail = 'john@example.com',
      userAvatar,
      notificationCount = 3,
      onNavItemClick,
      onInfoItemClick,
      onNotificationItemClick,
      onUserItemClick,
      ...props
    },
    ref
  ) => {
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLElement>(null);
    const {data: session } = useSession();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
      if (session) {
    fetch('/api/user/profile').then(res => res.json()).then(setUserData);
      }
    }, [session]);


    useEffect(() => {
      const checkWidth = () => {
        if (containerRef.current) {
          const width = containerRef.current.offsetWidth;
          setIsMobile(width < 768); // 768px is md breakpoint
        }
      };

      checkWidth();

      const resizeObserver = new ResizeObserver(checkWidth);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, []);

    // Combine refs
    const combinedRef = React.useCallback((node: HTMLElement | null) => {
      containerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }, [ref]);

    return (
      <header
        ref={combinedRef}
        className={cn(
          'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline',
          className
        )}
        {...props}
      >
        <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
          {/* Left side */}
          <div className="flex items-center gap-2">
            {/* Mobile menu trigger */}
            {isMobile && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                    variant="ghost"
                    size="icon"
                  >
                    <HamburgerIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-64 p-1">
                  <NavigationMenu className="max-w-none">
                    <NavigationMenuList className="flex-col items-start gap-0">
                      {navigationLinks.map((link, index) => (
                        <NavigationMenuItem key={index} className="w-full">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (onNavItemClick && link.href) onNavItemClick(link.href);
                            }}
                            className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer no-underline"
                          >
                            {link.label}
                          </button>
                        </NavigationMenuItem>
                      ))}
                    </NavigationMenuList>
                  </NavigationMenu>
                </PopoverContent>
              </Popover>
            )}
            {/* Main nav */}
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => e.preventDefault()}
                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
              >
                <div className="text-2xl">
                  {logo}
                </div>
                <span className="hidden font-bold text-xl sm:inline-block">shadcn.io</span>
              </button>
              {/* Navigation menu */}
              {!isMobile && (
                <NavigationMenu className="flex">
                  <NavigationMenuList className="gap-1">
                    {navigationLinks.map((link, index) => (
                      <NavigationMenuItem key={index}>
                        <NavigationMenuLink
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            if (onNavItemClick && link.href) onNavItemClick(link.href);
                          }}
                          className="text-muted-foreground hover:text-primary py-1.5 font-medium transition-colors cursor-pointer group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              )}
            </div>
          </div>
          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Info menu */}
              <InfoMenu onItemClick={onInfoItemClick} />
              {/* Notification */}
              <NotificationMenu 
                notificationCount={notificationCount}
                onItemClick={onNotificationItemClick}
              />
            </div>
            {/* User menu */}
            <UserMenu 
              userName={session?.user?.name || userData?.name || 'User'}
              userEmail={session?.user?.email || userData?.email || 'user@example.com'}
              userAvatar={userData?.profileImage || session?.user?.image}
              onItemClick={onUserItemClick}
            />
          </div>
        </div>
      </header>
    );
  }
);

Navbar.displayName = 'Navbar';

export { Logo, HamburgerIcon, InfoMenu, NotificationMenu, UserMenu };

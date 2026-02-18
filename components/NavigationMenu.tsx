'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Users, 
  Shield, 
  Home, 
  Settings,
  ChevronDown,
  BarChart3,
  Activity // Added an icon for the Responder menu
} from 'lucide-react';

interface NavigationMenuProps {
  userRole: string;
}

export default function NavigationMenu({ userRole }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showResponderMenu, setShowResponderMenu] = useState(false); // New state
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = userRole === 'system-admin';
  const isResponder = userRole === 'responder';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAdminMenu(false);
        setShowResponderMenu(false);
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: '/', label: 'Dashboard', icon: Home, show: true },
  ];

  const adminLinks = [
    { href: '/users', label: 'User Management', icon: Users, description: 'Manage system users' },
    { href: '/admin', label: 'Admin Dashboard', icon: Shield, description: 'System administration' },
    { href: '/reports', label: 'Reports & Analytics', icon: BarChart3, description: 'Generate reports' },
    { href: '/settings', label: 'Settings', icon: Settings, description: 'System configuration' },
  ];

  const responderLinks = [
    { href: '/users', label: 'User Management', icon: Users, description: 'Manage system users' },
    { href: '/reports', label: 'Reports & Analytics', icon: BarChart3, description: 'Generate reports' },
    { href: '/settings', label: 'Settings', icon: Settings, description: 'System configuration' },
  ];

  return (
    <nav className="flex items-center gap-2" ref={menuRef}>
      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-2">
        {navLinks.filter(link => link.show).map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                isActive(link.href) ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              <Icon size={16} />
              {link.label}
            </Link>
          );
        })}

        {/* Admin Dropdown */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showAdminMenu || pathname.startsWith('/admin') || pathname.startsWith('/users')
                  ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              <Shield size={16} />
              Admin
              <ChevronDown size={16} className={`transition-transform ${showAdminMenu ? 'rotate-180' : ''}`} />
            </button>
            {showAdminMenu && renderDropdown(adminLinks, setShowAdminMenu)}
          </div>
        )}

        {/* Responder Dropdown */}
        {isResponder && (
          <div className="relative">
            <button
              onClick={() => setShowResponderMenu(!showResponderMenu)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showResponderMenu || pathname.startsWith('/reports') || pathname.startsWith('/users')
                  ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              <Activity size={16} />
              Responder
              <ChevronDown size={16} className={`transition-transform ${showResponderMenu ? 'rotate-180' : ''}`} />
            </button>
            {showResponderMenu && renderDropdown(responderLinks, setShowResponderMenu)}
          </div>
        )}
      </div>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
          {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 right-0 bg-gray-800 border-t border-gray-700 shadow-2xl md:hidden z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium flex items-center gap-3 ${isActive(link.href) ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
                <link.icon size={20} /> {link.label}
              </Link>
            ))}

            {(isAdmin || isResponder) && (
              <>
                <div className="border-t border-gray-700 my-2 pt-2">
                  <p className="px-4 py-2 text-xs text-gray-400 uppercase font-semibold">{isAdmin ? 'Administration' : 'Responder Tools'}</p>
                </div>
                {(isAdmin ? adminLinks : responderLinks).map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg font-medium ${isActive(link.href) ? (isAdmin ? 'bg-orange-600' : 'bg-emerald-600') + ' text-white' : 'bg-gray-700 text-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <link.icon size={20} />
                      <div>
                        <p className="text-sm font-semibold">{link.label}</p>
                        <p className="text-xs text-gray-400">{link.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );

  // Helper function to render the desktop dropdown content
  function renderDropdown(links: any[], setMenuState: (val: boolean) => void) {
    return (
      <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 py-2 z-50">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuState(false)}
              className={`block px-4 py-3 hover:bg-gray-700 transition-colors ${isActive(link.href) ? 'bg-gray-700' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  link.icon === Users ? 'bg-purple-600' :
                  link.icon === Shield ? 'bg-orange-600' :
                  link.icon === BarChart3 ? 'bg-emerald-600' : 'bg-blue-600'
                }`}>
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{link.label}</p>
                  <p className="text-xs text-gray-400">{link.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }
}
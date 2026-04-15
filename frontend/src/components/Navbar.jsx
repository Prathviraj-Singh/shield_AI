import React, { useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { logout, currentUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (location.pathname === '/login') return null;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Scan', path: '/scan' },
    { name: 'Reports', path: '/reports' },
  ];

  return (
    <nav className="bg-gray-800/90 backdrop-blur border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 hover:opacity-80 transition-opacity">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            <span>ShieldAI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) => 
                    `text-sm font-medium transition-all duration-200 mt-1 ${isActive ? 'text-white border-b-2 border-blue-500 pb-1 translate-y-[2px]' : 'text-gray-400 hover:text-gray-200'}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
            
            {currentUser ? (
              <div className="flex items-center space-x-4 border-l border-gray-600 pl-6">
                <span className="text-gray-300 text-sm font-mono tracking-tight truncate max-w-[150px]">{currentUser.email}</span>
                <button 
                  onClick={logout} 
                  className="bg-gray-700/50 hover:bg-gray-700 text-red-400 hover:text-red-300 px-3 py-1.5 rounded-md text-sm font-medium transition border border-gray-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-l border-gray-600 pl-6">
                <Link to="/login" className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg shadow-blue-500/20 transition-all">Sign In</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none p-2 bg-gray-700/50 rounded-md">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-800 border-b border-gray-700 animate-fade-in-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-gray-900 text-blue-400' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {currentUser ? (
              <button 
                onClick={() => { setIsMobileMenuOpen(false); logout(); }} 
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 mt-2 border-t border-gray-700 pt-2"
              >
                Sign Out <span className="text-gray-500 font-normal text-sm ml-1">({currentUser.email})</span>
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 mt-2 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-500 text-center">Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

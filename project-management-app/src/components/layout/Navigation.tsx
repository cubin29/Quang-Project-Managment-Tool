'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  BarChart3, 
  FolderOpen, 
  Target, 
  CheckSquare, 
  Info,
  Menu,
  X
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  username: string
  role: string
}

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    
    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = () => {
      checkAuthStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Custom event for same-tab auth changes
    const handleAuthChange = () => {
      checkAuthStatus()
    }
    
    window.addEventListener('authStateChanged', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('authStateChanged', handleAuthChange)
    }
  }, [])

  const checkAuthStatus = () => {
    try {
      // Check localStorage first (persistent login)
      let token = localStorage.getItem('token')
      let userData = localStorage.getItem('user')
      const loginExpiry = localStorage.getItem('loginExpiry')
      
      // Check if persistent login has expired
      if (token && loginExpiry && Date.now() > parseInt(loginExpiry)) {
        // Login expired, clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('loginExpiry')
        token = null
        userData = null
      }
      
      // If no valid localStorage data, check sessionStorage
      if (!token || !userData) {
        token = sessionStorage.getItem('token')
        userData = sessionStorage.getItem('user')
      }
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      // Clear invalid data
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('loginExpiry')
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    // Clear all auth data from both storages
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('loginExpiry')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    
    setUser(null)
    setShowUserMenu(false)
    setShowMobileMenu(false)
    
    // Dispatch custom event to update navigation
    window.dispatchEvent(new Event('authStateChanged'))
    
    router.push('/about')
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
      case 'MANAGER': return 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
      case 'MEMBER': return 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg'
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600 text-white shadow-lg'
    }
  }

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/projects', label: 'Projects', icon: FolderOpen },
    { href: '/analytics', label: 'Analytics', icon: Target },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/about', label: 'About', icon: Info },
  ]

  const isActiveRoute = (href: string) => {
    return pathname === href || (href !== '/' && pathname.startsWith(href))
  }

  return (
    <>
      {/* Modern Navigation Bar with Design System */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand - Updated with Design System */}
            <Link 
              href="/" 
              className="flex items-center space-x-3 group"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <span className="text-white font-bold text-sm">PM</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                Project Manager
              </span>
            </Link>
            
            {/* Desktop Navigation - Updated with Design System */}
            <div className="hidden lg:flex items-center space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`} />
                    <span>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* User Section - Updated with Design System */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="w-10 h-10 bg-slate-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-lg">
                        {getUserInitials(user.name)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                      <div className="text-xs text-slate-500">{user.role}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </button>

                  {/* Enhanced User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                      {/* User Info Header */}
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-slate-200">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                              {getUserInitials(user.name)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-3 border-white rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-slate-900 truncate">{user.name}</h3>
                            <p className="text-sm text-slate-600 truncate">{user.email}</p>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        <Link
                          href="/auth/account"
                          className="flex items-center w-full p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-100 transition-colors">
                            <Settings className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900">Account Settings</div>
                            <div className="text-xs text-slate-500">Manage your profile and preferences</div>
                          </div>
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full p-3 rounded-xl hover:bg-red-50 transition-all duration-200 group"
                        >
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-100 transition-colors">
                            <LogOut className="h-5 w-5 text-slate-600 group-hover:text-red-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-900 group-hover:text-red-700">Sign Out</div>
                            <div className="text-xs text-slate-500">Sign out of your account</div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link 
                    href="/auth/login" 
                    className="bg-transparent hover:bg-slate-100 text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg transition-all duration-200 border-0 focus:ring-3 focus:ring-slate-200 focus:outline-none"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/register" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 border-0 focus:ring-3 focus:ring-blue-200 focus:outline-none text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {showMobileMenu ? (
                  <X className="h-6 w-6 text-slate-600" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
          <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = isActiveRoute(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border border-blue-200' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, BarChart3, Kanban, Calendar, Shield, Users, Target, LogIn } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    let token = localStorage.getItem('token')
    let user = localStorage.getItem('user')
    const loginExpiry = localStorage.getItem('loginExpiry')
    
    // Check if persistent login has expired
    if (token && loginExpiry && Date.now() > parseInt(loginExpiry)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('loginExpiry')
      token = null
      user = null
    }
    
    // If no valid localStorage data, check sessionStorage
    if (!token || !user) {
      token = sessionStorage.getItem('token')
      user = sessionStorage.getItem('user')
    }

    if (token && user) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard')
    } else {
      // User is not authenticated, redirect to about page
      router.push('/about')
    }
  }, [router])

  // Show loading state while checking authentication
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

const features = [
  {
    icon: BarChart3,
    title: "Interactive Analytics Dashboard",
    description: "Visualize project progress with business impact metrics, revenue tracking, and real-time analytics"
  },
  {
    icon: Target,
    title: "Business Impact Tracking",
    description: "Track business impact (1-10), tech effort, revenue uplift, and headcount savings for data-driven decisions"
  },
  {
    icon: Shield,
    title: "User Authentication & Security",
    description: "Secure user authentication with role-based access control (Admin, Manager, Member)"
  },
  {
    icon: Users,
    title: "Enhanced Project Management",
    description: "Manage projects with team assignments, country tracking, PIC designation, and comprehensive project data"
  },
  {
    icon: Calendar,
    title: "Timeline & ETA Tracking",
    description: "Plan and track project timelines with clear ETAs and progress monitoring"
  },
  {
    icon: Kanban,
    title: "Comprehensive Reporting",
    description: "Generate insights on project value, revenue impact, cost savings, and team utilization metrics"
  }
]

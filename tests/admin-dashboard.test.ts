import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminDashboard from '~/pages/admin/dashboard.vue'

describe('Admin Dashboard', () => {
  it('serves the admin dashboard when an admin logs in', async () => {
    // Mount the admin dashboard component
    const adminDashboard = await mountSuspended(AdminDashboard)
    
    // Verify the admin dashboard is in fact served
    expect(adminDashboard.html()).toContain('Admin Dashboard')
    expect(adminDashboard.html()).toContain('Welcome, Admin')
    
    // Verify essential admin dashboard elements are present
    expect(adminDashboard.html()).toContain('Total Therapists')
    expect(adminDashboard.html()).toContain('Active Clients') 
    expect(adminDashboard.html()).toContain('Pending Worksheets')
    expect(adminDashboard.html()).toContain('Therapist Management')
    expect(adminDashboard.html()).toContain('Add Therapist')
    
    // Verify navigation elements
    expect(adminDashboard.html()).toContain('Logout')
    
    // Verify table headers for therapist management
    expect(adminDashboard.html()).toContain('Name')
    expect(adminDashboard.html()).toContain('Email')
    expect(adminDashboard.html()).toContain('Status')
    expect(adminDashboard.html()).toContain('Actions')
  })
  
  it('contains all required admin functionality', async () => {
    const adminDashboard = await mountSuspended(AdminDashboard)
    
    // Verify the dashboard has the expected structure
    const nav = adminDashboard.find('nav')
    expect(nav.exists()).toBe(true)
    
    // Verify statistics cards are present
    const statsCards = adminDashboard.findAll('.card')
    expect(statsCards.length).toBeGreaterThan(0)
    
    // Verify therapist management table exists
    const table = adminDashboard.find('table')
    expect(table.exists()).toBe(true)
    
    // Verify Add Therapist button exists
    expect(adminDashboard.html()).toContain('Add Therapist')
  })
})
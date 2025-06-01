// Simple script to create an admin user
// Usage: node scripts/create-admin.js <email> [name]

async function createAdmin() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.error('Usage: node scripts/create-admin.js <email> [name]')
    console.error('Example: node scripts/create-admin.js admin@example.com "System Admin"')
    process.exit(1)
  }

  const email = args[0]
  const name = args[1] || 'System Admin'

  // Basic email validation
  if (!email.includes('@') || !email.includes('.')) {
    console.error('Error: Please provide a valid email address')
    process.exit(1)
  }

  try {
    console.log(`Creating admin user: ${email}`)
    
    const response = await fetch('http://localhost:3000/api/admin/bootstrap', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name
      })
    })

    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Success:', result.message)
      if (result.admin) {
        console.log('Admin user details:')
        console.log(`  Email: ${result.admin.email}`)
        console.log(`  Name: ${result.admin.name}`)
        console.log(`  ID: ${result.admin.id}`)
      }
    } else {
      console.error('❌ Error:', result.message || 'Unknown error')
    }
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    console.error('Make sure the development server is running (npm run dev)')
  }
}

createAdmin()
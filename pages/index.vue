<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Crane Beta</h1>
        <p class="text-gray-600">Managing worksheets for therapists</p>
      </div>

      <div class="card space-y-4">
        <h2 class="text-xl font-semibold text-center mb-6">Choose Your Login</h2>
        
        <NuxtLink to="/auth/admin" class="block w-full btn-primary text-center">
          Admin Login
        </NuxtLink>
        
        <NuxtLink to="/auth/therapist" class="block w-full btn-secondary text-center">
          Therapist Login
        </NuxtLink>
        
        <NuxtLink to="/auth/client" class="block w-full btn-secondary text-center">
          Client Login
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Client Login</h1>
        <p class="text-gray-600">Enter your email or phone to receive a login code</p>
      </div>

      <div class="card">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div v-if="!otpSent">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contact Method
              </label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input v-model="contactType" type="radio" value="email" class="mr-2" />
                  Email
                </label>
                <label class="flex items-center">
                  <input v-model="contactType" type="radio" value="sms" class="mr-2" />
                  SMS
                </label>
              </div>
            </div>

            <label for="identifier" class="block text-sm font-medium text-gray-700 mb-2">
              {{ contactType === 'email' ? 'Email Address' : 'Phone Number' }}
            </label>
            <input
              id="identifier"
              v-model="identifier"
              :type="contactType === 'email' ? 'email' : 'tel'"
              required
              class="input-field"
              :placeholder="contactType === 'email' ? 'client@example.com' : '+1234567890'"
            />
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full btn-primary mt-4"
            >
              {{ loading ? 'Sending...' : 'Send Login Code' }}
            </button>
          </div>

          <div v-else>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Enter 6-digit code
            </label>
            <input
              id="code"
              v-model="code"
              type="text"
              maxlength="6"
              required
              class="input-field text-center text-lg tracking-wider"
              placeholder="123456"
            />
            <button 
              type="submit" 
              :disabled="loading"
              class="w-full btn-primary mt-4"
            >
              {{ loading ? 'Verifying...' : 'Verify Code' }}
            </button>
            <button 
              type="button"
              @click="resetForm"
              class="w-full btn-secondary mt-2"
            >
              Use Different Contact
            </button>
          </div>

          <div v-if="error" class="text-red-600 text-sm text-center">
            {{ error }}
          </div>
        </form>
      </div>

      <div class="text-center mt-6">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">
          ← Back to Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
const identifier = ref('')
const code = ref('')
const contactType = ref('email')
const otpSent = ref(false)
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  loading.value = true
  error.value = ''

  try {
    if (!otpSent.value) {
      await $fetch('/api/auth/client/send-otp', {
        method: 'POST',
        body: { identifier: identifier.value, type: contactType.value }
      })
      otpSent.value = true
    } else {
      const response = await $fetch('/api/auth/client/verify-otp', {
        method: 'POST',
        body: { identifier: identifier.value, code: code.value }
      })
      
      if (response.success) {
        await navigateTo('/client/dashboard')
      }
    }
  } catch (err) {
    error.value = err.data?.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

function resetForm() {
  otpSent.value = false
  code.value = ''
  error.value = ''
}
</script>
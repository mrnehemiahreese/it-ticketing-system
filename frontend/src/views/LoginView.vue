<template>
  <v-app>
    <v-main class="d-flex align-center justify-center bg-grey-lighten-3">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card elevation="8" class="pa-4">
              <v-card-text>
                <div class="text-center mb-6">
                  <v-icon size="64" color="primary">mdi-ticket-confirmation</v-icon>
                  <h1 class="text-h4 font-weight-bold mt-4">IT Ticketing System</h1>
                  <p class="text-subtitle-1 text-grey mt-2">Sign in to continue</p>
                </div>

                <v-form ref="formRef" @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="formData.email"
                    label="Email"
                    type="email"
                    prepend-inner-icon="mdi-email"
                    :rules="[rules.required, rules.email]"
                    variant="outlined"
                    density="comfortable"
                    class="mb-3"
                  />

                  <v-text-field
                    v-model="formData.password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :rules="[rules.required]"
                    variant="outlined"
                    density="comfortable"
                    class="mb-4"
                    @click:append-inner="showPassword = !showPassword"
                  />

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    class="mb-4"
                  >
                    Sign In
                  </v-btn>

                  <v-alert
                    v-if="error"
                    type="error"
                    variant="tonal"
                    closable
                    @click:close="error = ''"
                  >
                    {{ error }}
                  </v-alert>
                </v-form>

                <v-divider class="my-4" />

                <div class="text-center text-caption text-grey">
                  <p>Default credentials:</p>
                  <p class="font-weight-medium">Admin: admin@example.com / admin123</p>
                  <p class="font-weight-medium">Technician: tech@example.com / tech123</p>
                  <p class="font-weight-medium">User: user@example.com / user123</p>
                </div>
              </v-card-text>
            </v-card>

            <div class="text-center mt-4 text-caption text-grey">
              &copy; 2026 IT Ticketing System. All rights reserved.
            </div>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { LOGIN_MUTATION } from '@/graphql/mutations'
import { VALIDATION_RULES } from '@/utils/constants'
import { parseGraphQLError } from '@/utils/helpers'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const formRef = ref(null)
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const formData = ref({
  email: '',
  password: ''
})

const rules = VALIDATION_RULES

// GraphQL mutation
const { mutate: login } = useMutation(LOGIN_MUTATION)

async function handleLogin() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  try {
    const result = await login({
      username: formData.value.email,
      password: formData.value.password
    })

    if (result?.data?.login) {
      const { accessToken, user } = result.data.login

      // Store auth data
      authStore.setAuth(accessToken, user)

      // Show success message
      notificationStore.success('Login successful!')

      // Redirect to intended page or dashboard
      const redirect = route.query.redirect || '/dashboard'
      router.push(redirect)
    }
  } catch (err) {
    error.value = parseGraphQLError(err)
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.v-main {
  min-height: 100vh;
}
</style>

<template>
    <div>
      <h1 class="text-h4 font-weight-bold mb-6">Profile Settings</h1>

      <v-row>
        <v-col cols="12" md="8">
          <v-card elevation="2">
            <v-card-title>Personal Information</v-card-title>
            <v-divider />
            <v-card-text>
              <v-form ref="formRef" @submit.prevent="handleUpdateProfile">
                <v-text-field
                  v-model="formData.fullname"
                  label="Full Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                />

                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                />

                <v-text-field
                  v-model="formData.phoneNumber"
                  label="Phone Number"
                  :rules="[rules.phoneNumber]"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                />

                <v-text-field
                  v-model="formData.department"
                  label="Department"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  :loading="loading"
                >
                  Save Changes
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>

          <v-card elevation="2" class="mt-4">
            <v-card-title>Change Password</v-card-title>
            <v-divider />
            <v-card-text>
              <v-form ref="passwordFormRef" @submit.prevent="handleChangePassword">
                <v-text-field
                  v-model="passwordData.oldPassword"
                  label="Current Password"
                  type="password"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                />

                <v-text-field
                  v-model="passwordData.newPassword"
                  label="New Password"
                  type="password"
                  :rules="[rules.required, rules.password]"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                />

                <v-text-field
                  v-model="passwordData.confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  :rules="[rules.required, passwordMatchRule]"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                />

                <v-btn
                  type="submit"
                  color="primary"
                  :loading="passwordLoading"
                >
                  Change Password
                </v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card elevation="2">
            <v-card-text class="text-center">
              <v-avatar
                :color="getAvatarColor(authStore.user?.fullname || authStore.user?.username || '')"
                size="120"
                class="mb-4"
              >
                <span class="text-h3">
                  {{ getInitials(authStore.user?.fullname || authStore.user?.username) }}
                </span>
              </v-avatar>

              <h3 class="text-h5 font-weight-bold">{{ authStore.fullName }}</h3>
              <p class="text-grey mt-1">{{ authStore.user?.email }}</p>

              <v-chip :color="getRoleColor(authStore.user?.role)" class="mt-3">
                {{ getRoleLabel(authStore.user?.role) }}
              </v-chip>

              <v-divider class="my-4" />

              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-briefcase</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Department</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.user?.department || 'N/A' }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-phone</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Phone</v-list-item-title>
                  <v-list-item-subtitle>{{ authStore.user?.phoneNumber || 'N/A' }}</v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Member Since</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(authStore.user?.createdAt) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMutation } from '@vue/apollo-composable'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { UPDATE_PROFILE, CHANGE_PASSWORD } from '@/graphql/mutations'
import { VALIDATION_RULES, USER_ROLE_LABELS, USER_ROLE_COLORS } from '@/utils/constants'
import { formatDate, getInitials, getAvatarColor, parseGraphQLError } from '@/utils/helpers'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const formRef = ref(null)
const passwordFormRef = ref(null)
const loading = ref(false)
const passwordLoading = ref(false)

const formData = ref({
  fullname: '',
  email: '',
  phoneNumber: '',
  department: ''
})

const passwordData = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = VALIDATION_RULES

const passwordMatchRule = computed(() => (v) =>
  v === passwordData.value.newPassword || 'Passwords do not match'
)

const { mutate: updateProfile } = useMutation(UPDATE_PROFILE)
const { mutate: changePassword } = useMutation(CHANGE_PASSWORD)

onMounted(() => {
  if (authStore.user) {
    formData.value = {
      fullname: authStore.user.fullname || '',
      email: authStore.user.email,
      phoneNumber: authStore.user.phoneNumber || '',
      department: authStore.user.department || ''
    }
  }
})

async function handleUpdateProfile() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const result = await updateProfile({ updateUserInput: formData.value })

    if (result?.data?.updateProfile) {
      authStore.updateUser(result.data.updateProfile)
      notificationStore.success('Profile updated successfully')
    }
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    loading.value = false
  }
}

async function handleChangePassword() {
  const { valid } = await passwordFormRef.value.validate()
  if (!valid) return

  passwordLoading.value = true

  try {
    await changePassword({
      oldPassword: passwordData.value.oldPassword,
      newPassword: passwordData.value.newPassword
    })

    notificationStore.success('Password changed successfully')

    // Reset form
    passwordData.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    passwordFormRef.value?.resetValidation()
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    passwordLoading.value = false
  }
}

function getRoleLabel(role) {
  return USER_ROLE_LABELS[role] || role
}

function getRoleColor(role) {
  return USER_ROLE_COLORS[role] || 'grey'
}
</script>

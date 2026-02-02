<template>
    <div>
      <div class="d-flex align-center justify-space-between mb-6">
        <h1 class="text-h4 font-weight-bold">User Management</h1>

        <v-btn color="primary" size="large" @click="openCreateDialog">
          <v-icon start>mdi-account-plus</v-icon>
          Add User
        </v-btn>
      </div>

      <!-- Filters -->
      <v-card elevation="2" class="mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                placeholder="Search users..."
                variant="outlined"
                density="comfortable"
                hide-details
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="roleFilter"
                :items="roleOptions"
                label="Filter by Role"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-select
                v-model="statusFilter"
                :items="statusOptions"
                label="Filter by Status"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Users Table -->
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :loading="loading"
        :search="search"
        class="elevation-2"
      >
        <!-- Name -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar :color="getAvatarColor(item.fullname || item.username)" size="32" class="mr-3">
              <span class="text-caption">{{ getInitials(item.fullname || item.username) }}</span>
            </v-avatar>
            <div>
              <div class="font-weight-medium">{{ item.fullname || item.username }}</div>
              <div class="text-caption text-grey">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Role -->
        <template v-slot:item.roles="{ item }">
          <v-chip
            v-for="role in (item.roles || [])"
            :key="role"
            :color="getRoleColor(role)"
            size="small"
            class="mr-1"
          >
            {{ getRoleLabel(role) }}
          </v-chip>
        </template>

        <!-- Status -->
        <template v-slot:item.isDisabled="{ item }">
          <v-chip :color="item.isDisabled ? 'error' : 'success'" size="small">
            {{ item.isDisabled ? 'Inactive' : 'Active' }}
          </v-chip>
        </template>

        <!-- Created At -->
        <template v-slot:item.createdAt="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <!-- Actions -->
        <template v-slot:item.actions="{ item }">
          <v-btn icon="mdi-pencil" variant="text" size="small" @click="openEditDialog(item)" />
          <v-btn
            icon="mdi-delete"
            variant="text"
            size="small"
            color="error"
            @click="confirmDelete(item)"
          />
        </template>
      </v-data-table>
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit User' : 'Create User' }}</v-card-title>
        <v-divider />

        <v-card-text>
          <v-form ref="formRef">
            <v-text-field
              v-model="userForm.fullname"
              label="Full Name"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="userForm.email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-if="!editMode"
              v-model="userForm.password"
              label="Password"
              type="password"
              :rules="[rules.required, rules.password]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="userForm.phoneNumber"
              label="Phone Number"
              :rules="[rules.phoneNumber]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="userForm.department"
              label="Department"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-model="userForm.role"
              label="Role"
              :items="roleOptions"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              class="mb-3"
            />

            <v-switch
              v-model="userForm.isActive"
              label="Active"
              color="success"
              hide-details
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveUser">
            {{ editMode ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete this user? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="deleting" @click="deleteUser">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useNotificationStore } from '@/stores/notification'
import { GET_USERS } from '@/graphql/queries'
import { CREATE_USER, UPDATE_USER, DELETE_USER } from '@/graphql/mutations'
import { VALIDATION_RULES, USER_ROLE, USER_ROLE_LABELS, USER_ROLE_COLORS } from '@/utils/constants'
import { formatDate, getInitials, getAvatarColor, parseGraphQLError } from '@/utils/helpers'

const notificationStore = useNotificationStore()

const search = ref('')
const roleFilter = ref(null)
const statusFilter = ref(null)
const dialog = ref(false)
const deleteDialog = ref(false)
const editMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selectedUser = ref(null)
const formRef = ref(null)

const userForm = ref({
  fullname: '',
  email: '',
  password: '',
  phoneNumber: '',
  department: '',
  role: 'USER',
  isActive: true
})

const rules = VALIDATION_RULES

const headers = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Department', key: 'department', sortable: true },
  { title: 'Phone', key: 'phoneNumber', sortable: false },
  { title: 'Role', key: 'roles', sortable: false },
  { title: 'Status', key: 'isDisabled', sortable: true },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

const roleOptions = Object.keys(USER_ROLE).map(key => ({
  value: USER_ROLE[key],
  title: USER_ROLE_LABELS[key]
}))

const statusOptions = [
  { value: true, title: 'Active' },
  { value: false, title: 'Inactive' }
]

// Fetch users
const { result, loading, refetch } = useQuery(GET_USERS)
const users = computed(() => result.value?.users || [])

const filteredUsers = computed(() => {
  let filtered = [...users.value]

  if (roleFilter.value) {
    filtered = filtered.filter(u => u.roles?.includes(roleFilter.value))
  }

  if (statusFilter.value !== null) {
    filtered = filtered.filter(u => !u.isDisabled === statusFilter.value)
  }

  return filtered
})

// Mutations
const { mutate: createUser } = useMutation(CREATE_USER)
const { mutate: updateUser } = useMutation(UPDATE_USER)
const { mutate: deleteUserMutation } = useMutation(DELETE_USER)

function openCreateDialog() {
  editMode.value = false
  userForm.value = {
    fullname: '',
    email: '',
    password: '',
    phoneNumber: '',
    department: '',
    role: 'USER',
    isActive: true
  }
  dialog.value = true
}

function openEditDialog(user) {
  editMode.value = true
  selectedUser.value = user
  userForm.value = {
    fullname: user.fullname || user.username || '',
    email: user.email,
    password: '',
    phoneNumber: user.phoneNumber || '',
    department: user.department || '',
    role: user.roles?.[0] || 'USER',
    isActive: !user.isDisabled
  }
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  editMode.value = false
  selectedUser.value = null
  formRef.value?.resetValidation()
}

async function saveUser() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true

  try {
    const input = {
      fullname: userForm.value.fullname,
      email: userForm.value.email,
      phoneNumber: userForm.value.phoneNumber || null,
      department: userForm.value.department || null,
      role: userForm.value.role,
      isActive: userForm.value.isActive
    }

    if (!editMode.value) {
      input.password = userForm.value.password
      await createUser({ createUserInput: input })
      notificationStore.success('User created successfully')
    } else {
      await updateUser({ id: selectedUser.value.id, updateUserInput: input })
      notificationStore.success('User updated successfully')
    }

    closeDialog()
    refetch()
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    saving.value = false
  }
}

function confirmDelete(user) {
  selectedUser.value = user
  deleteDialog.value = true
}

async function deleteUser() {
  deleting.value = true

  try {
    await deleteUserMutation({ id: selectedUser.value.id })
    notificationStore.success('User deleted successfully')
    deleteDialog.value = false
    selectedUser.value = null
    refetch()
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    deleting.value = false
  }
}

function getRoleLabel(role) {
  return USER_ROLE_LABELS[role] || role
}

function getRoleColor(role) {
  return USER_ROLE_COLORS[role] || 'grey'
}
</script>

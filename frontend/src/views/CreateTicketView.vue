<template>
    <div>
      <div class="mb-6">
        <v-btn
          variant="text"
          :to="{ name: 'Tickets' }"
          class="mb-4"
        >
          <v-icon start>mdi-arrow-left</v-icon>
          Back to Tickets
        </v-btn>

        <h1 class="text-h4 font-weight-bold">Create New Ticket</h1>
      </div>

      <v-row>
        <v-col cols="12" md="8">
          <v-card elevation="2">
            <v-card-text>
              <v-form ref="formRef" @submit.prevent="handleSubmit">
                <!-- Title -->
                <v-text-field
                  v-model="formData.title"
                  label="Title"
                  placeholder="Brief description of the issue"
                  :rules="[rules.required, rules.minLength(10)]"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                />

                <!-- Description -->
                <v-textarea
                  v-model="formData.description"
                  label="Description"
                  placeholder="Detailed description of the issue, including steps to reproduce..."
                  :rules="[rules.required, rules.minLength(20)]"
                  rows="6"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4"
                />

                <v-row>
                  <!-- Priority -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.priority"
                      label="Priority"
                      :items="priorityOptions"
                      item-title="label"
                      item-value="value"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>

                  <!-- Category (Level 1) -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="selectedLevel1"
                      label="Category"
                      :items="level1Categories"
                      item-title="name"
                      item-value="id"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                      :loading="categoriesLoading"
                      @update:model-value="handleLevel1Change"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon :color="item.raw.color">{{ item.raw.icon || 'mdi-folder' }}</v-icon>
                          </template>
                        </v-list-item>
                      </template>
                      <template v-slot:selection="{ item }">
                        <v-icon :color="item.raw.color" class="mr-2">{{ item.raw.icon || 'mdi-folder' }}</v-icon>
                        {{ item.raw.name }}
                      </template>
                    </v-select>
                  </v-col>
                </v-row>

                <!-- Sub-Category (Level 2) -->
                <v-row v-if="level2Categories.length > 0">
                  <v-col cols="12" md="6" offset-md="6">
                    <v-select
                      v-model="selectedLevel2"
                      label="Sub-Category"
                      :items="level2Categories"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      density="comfortable"
                      clearable
                      @update:model-value="handleLevel2Change"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon size="small" :color="item.raw.color">{{ item.raw.icon || 'mdi-folder-outline' }}</v-icon>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>

                <!-- Sub-Sub-Category (Level 3) -->
                <v-row v-if="level3Categories.length > 0">
                  <v-col cols="12" md="6" offset-md="6">
                    <v-select
                      v-model="formData.categoryId"
                      label="Specific Issue"
                      :items="level3Categories"
                      item-title="name"
                      item-value="id"
                      variant="outlined"
                      density="comfortable"
                      clearable
                      hint="Optional: Select the specific issue type"
                      persistent-hint
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon size="small" :color="item.raw.color">{{ item.raw.icon || 'mdi-circle-small' }}</v-icon>
                          </template>
                        </v-list-item>
                      </template>
                    </v-select>
                  </v-col>
                </v-row>

                <!-- Workstation -->
                <v-text-field
                  v-model="formData.workstation"
                  label="Workstation / Device"
                  placeholder="e.g., DESK-123, Laptop-456"
                  variant="outlined"
                  density="comfortable"
                  class="mb-4 mt-4"
                />

                <!-- Attachments -->
                <AttachmentUpload
                  :multiple="true"
                  @update:files="handleFilesUpdate"
                />

                <v-divider class="my-6" />

                <!-- Actions -->
                <div class="d-flex ga-3">
                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    :loading="loading"
                  >
                    <v-icon start>mdi-check</v-icon>
                    Create Ticket
                  </v-btn>

                  <v-btn
                    variant="outlined"
                    size="large"
                    @click="handleCancel"
                  >
                    Cancel
                  </v-btn>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Help Card -->
        <v-col cols="12" md="4">
          <v-card elevation="2" color="blue-lighten-5">
            <v-card-title>
              <v-icon start color="primary">mdi-information</v-icon>
              Tips for Creating Tickets
            </v-card-title>
            <v-card-text>
              <v-list density="compact" bg-color="transparent">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">
                    Provide a clear, concise title
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">
                    Include detailed steps to reproduce
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">
                    Attach screenshots or error messages
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">
                    Select appropriate category
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- Priority Guide -->
          <v-card elevation="2" class="mt-4">
            <v-card-title>Priority Guide</v-card-title>
            <v-card-text>
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="red">mdi-fire</v-icon>
                  </template>
                  <v-list-item-title class="text-caption font-weight-bold">Urgent</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Critical system down</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="orange">mdi-chevron-up</v-icon>
                  </template>
                  <v-list-item-title class="text-caption font-weight-bold">High</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Major functionality impaired</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="blue">mdi-minus</v-icon>
                  </template>
                  <v-list-item-title class="text-caption font-weight-bold">Medium</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Minor issues</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="grey">mdi-chevron-down</v-icon>
                  </template>
                  <v-list-item-title class="text-caption font-weight-bold">Low</v-list-item-title>
                  <v-list-item-subtitle class="text-caption">Questions, minor requests</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { CREATE_TICKET } from '@/graphql/mutations'
import { VALIDATION_RULES, TICKET_PRIORITY, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS } from '@/utils/constants'
import { parseGraphQLError } from '@/utils/helpers'
import { getUploadUrl } from '@/utils/api'
import AttachmentUpload from '@/components/common/AttachmentUpload.vue'
import gql from 'graphql-tag'

// GraphQL query for categories - 3 levels deep
const GET_CATEGORY_TREE = gql`
  query GetCategoryTree {
    categoryTree {
      id
      name
      description
      icon
      color
      isActive
      children {
        id
        name
        icon
        color
        isActive
        children {
          id
          name
          icon
          color
          isActive
        }
      }
    }
  }
`

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const attachments = ref([])

// Category selection state (3 levels)
const selectedLevel1 = ref(null)
const selectedLevel2 = ref(null)

const formData = ref({
  title: '',
  description: '',
  priority: 'MEDIUM',
  categoryId: null,
  workstation: ''
})

const rules = VALIDATION_RULES

// Priority options
const priorityOptions = Object.keys(TICKET_PRIORITY).map(key => ({
  value: TICKET_PRIORITY[key],
  label: TICKET_PRIORITY_LABELS[key],
  color: TICKET_PRIORITY_COLORS[key],
  icon: key === 'URGENT' ? 'mdi-fire' : key === 'HIGH' ? 'mdi-chevron-up' : key === 'MEDIUM' ? 'mdi-minus' : 'mdi-chevron-down'
}))

// Fetch categories from API
const { result: categoriesResult, loading: categoriesLoading } = useQuery(GET_CATEGORY_TREE)

// Level 1 categories (top-level, active only)
const level1Categories = computed(() => {
  if (!categoriesResult.value?.categoryTree) return []
  return categoriesResult.value.categoryTree.filter(c => c.isActive)
})

// Level 2 categories (children of selected level 1)
const level2Categories = computed(() => {
  if (!selectedLevel1.value || !categoriesResult.value?.categoryTree) return []
  const parent = categoriesResult.value.categoryTree.find(c => c.id === selectedLevel1.value)
  if (!parent?.children) return []
  return parent.children.filter(c => c.isActive)
})

// Level 3 categories (children of selected level 2)
const level3Categories = computed(() => {
  if (!selectedLevel2.value || !categoriesResult.value?.categoryTree) return []
  const level1 = categoriesResult.value.categoryTree.find(c => c.id === selectedLevel1.value)
  if (!level1?.children) return []
  const level2 = level1.children.find(c => c.id === selectedLevel2.value)
  if (!level2?.children) return []
  return level2.children.filter(c => c.isActive)
})

// Handle level 1 category change
function handleLevel1Change(id) {
  selectedLevel2.value = null
  formData.value.categoryId = null
  
  // If no children, use this as final category
  if (id) {
    const cat = categoriesResult.value?.categoryTree?.find(c => c.id === id)
    if (!cat?.children?.length) {
      formData.value.categoryId = id
    }
  }
}

// Handle level 2 category change
function handleLevel2Change(id) {
  formData.value.categoryId = null
  
  // If no children, use this as final category
  if (id) {
    const level1 = categoriesResult.value?.categoryTree?.find(c => c.id === selectedLevel1.value)
    const cat = level1?.children?.find(c => c.id === id)
    if (!cat?.children?.length) {
      formData.value.categoryId = id
    }
  } else if (selectedLevel1.value) {
    // If cleared, check if level1 has no other children
    const level1 = categoriesResult.value?.categoryTree?.find(c => c.id === selectedLevel1.value)
    if (!level1?.children?.length) {
      formData.value.categoryId = selectedLevel1.value
    }
  }
}

// GraphQL mutation
const { mutate: createTicket } = useMutation(CREATE_TICKET)

function handleFilesUpdate(files) {
  attachments.value = files
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  // Determine final category: prefer most specific selected
  const finalCategoryId = formData.value.categoryId || selectedLevel2.value || selectedLevel1.value
  if (!finalCategoryId) {
    notificationStore.error('Please select a category')
    return
  }

  loading.value = true

  try {
    const input = {
      title: formData.value.title,
      description: formData.value.description,
      priority: formData.value.priority,
      categoryId: finalCategoryId,
      workstationNumber: formData.value.workstation || null
    }

    const result = await createTicket({ createTicketInput: input })

    if (result?.data?.createTicket) {
      const ticketId = result.data.createTicket.id
      
      // Upload attachments if any
      if (attachments.value && attachments.value.length > 0) {
        const token = authStore.token
        
        for (const file of attachments.value) {
          const uploadFormData = new FormData()
          uploadFormData.append('file', file)
          uploadFormData.append('ticketId', ticketId)
          
          try {
            const uploadResponse = await fetch(getUploadUrl(), {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: uploadFormData
            })
            
            if (!uploadResponse.ok) {
              console.error('Upload failed for', file.name)
              notificationStore.warning(`Failed to upload ${file.name}`)
            }
          } catch (uploadErr) {
            console.error('Failed to upload attachment:', file.name, uploadErr)
            notificationStore.warning(`Failed to upload ${file.name}`)
          }
        }
      }
      
      notificationStore.success('Ticket created successfully!')
      router.push({ name: 'TicketDetail', params: { id: ticketId } })
    }
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
    console.error('Create ticket error:', err)
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  router.push({ name: 'Tickets' })
}
</script>

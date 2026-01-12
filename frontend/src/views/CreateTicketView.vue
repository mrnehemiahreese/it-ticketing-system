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

                  <!-- Category -->
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="formData.category"
                      label="Category"
                      :items="categoryOptions"
                      item-title="label"
                      item-value="value"
                      :rules="[rules.required]"
                      variant="outlined"
                      density="comfortable"
                    >
                      <template v-slot:item="{ props, item }">
                        <v-list-item v-bind="props">
                          <template v-slot:prepend>
                            <v-icon>{{ item.raw.icon }}</v-icon>
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
                  class="mb-4"
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
                    Include detailed steps to reproduce the issue
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
                    Select appropriate priority and category
                  </v-list-item-title>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-check</v-icon>
                  </template>
                  <v-list-item-title class="text-caption">
                    Include workstation/device information
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
                  <v-list-item-title class="text-caption font-weight-bold">
                    Urgent
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    Critical system down
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="orange">mdi-chevron-up</v-icon>
                  </template>
                  <v-list-item-title class="text-caption font-weight-bold">
                    High
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    Major functionality impaired
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="blue">mdi-minus</v-icon>
                  </template>
                  <v-list-item-title class="text-caption font-weight-bold">
                    Medium
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    Minor issues, workaround available
                  </v-list-item-subtitle>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon color="grey">mdi-chevron-down</v-icon>
                  </template>
                  <v-list-item-title class="text-caption font-weight-bold">
                    Low
                  </v-list-item-title>
                  <v-list-item-subtitle class="text-caption">
                    Questions, minor requests
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMutation } from '@vue/apollo-composable'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { CREATE_TICKET } from '@/graphql/mutations'
import { VALIDATION_RULES, TICKET_PRIORITY, TICKET_PRIORITY_LABELS, TICKET_PRIORITY_COLORS, TICKET_CATEGORY, TICKET_CATEGORY_LABELS, TICKET_CATEGORY_ICONS } from '@/utils/constants'
import { parseGraphQLError } from '@/utils/helpers'
import { getUploadUrl } from '@/utils/api'
import AttachmentUpload from '@/components/common/AttachmentUpload.vue'

const router = useRouter()
const notificationStore = useNotificationStore()
const authStore = useAuthStore()

const formRef = ref(null)
const loading = ref(false)
const attachments = ref([])

const formData = ref({
  title: '',
  description: '',
  priority: 'MEDIUM',
  category: '',
  workstationNumber: ''
})

const rules = VALIDATION_RULES

// Priority options
const priorityOptions = Object.keys(TICKET_PRIORITY).map(key => ({
  value: TICKET_PRIORITY[key],
  label: TICKET_PRIORITY_LABELS[key],
  color: TICKET_PRIORITY_COLORS[key],
  icon: key === 'URGENT' ? 'mdi-fire' : key === 'HIGH' ? 'mdi-chevron-up' : key === 'MEDIUM' ? 'mdi-minus' : 'mdi-chevron-down'
}))

// Category options
const categoryOptions = Object.keys(TICKET_CATEGORY).map(key => ({
  value: TICKET_CATEGORY[key],
  label: TICKET_CATEGORY_LABELS[key],
  icon: TICKET_CATEGORY_ICONS[key]
}))

// GraphQL mutation
const { mutate: createTicket } = useMutation(CREATE_TICKET)

function handleFilesUpdate(files) {
  
  attachments.value = files
}

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true

  try {
    const input = {
      title: formData.value.title,
      description: formData.value.description,
      priority: formData.value.priority,
      category: formData.value.category,
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
            const uploadResponse = await fetch(`'" + getUploadUrl() + "'`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: uploadFormData
            })
            
            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text()
              console.error('Upload failed for', file.name, 'Error:', errorText)
              notificationStore.warning(`Failed to upload ${file.name}`)
            } else {
              
            }
          } catch (uploadErr) {
            console.error('Failed to upload attachment:', file.name, uploadErr)
            notificationStore.warning(`Failed to upload ${file.name}`)
          }
        }
        
      } else {
        
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

<template>
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
    </div>

    <div v-else-if="ticket">
      <!-- Header -->
      <div class="mb-6">
        <v-btn variant="text" :to="{ name: 'Tickets' }" class="mb-4">
          <v-icon start>mdi-arrow-left</v-icon>
          Back to Tickets
        </v-btn>

        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-caption text-grey mb-1">{{ ticket.ticketNumber }}</div>
            <h1 class="text-h4 font-weight-bold">{{ ticket.title }}</h1>
          </div>

          <div class="d-flex ga-2">
            <StatusChip :status="ticket.status" show-icon />
            <PriorityChip :priority="ticket.priority" show-icon />
          </div>
        </div>
      </div>

      <v-row>
        <!-- Main Content -->
        <v-col cols="12" md="8">
          <!-- Description -->
          <v-card elevation="2" class="mb-4">
            <v-card-title>Description</v-card-title>
            <v-divider />
            <v-card-text>
              <p style="white-space: pre-wrap;">{{ ticket.description }}</p>
            </v-card-text>
          </v-card>

          <!-- Comments -->
          <div class="mb-4">
            <CommentList
              :comments="ticket.comments"
              @edit="handleEditComment"
              @delete="handleDeleteComment"
            />
          </div>

          <!-- Add Comment Form -->
          <CommentForm
            :ticket-id="ticket.id"
            :comment="editingComment"
            :loading="commentLoading"
            @submit="handleSubmitComment"
            @cancel="editingComment = null"
          />
        </v-col>

        <!-- Sidebar -->
        <v-col cols="12" md="4">
          <!-- Actions Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title>Actions</v-card-title>
            <v-divider />
            <v-card-text>
              <v-select
                v-model="newStatus"
                label="Update Status"
                :items="statusOptions"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-icon :color="item.raw.color">{{ item.raw.icon }}</v-icon>
                    </template>
                  </v-list-item>
                </template>
              </v-select>

              <v-btn
                color="primary"
                block
                :loading="statusLoading"
                :disabled="newStatus === ticket.status"
                @click="updateTicketStatus"
              >
                Update Status
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- Details Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title>Details</v-card-title>
            <v-divider />
            <v-card-text>
              <v-list density="compact">
                <!-- Category -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>{{ getCategoryIcon(ticket.category) }}</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Category</v-list-item-title>
                  <v-list-item-subtitle>{{ getCategoryLabel(ticket.category) }}</v-list-item-subtitle>
                </v-list-item>

                <!-- Workstation -->
                <v-list-item v-if="ticket.workstation">
                  <template v-slot:prepend>
                    <v-icon>mdi-desktop-tower</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Workstation</v-list-item-title>
                  <v-list-item-subtitle>{{ ticket.workstation }}</v-list-item-subtitle>
                </v-list-item>

                <!-- Created -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar-plus</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Created</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(ticket.createdAt, true) }}</v-list-item-subtitle>
                </v-list-item>

                <!-- Updated -->
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-update</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Updated</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(ticket.updatedAt, true) }}</v-list-item-subtitle>
                </v-list-item>

                <!-- Resolved -->
                <v-list-item v-if="ticket.resolvedAt">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title class="text-caption text-grey">Resolved</v-list-item-title>
                  <v-list-item-subtitle>{{ formatDate(ticket.resolvedAt, true) }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

          <!-- People Card -->
          <v-card elevation="2" class="mb-4">
            <v-card-title>People</v-card-title>
            <v-divider />
            <v-card-text>
              <!-- Created By -->
              <div class="mb-4">
                <div class="text-caption text-grey mb-2">Created By</div>
                <div class="d-flex align-center">
                  <v-avatar :color="getAvatarColor(ticket.createdBy.fullname || ticket.createdBy.username)" size="40" class="mr-3">
                    <span>{{ getInitials(ticket.createdBy.fullname || ticket.createdBy.username) }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ ticket.createdBy.fullname || ticket.createdBy.username }}</div>
                    <div class="text-caption text-grey">{{ ticket.createdBy.email }}</div>
                  </div>
                </div>
              </div>

              <!-- Assigned To -->
              <div class="mb-4">
                <div class="text-caption text-grey mb-2">Assigned To</div>
                <div v-if="ticket.assignedTo" class="d-flex align-center">
                  <v-avatar :color="getAvatarColor(ticket.assignedTo.fullname || ticket.assignedTo.username)" size="40" class="mr-3">
                    <span>{{ getInitials(ticket.assignedTo.fullname || ticket.assignedTo.username) }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ ticket.assignedTo.fullname || ticket.assignedTo.username }}</div>
                    <div class="text-caption text-grey">{{ ticket.assignedTo.email }}</div>
                  </div>
                </div>
                <div v-else class="text-grey">Not assigned</div>
              </div>

              <!-- Assign Technician (Admin/Technician only) -->
              <div v-if="authStore.isAdmin || authStore.isAgent">
                <v-select
                  v-model="selectedTechnician"
                  :items="technicians"
                  item-title="name"
                  item-value="id"
                  label="Assign to Technician"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                />
                <v-btn
                  color="primary"
                  block
                  :loading="assignLoading"
                  @click="assignTechnician"
                >
                  Assign
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- Image Attachments -->
          <v-card v-if="ticket.attachments?.some(a => a.mimetype?.startsWith('image/'))" elevation="2" class="mb-4">
            <v-card-title>Images</v-card-title>
            <v-divider />
            <v-card-text>
              <v-row>
                <v-col
                  v-for="attachment in ticket.attachments.filter(a => a.mimetype?.startsWith('image/'))"
                  :key="attachment.id"
                  cols="12"
                  md="6"
                >
                  <v-card @click="handleAttachmentClick(attachment)" class="cursor-pointer">
                    <v-img
                      :src="`http://192.168.1.2:4000/attachments/${attachment.id}`"
                      :alt="attachment.filename"
                      cover
                      height="300"
                    />
                    <v-card-subtitle>{{ attachment.filename }}</v-card-subtitle>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- File Attachments (Non-images) -->
          <v-card v-if="ticket.attachments?.some(a => !a.mimetype?.startsWith('image/'))" elevation="2">
            <v-card-title>Attachments ({{ ticket.attachments.filter(a => !a.mimetype?.startsWith('image/')).length }})</v-card-title>
            <v-divider />
            <v-list>
              <v-list-item v-for="attachment in ticket.attachments.filter(a => !a.mimetype?.startsWith('image/'))" :key="attachment.id">
                <template v-slot:prepend>
                  <v-icon>{{ getFileIcon(attachment.mimetype) }}</v-icon>
                </template>
                <v-list-item-title>{{ attachment.filename }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatFileSize(attachment.size) }}</v-list-item-subtitle>
                <template v-slot:append>
                  <v-btn icon="mdi-download" variant="text" size="small" @click="handleAttachmentClick(attachment)" />
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <div v-else class="text-center py-12">
      <v-icon size="96" color="grey">mdi-ticket-outline</v-icon>
      <h3 class="text-h5 text-grey mt-4">Ticket not found</h3>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { GET_TICKET, GET_TECHNICIANS } from '@/graphql/queries'
import { UPDATE_TICKET_STATUS, ASSIGN_TICKET, CREATE_COMMENT, DELETE_COMMENT } from '@/graphql/mutations'
import { formatDate, getInitials, getAvatarColor, formatFileSize, parseGraphQLError } from '@/utils/helpers'
import { TICKET_STATUS, TICKET_STATUS_LABELS, TICKET_STATUS_COLORS, TICKET_CATEGORY_LABELS, TICKET_CATEGORY_ICONS } from '@/utils/constants'
import StatusChip from '@/components/tickets/StatusChip.vue'
import PriorityChip from '@/components/tickets/PriorityChip.vue'
import CommentList from '@/components/comments/CommentList.vue'
import CommentForm from '@/components/comments/CommentForm.vue'

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const ticketId = computed(() => route.params.id)
const newStatus = ref('')
const selectedTechnician = ref(null)
const editingComment = ref(null)
const statusLoading = ref(false)
const assignLoading = ref(false)
const commentLoading = ref(false)

// Fetch ticket
const { result, loading, refetch } = useQuery(GET_TICKET, { id: ticketId.value }, { fetchPolicy: "cache-and-network" })
const ticket = computed(() => result.value?.ticket)

// Fetch technicians
const { result: techniciansResult } = useQuery(GET_TECHNICIANS)
const technicians = computed(() => {
  const techs = techniciansResult.value?.users || []
  return techs.map(t => ({ id: t.id, name: t.fullname || t.username }))
})

// Status options
const statusOptions = Object.keys(TICKET_STATUS).map(key => ({
  value: TICKET_STATUS[key],
  label: TICKET_STATUS_LABELS[key],
  color: TICKET_STATUS_COLORS[key],
  icon: key === 'OPEN' ? 'mdi-circle-outline' : key === 'IN_PROGRESS' ? 'mdi-clock-outline' : key === 'RESOLVED' ? 'mdi-check-circle' : 'mdi-close-circle'
}))

// Mutations
const { mutate: updateStatus } = useMutation(UPDATE_TICKET_STATUS)
const { mutate: assignTicket } = useMutation(ASSIGN_TICKET)
const { mutate: createComment } = useMutation(CREATE_COMMENT)
const { mutate: deleteComment } = useMutation(DELETE_COMMENT)

// Initialize status
watch(ticket, (newTicket) => {
  if (newTicket) {
    newStatus.value = newTicket.status
    selectedTechnician.value = newTicket.assignedTo?.id || null
  }
}, { immediate: true })

async function updateTicketStatus() {
  statusLoading.value = true
  try {
    await updateStatus({
      id: ticketId.value,
      status: newStatus.value
    })
    notificationStore.success('Status updated successfully')
    await refetch()
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    statusLoading.value = false
  }
}

async function assignTechnician() {
  if (!selectedTechnician.value) return
  assignLoading.value = true
  try {
    await assignTicket({
      id: ticketId.value,
      userId: selectedTechnician.value
    })
    notificationStore.success('Technician assigned successfully')
    await refetch()
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    assignLoading.value = false
  }
}

async function handleSubmitComment(commentData) {
  commentLoading.value = true
  try {
    await createComment({ createCommentInput: commentData })
    notificationStore.success('Comment added successfully')
    editingComment.value = null
    await refetch()
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    commentLoading.value = false
  }
}

function handleEditComment(comment) {
  editingComment.value = comment
}

async function handleDeleteComment(comment) {
  if (!confirm('Are you sure you want to delete this comment?')) return
  try {
    await deleteComment({ id: comment.id })
    notificationStore.success('Comment deleted successfully')
    await refetch()
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  }
}

function getCategoryLabel(category) {
  return TICKET_CATEGORY_LABELS[category] || category
}

function getCategoryIcon(category) {
  return TICKET_CATEGORY_ICONS[category] || 'mdi-dots-horizontal'
}

function getFileIcon(mimeType) {
  if (mimeType?.startsWith('image/')) return 'mdi-file-image'
  if (mimeType?.includes('pdf')) return 'mdi-file-pdf-box'
  return 'mdi-file'
}

function handleAttachmentClick(attachment) {
  const url = `http://192.168.1.2:4000/attachments/${attachment.id}`
  const token = authStore.token

  // For images, open in new tab
  if (attachment.mimetype?.startsWith('image/')) {
    window.open(url, '_blank')
    return
  }

  // For PDFs, open in new tab
  if (attachment.mimetype?.includes('pdf')) {
    window.open(url, '_blank')
    return
  }

  // For other files, trigger download
  fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.blob())
  .then(blob => {
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = attachment.filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  })
  .catch(error => {
    console.error('Download failed:', error)
    notificationStore.error('Failed to download attachment')
  })
}
</script>

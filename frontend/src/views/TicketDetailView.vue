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
          <!-- Actions Card (Agents/Admins only) -->
          <v-card v-if="authStore.isAdmin || authStore.isAgent" elevation="2" class="mb-4">
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


          <!-- User Resolve Card (Ticket owner only, not admin/agent) -->
          <v-card v-if="!authStore.isAdmin && !authStore.isAgent && isTicketOwner && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED'" elevation="2" class="mb-4">
            <v-card-title>Mark as Resolved</v-card-title>
            <v-divider />
            <v-card-text>
              <p class="text-body-2 mb-3">If your issue has been resolved, you can mark this ticket as complete.</p>
              <v-btn
                color="success"
                block
                :loading="resolveLoading"
                @click="userMarkResolved"
              >
                <v-icon start>mdi-check-circle</v-icon>
                Mark My Ticket Resolved
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
                  <v-avatar :color="getAvatarColor(ticket.createdBy?.fullname)" size="40" class="mr-3">
                    <span>{{ getInitialsFromFullname(ticket.createdBy?.fullname) }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ ticket.createdBy?.fullname }}</div>
                    <div class="text-caption text-grey">{{ ticket.createdBy.email }}</div>
                  </div>
                </div>
              </div>

              <!-- Assigned To -->
              <div class="mb-4">
                <div class="text-caption text-grey mb-2">Assigned To</div>
                <div v-if="ticket.assignedTo" class="d-flex align-center">
                  <v-avatar :color="getAvatarColor(ticket.assignedTo?.fullname)" size="40" class="mr-3">
                    <span>{{ getInitialsFromFullname(ticket.assignedTo?.fullname) }}</span>
                  </v-avatar>
                  <div>
                    <div class="font-weight-medium">{{ ticket.assignedTo?.fullname }}</div>
                    <div class="text-caption text-grey">{{ ticket.assignedTo.email }}</div>
                  </div>
                </div>
                <div v-else class="text-grey">Not assigned</div>
              </div>

              <!-- Assign Agent (Admin/Agent only) -->
              <div v-if="authStore.isAdmin || authStore.isAgent">
                <v-select
                  v-model="selectedAgent"
                  :items="agents"
                  item-title="name"
                  item-value="id"
                  label="Assign to Agent"
                  variant="outlined"
                  density="comfortable"
                  class="mb-3"
                />
                <v-btn
                  color="primary"
                  block
                  :loading="assignLoading"
                  @click="assignAgent"
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
                  <v-card @click="openImageModal(attachment)" class="cursor-pointer">
                    <v-img
                      :src="getAttachmentUrl(attachment.id)"
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

    <!-- Image Modal -->
    <v-dialog v-model="imageModal.open" max-width="1000px" max-height="90vh" @keydown.arrow-left="previousImage" @keydown.arrow-right="nextImage">
      <v-card v-if="currentImageAttachment" class="bg-black">
        <!-- Header with Controls -->
        <v-card-title class="d-flex justify-space-between align-center bg-grey-darken-3 pa-2">
          <div>
            <div class="text-caption text-grey">{{ currentImageAttachment.filename }}</div>
            <div v-if="imageAttachments.length > 1" class="text-caption text-grey">
              Image {{ imageModal.currentIndex + 1 }} of {{ imageAttachments.length }}
            </div>
          </div>
          
          <!-- Control Buttons -->
          <div class="d-flex ga-2">
            <!-- Zoom Controls -->
            <v-btn-group>
              <v-btn icon="mdi-minus" variant="text" color="white" size="small" @click="zoomOut" />
              <v-btn icon="mdi-magnify" variant="text" color="white" size="small" disabled>
                {{ Math.round(imageModal.zoom * 100) }}%
              </v-btn>
              <v-btn icon="mdi-plus" variant="text" color="white" size="small" @click="zoomIn" />
            </v-btn-group>

            <!-- Download Button -->
            <v-btn icon="mdi-download" variant="text" color="white" size="small" @click="downloadImage" title="Download" />

            <!-- Fullscreen Button -->
            <v-btn :icon="imageModal.isFullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'" variant="text" color="white" size="small" @click="toggleFullscreen" :title="imageModal.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'" />

            <!-- Close Button -->
            <v-btn icon="mdi-close" variant="text" color="white" size="small" @click="imageModal.open = false" />
          </div>
        </v-card-title>
        
        <!-- Image Display with Zoom -->
        <v-card-text class="pa-0 d-flex justify-center align-center position-relative overflow-auto" style="height: 70vh;">
          <div 
            class="d-flex justify-center align-center"
            @wheel.prevent="handleMouseWheel"
            style="cursor: grab; width: 100%; height: 100%; position: relative;"
          >
            <img
              :src="getAttachmentUrl(currentImageAttachment.id)"
              :alt="currentImageAttachment.filename"
              :style="{
                maxHeight: '100%',
                maxWidth: '100%',
                transform: `scale(${imageModal.zoom})`,
                transition: 'transform 0.2s ease',
                objectFit: 'contain'
              }"
            />
          </div>
          
          <!-- Left Arrow -->
          <v-btn
            v-if="imageAttachments.length > 1"
            icon="mdi-chevron-left"
            color="white"
            variant="text"
            size="large"
            class="position-absolute"
            style="left: 10px; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.5);"
            @click="previousImage"
          />
          
          <!-- Right Arrow -->
          <v-btn
            v-if="imageAttachments.length > 1"
            icon="mdi-chevron-right"
            color="white"
            variant="text"
            size="large"
            class="position-absolute"
            style="right: 10px; top: 50%; transform: translateY(-50%); z-index: 10; background: rgba(0,0,0,0.5);"
            @click="nextImage"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery, useMutation, useSubscription } from '@vue/apollo-composable'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { GET_TICKET, GET_TECHNICIANS } from '@/graphql/queries'
import { TICKET_UPDATED_SUBSCRIPTION, COMMENT_ADDED_SUBSCRIPTION } from '@/graphql/subscriptions'
import { UPDATE_TICKET_STATUS, ASSIGN_TICKET, CREATE_COMMENT, DELETE_COMMENT, USER_MARK_RESOLVED } from '@/graphql/mutations'
import { formatDate, getInitials, getAvatarColor, formatFileSize, parseGraphQLError } from '@/utils/helpers'
import { getAttachmentUrl } from '@/utils/api'
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
const selectedAgent = ref(null)
const editingComment = ref(null)
const statusLoading = ref(false)
const resolveLoading = ref(false)
const assignLoading = ref(false)
const commentLoading = ref(false)
const imageModal = ref({
  open: false,
  currentIndex: 0,
  zoom: 1,
  isFullscreen: false
})

// Fetch ticket
const { result, loading, refetch } = useQuery(GET_TICKET, { id: ticketId.value }, { fetchPolicy: "cache-and-network" })
const ticket = computed(() => result.value?.ticket)

// Subscribe to ticket updates
const { onResult: onTicketUpdate } = useSubscription(
  TICKET_UPDATED_SUBSCRIPTION,
  () => ({ ticketId: ticketId.value }),
  () => ({ enabled: !!ticketId.value })
)

onTicketUpdate((data) => {
  if (data.data?.ticketUpdated) {
    // Update the ticket in cache with new data
    const updatedTicket = data.data.ticketUpdated
    result.value = { ticket: updatedTicket }
  }
})

// Subscribe to new comments
const { onResult: onCommentAdded } = useSubscription(
  COMMENT_ADDED_SUBSCRIPTION,
  () => ({ ticketId: ticketId.value }),
  () => ({ enabled: !!ticketId.value })
)

onCommentAdded((data) => {
  if (data.data?.commentAdded && ticket.value) {
    // Add new comment to the ticket's comments array
    const newComment = data.data.commentAdded
    if (!ticket.value.comments.find(c => c.id === newComment.id)) {
      ticket.value.comments.push(newComment)
    }
  }
})

// Image attachment helpers
const imageAttachments = computed(() => {
  return ticket.value?.attachments?.filter(a => a.mimetype?.startsWith('image/')) || []
})

const currentImageAttachment = computed(() => {
  return imageAttachments.value[imageModal.value.currentIndex] || null
})

// Fetch agents
const { result: agentsResult } = useQuery(GET_TECHNICIANS)
const agents = computed(() => {
  const techs = agentsResult.value?.users || []
  return techs.map(t => ({ id: t.id, name: t.fullname }))
})

const isTicketOwner = computed(() => {
  return ticket.value?.createdBy?.id === authStore.user?.id
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
const { mutate: markResolved } = useMutation(USER_MARK_RESOLVED)

// Initialize status
watch(ticket, (newTicket) => {
  if (newTicket) {
    newStatus.value = newTicket.status
    selectedAgent.value = newTicket.assignedTo?.id || null
  }
}, { immediate: true })

async function updateTicketStatus() {
  statusLoading.value = true
  try {
    await updateStatus({
      id: ticketId.value,
      updateTicketInput: {
        status: newStatus.value
      }
    })
    notificationStore.success('Status updated successfully')
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    statusLoading.value = false
  }
}

async function userMarkResolved() {
  resolveLoading.value = true
  try {
    await markResolved({
      ticketId: ticketId.value
    })
    notificationStore.success("Your ticket has been marked as resolved!")
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  } finally {
    resolveLoading.value = false
  }
}

async function assignAgent() {
  if (!selectedAgent.value) return
  assignLoading.value = true
  try {
    await assignTicket({
      ticketId: ticketId.value,
      userId: selectedAgent.value
    })
    notificationStore.success('Agent assigned successfully')
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
  } catch (err) {
    notificationStore.error(parseGraphQLError(err))
  }
}

function getInitialsFromFullname(fullname) {
  if (!fullname) return "?"
  const parts = fullname.trim().split(" ")
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
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
  const url = getAttachmentUrl(attachment.id)
  const token = authStore.token

  // For images, open in modal
  if (attachment.mimetype?.startsWith('image/')) {
    openImageModal(attachment)
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

function openImageModal(attachment) {
  const index = imageAttachments.value.findIndex(img => img.id === attachment.id)
  if (index !== -1) {
    imageModal.value.currentIndex = index
    imageModal.value.zoom = 1
    imageModal.value.isFullscreen = false
    imageModal.value.open = true
  }
}

function nextImage() {
  if (imageAttachments.value.length > 1) {
    imageModal.value.currentIndex = (imageModal.value.currentIndex + 1) % imageAttachments.value.length
    imageModal.value.zoom = 1
  }
}

function previousImage() {
  if (imageAttachments.value.length > 1) {
    imageModal.value.currentIndex = (imageModal.value.currentIndex - 1 + imageAttachments.value.length) % imageAttachments.value.length
    imageModal.value.zoom = 1
  }
}

function zoomIn() {
  if (imageModal.value.zoom < 4) {
    imageModal.value.zoom = Math.min(imageModal.value.zoom + 0.25, 4)
  }
}

function zoomOut() {
  if (imageModal.value.zoom > 0.5) {
    imageModal.value.zoom = Math.max(imageModal.value.zoom - 0.25, 0.5)
  }
}

function handleMouseWheel(event) {
  const delta = event.deltaY > 0 ? -1 : 1
  if (delta > 0) {
    zoomIn()
  } else {
    zoomOut()
  }
}

function downloadImage() {
  if (!currentImageAttachment.value) return
  
  const url = getAttachmentUrl(currentImageAttachment.value.id)
  const a = document.createElement('a')
  a.href = url
  a.download = currentImageAttachment.value.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function toggleFullscreen() {
  const elem = document.querySelector('[role="dialog"]')
  if (!elem) return

  if (!imageModal.value.isFullscreen) {
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
      imageModal.value.isFullscreen = true
    }
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      imageModal.value.isFullscreen = false
    }
  }
}
</script>

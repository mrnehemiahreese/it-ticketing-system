<template>
  <div>
    <v-card>
      <v-card-title>
        Comments ({{ comments.length }})
      </v-card-title>

      <v-divider />

      <v-card-text v-if="comments.length === 0" class="text-center py-8">
        <v-icon size="64" color="grey">mdi-comment-outline</v-icon>
        <p class="text-grey mt-4">No comments yet</p>
      </v-card-text>

      <v-list v-else>
        <template v-for="(comment, index) in sortedComments" :key="comment.id">
          <v-list-item class="px-4 py-4">
            <template v-slot:prepend>
              <v-avatar
                :color="getAvatarColor(comment.user.firstName)"
                size="40"
              >
                <span class="text-body-2">
                  {{ getInitials(comment.user.firstName, comment.user.lastName) }}
                </span>
              </v-avatar>
            </template>

            <div>
              <div class="d-flex align-center mb-2">
                <span class="font-weight-medium mr-2">
                  {{ comment.user.firstName }} {{ comment.user.lastName }}
                </span>
                <span class="text-caption text-grey mr-2">
                  {{ formatRelativeTime(comment.createdAt) }}
                </span>
                <v-chip
                  v-if="comment.isInternal"
                  size="x-small"
                  color="orange"
                  variant="flat"
                  class="mr-2"
                >
                  Internal
                </v-chip>
              </div>

              <div class="text-body-2" style="white-space: pre-wrap;">
                {{ comment.content }}
              </div>
            </div>

            <template v-slot:append>
              <v-menu v-if="canEditComment(comment)">
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                    v-bind="props"
                  />
                </template>

                <v-list density="compact">
                  <v-list-item @click="editComment(comment)">
                    <template v-slot:prepend>
                      <v-icon>mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="deleteComment(comment)">
                    <template v-slot:prepend>
                      <v-icon color="error">mdi-delete</v-icon>
                    </template>
                    <v-list-item-title class="text-error">Delete</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-list-item>

          <v-divider v-if="index < comments.length - 1" />
        </template>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatRelativeTime, getInitials, getAvatarColor } from '@/utils/helpers'

const props = defineProps({
  comments: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['edit', 'delete'])

const authStore = useAuthStore()

const sortedComments = computed(() => {
  return [...props.comments].sort((a, b) =>
    new Date(a.createdAt) - new Date(b.createdAt)
  )
})

function canEditComment(comment) {
  return authStore.user?.id === comment.user.id || authStore.isAdmin
}

function editComment(comment) {
  emit('edit', comment)
}

function deleteComment(comment) {
  emit('delete', comment)
}
</script>

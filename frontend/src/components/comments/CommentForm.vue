<template>
  <v-card>
    <v-card-title>
      {{ editMode ? 'Edit Comment' : 'Add Comment' }}
    </v-card-title>

    <v-divider />

    <v-card-text>
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-textarea
          v-model="formData.content"
          label="Comment"
          placeholder="Write your comment here..."
          rows="4"
          :rules="[rules.required]"
          variant="outlined"
          density="comfortable"
        />

        <v-switch
          v-model="formData.isInternal"
          label="Internal Comment (Only visible to agents and admins)"
          color="orange"
          density="comfortable"
          hide-details
          class="mb-4"
        />

        <div class="d-flex ga-2">
          <v-btn
            type="submit"
            color="primary"
            variant="flat"
            :loading="loading"
          >
            {{ editMode ? 'Update' : 'Post Comment' }}
          </v-btn>

          <v-btn
            v-if="editMode"
            variant="outlined"
            @click="handleCancel"
          >
            Cancel
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { VALIDATION_RULES } from '@/utils/constants'

const props = defineProps({
  ticketId: {
    type: String,
    required: true
  },
  comment: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formRef = ref(null)
const formData = ref({
  content: '',
  isInternal: false
})

const editMode = ref(false)
const rules = VALIDATION_RULES

// Watch for comment prop changes (for edit mode)
watch(() => props.comment, (newComment) => {
  if (newComment) {
    editMode.value = true
    formData.value = {
      content: newComment.content,
      isInternal: newComment.isInternal
    }
  } else {
    editMode.value = false
    resetForm()
  }
}, { immediate: true })

async function handleSubmit() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const commentData = {
    ticketId: props.ticketId,
    content: formData.value.content,
    isInternal: formData.value.isInternal
  }

  emit('submit', commentData)

  if (!editMode.value) {
    resetForm()
  }
}

function handleCancel() {
  emit('cancel')
  resetForm()
}

async function resetForm() {
  formData.value = {
    content: '',
    isInternal: false
  }
  // Wait for Vue to process the reactive update before resetting validation
  await nextTick()
  formRef.value?.resetValidation()
}
</script>

<template>
  <div>
    <v-file-input
      v-model="files"
      :label="label"
      :multiple="multiple"
      :accept="accept"
      prepend-icon="mdi-paperclip"
      variant="outlined"
      density="comfortable"
      :rules="validationRules"
      @update:model-value="handleFileChange"
    >
      <template v-slot:selection="{ fileNames }">
        <template v-for="fileName in fileNames" :key="fileName">
          <v-chip
            size="small"
            label
            color="primary"
            class="mr-2"
          >
            {{ fileName }}
          </v-chip>
        </template>
      </template>
    </v-file-input>

    <!-- File Preview -->
    <div v-if="previews.length > 0" class="mt-4">
      <v-card>
        <v-card-title class="text-subtitle-2">
          Attachments ({{ previews.length }})
        </v-card-title>
        <v-divider />
        <v-list>
          <v-list-item
            v-for="(preview, index) in previews"
            :key="index"
            class="px-4"
          >
            <template v-slot:prepend>
              <v-icon :color="getFileIconColor(preview.type)">
                {{ getFileIcon(preview.type) }}
              </v-icon>
            </template>

            <v-list-item-title>{{ preview.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ formatFileSize(preview.size) }}</v-list-item-subtitle>

            <template v-slot:append>
              <v-btn
                icon="mdi-close"
                variant="text"
                size="small"
                @click="removeFile(index)"
              />
            </template>
          </v-list-item>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatFileSize, validateFile } from '@/utils/helpers'
import { FILE_UPLOAD } from '@/utils/constants'

const props = defineProps({
  label: {
    type: String,
    default: 'Attach files'
  },
  multiple: {
    type: Boolean,
    default: true
  },
  maxSize: {
    type: Number,
    default: FILE_UPLOAD.MAX_SIZE
  },
  allowedTypes: {
    type: Array,
    default: () => FILE_UPLOAD.ALLOWED_TYPES
  }
})

const emit = defineEmits(['update:files'])

const files = ref([])
const previews = ref([])

const accept = computed(() => {
  return FILE_UPLOAD.ALLOWED_EXTENSIONS.join(',')
})

const validationRules = computed(() => [
  (value) => {
    if (!value || value.length === 0) return true

    const fileArray = Array.isArray(value) ? value : [value]
    for (const file of fileArray) {
      const validation = validateFile(file, props.maxSize, props.allowedTypes)
      if (!validation.valid) {
        return validation.error
      }
    }
    return true
  }
])

function handleFileChange(newFiles) {
  
  
  
  
  if (!newFiles) {
    
    previews.value = []
    emit('update:files', [])
    return
  }

  const fileArray = Array.isArray(newFiles) ? newFiles : [newFiles]
  
  
  
  previews.value = fileArray.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
    file: file
  }))

  
  emit('update:files', fileArray)
}

function removeFile(index) {
  
  previews.value.splice(index, 1)
  const newFiles = previews.value.map(p => p.file)
  files.value = newFiles
  
  emit('update:files', newFiles)
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return 'mdi-file-image'
  if (mimeType.includes('pdf')) return 'mdi-file-pdf-box'
  if (mimeType.includes('word')) return 'mdi-file-word'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'mdi-file-excel'
  if (mimeType.includes('text')) return 'mdi-file-document'
  return 'mdi-file'
}

function getFileIconColor(mimeType) {
  if (mimeType.startsWith('image/')) return 'blue'
  if (mimeType.includes('pdf')) return 'red'
  if (mimeType.includes('word')) return 'blue'
  if (mimeType.includes('excel')) return 'green'
  return 'grey'
}
</script>

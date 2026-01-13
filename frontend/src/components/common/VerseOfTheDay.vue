<template>
  <v-card class="verse-card" :elevation="elevation" :variant="variant">
    <v-card-item>
      <template v-slot:prepend>
        <v-avatar color="primary" size="42">
          <v-icon color="white">mdi-book-open-variant</v-icon>
        </v-avatar>
      </template>
      <v-card-title class="text-subtitle-1 font-weight-medium">
        Verse of the Day
      </v-card-title>
      <v-card-subtitle v-if="verse.reference">
        {{ verse.reference }}
      </v-card-subtitle>
    </v-card-item>

    <v-card-text>
      <div v-if="loading" class="d-flex justify-center py-4">
        <v-progress-circular indeterminate color="primary" size="24"></v-progress-circular>
      </div>
      <div v-else-if="error" class="text-error">
        {{ error }}
      </div>
      <blockquote v-else class="verse-text text-body-1 font-italic">
        "{{ verse.text }}"
      </blockquote>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue"

defineProps({
  elevation: {
    type: [Number, String],
    default: 1
  },
  variant: {
    type: String,
    default: "elevated"
  }
})

const verse = ref({ text: "", reference: "" })
const loading = ref(true)
const error = ref(null)

const fetchVerse = async () => {
  loading.value = true
  error.value = null
  
  try {
    // Using ourmanna.com API for verse of the day
    const response = await fetch("https://beta.ourmanna.com/api/v1/get?format=json&order=daily")
    
    if (!response.ok) {
      throw new Error("Failed to fetch verse")
    }
    
    const data = await response.json()
    
    if (data.verse) {
      verse.value = {
        text: data.verse.details.text,
        reference: data.verse.details.reference
      }
    }
  } catch (err) {
    console.error("Error fetching verse:", err)
    // Fallback verse if API fails
    verse.value = {
      text: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope.",
      reference: "Jeremiah 29:11"
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchVerse()
})
</script>

<style scoped>
.verse-card {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.verse-text {
  line-height: 1.6;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin: 0;
  padding-left: 12px;
  border-left: 2px solid rgba(var(--v-theme-primary), 0.3);
}
</style>

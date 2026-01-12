<template>
    <div>
      <h1 class="text-h4 font-weight-bold mb-6">Knowledge Base</h1>

      <!-- Search -->
      <v-card elevation="2" class="mb-6">
        <v-card-text>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search articles..."
            variant="outlined"
            density="comfortable"
            hide-details
          />
        </v-card-text>
      </v-card>

      <!-- Categories -->
      <v-row class="mb-6">
        <v-col
          v-for="category in categories"
          :key="category.value"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            elevation="2"
            hover
            class="category-card"
            @click="selectCategory(category.value)"
          >
            <v-card-text class="text-center">
              <v-avatar :color="category.color" size="64" class="mb-3">
                <v-icon size="32" color="white">{{ category.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h6">{{ category.label }}</h3>
              <p class="text-caption text-grey mt-2">
                {{ category.count }} articles
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Articles List -->
      <v-row v-if="articles.length > 0">
        <v-col
          v-for="article in filteredArticles"
          :key="article.id"
          cols="12"
          md="6"
        >
          <v-card elevation="2" hover>
            <v-card-title>{{ article.title }}</v-card-title>
            <v-card-subtitle>
              <v-chip size="small" :color="getCategoryColor(article.category)" class="mr-2">
                {{ article.category }}
              </v-chip>
              <span class="text-caption text-grey">
                Updated {{ formatRelativeTime(article.updatedAt) }}
              </span>
            </v-card-subtitle>
            <v-card-text>
              <p class="text-body-2">{{ truncate(article.content, 150) }}</p>

              <div v-if="article.tags?.length" class="mt-3">
                <v-chip
                  v-for="tag in article.tags"
                  :key="tag"
                  size="x-small"
                  variant="outlined"
                  class="mr-1"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn variant="text" color="primary" @click="viewArticle(article)">
                Read More
                <v-icon end>mdi-arrow-right</v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- Empty State -->
      <v-card v-else elevation="2" class="text-center py-12">
        <v-icon size="96" color="grey">mdi-book-open-variant</v-icon>
        <h3 class="text-h5 text-grey mt-4">No articles found</h3>
        <p class="text-grey mt-2">Try adjusting your search query</p>
      </v-card>
    </div>

    <!-- Article Dialog -->
    <v-dialog v-model="articleDialog" max-width="800" scrollable>
      <v-card v-if="selectedArticle">
        <v-card-title>{{ selectedArticle.title }}</v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <div class="mb-4">
            <v-chip size="small" :color="getCategoryColor(selectedArticle.category)" class="mr-2">
              {{ selectedArticle.category }}
            </v-chip>
            <span class="text-caption text-grey">
              By {{ selectedArticle.author?.firstName }} {{ selectedArticle.author?.lastName }} &middot;
              Updated {{ formatDate(selectedArticle.updatedAt) }}
            </span>
          </div>

          <div style="white-space: pre-wrap;">{{ selectedArticle.content }}</div>

          <div v-if="selectedArticle.tags?.length" class="mt-4">
            <v-chip
              v-for="tag in selectedArticle.tags"
              :key="tag"
              size="small"
              variant="outlined"
              class="mr-2"
            >
              {{ tag }}
            </v-chip>
          </div>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="articleDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { truncate, formatRelativeTime, formatDate } from '@/utils/helpers'

const search = ref('')
const selectedCategory = ref(null)
const articleDialog = ref(false)
const selectedArticle = ref(null)

// Mock categories
const categories = ref([
  { value: 'HARDWARE', label: 'Hardware', icon: 'mdi-desktop-tower', color: 'blue', count: 12 },
  { value: 'SOFTWARE', label: 'Software', icon: 'mdi-application', color: 'green', count: 24 },
  { value: 'NETWORK', label: 'Network', icon: 'mdi-lan', color: 'orange', count: 8 },
  { value: 'ACCESS', label: 'Access', icon: 'mdi-key', color: 'purple', count: 15 },
  { value: 'SECURITY', label: 'Security', icon: 'mdi-shield-lock', color: 'red', count: 10 },
  { value: 'GENERAL', label: 'General', icon: 'mdi-help-circle', color: 'grey', count: 18 }
])

// Mock articles
const articles = ref([
  {
    id: '1',
    title: 'How to Reset Your Password',
    content: 'This article explains how to reset your password if you have forgotten it...',
    category: 'ACCESS',
    tags: ['password', 'security', 'login'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    author: { firstName: 'Admin', lastName: 'User' }
  },
  {
    id: '2',
    title: 'Connecting to VPN',
    content: 'Step-by-step guide to connect to the company VPN...',
    category: 'NETWORK',
    tags: ['vpn', 'remote', 'connection'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    author: { firstName: 'Tech', lastName: 'Support' }
  },
  {
    id: '3',
    title: 'Installing Software from App Store',
    content: 'How to install approved software applications from the internal app store...',
    category: 'SOFTWARE',
    tags: ['installation', 'apps', 'software'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    author: { firstName: 'IT', lastName: 'Team' }
  },
  {
    id: '4',
    title: 'Troubleshooting Printer Issues',
    content: 'Common printer problems and how to resolve them...',
    category: 'HARDWARE',
    tags: ['printer', 'troubleshooting', 'hardware'],
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    author: { firstName: 'Support', lastName: 'Team' }
  }
])

const filteredArticles = computed(() => {
  let filtered = articles.value

  if (selectedCategory.value) {
    filtered = filtered.filter(a => a.category === selectedCategory.value)
  }

  if (search.value) {
    const searchLower = search.value.toLowerCase()
    filtered = filtered.filter(a =>
      a.title.toLowerCase().includes(searchLower) ||
      a.content.toLowerCase().includes(searchLower) ||
      a.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  return filtered
})

function selectCategory(category) {
  selectedCategory.value = selectedCategory.value === category ? null : category
}

function getCategoryColor(category) {
  const cat = categories.value.find(c => c.value === category)
  return cat?.color || 'grey'
}

function viewArticle(article) {
  selectedArticle.value = article
  articleDialog.value = true
}
</script>

<style scoped>
.category-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
}
</style>

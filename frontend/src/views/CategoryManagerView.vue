<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4 mb-1">Category Manager</h1>
            <p class="text-body-2 text-medium-emphasis">
              Manage ticket categories and sub-categories (3 levels supported)
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="openCreateDialog(null)"
          >
            Add Category
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading">
      <v-col cols="12">
        <v-skeleton-loader type="list-item@6" />
      </v-col>
    </v-row>

    <!-- Categories Tree -->
    <v-row v-else>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon start>mdi-folder-multiple</v-icon>
            Categories
            <v-spacer />
            <v-chip size="small" color="primary">
              {{ totalCategories }} total
            </v-chip>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-0">
            <v-list density="compact">
              <template v-for="parent in categoryTree" :key="parent.id">
                <!-- Level 1: Parent Category -->
                <v-list-item class="category-level-1">
                  <template #prepend>
                    <v-icon :icon="parent.icon || 'mdi-folder'" :color="parent.color" />
                  </template>
                  <v-list-item-title class="font-weight-bold">
                    {{ parent.name }}
                    <v-chip v-if="!parent.isActive" size="x-small" color="warning" class="ml-2">
                      Inactive
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle v-if="parent.description">
                    {{ parent.description }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-chip size="x-small" class="mr-2" variant="outlined">
                      {{ parent.children?.length || 0 }} sub
                    </v-chip>
                    <v-btn
                      icon="mdi-plus"
                      size="x-small"
                      variant="text"
                      color="success"
                      @click="openCreateDialog(parent.id)"
                      title="Add Sub-Category"
                    />
                    <v-btn
                      icon="mdi-pencil"
                      size="x-small"
                      variant="text"
                      @click="openEditDialog(parent)"
                      title="Edit"
                    />
                    <v-btn
                      icon="mdi-delete"
                      size="x-small"
                      variant="text"
                      color="error"
                      @click="confirmDelete(parent)"
                      title="Delete"
                    />
                  </template>
                </v-list-item>

                <!-- Level 2: Child Categories -->
                <template v-if="parent.children?.length">
                  <template v-for="child in parent.children" :key="child.id">
                    <v-list-item class="category-level-2">
                      <template #prepend>
                        <v-icon :icon="child.icon || 'mdi-folder-outline'" size="small" :color="child.color || parent.color" />
                      </template>
                      <v-list-item-title class="font-weight-medium">
                        {{ child.name }}
                        <v-chip v-if="!child.isActive" size="x-small" color="warning" class="ml-2">
                          Inactive
                        </v-chip>
                      </v-list-item-title>
                      <template #append>
                        <v-chip v-if="child.children?.length" size="x-small" class="mr-2" variant="outlined">
                          {{ child.children.length }} items
                        </v-chip>
                        <v-btn
                          icon="mdi-plus"
                          size="x-small"
                          variant="text"
                          color="success"
                          @click="openCreateDialog(child.id)"
                          title="Add Sub-Item"
                        />
                        <v-btn
                          icon="mdi-pencil"
                          size="x-small"
                          variant="text"
                          @click="openEditDialog(child)"
                          title="Edit"
                        />
                        <v-btn
                          icon="mdi-delete"
                          size="x-small"
                          variant="text"
                          color="error"
                          @click="confirmDelete(child)"
                          title="Delete"
                        />
                      </template>
                    </v-list-item>

                    <!-- Level 3: Grandchild Categories -->
                    <template v-if="child.children?.length">
                      <v-list-item
                        v-for="grandchild in child.children"
                        :key="grandchild.id"
                        class="category-level-3"
                      >
                        <template #prepend>
                          <v-icon :icon="grandchild.icon || 'mdi-circle-small'" size="x-small" :color="grandchild.color || child.color || parent.color" />
                        </template>
                        <v-list-item-title class="text-body-2">
                          {{ grandchild.name }}
                          <v-chip v-if="!grandchild.isActive" size="x-small" color="warning" class="ml-2">
                            Inactive
                          </v-chip>
                        </v-list-item-title>
                        <template #append>
                          <v-btn
                            icon="mdi-pencil"
                            size="x-small"
                            variant="text"
                            @click="openEditDialog(grandchild)"
                            title="Edit"
                          />
                          <v-btn
                            icon="mdi-delete"
                            size="x-small"
                            variant="text"
                            color="error"
                            @click="confirmDelete(grandchild)"
                            title="Delete"
                          />
                        </template>
                      </v-list-item>
                    </template>
                  </template>
                </template>

                <v-divider v-if="categoryTree.indexOf(parent) < categoryTree.length - 1" />
              </template>
            </v-list>

            <v-alert v-if="categoryTree.length === 0" type="info" class="ma-4">
              No categories found. Click "Add Category" to create one.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Quick Stats -->
      <v-col cols="12" md="4">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon start>mdi-chart-bar</v-icon>
            Quick Stats
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-folder</v-icon>
                </template>
                <v-list-item-title>Level 1 Categories</v-list-item-title>
                <template #append>
                  <strong>{{ categoryTree.length }}</strong>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="info">mdi-folder-open</v-icon>
                </template>
                <v-list-item-title>Level 2 Sub-Categories</v-list-item-title>
                <template #append>
                  <strong>{{ totalLevel2 }}</strong>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="secondary">mdi-file-document-outline</v-icon>
                </template>
                <v-list-item-title>Level 3 Items</v-list-item-title>
                <template #append>
                  <strong>{{ totalLevel3 }}</strong>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="warning">mdi-eye-off</v-icon>
                </template>
                <v-list-item-title>Inactive</v-list-item-title>
                <template #append>
                  <strong>{{ inactiveCount }}</strong>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <v-card>
          <v-card-title>
            <v-icon start>mdi-information</v-icon>
            Tips
          </v-card-title>
          <v-card-text class="text-body-2">
            <ul class="pl-4">
              <li>3-level hierarchy: Category &gt; Sub-Category &gt; Item</li>
              <li>Use icons from Material Design Icons</li>
              <li>Colors should be hex codes (e.g., #1976D2)</li>
              <li>Inactive categories are hidden from ticket forms</li>
              <li>Deleting a parent moves its children to root</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon start>{{ editingCategory ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
          {{ editingCategory ? 'Edit Category' : 'Create Category' }}
        </v-card-title>
        <v-divider />
        <v-card-text>
          <v-form ref="formRef" v-model="formValid">
            <v-text-field
              v-model="form.name"
              label="Name"
              :rules="[v => !!v || 'Name is required']"
              variant="outlined"
              density="compact"
              class="mb-3"
            />

            <v-textarea
              v-model="form.description"
              label="Description (optional)"
              variant="outlined"
              density="compact"
              rows="2"
              class="mb-3"
            />

            <v-select
              v-model="form.parentId"
              :items="parentOptions"
              item-title="displayName"
              item-value="id"
              label="Parent Category (optional)"
              variant="outlined"
              density="compact"
              clearable
              class="mb-3"
            >
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template #prepend>
                    <v-icon :icon="item.raw.icon" size="small" :class="{ 'ml-4': item.raw.level === 2 }" />
                  </template>
                </v-list-item>
              </template>
            </v-select>

            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="form.icon"
                  label="Icon"
                  variant="outlined"
                  density="compact"
                  placeholder="mdi-folder"
                >
                  <template #prepend-inner>
                    <v-icon :icon="form.icon || 'mdi-folder'" size="small" />
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="form.color"
                  label="Color"
                  variant="outlined"
                  density="compact"
                  placeholder="#1976D2"
                >
                  <template #prepend-inner>
                    <div
                      :style="{ width: '20px', height: '20px', backgroundColor: form.color, borderRadius: '4px' }"
                    />
                  </template>
                </v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model.number="form.sortOrder"
              label="Sort Order"
              type="number"
              variant="outlined"
              density="compact"
              class="mb-3"
            />

            <v-switch
              v-model="form.isActive"
              label="Active"
              color="success"
              density="compact"
            />
          </v-form>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="!formValid"
            @click="saveCategory"
          >
            {{ editingCategory ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-error">
          <v-icon start color="error">mdi-alert</v-icon>
          Confirm Delete
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete <strong>{{ categoryToDelete?.name }}</strong>?
          <template v-if="categoryToDelete?.children?.length">
            <v-alert type="warning" density="compact" class="mt-3">
              This category has {{ categoryToDelete.children.length }} sub-categories that will become root categories.
            </v-alert>
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="deleteCategory">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarText }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

// GraphQL Queries & Mutations - Now fetches 3 levels
const GET_CATEGORY_TREE = gql`
  query GetCategoryTree {
    categoryTree {
      id
      name
      description
      icon
      color
      sortOrder
      isActive
      parentId
      children {
        id
        name
        description
        icon
        color
        sortOrder
        isActive
        parentId
        children {
          id
          name
          description
          icon
          color
          sortOrder
          isActive
          parentId
        }
      }
    }
  }
`

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      icon
      color
      sortOrder
      isActive
      parentId
    }
  }
`

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($input: UpdateCategoryInput!) {
    updateCategory(input: $input) {
      id
      name
      description
      icon
      color
      sortOrder
      isActive
      parentId
    }
  }
`

const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`

// State
const loading = ref(true)
const categoryTree = ref([])
const dialog = ref(false)
const deleteDialog = ref(false)
const editingCategory = ref(null)
const categoryToDelete = ref(null)
const formRef = ref(null)
const formValid = ref(false)
const saving = ref(false)
const deleting = ref(false)
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const form = ref({
  name: '',
  description: '',
  parentId: null,
  icon: 'mdi-folder',
  color: '#1976D2',
  sortOrder: 1,
  isActive: true
})

// Computed
const totalCategories = computed(() => {
  let count = categoryTree.value.length
  categoryTree.value.forEach(cat => {
    count += cat.children?.length || 0
    cat.children?.forEach(child => {
      count += child.children?.length || 0
    })
  })
  return count
})

const totalLevel2 = computed(() => {
  return categoryTree.value.reduce((sum, cat) => sum + (cat.children?.length || 0), 0)
})

const totalLevel3 = computed(() => {
  let count = 0
  categoryTree.value.forEach(cat => {
    cat.children?.forEach(child => {
      count += child.children?.length || 0
    })
  })
  return count
})

const inactiveCount = computed(() => {
  let count = categoryTree.value.filter(c => !c.isActive).length
  categoryTree.value.forEach(cat => {
    count += (cat.children || []).filter(c => !c.isActive).length
    cat.children?.forEach(child => {
      count += (child.children || []).filter(c => !c.isActive).length
    })
  })
  return count
})

// Parent options now includes level 1 and level 2 categories (for creating level 2 and level 3)
const parentOptions = computed(() => {
  const excluded = editingCategory.value ? [editingCategory.value.id] : []
  const options = []

  categoryTree.value.forEach(cat => {
    if (!excluded.includes(cat.id)) {
      options.push({
        id: cat.id,
        name: cat.name,
        displayName: cat.name,
        icon: cat.icon || 'mdi-folder',
        level: 1
      })
    }
    // Add level 2 categories as potential parents (for level 3 items)
    cat.children?.forEach(child => {
      if (!excluded.includes(child.id)) {
        options.push({
          id: child.id,
          name: child.name,
          displayName: `${cat.name} > ${child.name}`,
          icon: child.icon || 'mdi-folder-outline',
          level: 2
        })
      }
    })
  })

  return options
})

// Queries
const { refetch: refetchTree, onResult: onTreeResult } = useQuery(GET_CATEGORY_TREE)

onTreeResult((result) => {
  if (result.data?.categoryTree) {
    categoryTree.value = result.data.categoryTree
    loading.value = false
  }
})

// Mutations
const { mutate: createCategoryMutation } = useMutation(CREATE_CATEGORY)
const { mutate: updateCategoryMutation } = useMutation(UPDATE_CATEGORY)
const { mutate: deleteCategoryMutation } = useMutation(DELETE_CATEGORY)

// Methods
const openCreateDialog = (parentId = null) => {
  editingCategory.value = null

  // Find parent to inherit color
  let parentColor = '#1976D2'
  if (parentId) {
    // Check level 1
    const level1 = categoryTree.value.find(c => c.id === parentId)
    if (level1) {
      parentColor = level1.color || parentColor
    } else {
      // Check level 2
      for (const cat of categoryTree.value) {
        const level2 = cat.children?.find(c => c.id === parentId)
        if (level2) {
          parentColor = level2.color || cat.color || parentColor
          break
        }
      }
    }
  }

  form.value = {
    name: '',
    description: '',
    parentId,
    icon: 'mdi-folder',
    color: parentColor,
    sortOrder: 1,
    isActive: true
  }
  dialog.value = true
}

const openEditDialog = (category) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    description: category.description || '',
    parentId: category.parentId || null,
    icon: category.icon || 'mdi-folder',
    color: category.color || '#1976D2',
    sortOrder: category.sortOrder || 1,
    isActive: category.isActive !== false
  }
  dialog.value = true
}

const closeDialog = () => {
  dialog.value = false
  editingCategory.value = null
  formRef.value?.reset()
}

const saveCategory = async () => {
  if (!formValid.value) return

  saving.value = true
  try {
    const input = {
      name: form.value.name,
      description: form.value.description || null,
      parentId: form.value.parentId || null,
      icon: form.value.icon || null,
      color: form.value.color || null,
      sortOrder: form.value.sortOrder,
      isActive: form.value.isActive
    }

    if (editingCategory.value) {
      await updateCategoryMutation({ input: { id: editingCategory.value.id, ...input } })
      showSnackbar('Category updated successfully', 'success')
    } else {
      await createCategoryMutation({ input })
      showSnackbar('Category created successfully', 'success')
    }

    await refetchTree()
    closeDialog()
  } catch (error) {
    console.error('Error saving category:', error)
    showSnackbar(error.message || 'Failed to save category', 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (category) => {
  categoryToDelete.value = category
  deleteDialog.value = true
}

const deleteCategory = async () => {
  if (!categoryToDelete.value) return

  deleting.value = true
  try {
    await deleteCategoryMutation({ id: categoryToDelete.value.id })
    showSnackbar('Category deleted successfully', 'success')
    await refetchTree()
    deleteDialog.value = false
    categoryToDelete.value = null
  } catch (error) {
    console.error('Error deleting category:', error)
    showSnackbar(error.message || 'Failed to delete category', 'error')
  } finally {
    deleting.value = false
  }
}

const showSnackbar = (text, color = 'success') => {
  snackbarText.value = text
  snackbarColor.value = color
  snackbar.value = true
}

onMounted(() => {
  // Initial loading handled by query
})
</script>

<style scoped>
.category-level-1 {
  background-color: rgba(var(--v-theme-surface-variant), 0.4);
}
.category-level-2 {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.4);
  margin-left: 24px;
  background-color: rgba(var(--v-theme-surface-variant), 0.2);
}
.category-level-3 {
  border-left: 2px solid rgba(var(--v-theme-secondary), 0.3);
  margin-left: 48px;
}
</style>

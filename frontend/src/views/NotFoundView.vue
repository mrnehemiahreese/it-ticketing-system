<template>
  <v-app>
    <v-main class="d-flex align-center justify-center bg-grey-lighten-3">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="6" class="text-center">
            <v-icon size="120" color="grey">mdi-alert-circle-outline</v-icon>
            <h1 class="text-h2 font-weight-bold mt-6 mb-3">404</h1>
            <h2 class="text-h5 text-grey mb-6">Page Not Found</h2>
            <p class="text-body-1 text-grey mb-8">
              The page you are looking for does not exist or has been moved.
            </p>
            <v-btn color="primary" size="large" :to="{ name: 'Dashboard' }">
              <v-icon start>mdi-home</v-icon>
              Go to Dashboard
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
// This component is intentionally simple
</script>

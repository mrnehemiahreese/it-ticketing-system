#!/bin/bash

# IT Ticketing System - Project Initialization Script
# This script completes the setup of the ticketing system

set -e

echo "🚀 Initializing IT Ticketing System..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${RED}⚠️  IMPORTANT: Edit .env file with your credentials before starting!${NC}"
    echo ""
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p backend/uploads
mkdir -p nginx/ssl
mkdir -p frontend/public
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Generate backend files
echo "🔧 Setting up backend..."
cd backend

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
uploads/
.env
*.log
.DS_Store
EOF

# Create nest-cli.json
cat > nest-cli.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
EOF

# Create .prettierrc
cat > .prettierrc << 'EOF'
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
EOF

cd ..
echo -e "${GREEN}✓ Backend configuration complete${NC}"
echo ""

# Generate frontend files
echo "🎨 Setting up frontend..."
cd frontend

# Create .gitignore
cat > .gitignore << 'EOF'
node_modules/
dist/
.DS_Store
.vscode/
*.log
EOF

# Create vite.config.js
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/graphql': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      }
    }
  }
})
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IT Ticketing System</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
EOF

# Create main.js
mkdir -p src
cat > src/main.js << 'EOF'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import apolloProvider from './plugins/apollo'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(apolloProvider)

app.mount('#app')
EOF

# Create App.vue
cat > src/App.vue << 'EOF'
<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup>
// Main App Component
</script>
EOF

cd ..
echo -e "${GREEN}✓ Frontend configuration complete${NC}"
echo ""

# Create nginx configuration
echo "🌐 Setting up nginx..."
mkdir -p nginx
cat > nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream frontend {
        server frontend:80;
    }

    upstream backend {
        server backend:4000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Backend GraphQL
        location /graphql {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        # Backend API
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
EOF

echo -e "${GREEN}✓ Nginx configuration complete${NC}"
echo ""

# Create start script
cat > start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting IT Ticketing System..."
docker-compose up -d
echo ""
echo "✅ System started!"
echo ""
echo "📍 Access points:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:4000/graphql"
echo ""
echo "👤 Default login:"
echo "   Username: admin"
echo "   Password: Admin123!"
echo ""
echo "📋 View logs: docker-compose logs -f"
EOF

chmod +x start.sh

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping IT Ticketing System..."
docker-compose down
echo "✅ System stopped"
EOF

chmod +x stop.sh

echo ""
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Project initialization complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo ""
echo "1. Edit .env file with your credentials:"
echo "   nano .env"
echo ""
echo "2. Start the system:"
echo "   ./start.sh"
echo ""
echo "3. Access the application:"
echo "   http://localhost:3000"
echo ""
echo -e "${RED}⚠️  Don't forget to:${NC}"
echo "   - Change default admin password"
echo "   - Configure SMTP for emails"
echo "   - Set up Slack webhook"
echo ""
echo "📚 See QUICK_START.md for detailed instructions"
echo ""

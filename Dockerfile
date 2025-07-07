FROM node:22-alpine

WORKDIR /app

# Copy package files for better layer caching
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Set environment for production
ENV NODE_ENV=production
ENV BACKEND_URL=https://sianglao-backend-production.up.railway.app

# Start production server
CMD ["node", ".output/server/index.mjs"]
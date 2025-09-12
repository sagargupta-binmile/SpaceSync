# Use Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json & lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire app
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 3000

# Run app
CMD ["node", "dist/main"]

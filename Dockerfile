# Use an official Node.js image from Docker Hub as the base image
FROM node:18-alpine

# Set the working directory inside the container to /app
WORKDIR /app

# Update npm to the latest version
RUN npm install -g npm@latest

# Copy only the package.json and package-lock.json first
COPY package*.json ./

# Install the app dependencies using npm
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Build the app
RUN npm run build

# Expose port 4173 (default for preview) to make it available outside the container
EXPOSE 4173

# Start the app using npm run preview and expose to host
CMD ["npm", "run", "preview", "--", "--host"]


# Use an official Node runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Install wait-port for MongoDB connection retries

# Expose the port the app runs on
EXPOSE 5000

# Start the application with MongoDB connection retry
CMD ["npm", "start"]
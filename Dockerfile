# geo-match-service/Dockerfile
#
# Stage 1: Build Stage
# Use an official Node.js image as the base
FROM node:20-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to cache dependencies efficiently
COPY package*.json ./

# Install application dependencies
# The --omit=dev flag ensures we only install production dependencies
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# ---
# Stage 2: Production Stage
# Use a slim, secure, and smaller Node.js runtime image
FROM node:20-alpine AS final

# Set the working directory again
WORKDIR /app

# Copy only the necessary files from the builder stage
# This creates a small image by excluding build artifacts and source code not needed at runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/db ./db
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/middleware ./middleware
COPY --from=builder /app/sql ./sql


# Expose the port your application listens on (from your .env file)
EXPOSE 3000

# Set the command to run the application
# This command is executed when a container is started from this image
CMD [ "node", "server.js" ]

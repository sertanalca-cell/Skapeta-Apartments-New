FROM node:18-alpine

WORKDIR /app/frontend

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Build for production
RUN yarn build

# Expose port
EXPOSE 3000

# Serve the built app
CMD ["yarn", "start"]

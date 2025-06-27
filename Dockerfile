# Use Node.js base image
FROM node:20-alpine

# Install Redis Stack
RUN apk add --no-cache redis
RUN wget https://download.redis.io/redis-stack/redis-stack-server-6.2.6-v9.alpine314.x86_64.tar.gz && \
    tar xvf redis-stack-server-6.2.6-v9.alpine314.x86_64.tar.gz && \
    mv redis-stack-server-6.2.6-v9/* /usr/local/ && \
    rm -rf redis-stack-server-6.2.6-v9*

# Create app directory
WORKDIR /poot2

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . ./poot2

# Make start script executable
COPY start.sh .
RUN chmod +x start.sh

# Expose Redis port and any other ports your app needs
EXPOSE 6379

CMD ["./start.sh"]


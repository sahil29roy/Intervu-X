FROM node:18-alpine

WORKDIR /app

# Create a non-root user for sandbox security
RUN addgroup -S sandbox && adduser -S sandbox -G sandbox
USER sandbox

# Execute solution.js script by default
CMD ["node", "solution.js"] 



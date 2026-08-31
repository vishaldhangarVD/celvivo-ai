FROM ghcr.io/puppeteer/puppeteer:23.0.0

# The official image already includes Chrome + every required system library.
# We will build and run our Next.js app on top of it.

WORKDIR /usr/src/app

# The base image default user is 'pptruser'. We use root temporarily to install and copy,
# then switch back to pptruser for execution security.
USER root

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Next.js generates the standalone folder in .next/standalone
# However, to keep it simple with 'npm start', we'll run from the root.
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

EXPOSE 3000

# Switch back to the non-root user for security
USER pptruser

CMD ["npm", "start"]

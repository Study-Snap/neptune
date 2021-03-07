FROM node:15.5.0-alpine3.11

LABEL maintainer="Ben Sykes"
LABEL authors="Ben Sykes, Liam Stickney, Malik Sheharyaar Talhat"

# Configure environment (Note: Tini allows us to avoid several Docker edge cases, see https://github.com/krallin/tini.)
RUN apk add --no-cache tini bind-tools
RUN addgroup -g 10001 -S studysnap && adduser -u 10000 -S -G studysnap -h /home/studysnap studysnap

# Install project dependencies
WORKDIR /app
COPY package.json .
RUN npm i

# Copy project files and create production build
COPY . .
RUN npm run build

# Change this port to your configured port in `config/index.ts`
EXPOSE 5555

# Use nonroot user studysnap
USER studysnap
ENTRYPOINT ["/sbin/tini", "--", "npm", "run"]
CMD ["start:prod"]
FROM node:lts-buster-slim

# Install packages
RUN apt update && apt install supervisor -y

# Setup app
RUN mkdir -p /app && chown -R root:root /app

# Add application
WORKDIR /app
COPY --chown=nobody challenge .

# Install dependencies
RUN npm install

# Setup superivsord
COPY config/supervisord.conf /etc/supervisord.conf

# Expose the port node-js is reachable on
EXPOSE 1337

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh

# Start the node-js application
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
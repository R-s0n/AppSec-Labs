FROM python:3.8.11-alpine3.13

# Setup usr
RUN adduser -D -u 1000 -g 1000 -s /bin/sh www

# Install dependencies
RUN apk add --update --no-cache gcc g++ make musl-dev python3-dev cargo libffi-dev openssl-dev

# Install packages
RUN apk add --update --no-cache nginx supervisor uwsgi-python3 chromium chromium-chromedriver

# Upgrade pip
RUN python -m pip install --upgrade pip

# Setup app
RUN mkdir -p /app

# Switch working environment
WORKDIR /app

# Add application
COPY challenge .

# Install dependencies
RUN python -m venv venv
RUN . /app/venv/bin/activate && pip install -r requirements.txt

# Fix permissions
RUN chown -R www:www /var/lib/nginx

# Copy configs
COPY config/supervisord.conf /etc/supervisord.conf
COPY config/nginx.conf /etc/nginx/nginx.conf

# Expose port the server is reachable on
EXPOSE 80

# Disable pycache
ENV PYTHONDONTWRITEBYTECODE=1

# Run supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
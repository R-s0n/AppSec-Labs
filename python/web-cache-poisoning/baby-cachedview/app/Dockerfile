FROM python:3.8.11-alpine3.13

# Setup user
RUN adduser -D -u 1000 -g 1000 -s /bin/sh www

# Install dependencies
RUN apk add --update --no-cache firefox wget terminus-font nginx supervisor uwsgi-python3

# Install geckodriver
RUN wget -q https://github.com/mozilla/geckodriver/releases/download/v0.29.1/geckodriver-v0.29.1-linux64.tar.gz && \
   tar -x geckodriver -zf geckodriver-v0.29.1-linux64.tar.gz -O > /usr/local/bin/geckodriver && chmod +x /usr/local/bin/geckodriver && rm -rf *.gz

# Setup app
RUN mkdir -p /app

# Switch working environment
WORKDIR /app

# Add application
COPY challenge .

# Install dependencies
RUN python -m venv venv
RUN . /app/venv/bin/activate && python -m pip install --upgrade pip && pip install -r requirements.txt

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
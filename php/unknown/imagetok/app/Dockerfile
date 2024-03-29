FROM alpine:edge

# Setup user
RUN adduser -D -u 1000 -g 1000 -s /bin/sh www

# Install system packages
RUN apk add --no-cache --update mariadb mariadb-client \
    supervisor nginx build-base openssl-dev

# Install PHP dependencies
RUN apk add --no-cache --update php7-fpm php7-phar \
    php7-fileinfo php7-soap php7-mysqli php7-json php7-dev

# Switch working environment
WORKDIR /tmp

# Install curl
RUN wget https://curl.haxx.se/download/curl-7.70.0.tar.gz && tar xfz curl-7.70.0.tar.gz \
    && cd curl-7.70.0/ && ./configure --with-ssl \
    && make -j 16 && make install

# Install PHP
RUN wget https://github.com/php/php-src/archive/php-7.4.10.zip && unzip php-7.4.10.zip \
    && cd php-src-php-7.4.10/ext/curl && phpize && ./configure && make -j 16

# Load curl extension
RUN echo "extension=/tmp/php-src-php-7.4.10/ext/curl/.libs/curl.so" > /etc/php7/conf.d/20-curl.ini

# Cleanup
RUN rm -rf curl-* *.zip

# Configure php-fpm and nginx
COPY config/fpm.conf /etc/php7/php-fpm.d/www.conf
COPY config/supervisord.conf /etc/supervisord.conf
COPY config/nginx.conf /etc/nginx/nginx.conf

# Copy challenge files
COPY imagetok /www

# Setup permissions
RUN chown -R www:www /www/uploads /var/lib/nginx

# Expose the port nginx is listening on
EXPOSE 80

# Populate database and start supervisord
COPY --chown=root entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
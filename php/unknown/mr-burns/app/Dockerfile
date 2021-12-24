FROM alpine:edge

# Setup user
RUN adduser -D -u 1000 -g 1000 -s /bin/sh www

# Install system packages
RUN apk add --no-cache --update supervisor nginx build-base openssl-dev

# Download and configure PHP
RUN wget https://www.php.net/distributions/php-7.4.8.tar.gz && \
    tar -xzvf php-7.4.8.tar.gz && \
    cd php-7.4.8 && \
    ./configure --build=x86_64-alpine-linux-musl --host=x86_64-alpine-linux-musl --prefix=/usr --program-suffix=7 --libdir=/usr/lib/php7 \
    --datadir=/usr/share/php7 --sysconfdir=/etc/php7 --localstatedir=/var --with-layout=GNU --with-config-file-path=/etc/php7 --with-config-file-scan-dir=/etc/php7/conf.d \
    --disable-all --enable-session --enable-fpm --with-openssl --with-openssl-dir=/usr/bin/openssl \
    build_alias=x86_64-alpine-linux-musl host_alias=x86_64-alpine-linux-musl

# Compile PHP
RUN cd /php-7.4.8 && make -j 16 && make install && rm -rf /php-7.4.8*

# Configure php-fpm and nginx
COPY config/fpm.conf /etc/php7/php-fpm.conf
COPY config/supervisord.conf /etc/supervisord.conf
COPY config/nginx.conf /etc/nginx/nginx.conf

# Setup permissions
COPY --chown=www:www challenge /www
RUN chown -R www:www /var/lib/nginx

# Switch working environment
WORKDIR /etc/php7/conf.d/

# Disable dangerous functions
RUN echo "disable_functions = exec, system, popen, proc_open, shell_exec, passthru, ini_set, putenv, pfsockopen, fsockopen, socket_create" >> disablefns.ini

# Restrict filesystem access to PHP
RUN echo "open_basedir = /www:/tmp" >> openbdir.ini

# Switch working environment
WORKDIR /

# Add readflag binary
COPY readflag.c .
RUN gcc -o /readflag /readflag.c && chmod 4755 /readflag && rm /readflag.c

# Copy flag
COPY flag /root/flag

# Expose the port nginx is listening on
EXPOSE 80

# Populate miner log and run supervisord
COPY --chown=root entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
FROM debian:buster-slim

# Install packages
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
	apt-get install -y --no-install-recommends supervisor apt-transport-https gnupg curl nodejs procps libssl1.1 zlib1g "libpcre2-*" liblua5.3-0 libatomic1 tar curl socat ca-certificates && \
	apt-get install -y --no-install-recommends gcc make libc6-dev libssl-dev libglu1 libpcre2-dev zlib1g-dev liblua5.3-dev && \
	c_rehash && \
	curl -sS https://couchdb.apache.org/repo/keys.asc | gpg --dearmor | tee /usr/share/keyrings/couchdb-archive-keyring.gpg >/dev/null 2>&1 && \
	curl -sS https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add && \
	echo "deb [signed-by=/usr/share/keyrings/couchdb-archive-keyring.gpg] https://apache.jfrog.io/artifactory/couchdb-deb/ buster main" | tee /etc/apt/sources.list.d/couchdb.list >/dev/null && \
	echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
	echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list && \
	apt-get update && apt install -y --no-install-recommends couchdb yarn google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends && \
	curl -sfSL "https://www.haproxy.org/download/2.4/src/haproxy-2.4.0.tar.gz" -o haproxy.tar.gz && \
	groupadd "haproxy" && \
	useradd -g "haproxy" "haproxy" && \
	mkdir -p /tmp/haproxy && \
	tar -xzf haproxy.tar.gz -C /tmp/haproxy --strip-components=1 && \
	rm -f haproxy.tar.gz && \
	make -C /tmp/haproxy -j"$(nproc)" TARGET=linux-glibc CPU=generic USE_PCRE2=1 USE_PCRE2_JIT=1 USE_OPENSSL=1 \
				USE_TFO=1 USE_LINUX_TPROXY=1 USE_LUA=1 USE_GETADDRINFO=1 \
				USE_PROMEX=1 USE_SLZ=1 \
				all && \
	make -C /tmp/haproxy TARGET=linux-glibc install-bin install-man && \
	ln -s /usr/local/sbin/haproxy /usr/sbin/haproxy && \
	mkdir -p /var/lib/haproxy && \
	chown "haproxy:haproxy" /var/lib/haproxy && \
	mkdir -p /usr/local/etc/haproxy && \
	ln -s /usr/local/etc/haproxy /etc/haproxy && \
	cp -R /tmp/haproxy/examples/errorfiles /usr/local/etc/haproxy/errors && \
	rm -rf /tmp/haproxy && \
	apt-get purge -y --auto-remove gcc make libc6-dev libssl-dev libpcre2-dev zlib1g-dev liblua5.3-dev && \
	apt-get clean && \
	rm -rf /var/lib/apt/lists/*

COPY config/haproxy.cfg /usr/local/etc/haproxy
# Setup app
RUN mkdir -p /app

# Add application
WORKDIR /app
COPY challenge .

#Setup couchdb
COPY config/local.ini /opt/couchdb/etc/

# Install dependencies
RUN yarn

# Setup superivsord
COPY config/supervisord.conf /etc/supervisord.conf

# Expose the port node-js is reachable on
EXPOSE 8081

# Start the node-js application
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]

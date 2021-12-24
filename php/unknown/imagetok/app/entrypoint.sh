#!/bin/ash

# Secure entrypoint
chmod 600 /entrypoint.sh

# Initialize & start MariaDB
mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld
mysql_install_db --user=mysql --ldata=/var/lib/mysql
mysqld --user=mysql --console --skip-name-resolve --skip-networking=0 &

# Wait for mysql to start
while ! mysqladmin ping -h'localhost' --silent; do echo "not up" && sleep .2; done

# Create random database & user
export DB_NAME="db_$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 5 | head -n 1)"
export DB_USER="user_$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 5 | head -n 1)"

SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 15 | head -n 1) # Don't waste your time bruteforcing, it's not the intended path

# Populate database structure
mysql -u root << EOF
CREATE DATABASE $DB_NAME;
CREATE TABLE $DB_NAME.files (
    id INT NOT NULL AUTO_INCREMENT,
    file_name VARCHAR(255) NOT NULL,
    checksum VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE $DB_NAME.definitely_not_a_flag (
    flag VARCHAR(255) NOT NULL
);

CREATE USER '$DB_USER'@'%';
GRANT SELECT, UPDATE, INSERT ON *.* TO '$DB_USER'@'%';
ALTER USER 'root'@'localhost' IDENTIFIED BY '[REDACTED]';
FLUSH PRIVILEGES;

INSERT INTO $DB_NAME.definitely_not_a_flag (flag) VALUES('HTB{f4k3_fl4g_f0r_t3st1ng}');
EOF

# Add SECRET used for cookie signing
sed -i "s/\[REDACTED SECRET\]/$SECRET/g" /www/index.php

# Populate ENV
echo -e "fastcgi_param DB_NAME $DB_NAME;\nfastcgi_param DB_USER $DB_USER;\nfastcgi_param DB_PASS '';" >> /etc/nginx/fastcgi_params

# Cronjob to delete images every 2 minutes
echo '*/2 * * * * rm /www/uploads/*' >> /var/spool/cron/crontabs/root

# Start cron deamon
crond -f &

# Start supervisord services
/usr/bin/supervisord -c /etc/supervisord.conf
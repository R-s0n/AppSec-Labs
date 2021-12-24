#!/bin/ash

DATE=$(date +"%d-%m-%Y %T")

# Populate crypto-miner log
cat << EOF > /tmp/demo_miner.log 
<div style="line-height: 1.8">
<p>Mr. Burns Miner v1.0 Started</p><span style="color:green">*</span> CPU      Intel(R) Core(TM) i5-4278U CPU @ 2.60GHz (1) <span style="color:red">-x64</span> <span style="color:green">AES</span> <span style="color:grey">vL2:</span>0.2 MB <span style="color:grey">L3:</span>3.0 MB <span style="color:lightseagreen">1</span>C<span style="color:grey">/</span><span style="color:lightseagreen">3</span>T
<span style="color:green">*</span> DONATE   <span style="color:red">0%</span>
<span style="color:green">*</span> POOL #1  <span style="color:lightseagreen">13.37.37.13:6768</span> <span style="color:lightgrey">algo</span> auto
<span style="color:green">*</span> POOL #2  <span style="color:lightseagreen">v1.mrburns.htb:6768:6768</span> <span style="color:lightgrey">algo</span> auto
<span style="color:green">*</span> COMMANDS hashrate, pause, resume
[$DATE] <span style="color:white;background-color:blue"> net </span> use pool <span style="color:lightseagreen">13.37.37.13:6768</span>  <span style="color:lightgrey">13.37.37.13:6768</span>
[$DATE] <span style="color:white;background-color:blue"> net </span> <span style="color:purple">new job</span> from 13.37.37.13:6768 <span style="color:lightgrey">diff</span> 5990191 <span style="color:white;color:lightgrey">algo</span> rx/0 <span style="color:lightgrey">height</span> 2025539
[$DATE] <span style="color:white;background-color:blue"> rx  </span> <span style="color:purple">init dataset</span> <span style="color:lightgrey">algo</span> rx/0 (<span style="color:lightseagreen">1</span> threads) <span style="color:grey">seed 7b8b843f868c19c6...</span>
[$DATE] <span style="color:white;background-color:blue"> rx  </span> <span style="background-color:yellow">failed to allocate RandomX dataset, switching to slow mode</span> <span style="color:grey">(3 ms)</span>
[$DATE] <span style="color:white;background-color:blue"> rx  </span> <span style="color:green">dataset ready</span> <span style="color:grey">(5620 ms)</span>
[$DATE] <span style="background-color:cyan"> cpu </span> use profile <span style="color:white;background-color:blue"> rx  </span> (<span style="color:lightseagreen">1</span> thread) scratchpad (<span style="color:lightseagreen">2048 KB</span>)
[$DATE] <span style="background-color:cyan"> cpu </span> <span style="color:green">READY</span> threads <span style="color:lightseagreen">1/1 (1)</span> huge pages <span style="color:red">0% 0/1</span> memory <span style="color:lightseagreen">2048 KB</span> <span style="color:grey">(29 ms)</span>
[$DATE] <span style="color:white;background-color:blue"> net </span> <span style="color:purple">new job</span> from 13.37.37.13:6768 <span style="color:lightgrey">diff</span> 5990191 <span style="color:lightgrey">algo</span> rx/0 <span style="color:lightgrey">height</span> 2025539
[$DATE] speed <span style="color:lightgrey">10s/60s/15m</span> <span style="color:lightseagreen">n/a</span> <span style="color:darkturquoise">1.2 n/a<span> <span style="color:lightseagreen">H/s</span> max <span style="color:lightseagreen">1.5H/s</span>
</div>
EOF

# Secure entrypoint
chmod 600 /entrypoint.sh

# Run supervisord
/usr/bin/supervisord -c /etc/supervisord.conf
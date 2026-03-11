#!/bin/sh

# 模块安装目录
MOD_DIR="/data/adb/modules/ech-wk"
# 运行目录
RUN_DIR="/data/adb/ech-wk"

# 创建目录
mkdir -p $RUN_DIR
mkdir -p $MOD_DIR/bin

# 复制二进制和配置
cp -f "$MODPATH/bin/ech-wk" "$RUN_DIR/ech-wk"
cp -f "$MODPATH/config/default.conf" "$RUN_DIR/config.conf"
chmod 755 "$RUN_DIR/ech-wk"

# 初始化 KSU 配置（默认值）
ksud module config set server_addr "ech.510524.xyz:443"
ksud module config set local_port "1080"
ksud module config set doh_server "dns.alidns.com/dns-query"
ksud module config set ech_domain "cloudflare-ech.com"
ksud module config set preferred_ip "fage.cf.090227.xyz"
ksud module config set token "fage"

# 设置自启
touch "$MOD_DIR/auto_mount"

#!/bin/sh

# 等待系统启动完成
sleep 15

RUN_DIR="/data/adb/ech-wk"
BIN="$RUN_DIR/ech-wk"

# 确保二进制存在且可执行
if [ ! -f "$BIN" ]; then
  exit 1
fi
chmod 755 "$BIN"

# 从 KSU 配置读取参数（兼容官方参数名）
SERVER_ADDR=$(ksud module config get server_addr 2>/dev/null || echo "ech.510524.xyz:443")
LOCAL_LISTEN=$(ksud module config get local_port 2>/dev/null || echo "127.0.0.1:1080")
TOKEN=$(ksud module config get token 2>/dev/null || echo "fage")
PREFERRED_IP=$(ksud module config get preferred_ip 2>/dev/null || echo "fage.cf.090227.xyz")
DOH_SERVER=$(ksud module config get doh_server 2>/dev/null || echo "dns.alidns.com/dns-query")
ECH_DOMAIN=$(ksud module config get ech_domain 2>/dev/null || echo "cloudflare-ech.com")

# 杀死旧进程
pkill -f "$BIN" 2>/dev/null

# 按官方语法启动（核心修复！）
"$BIN" \
  -f "$SERVER_ADDR" \
  -l "$LOCAL_LISTEN" \
  -token "$TOKEN" \
  -ip "$PREFERRED_IP" \
  -dns "$DOH_SERVER" \
  -ech "$ECH_DOMAIN" &

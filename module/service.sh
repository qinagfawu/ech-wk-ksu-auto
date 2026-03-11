#!/bin/sh

# 等待系统启动
sleep 15

RUN_DIR="/data/adb/ech-wk"
BIN="$RUN_DIR/ech-wk"
CONF="$RUN_DIR/config.conf"

# 确保二进制和配置文件存在
if [ ! -f "$BIN" ] || [ ! -f "$CONF" ]; then
  exit 1
fi
chmod 755 "$BIN"

# 从配置文件读取参数（用 grep + awk 提取）
SERVER_ADDR=$(grep "^server_addr" "$CONF" | awk -F'=' '{print $2}' | xargs)
LOCAL_LISTEN=$(grep "^local_listen" "$CONF" | awk -F'=' '{print $2}' | xargs)
TOKEN=$(grep "^token" "$CONF" | awk -F'=' '{print $2}' | xargs)
PREFERRED_IP=$(grep "^preferred_ip" "$CONF" | awk -F'=' '{print $2}' | xargs)
DOH_SERVER=$(grep "^doh_server" "$CONF" | awk -F'=' '{print $2}' | xargs)
ECH_DOMAIN=$(grep "^ech_domain" "$CONF" | awk -F'=' '{print $2}' | xargs)

# 杀死旧进程
pkill -f "$BIN" 2>/dev/null

# 按官方语法启动
"$BIN" \
  -f "$SERVER_ADDR" \
  -l "$LOCAL_LISTEN" \
  -token "$TOKEN" \
  -ip "$PREFERRED_IP" \
  -dns "$DOH_SERVER" \
  -ech "$ECH_DOMAIN" >> "$RUN_DIR/ech.log" 2>&1 &

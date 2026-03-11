#!/bin/sh

# 等待系统启动完成
sleep 10

RUN_DIR="/data/adb/ech-wk"
BIN="$RUN_DIR/ech-wk"

# 从 KSU 配置读取参数
SERVER_ADDR=$(ksud module config get server_addr | tr -d '\n')
LOCAL_PORT=$(ksud module config get local_port | tr -d '\n')
DOH_SERVER=$(ksud module config get doh_server | tr -d '\n')
ECH_DOMAIN=$(ksud module config get ech_domain | tr -d '\n')
PREFERRED_IP=$(ksud module config get preferred_ip | tr -d '\n')
TOKEN=$(ksud module config get token | tr -d '\n')

# 杀死旧进程
pkill -f "$BIN"

# 启动新进程
"$BIN" \
  --server "$SERVER_ADDR" \
  --local-port "$LOCAL_PORT" \
  --doh "$DOH_SERVER" \
  --ech-domain "$ECH_DOMAIN" \
  --preferred-ip "$PREFERRED_IP" \
  --token "$TOKEN" &

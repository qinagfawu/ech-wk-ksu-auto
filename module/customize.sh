#!/bin/sh

MOD_DIR="/data/adb/modules/ech-wk"
RUN_DIR="/data/adb/ech-wk"

# 创建运行目录
mkdir -p "$RUN_DIR"
mkdir -p "$MOD_DIR/bin"
touch "$RUN_DIR/ech.log"  # 日志文件

# 复制二进制和配置文件
cp -f "$MODPATH/bin/ech-wk" "$RUN_DIR/ech-wk"
cp -f "$MODPATH/config/default.conf" "$RUN_DIR/config.conf"
chmod 755 "$RUN_DIR/ech-wk"

# 启用自动挂载
touch "$MOD_DIR/auto_mount"

// 适配 KSU 官方 WebUI API
function ksudExec(cmd) {
  return new Promise((resolve, reject) => {
    if (window.ksud && typeof window.ksud.exec === 'function') {
      window.ksud.exec(cmd, (result) => {
        if (result.code === 0) {
          resolve(result.stdout || '操作成功');
        } else {
          reject(new Error(result.stderr || '操作失败'));
        }
      });
    } else {
      reject(new Error('KSU API 未找到，请更新 KSU 版本'));
    }
  });
}

// 加载配置
async function loadConfig() {
  try {
    const server = await ksudExec("ksud module config get server_addr");
    document.getElementById('server_addr').value = server.trim() || 'ech.510524.xyz:443';
    
    const local = await ksudExec("ksud module config get local_port");
    document.getElementById('local_port').value = local.trim() || '127.0.0.1:1080';
    
    const token = await ksudExec("ksud module config get token");
    document.getElementById('token').value = token.trim() || 'fage';
    
    const ip = await ksudExec("ksud module config get preferred_ip");
    document.getElementById('preferred_ip').value = ip.trim() || 'fage.cf.090227.xyz';
    
    const doh = await ksudExec("ksud module config get doh_server");
    document.getElementById('doh_server').value = doh.trim() || 'dns.alidns.com/dns-query';
    
    const ech = await ksudExec("ksud module config get ech_domain");
    document.getElementById('ech_domain').value = ech.trim() || 'cloudflare-ech.com';
    
  } catch (e) {
    console.error('加载配置失败:', e);
    alert('加载配置失败，使用默认值');
  }
}

// 保存配置
document.getElementById('save').addEventListener('click', async () => {
  try {
    const server = document.getElementById('server_addr').value.trim();
    const local = document.getElementById('local_port').value.trim();
    const token = document.getElementById('token').value.trim();
    const ip = document.getElementById('preferred_ip').value.trim();
    const doh = document.getElementById('doh_server').value.trim();
    const ech = document.getElementById('ech_domain').value.trim();

    await ksudExec(`ksud module config set server_addr "${server}"`);
    await ksudExec(`ksud module config set local_port "${local}"`);
    await ksudExec(`ksud module config set token "${token}"`);
    await ksudExec(`ksud module config set preferred_ip "${ip}"`);
    await ksudExec(`ksud module config set doh_server "${doh}"`);
    await ksudExec(`ksud module config set ech_domain "${ech}"`);

    alert('配置保存成功！');
  } catch (e) {
    alert('保存失败：' + e.message);
  }
});

// 启动服务
document.getElementById('start').addEventListener('click', async () => {
  try {
    // 读取最新配置并启动
    const server = await ksudExec("ksud module config get server_addr");
    const local = await ksudExec("ksud module config get local_port");
    const token = await ksudExec("ksud module config get token");
    const ip = await ksudExec("ksud module config get preferred_ip");
    const doh = await ksudExec("ksud module config get doh_server");
    const ech = await ksudExec("ksud module config get ech_domain");

    // 官方参数启动
    const cmd = `/data/adb/ech-wk/ech-wk -f "${server.trim()}" -l "${local.trim()}" -token "${token.trim()}" -ip "${ip.trim()}" -dns "${doh.trim()}" -ech "${ech.trim()}" >> /data/adb/ech-wk/ech.log 2>&1 &`;
    await ksudExec(cmd);
    
    alert('服务启动成功！');
    await checkStatus(); // 启动后自动查看状态
  } catch (e) {
    alert('启动失败：' + e.message);
  }
});

// 停止服务
document.getElementById('stop').addEventListener('click', async () => {
  try {
    await ksudExec("pkill -9 -f /data/adb/ech-wk/ech-wk");
    alert('服务已停止！');
    await checkStatus(); // 停止后自动查看状态
  } catch (e) {
    alert('停止失败：' + e.message);
  }
});

// 重启服务
document.getElementById('restart').addEventListener('click', async () => {
  try {
    await ksudExec("pkill -9 -f /data/adb/ech-wk/ech-wk");
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
    
    // 重新启动
    const server = await ksudExec("ksud module config get server_addr");
    const local = await ksudExec("ksud module config get local_port");
    const token = await ksudExec("ksud module config get token");
    const ip = await ksudExec("ksud module config get preferred_ip");
    const doh = await ksudExec("ksud module config get doh_server");
    const ech = await ksudExec("ksud module config get ech_domain");

    const cmd = `/data/adb/ech-wk/ech-wk -f "${server.trim()}" -l "${local.trim()}" -token "${token.trim()}" -ip "${ip.trim()}" -dns "${doh.trim()}" -ech "${ech.trim()}" >> /data/adb/ech-wk/ech.log 2>&1 &`;
    await ksudExec(cmd);
    
    alert('服务重启成功！');
    await checkStatus();
  } catch (e) {
    alert('重启失败：' + e.message);
  }
});

// 查看服务状态
async function checkStatus() {
  try {
    const result = await ksudExec("ps -A | grep ech-wk | grep -v grep");
    if (result) {
      alert('服务正在运行！');
      document.getElementById('logContent').innerText = '服务状态：运行中\n' + result;
    } else {
      alert('服务已停止！');
      document.getElementById('logContent').innerText = '服务状态：已停止';
    }
  } catch (e) {
    alert('查看状态失败：' + e.message);
  }
}
document.getElementById('status').addEventListener('click', checkStatus);

// 查看运行日志
async function refreshLog() {
  try {
    // 创建日志文件（如果不存在）
    await ksudExec("touch /data/adb/ech-wk/ech.log");
    // 读取最后100行日志
    const log = await ksudExec("tail -n 100 /data/adb/ech-wk/ech.log");
    document.getElementById('logContent').innerText = log || '日志为空（服务未运行）';
  } catch (e) {
    document.getElementById('logContent').innerText = '读取日志失败：' + e.message;
  }
}
document.getElementById('refreshLog').addEventListener('click', refreshLog);

// 页面加载时初始化
window.onload = async () => {
  await loadConfig();
  await checkStatus(); // 加载页面时自动检查状态
};

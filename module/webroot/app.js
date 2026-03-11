// 直接读写配置文件，完全绕开 KSU API
function fileExec(cmd) {
  return new Promise((resolve, reject) => {
    // 你的 KSU 版本用 window.kernelsu.exec
    if (window.kernelsu && typeof window.kernelsu.exec === 'function') {
      window.kernelsu.exec(cmd, (result) => {
        if (result.code === 0) {
          resolve(result.stdout || '');
        } else {
          reject(new Error(result.stderr || '命令执行失败'));
        }
      });
    } else {
      // 兜底：如果连 kernelsu 都找不到，就用 alert 提示
      reject(new Error('WebUI 无法执行命令，请手动修改 /data/adb/ech-wk/config.conf'));
    }
  });
}

// 加载配置（从文件读取）
async function loadConfig() {
  try {
    await fileExec("touch /data/adb/ech-wk/config.conf");
    const conf = await fileExec("cat /data/adb/ech-wk/config.conf");
    
    const parse = (key) => {
      const reg = new RegExp(`^${key}\\s*=\\s*(.+)$`, 'm');
      const match = conf.match(reg);
      return match ? match[1].trim() : '';
    };

    document.getElementById('server_addr').value = parse('server_addr') || 'ech.510524.xyz:443';
    document.getElementById('local_port').value = parse('local_listen') || '127.0.0.1:1080';
    document.getElementById('token').value = parse('token') || 'fage';
    document.getElementById('preferred_ip').value = parse('preferred_ip') || 'fage.cf.090227.xyz';
    document.getElementById('doh_server').value = parse('doh_server') || 'dns.alidns.com/dns-query';
    document.getElementById('ech_domain').value = parse('ech_domain') || 'cloudflare-ech.com';
    
    document.getElementById('logContent').innerText = '配置加载完成（从文件读取）';
  } catch (e) {
    document.getElementById('logContent').innerText = '加载配置失败：' + e.message;
  }
}

// 保存配置（写入文件）
document.getElementById('save').addEventListener('click', async () => {
  try {
    const server = document.getElementById('server_addr').value.trim();
    const local = document.getElementById('local_port').value.trim();
    const token = document.getElementById('token').value.trim();
    const ip = document.getElementById('preferred_ip').value.trim();
    const doh = document.getElementById('doh_server').value.trim();
    const ech = document.getElementById('ech_domain').value.trim();

    const confContent = `server_addr = ${server}
local_listen = ${local}
token = ${token}
preferred_ip = ${ip}
doh_server = ${doh}
ech_domain = ${ech}`;

    // 写入配置文件
    await fileExec(`echo '${confContent}' > /data/adb/ech-wk/config.conf`);
    alert('配置已保存到文件！');
    await loadConfig();
  } catch (e) {
    alert('保存失败：' + e.message);
  }
});

// 启动服务
document.getElementById('start').addEventListener('click', async () => {
  try {
    await fileExec("/data/adb/modules/ech-wk/service.sh");
    alert('服务启动成功！');
    await checkStatus();
  } catch (e) {
    alert('启动失败：' + e.message);
  }
});

// 停止服务
document.getElementById('stop').addEventListener('click', async () => {
  try {
    await fileExec("pkill -9 -f /data/adb/ech-wk/ech-wk");
    alert('服务已停止！');
    await checkStatus();
  } catch (e) {
    alert('停止失败：' + e.message);
  }
});

// 重启服务
document.getElementById('restart').addEventListener('click', async () => {
  try {
    await fileExec("pkill -9 -f /data/adb/ech-wk/ech-wk");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await fileExec("/data/adb/modules/ech-wk/service.sh");
    alert('服务重启成功！');
    await checkStatus();
  } catch (e) {
    alert('重启失败：' + e.message);
  }
});

// 查看状态
async function checkStatus() {
  try {
    const result = await fileExec("ps -A | grep ech-wk | grep -v grep");
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

// 刷新日志
async function refreshLog() {
  try {
    await fileExec("touch /data/adb/ech-wk/ech.log");
    const log = await fileExec("tail -n 100 /data/adb/ech-wk/ech.log");
    document.getElementById('logContent').innerText = log || '日志为空（服务未运行）';
  } catch (e) {
    document.getElementById('logContent').innerText = '读取日志失败：' + e.message;
  }
}
document.getElementById('refreshLog').addEventListener('click', refreshLog);

// 页面加载
window.onload = async () => {
  await loadConfig();
  await checkStatus();
};

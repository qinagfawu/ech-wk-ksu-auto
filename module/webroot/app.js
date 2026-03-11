// KSU WebUI API 封装
async function ksudExec(cmd) {
  return new Promise((resolve, reject) => {
    // 适配 KSU WebUI 环境
    window.ksud.exec(cmd, (result) => {
      if (result.code === 0) resolve(result.stdout);
      else reject(result.stderr);
    });
  });
}

// 加载配置
async function loadConfig() {
  try {
    const server = await ksudExec("ksud module config get server_addr");
    document.getElementById('server_addr').value = server.trim();
    const port = await ksudExec("ksud module config get local_port");
    document.getElementById('local_port').value = port.trim();
    const doh = await ksudExec("ksud module config get doh_server");
    document.getElementById('doh_server').value = doh.trim();
    const ech = await ksudExec("ksud module config get ech_domain");
    document.getElementById('ech_domain').value = ech.trim();
    const ip = await ksudExec("ksud module config get preferred_ip");
    document.getElementById('preferred_ip').value = ip.trim();
    const token = await ksudExec("ksud module config get token");
    document.getElementById('token').value = token.trim();
  } catch (e) {
    console.error("加载配置失败", e);
  }
}

// 保存配置
document.getElementById('save').addEventListener('click', async () => {
  try {
    const server = document.getElementById('server_addr').value;
    await ksudExec(`ksud module config set server_addr "${server}"`);

    await ksudExec(`ksud module config set local_port "${port}"`);
    const doh = document.getElementById('doh_server').value;
    await ksudExec(`ksud module config set doh_server "${doh}"`);
    const ech = document.getElementById('ech_domain').value;
    await ksudExec(`ksud module config set ech_domain "${ech}"`);
    const ip = document.getElementById('preferred_ip').value;
    await ksudExec(`ksud module config set preferred_ip "${ip}"`);
    const token = document.getElementById('token').value;
    await ksudExec(`ksud module config set token "${token}"`);
    alert('配置已保存');
  } catch (e) {
    alert('保存失败: ' + e.message);
  }
});

// 重启服务
document.getElementById('restart').addEventListener('click', async () => {
  try {
    await ksudExec("pkill -f /data/adb/ech-wk/ech-wk");
    await ksudExec("/data/adb/modules/ech-wk/service.sh");
    alert('服务已重启');
  } catch (e) {
    alert('重启失败: ' + e.message);
  }
});

// 页面加载时读取配置
window.onload = loadConfig;

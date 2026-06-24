/**
 * PWA 状态检测脚本
 * 手机/桌面浏览器均可直接查看
 */
async function showPWAStatus() {
  const content = document.getElementById('content');

  let html = '';

  // 1. 网络状态
  html += '<div class="panel">';
  html += '<h3>📶 网络状态</h3>';
  html += '<div class="item">';
  html += `<span class="icon">${navigator.onLine ? '✅' : '❌'}</span>`;
  html += `<span>${navigator.onLine ? '在线' : '离线'}</span>`;
  html += '</div></div>';

  // 2. Service Worker
  html += '<div class="panel">';
  html += '<h3>⚙️ Service Worker</h3>';
  if ('serviceWorker' in navigator) {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length > 0) {
        html += `<div class="item"><span class="icon ok">✅</span><span>已注册 ${regs.length} 个 Service Worker</span></div>`;
        for (const reg of regs) {
          const state = reg.active ? '活跃' : (reg.waiting ? '等待中' : '安装中');
          const stateClass = reg.active ? 'ok' : 'warn';
          html += `<div class="item" style="padding-left: 20px;"><span class="icon ${stateClass}">${state}</span><span>${reg.scope.replace(window.location.origin, '')}</span></div>`;
        }
      } else {
        html += '<div class="item"><span class="icon warn">⏳</span><span>正在注册 Service Worker...</span></div>';
      }
    } catch (e) {
      html += `<div class="item"><span class="icon fail">❌</span><span>检查失败: ${e.message}</span></div>`;
    }
  } else {
    html += '<div class="item"><span class="icon fail">❌</span><span>浏览器不支持 Service Worker</span></div>';
  }
  html += '</div>';

  // 3. Cache Storage
  html += '<div class="panel">';
  html += '<h3>💾 缓存存储</h3>';
  if ('caches' in window) {
    try {
      const names = await caches.keys();
      if (names.length > 0) {
        html += `<div class="item"><span class="icon ok">✅</span><span>${names.length} 个缓存</span></div>`;
        for (const name of names) {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          html += `<div class="cache-name">${name}</div>`;
          html += `<div class="cache-count">${keys.length} 个文件</div>`;
        }
      } else {
        html += '<div class="item"><span class="icon warn">⏳</span><span>首次访问，缓存为空</span></div>';
      }
    } catch (e) {
      html += `<div class="item"><span class="icon fail">❌</span><span>检查失败</span></div>`;
    }
  } else {
    html += '<div class="item"><span class="icon fail">❌</span><span>浏览器不支持 Cache API</span></div>';
  }
  html += '</div>';

  // 4. Manifest
  html += '<div class="panel">';
  html += '<h3>📱 Web App Manifest</h3>';
  const manifestLink = document.querySelector('link[rel="manifest"]');
  if (manifestLink) {
    html += '<div class="item"><span class="icon ok">✅</span><span>Manifest 链接已设置</span></div>';
    try {
      const res = await fetch(manifestLink.href);
      const manifest = await res.json();
      html += `<pre>${JSON.stringify(manifest, null, 2)}</pre>`;
    } catch (e) {
      html += `<div class="item"><span class="icon fail">❌</span><span>加载失败</span></div>`;
    }
  } else {
    html += '<div class="item"><span class="icon fail">❌</span><span>未找到 Manifest</span></div>';
  }
  html += '</div>';

  // 5. 提示
  html += '<div class="panel">';
  html += '<h3>💡 使用提示</h3>';
  html += '<div style="font-size: 13px; color: #666; line-height: 1.6;">';
  html += '<p>• 等待 5 秒后刷新页面，SW 会自动注册</p>';
  html += '<p>• iOS Safari 需要添加到主屏幕才能完整支持</p>';
  html += '<p>• 离线后刷新，缓存资源仍可访问</p>';
  html += '</div></div>';

  content.innerHTML = html;
}

// 页面加载后自动检查
showPWAStatus();

// 每 3 秒更新一次
setInterval(showPWAStatus, 3000);

// 监听网络变化
window.addEventListener('online', () => showPWAStatus());
window.addEventListener('offline', () => showPWAStatus());

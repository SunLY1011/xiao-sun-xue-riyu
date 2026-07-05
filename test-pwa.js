// 在 DevTools Console 执行
(async () => {
  const results = [];
  
  // 1. 检查 SW 注册
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations();
    results.push({ test: 'SW Registered', pass: regs.length > 0, detail: regs.length + ' SW(s)' });
  }
  
  // 2. 检查 Manifest
  const res = await fetch('manifest.json');
  const manifest = await res.json();
  results.push({ test: 'Manifest Valid', pass: !!manifest.name && !!manifest.icons });
  
  // 3. 检查缓存
  const cacheNames = await caches.keys();
  results.push({ test: 'Has Caches', pass: cacheNames.some(n => n.includes('hyouga')) });
  
  // 4. 检查安装提示
  const canInstall = 'beforeinstallprompt' in window;
  results.push({ test: 'Installable', pass: canInstall });
  
  console.table(results);
  console.log('PWA Test Summary:', results.every(r => r.pass) ? '✅ PASS' : '❌ FAIL');
})();
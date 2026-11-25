// Lưu app vào máy để mở được cả khi không có mạng
const CACHE='hsk-moi-ngay-v9';
const AC='hsk-audio-1'; // ghi âm: giữ lại qua các lần cập nhật app
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./privacy.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==AC).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin===location.origin&&url.pathname.includes('/a/')){
    // ghi âm: lấy từ bộ nhớ trước, chưa có thì tải rồi lưu (bỏ qua yêu cầu cắt đoạn)
    e.respondWith(caches.open(AC).then(c=>c.match(url.pathname).then(hit=>hit||fetch(url.pathname).then(r=>{if(r.status===200)c.put(url.pathname,r.clone());return r}))));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.status===200){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp))}return r}).catch(()=>hit);
    return hit||net;
  }));
});

#!/usr/bin/env node
/**
 * CMAC – tạo trang Kiến thức & Tin tức từ file nội dung.
 *
 *   node tools/build-pages.js
 *
 * Nội dung bài viết: content/kien-thuc/<slug>.html và content/tin-tuc/<slug>.html
 * Mỗi file bắt đầu bằng một khối JSON trong chú thích HTML:
 *   <!--
 *   { "title": "...", "date": "2026-10-14", "excerpt": "...",
 *     "topic": "Quản trị tài chính",            (Kiến thức: một trong TOPICS)
 *     "cover": "/assets/news/anh.jpg",           (tuỳ chọn, ảnh đại diện)
 *     "author": "CMAC" }                         (tuỳ chọn)
 *   -->
 *   <p class="lead">Đoạn mở đầu…</p> …nội dung HTML…
 *
 * Kết quả (được commit và GitHub Pages phục vụ trực tiếp):
 *   kien-thuc/index.html, kien-thuc/<slug>/index.html
 *   tin-tuc/index.html,   tin-tuc/<slug>/index.html
 *   khối "Bài viết mới" trong index.html (giữa 2 dấu LATEST), sitemap.xml
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE = "https://cmac.vn";
const TOPICS = ["Kế toán & Thuế", "Quản trị tài chính", "CFO & Chiến lược", "Tài chính doanh nghiệp"];

const SECTIONS = {
  "kien-thuc": {
    name: "Kiến thức",
    title: "Kiến thức quản trị tài chính",
    lede: "Bài viết thực tế cho chủ doanh nghiệp: hiểu con số, kiểm soát dòng tiền, ra quyết định tài chính tốt hơn.",
    metaDesc: "Kiến thức quản trị tài chính, kế toán – thuế, CFO và tài chính doanh nghiệp cho chủ doanh nghiệp vừa và nhỏ, do CMAC chia sẻ.",
    empty: "Bài viết đang được chuẩn bị.",
  },
  "tin-tuc": {
    name: "Tin tức",
    title: "Tin tức và hoạt động của CMAC",
    lede: "Các hoạt động, sự kiện và dấu mốc của CMAC cùng khách hàng, đối tác tại Đà Nẵng và Miền Trung.",
    metaDesc: "Tin tức, hoạt động và sự kiện của CMAC – Công ty TNHH Tư vấn Quản trị và Kế toán Miền Trung.",
    empty: "Tin tức đang được cập nhật.",
  },
};

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
const readMinutes = (html) => Math.max(1, Math.round(html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length / 220));

function loadPosts(section) {
  const dir = path.join(ROOT, "content", section);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const m = raw.match(/^\s*<!--([\s\S]*?)-->/);
    if (!m) throw new Error(`${section}/${f}: thiếu khối JSON ở đầu file`);
    const meta = JSON.parse(m[1]);
    for (const k of ["title", "date", "excerpt"]) if (!meta[k]) throw new Error(`${section}/${f}: thiếu "${k}"`);
    if (section === "kien-thuc" && !TOPICS.includes(meta.topic)) throw new Error(`${section}/${f}: topic phải là một trong ${TOPICS.join(", ")}`);
    const body = raw.slice(m[0].length).trim();
    return { ...meta, slug: f.replace(/\.html$/, ""), section, body, url: `/${section}/${f.replace(/\.html$/, "")}/`, minutes: readMinutes(body) };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

// ---------- khung trang dùng chung ----------
const NAV = [
  ["/#dich-vu", "Dịch vụ"], ["/#cfo", "CFO thuê ngoài"], ["/#khach-hang", "Khách hàng"], ["/#cach-lam-viec", "Cách làm việc"],
  ["/kien-thuc/", "Kiến thức"], ["/tin-tuc/", "Tin tức"], ["/#ve-cmac", "Về CMAC"],
];
function head({ title, desc, url, image, type = "website" }) {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${url}">
<meta property="og:type" content="${type}">
<meta property="og:locale" content="vi_VN">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${url}">
<meta property="og:image" content="${SITE}${image || "/assets/cmac-logo.png"}">
<meta name="theme-color" content="#2A1F1A">
<link rel="icon" type="image/png" href="/assets/cmac-mark-v2.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,600;1,400&family=Montserrat:wght@600;700;800&display=swap">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>`;
}
function header(active) {
  const links = NAV.map(([href, label]) => `<a href="${href}"${href === active ? ' aria-current="page"' : ""}>${label}</a>`).join("\n      ");
  return `
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="/" aria-label="CMAC, về trang chủ"><img src="/assets/cmac-logo.png" alt="CMAC – Vững Tài chính. Mạnh Tương Lai." width="163" height="46"></a>
    <nav class="nav" id="nav" aria-label="Điều hướng chính">
      ${links}
    </nav>
    <a class="btn btn-bronze head-cta" href="/#lien-he">Đặt lịch trao đổi</a>
    <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
  </div>
</header>`;
}
const FOOTER = `
<footer class="foot">
  <div class="wrap foot-top">
    <div>
      <img src="/assets/cmac-logo.png" alt="CMAC" width="220" height="62" loading="lazy">
      <p class="one">Đối tác Tài chính &amp; Quản trị giúp doanh nghiệp vững tài chính, nâng cao năng lực quản trị và tăng trưởng bền vững.</p>
    </div>
    <div>
      <h4>Khám phá</h4>
      <ul>
        <li><a href="/#dich-vu">Dịch vụ</a></li>
        <li><a href="/#cfo">CFO thuê ngoài</a></li>
        <li><a href="/kien-thuc/">Kiến thức</a></li>
        <li><a href="/tin-tuc/">Tin tức</a></li>
      </ul>
    </div>
    <div>
      <h4>Liên hệ</h4>
      <ul>
        <li>0839 10 09 26</li>
        <li>Ceo.cmac@gmail.com</li>
        <li>814 Trần Hưng Đạo, P. Điện Bàn Đông, TP. Đà Nẵng</li>
      </ul>
    </div>
  </div>
  <div class="wrap foot-bot">
    <span>© 2026 Công ty TNHH Tư vấn Quản trị và Kế toán Miền Trung · MSDN 4001340408</span>
    <span class="essence">FINANCE · TRUST · GROWTH</span>
  </div>
</footer>
<a class="zalo-float" href="https://zalo.me/0839100926" target="_blank" rel="noopener" aria-label="Nhắn Zalo cho CMAC: 0839 10 09 26"><span class="zi" aria-hidden="true">Zalo</span><span class="zt">Nhắn Zalo</span></a>
<script>
(() => {
  const b = document.getElementById("menuBtn"), n = document.getElementById("nav");
  b.addEventListener("click", () => { const o = n.classList.toggle("open"); b.setAttribute("aria-expanded", String(o)); });
  n.addEventListener("click", (e) => { if (e.target.tagName === "A") { n.classList.remove("open"); b.setAttribute("aria-expanded", "false"); } });
  const chips = document.querySelectorAll("[data-filter]");
  chips.forEach((c) => c.addEventListener("click", () => {
    chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
    const f = c.dataset.filter;
    document.querySelectorAll("[data-topic]").forEach((el) => { el.hidden = f !== "*" && el.dataset.topic !== f; });
  }));
})();
</script>
</body>
</html>
`;

// ---------- trang danh sách ----------
function cardHtml(p, headingTag = "h2") {
  const label = p.section === "kien-thuc" ? p.topic : "Tin tức";
  const cover = p.cover ? `<a class="cover" href="${p.url}" tabindex="-1" aria-hidden="true"><img src="${esc(p.cover)}" alt="" width="640" height="360" loading="lazy"></a>` : "";
  return `<li class="card${p.cover ? "" : " topic"}" data-topic="${esc(label)}">
        ${cover}<div class="body">
          <span class="tag">${esc(label)}</span>
          <${headingTag}><a href="${p.url}">${esc(p.title)}</a></${headingTag}>
          <p>${esc(p.excerpt)}</p>
          <span class="meta">${fmtDate(p.date)} · ${p.minutes} phút đọc</span>
        </div>
      </li>`;
}
function listingPage(section, posts) {
  const s = SECTIONS[section];
  const topics = section === "kien-thuc" ? TOPICS.filter((t) => posts.some((p) => p.topic === t)) : [];
  const filters = topics.length > 1
    ? `<div class="filters" role="group" aria-label="Lọc theo chủ đề">
        <button class="chip" type="button" data-filter="*" aria-pressed="true">Tất cả</button>
        ${topics.map((t) => `<button class="chip" type="button" data-filter="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join("\n        ")}
      </div>` : "";
  const list = posts.length ? `<ul class="cards">\n      ${posts.map((p) => cardHtml(p)).join("\n      ")}\n    </ul>` : `<p class="empty">${s.empty}</p>`;
  return head({ title: `${s.name} | CMAC – Tư vấn Tài chính & Quản trị`, desc: s.metaDesc, url: `/${section}/` }) + header(`/${section}/`) + `
<main>
  <section class="page-hero">
    <div class="wrap">
      <nav class="crumbs" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><span>${s.name}</span></nav>
      <h1>${s.title}</h1>
      <p class="lede">${s.lede}</p>
    </div>
  </section>
  <section class="listing" aria-label="Danh sách bài viết">
    <div class="wrap">
      ${filters}
      ${list}
    </div>
  </section>
</main>` + FOOTER;
}

// ---------- trang bài viết ----------
function articlePage(p, siblings) {
  const s = SECTIONS[p.section];
  const label = p.section === "kien-thuc" ? p.topic : "Tin tức";
  const related = siblings.filter((x) => x.slug !== p.slug).slice(0, 4);
  const relatedHtml = related.length ? `<div class="aside-list">
          <h2>${p.section === "kien-thuc" ? "Bài viết khác" : "Tin khác"}</h2>
          <ul>${related.map((r) => `<li><a href="${r.url}">${esc(r.title)}</a></li>`).join("")}</ul>
        </div>` : "";
  const jsonld = { "@context": "https://schema.org", "@type": p.section === "kien-thuc" ? "Article" : "NewsArticle", headline: p.title, description: p.excerpt, datePublished: p.date, author: { "@type": "Organization", name: p.author || "CMAC" }, publisher: { "@type": "Organization", name: "CMAC – Công ty TNHH Tư vấn Quản trị và Kế toán Miền Trung", logo: { "@type": "ImageObject", url: `${SITE}/assets/cmac-logo.png` } }, mainEntityOfPage: `${SITE}${p.url}`, ...(p.cover ? { image: `${SITE}${p.cover}` } : {}) };
  return head({ title: `${p.title} | CMAC`, desc: p.excerpt, url: p.url, image: p.cover, type: "article" }) + header(`/${p.section}/`) + `
<main>
  <section class="page-hero">
    <div class="wrap">
      <nav class="crumbs" aria-label="Đường dẫn"><a href="/">Trang chủ</a><span aria-hidden="true">/</span><a href="/${p.section}/">${s.name}</a><span aria-hidden="true">/</span><span>${esc(label)}</span></nav>
      <h1>${esc(p.title)}</h1>
      <div class="meta-line"><span>${fmtDate(p.date)}</span><span>${esc(label)}</span><span>${p.minutes} phút đọc</span>${p.author ? `<span>${esc(p.author)}</span>` : ""}</div>
    </div>
  </section>
  <article class="article">
    <div class="wrap">
      <div class="prose">
${p.body}
      </div>
      <aside class="aside" aria-label="Liên hệ và bài liên quan">
        <div class="aside-cta">
          <h2>Trao đổi cùng CMAC</h2>
          <p>Doanh nghiệp của anh/chị đang gặp vấn đề tương tự? Bắt đầu bằng một buổi trao đổi.</p>
          <a class="btn btn-bronze" href="/#lien-he">Đặt lịch trao đổi</a>
          <a class="btn btn-line" href="https://zalo.me/0839100926" target="_blank" rel="noopener">Nhắn Zalo</a>
        </div>
        ${relatedHtml}
      </aside>
    </div>
  </article>
</main>
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` + FOOTER;
}

// ---------- khối "Bài viết mới" trên trang chủ ----------
function latestBlock(all) {
  // 1 tin mới nhất + các bài kiến thức mới nhất, tổng 3 bài, xếp theo ngày
  const news = all.filter((p) => p.section === "tin-tuc").slice(0, 1);
  const know = all.filter((p) => p.section === "kien-thuc").slice(0, 3 - news.length);
  const items = [...news, ...know].sort((a, b) => b.date.localeCompare(a.date));
  if (!items.length) return "";
  return `
  <section class="sec latest" id="bai-viet" aria-labelledby="latest-title">
    <div class="wrap">
      <div class="latest-head">
        <div class="sec-head">
          <p class="kicker">Kiến thức &amp; Tin tức</p>
          <h2 id="latest-title">Bài viết mới từ CMAC</h2>
          <hr class="rule">
        </div>
        <div class="latest-links"><a href="/kien-thuc/">Xem tất cả Kiến thức</a><a href="/tin-tuc/">Xem Tin tức</a></div>
      </div>
      <ul class="latest-grid">
        ${items.map((p) => `<li class="latest-card">
          <span class="tag">${esc(p.section === "kien-thuc" ? p.topic : "Tin tức")}</span>
          <h3><a href="${p.url}">${esc(p.title)}</a></h3>
          <p>${esc(p.excerpt)}</p>
          <span class="meta">${fmtDate(p.date)} · ${p.minutes} phút đọc</span>
        </li>`).join("\n        ")}
      </ul>
    </div>
  </section>
  `;
}

// ---------- chạy ----------
function write(rel, html) {
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}
const all = [];
for (const section of Object.keys(SECTIONS)) {
  const posts = loadPosts(section);
  all.push(...posts);
  // xoá trang bài cũ không còn file nội dung
  const outDir = path.join(ROOT, section);
  if (fs.existsSync(outDir)) for (const d of fs.readdirSync(outDir, { withFileTypes: true })) {
    if (d.isDirectory() && !posts.some((p) => p.slug === d.name)) fs.rmSync(path.join(outDir, d.name), { recursive: true });
  }
  write(`${section}/index.html`, listingPage(section, posts));
  for (const p of posts) write(`${section}/${p.slug}/index.html`, articlePage(p, posts));
  console.log(`${section}: ${posts.length} bài`);
}
all.sort((a, b) => b.date.localeCompare(a.date));

const indexFile = path.join(ROOT, "index.html");
let index = fs.readFileSync(indexFile, "utf8");
const START = "<!-- LATEST:START -->", END = "<!-- LATEST:END -->";
if (index.includes(START) && index.includes(END)) {
  index = index.slice(0, index.indexOf(START) + START.length) + latestBlock(all) + index.slice(index.indexOf(END));
  fs.writeFileSync(indexFile, index);
  console.log("index.html: đã cập nhật khối Bài viết mới");
}

const urls = [["/", "2026-10-14"], ["/kien-thuc/", all.find((p) => p.section === "kien-thuc")?.date], ["/tin-tuc/", all.find((p) => p.section === "tin-tuc")?.date], ...all.map((p) => [p.url, p.date])];
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(([u, d]) => `  <url><loc>${SITE}${u}</loc>${d ? `<lastmod>${d}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`sitemap.xml: ${urls.length} địa chỉ`);

/* =========================================================================
   HƯỚNG DẪN TÙY CHỈNH DỰ ÁN & CHÈN FILE THẬT (MK SLIDE STUDIO)
   -------------------------------------------------------------------------
   1. Để chèn video PowerPoint Morph thật (.mp4):
      - Dán đường dẫn hoặc URL trực tiếp vào thuộc tính `videoUrl: './assets/ten_du_an/00_Full_Hieu_Ung.mp4'`.
      - Nếu để trống `videoUrl: ''`, hệ thống sẽ tự động phát luồng Morph Animation 60fps dựng sẵn.
   2. Để chèn ảnh từng slide PPT thật (.png / .jpg):
      - Xuất PowerPoint sang PNG (File -> Save As -> PNG -> All Slides).
      - Thêm thuộc tính `src: './assets/ten_du_an/Slide_01.png'` vào từng phần tử trong mảng `slides`.
      - Hệ thống tự động giữ nguyên ảnh thật (không ghi đè SVG mẫu) khi `sl.src` đã được cung cấp.
   3. Để thêm dự án mới:
      - Copy 1 object bất kỳ trong mảng `slideFolders` bên dưới và đổi `id`, `folderName`, `category`.
   ========================================================================= */

/* =========================================================================
   1. SVG HIGH-CRAFT SLIDE MOCKUP GENERATOR (Zero broken links, crisp 16:9)
   ========================================================================= */
function escXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
export function makeSlideSvgDataUri({
  bg1,
  bg2,
  accent,
  accent2,
  tag,
  title,
  subtitle,
  layout,
  pageNum,
  total,
}) {
  tag = escXml(tag);
  title = escXml(title);
  subtitle = escXml(subtitle);
  let bodyMarkup = "";
  if (layout === "cover") {
    bodyMarkup = `
      <circle cx="760" cy="270" r="185" fill="${accent}" opacity="0.14"/>
      <circle cx="760" cy="270" r="120" fill="none" stroke="${accent2}" stroke-width="2" stroke-dasharray="8 8" opacity="0.6"/>
      <rect x="64" y="128" width="160" height="30" rx="15" fill="${accent}" opacity="0.22"/>
      <text x="82" y="148" fill="${accent}" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="2">${tag}</text>
      <text x="64" y="232" fill="#FFFFFF" font-family="sans-serif" font-size="44" font-weight="800">${title}</text>
      <text x="64" y="280" fill="#B4BCCB" font-family="sans-serif" font-size="20" font-weight="400">${subtitle}</text>
      <rect x="64" y="330" width="170" height="44" rx="22" fill="${accent}"/>
      <text x="100" y="357" fill="#050508" font-family="sans-serif" font-size="14" font-weight="700">MK SLIDE STUDIO</text>
    `;
  } else if (layout === "chart") {
    bodyMarkup = `
      <text x="64" y="96" fill="${accent}" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="2">${tag}</text>
      <text x="64" y="140" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="800">${title}</text>
      <text x="64" y="172" fill="#9CA3AF" font-family="sans-serif" font-size="16">${subtitle}</text>
      <rect x="64" y="210" width="380" height="230" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)"/>
      <rect x="104" y="340" width="48" height="72" rx="8" fill="${accent2}" opacity="0.45"/>
      <rect x="176" y="298" width="48" height="114" rx="8" fill="${accent2}" opacity="0.72"/>
      <rect x="248" y="262" width="48" height="150" rx="8" fill="${accent2}"/>
      <rect x="320" y="228" width="48" height="184" rx="8" fill="${accent}"/>
      <rect x="476" y="210" width="420" height="104" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)"/>
      <text x="506" y="256" fill="${accent}" font-family="sans-serif" font-size="34" font-weight="800">+184%</text>
      <text x="506" y="286" fill="#CBD5E1" font-family="sans-serif" font-size="15">Tốc độ tăng trưởng người dùng thực</text>
      <rect x="476" y="336" width="420" height="104" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)"/>
      <text x="506" y="382" fill="${accent2}" font-family="sans-serif" font-size="34" font-weight="800">98.4%</text>
      <text x="506" y="412" fill="#CBD5E1" font-family="sans-serif" font-size="15">Độ hài lòng sau khi triển khai</text>
    `;
  } else if (layout === "grid") {
    bodyMarkup = `
      <text x="64" y="92" fill="${accent2}" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="2">${tag}</text>
      <text x="64" y="136" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="800">${title}</text>
      <rect x="64" y="185" width="260" height="255" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)"/>
      <circle cx="110" cy="235" r="22" fill="${accent}" opacity="0.22"/>
      <text x="102" y="241" fill="${accent}" font-family="sans-serif" font-size="16" font-weight="800">01</text>
      <text x="88" y="296" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">Phân tích dữ liệu</text>
      <text x="88" y="328" fill="#9CA3AF" font-family="sans-serif" font-size="14">Cấu trúc thông tin mạch lạc</text>
      <rect x="350" y="185" width="260" height="255" rx="20" fill="rgba(255,255,255,0.07)" stroke="${accent2}"/>
      <circle cx="396" cy="235" r="22" fill="${accent2}" opacity="0.25"/>
      <text x="388" y="241" fill="${accent2}" font-family="sans-serif" font-size="16" font-weight="800">02</text>
      <text x="374" y="296" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">Chiến lược lõi</text>
      <text x="374" y="328" fill="#9CA3AF" font-family="sans-serif" font-size="14">Tập trung điểm chạm khách hàng</text>
      <rect x="636" y="185" width="260" height="255" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)"/>
      <circle cx="682" cy="235" r="22" fill="${accent}" opacity="0.22"/>
      <text x="674" y="241" fill="${accent}" font-family="sans-serif" font-size="16" font-weight="800">03</text>
      <text x="660" y="296" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">Mở rộng quy mô</text>
      <text x="660" y="328" fill="#9CA3AF" font-family="sans-serif" font-size="14">Tối ưu ROI trong 12 tháng</text>
    `;
  } else {
    bodyMarkup = `
      <text x="64" y="96" fill="${accent}" font-family="sans-serif" font-size="13" font-weight="700" letter-spacing="2">${tag}</text>
      <text x="64" y="140" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="800">${title}</text>
      <text x="64" y="174" fill="#9CA3AF" font-family="sans-serif" font-size="16">${subtitle}</text>
      <line x1="84" y1="300" x2="876" y2="300" stroke="rgba(255,255,255,0.18)" stroke-width="3"/>
      <circle cx="160" cy="300" r="18" fill="${accent2}"/>
      <circle cx="400" cy="300" r="18" fill="${accent}"/>
      <circle cx="640" cy="300" r="18" fill="${accent2}"/>
      <circle cx="820" cy="300" r="18" fill="#FFFFFF"/>
      <text x="125" y="352" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="700">Giai đoạn 1</text>
      <text x="365" y="352" fill="${accent}" font-family="sans-serif" font-size="16" font-weight="700">Giai đoạn 2</text>
      <text x="605" y="352" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="700">Giai đoạn 3</text>
      <text x="785" y="352" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="700">Bứt phá</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}"/>
        <stop offset="100%" stop-color="${bg2}"/>
      </linearGradient>
    </defs>
    <rect width="960" height="540" fill="url(#bg)"/>
    <g opacity="0.12">
      <line x1="0" y1="90" x2="960" y2="90" stroke="#fff" stroke-width="0.5"/>
      <line x1="0" y1="270" x2="960" y2="270" stroke="#fff" stroke-width="0.5"/>
      <line x1="0" y1="450" x2="960" y2="450" stroke="#fff" stroke-width="0.5"/>
    </g>
    ${bodyMarkup}
    <text x="64" y="502" fill="rgba(255,255,255,0.45)" font-family="sans-serif" font-size="12">MK SLIDE STUDIO • PORTFOLIO</text>
    <text x="860" y="502" fill="rgba(255,255,255,0.55)" font-family="sans-serif" font-size="12" font-weight="700">${pageNum} / ${total}</text>
  </svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

/* =========================================================================
   2. PROJECT FOLDERS DATA ARRAY (Easy to swap in real MP4 & PNG URLs)
   ========================================================================= */
export const slideFolders = [
  {
    id: "thiet-ke-slide-co-ban",
    folderName: "Giao_dien_goi_co_ban",
    displayTitle: "Thiết kế giao diện gói cơ bản",
    category: "Thuyết trình nhóm",
    beforeImg: "assets/before-after/nhom-before.png",
    afterImg: "assets/before-after/nhom-after.png",
    slideCount: 25,
    packagePrice: 5000,
    accent: "#F5A623",
    accent2: "#2D7FF9",
    bg1: "#070B18",
    bg2: "#0F1830",
    videoFileName: "00_Full_Hieu_Ung_Goi_CoBan.mp4",
    videoUrl: "assets/projects/thiet-ke-slide-co-ban/du-an-2.mp4", // Paste your .mp4 URL here to override built-in Morph stream
    slides: [
      {
        fileName: "Slide_demo_01.png",
        caption: "Trang bìa mở đầu ấn tượng",
        src: "assets/projects/thiet-ke-slide-co-ban/anh4.png", // <-- Đường dẫn ảnh trang slide 1
        title: "Trang bìa",
      },
      {
        fileName: "Slide_demo_02.png",
        caption: "Nội dung bài thuyết trình",
        src: "assets/projects/thiet-ke-slide-co-ban/anh5.png",
        title: "Nội dung bài thuyết trình",
      },
      {
        fileName: "Slide_demo_03.png",
        caption: "Tổng kết & thông điệp chính",
        src: "assets/projects/thiet-ke-slide-co-ban/anh1.png",
        title: "Tổng kết & thông điệp chính",
      },
      {
        fileName: "Slide_demo_04.png",
        caption: "Kết thúc bài thuyết trình",
        src: "assets/projects/thiet-ke-slide-co-ban/anh3.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Kết thúc slide",
      },
    ],
  },
  {
    id: "thiet-ke-slide-chuyensau",
    folderName: "thiet-ke-slide-chuyen-sau",
    displayTitle: "Thiết kế slide chuyên sâu với model 3d, animation mượt mà",
    category: "Đồ án & Nghiên cứu",
    beforeImg: 'assets/before-after/do-an-before.png', // <-- Ảnh Before của dự án 2
    afterImg:"assets/before-after/do-an-after.png",
    slideCount: 27,
    packagePrice: 15000,
    accent: "#2D7FF9",
    accent2: "#38BDF8",
    bg1: "#060C18",
    bg2: "#0C1E38",
    videoFileName: "00_Full_Hieu_Ung.mp4",
    videoUrl: "assets/projects/thiet-ke-slide-chuyensau/demo.mp4",
    slides: [
      {
        fileName: "Slide_demo_01.png",
        caption: "Giao diện mở đầu bài thuyết trình",
        src: "assets/projects/thiet-ke-slide-chuyensau/anh1.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Mở đầu bài thuyết trình",
      },
      {
        fileName: "Slide_demo_02.png",
        caption: "Nhấn mạnh chủ thể bằng model 3d",
        src: "assets/projects/thiet-ke-slide-chuyensau/anh2.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Model 3d sinh động",
      },
      {
        fileName: "Slide_demo_03.png",
        caption: "Khái niệm / Nội dung",
        src: "assets/projects/thiet-ke-slide-chuyensau/anh3.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Nội dung rõ ràng, thẩm mĩ",
      },
      {
        fileName: "Slide_demo_04.png",
        caption: "Kết thúc slide chuẩn cinema",
        src: "assets/projects/thiet-ke-slide-chuyensau/anh5.jpg", // <-- Đường dẫn ảnh trang slide 2
        title: "Kết slide đa dạng, sáng tạo",
      },
    ],
  },
  {
    id: "Pitch deck cá nhân",
    folderName: "pitch-deck-ca-nhan",
    displayTitle:
      "Xây dựng pitch deck cá nhân, thương hiệu huy động vốn và trình bày sản phẩm",
    category: "Pitch Deck",
    beforeImg: 'assets/before-after/pitch-before.png', 
    afterImg:"assets/before-after/pitch-after.png",
    slideCount: 28,
    packagePrice: 15000,
    accent: "#F5A623",
    accent2: "#FB7185",
    bg1: "#120816",
    bg2: "#220E28",
    videoFileName: "00_Full_Hieu_Ung.mp4",
    videoUrl: "assets/projects/pitch-deck-ca-nhan/demo.mp4",
    slides: [
      {
        fileName: "Slide_demo_01.png",
        caption: "Slide mở đầu ấn tượng kèm tác giá",
        src: "assets/projects/pitch-deck-ca-nhan/anh1.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Gây ấn tượng ngay từ slide đầu tiên",
      },
      {
        fileName: "Slide_demo_02.png",
        caption: "Mục lục bài thuyết trình thẩm mĩ",
        src: "assets/projects/pitch-deck-ca-nhan/anh2.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Mục lục ấn tượng làm nổi bật hành trình của buổi thuyết trình",
      },
      {
        fileName: "Slide_demo_03.png",
        caption: "Dựng ảnh 3d phong cách từ ảnh 2d đơn giản",
        src: "assets/projects/pitch-deck-ca-nhan/anh3.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Làm chủ thể nổi bật trong bài thuyết trình",
      },
      {
        fileName: "Slide_demo_04.png",
        caption: "Kết luận và thông điệp",
        src: "assets/projects/pitch-deck-ca-nhan/anh4.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Slide thông điệp phong phú và thẩm mĩ",
      },
      {
        fileName: "Slide_demo_05.png",
        caption: "Slide kết thúc",
        src: "assets/projects/pitch-deck-ca-nhan/anh5.png", // <-- Đường dẫn ảnh trang slide 2
        title: "Kết thúc bài thuyết trình ấn tượng",
      },
    ],
  },
];

// Hydrate each slide with its crisp SVG data URI (skip if custom src is provided)
slideFolders.forEach((folder) => {
  folder.slides.forEach((sl, idx) => {
    if (!sl.src) {
      sl.src = makeSlideSvgDataUri({
        bg1: folder.bg1,
        bg2: folder.bg2,
        accent: folder.accent,
        accent2: folder.accent2,
        tag: sl.tag,
        title: sl.title,
        subtitle: sl.subtitle,
        layout: sl.layout,
        pageNum: String(idx + 1).padStart(2, "0"),
        total: String(folder.slideCount).padStart(2, "0"),
      });
    }
  });
  if (!folder.thumbnail && folder.slides.length > 0) {
    folder.thumbnail = folder.slides[0].src;
  }
});

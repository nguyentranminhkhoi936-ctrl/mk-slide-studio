import { slideFolders } from "../data/projects-data.js";

export function initFolderExplorer({ onOrderSimilar, showToast } = {}) {
  /* =========================================================================
     8. PROJECT FOLDER CARDS RENDERING & CATEGORY FILTERING
     ========================================================================= */
  const foldersGrid = document.getElementById("folders-grid");
  const baBeforeImg = document.getElementById("ba-before-img");
  const baAfterImg = document.getElementById("ba-after-img");
  const baRange = document.getElementById("ba-range");

  // Mặc định mở tab đầu tiên
  let activeCategory = "Thuyết trình nhóm";

  // Hàm tìm dự án thuộc danh mục đang bấm và cập nhật ảnh Before/After của chính dự án đó
  function syncBeforeAfterWithProject(category) {
    const matchedProject = slideFolders.find(
      (item) => item.category === category,
    );

    if (matchedProject && baBeforeImg && baAfterImg) {
      if (matchedProject.beforeImg) baBeforeImg.src = matchedProject.beforeImg;
      if (matchedProject.afterImg) baAfterImg.src = matchedProject.afterImg;

      // Đưa thanh kéo về lại chính giữa 50% mỗi khi chuyển nút
      if (baRange) {
        baRange.value = 50;
        baRange.dispatchEvent(new Event("input"));
      }
    }
  }

  // Hàm hiển thị đầy đủ cả 3 thư mục dự án trên lưới 3 cột & làm nổi bật dự án đang chọn
  function renderFolders() {
    foldersGrid.innerHTML = slideFolders
      .map((folder) => {
        const isSelected = folder.category === activeCategory;
        return `
      <div class="folder-card interactive-el group cursor-pointer flex flex-col" data-folder-id="${folder.id}">
        <div class="folder-tab max-w-[88%] ${isSelected ? "border-amberGlow/60" : ""}">
          <span class="text-amberGlow text-sm">📁</span>
          <span class="font-mono text-xs font-semibold text-white/90 truncate">${folder.folderName}</span>
        </div>

        <div class="glass-card rounded-b-2xl rounded-tr-2xl p-4 flex flex-col flex-1 transition-all shadow-xl ${
          isSelected
            ? "border-amberGlow/65 shadow-[0_0_28px_rgba(245,166,35,0.22)] -translate-y-1"
            : "group-hover:border-amberGlow/45 group-hover:-translate-y-1"
        }">
          <div class="relative aspect-[16/9] rounded-xl overflow-hidden border border-white/10 mb-4 bg-black">
            <img src="${folder.thumbnail}" alt="${folder.displayTitle}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amberGlow/45 text-[10px] font-semibold text-amberGlow flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-amberGlow animate-pulse"></span>
              Full Hiệu Ứng Video
            </div>
            <div class="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/15">
              ${folder.slideCount} Slides
            </div>
          </div>

          <div class="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 class="font-display font-bold text-base sm:text-lg ${isSelected ? "text-amberGlow" : "text-white group-hover:text-amberGlow"} transition-colors">${folder.displayTitle}</h3>
              <span class="inline-block mt-1 text-xs text-cobaltGlow font-medium">${folder.category}</span>
            </div>
          </div>

          <div class="mt-auto pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <span class="text-mutedText font-mono">1 Video + ${folder.slides.length} Ảnh mẫu</span>
            <span class="font-semibold text-white group-hover:text-amberGlow transition-colors inline-flex items-center gap-1">
              Xem chi tiết →
            </span>
          </div>
        </div>
      </div>
    `;
      })
      .join("");

    foldersGrid.querySelectorAll(".folder-card").forEach((card) => {
      card.addEventListener("click", () =>
        openFolderModal(card.dataset.folderId),
      );
    });
  }

  // Sự kiện khi bấm 1 trong 3 nút danh mục
  document.querySelectorAll(".filter-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.dataset.filter;

      document.querySelectorAll(".filter-pill").forEach((b) => {
        b.className =
          "filter-pill interactive-el px-4 py-2 rounded-full text-xs sm:text-sm font-semibold glass-card text-white/80 hover:text-white transition-all";
      });
      btn.className =
        "filter-pill interactive-el px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-white text-cosmic border border-white transition-all";

      // Cập nhật cả ảnh Before/After lẫn thẻ dự án bên dưới
      syncBeforeAfterWithProject(activeCategory);
      renderFolders();
    });
  });

  // Khởi chạy dữ liệu mặc định ngay khi vừa tải trang
  syncBeforeAfterWithProject(activeCategory);
  renderFolders();

  renderFolders();

  /* =========================================================================
     9. FULL-SCREEN SPLIT-VIEW FOLDER EXPLORER MODAL (VIDEO + SLIDE IMAGES)
     ========================================================================= */
  const folderModal = document.getElementById("folder-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalFolderTitle = document.getElementById("modal-folder-title");
  const modalFolderCategory = document.getElementById("modal-folder-category");
  const sidebarFolderPath = document.getElementById("sidebar-folder-path");
  const sidebarFileCount = document.getElementById("sidebar-file-count");
  const sidebarFileList = document.getElementById("sidebar-file-list");
  const stageStatusBadge = document.getElementById("stage-status-badge");
  const backToVideoBtn = document.getElementById("back-to-video-btn");
  const stageVideoWrap = document.getElementById("stage-video-wrap");
  const stageImageWrap = document.getElementById("stage-image-wrap");
  const modalVideoPlayer = document.getElementById("modal-video-player");
  const modalFallbackCanvas = document.getElementById(
    "modal-morph-fallback-canvas",
  );
  const modalSlideImage = document.getElementById("modal-slide-image");
  const stageCaption = document.getElementById("stage-caption");
  const modalPrevBtn = document.getElementById("modal-prev-btn");
  const modalNextBtn = document.getElementById("modal-next-btn");
  const modalOrderSimilarBtn = document.getElementById(
    "modal-order-similar-btn",
  );
  const morphStreamCanvas = document.getElementById("morph-stream-canvas");

  let currentFolder = null;
  let currentFileIndex = 0; // 0 = Video, 1..N = Slides
  let morphAnimFrameId = null;
  let activeMediaStream = null;

  function stopMorphVideoStream() {
    if (morphAnimFrameId) {
      cancelAnimationFrame(morphAnimFrameId);
      morphAnimFrameId = null;
    }
    if (activeMediaStream) {
      activeMediaStream.getTracks().forEach((tr) => tr.stop());
      activeMediaStream = null;
    }
    modalVideoPlayer.pause();
    modalVideoPlayer.srcObject = null;
    modalVideoPlayer.removeAttribute("src");
  }

  function startMorphVideoForFolder(folder) {
    stopMorphVideoStream();
    modalFallbackCanvas.classList.add("hidden");
    modalVideoPlayer.classList.remove("hidden");

    // If user configured a real MP4 URL in slideFolders, play it directly
    if (folder.videoUrl && folder.videoUrl.trim().length > 0) {
      modalVideoPlayer.src = folder.videoUrl;
      modalVideoPlayer.play().catch(() => {});
      return;
    }

    // Otherwise render a live 16:9 PowerPoint Morph animation and stream into <video>
    const canCapture = typeof morphStreamCanvas.captureStream === "function";
    const targetCanvas = canCapture ? morphStreamCanvas : modalFallbackCanvas;
    if (!canCapture) {
      modalVideoPlayer.classList.add("hidden");
      modalFallbackCanvas.classList.remove("hidden");
    }

    const ctx = targetCanvas.getContext("2d");
    const W = targetCanvas.width;
    const H = targetCanvas.height;
    const startTime = performance.now();

    function drawMorphFrame(now) {
      const elapsed = (now - startTime) / 1000;
      const cycleDur = 3.2;
      const totalSlides = folder.slides.length;
      const rawIdx = (elapsed / cycleDur) % totalSlides;
      const slideIdx = Math.floor(rawIdx);
      const nextIdx = (slideIdx + 1) % totalSlides;
      const frac = rawIdx - slideIdx;
      // Morph transition happens in the last 0.8s of each cycle
      const morphT = frac > 0.72 ? (frac - 0.72) / 0.28 : 0;
      const ease = morphT * morphT * (3 - 2 * morphT);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, folder.bg1);
      grad.addColorStop(1, folder.bg2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Morphing glowing orb migrating smoothly across slides
      const orbPositions = [
        { x: 740, y: 260, r: 165 },
        { x: 250, y: 310, r: 130 },
        { x: 480, y: 240, r: 190 },
        { x: 760, y: 180, r: 145 },
      ];
      const oA = orbPositions[slideIdx % orbPositions.length];
      const oB = orbPositions[nextIdx % orbPositions.length];
      const ox = oA.x + (oB.x - oA.x) * ease;
      const oy = oA.y + (oB.y - oA.y) * ease;
      const or = oA.r + (oB.r - oA.r) * ease;

      const orbGrad = ctx.createRadialGradient(ox, oy, 10, ox, oy, or);
      orbGrad.addColorStop(0, folder.accent + "55");
      orbGrad.addColorStop(0.6, folder.accent2 + "22");
      orbGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, or, 0, Math.PI * 2);
      ctx.fill();

      // Morphing architectural card
      const cardX = 64 + ease * (slideIdx % 2 === 0 ? 380 : -380) * 0.35;
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.strokeStyle = "rgba(255,255,255,0.14)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, 290, 380, 155, 18);
      ctx.fill();
      ctx.stroke();

      // Animated bar chart inside morphing card
      const bars = [0.42, 0.68, 0.85, 1.0];
      bars.forEach((h, bi) => {
        const animH = h * (85 + Math.sin(elapsed * 2.4 + bi) * 14);
        ctx.fillStyle = bi === 3 ? folder.accent : folder.accent2;
        ctx.beginPath();
        ctx.roundRect(cardX + 34 + bi * 82, 422 - animH, 46, animH, 7);
        ctx.fill();
      });

      // Morphing slide typography
      const curSlide = folder.slides[slideIdx];
      ctx.globalAlpha = 1 - ease * 0.85;
      ctx.fillStyle = folder.accent;
      ctx.font = '700 14px "Be Vietnam Pro", sans-serif';
      ctx.fillText(curSlide.tag + "  •  MORPH TRANSITION", 64, 118 - ease * 18);

      ctx.fillStyle = "#FFFFFF";
      ctx.font = '800 40px "Montserrat", sans-serif';
      ctx.fillText(curSlide.title, 64, 178 - ease * 24);

      ctx.fillStyle = "#B8C0CC";
      ctx.font = '400 19px "Be Vietnam Pro", sans-serif';
      ctx.fillText(curSlide.subtitle, 64, 218 - ease * 16);
      ctx.globalAlpha = 1;

      // Top-right slide morph indicator
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.roundRect(W - 220, 34, 166, 34, 17);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.font = '600 13px "Be Vietnam Pro", sans-serif';
      ctx.fillText(
        `Slide 0${slideIdx + 1} / 0${totalSlides} • 60 FPS`,
        W - 202,
        56,
      );

      // Progress timeline bar at bottom
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(64, H - 36, W - 128, 4);
      const totalProg =
        (elapsed % (cycleDur * totalSlides)) / (cycleDur * totalSlides);
      ctx.fillStyle = folder.accent;
      ctx.fillRect(64, H - 36, (W - 128) * totalProg, 4);

      morphAnimFrameId = requestAnimationFrame(drawMorphFrame);
    }

    morphAnimFrameId = requestAnimationFrame(drawMorphFrame);

    if (canCapture) {
      try {
        activeMediaStream = morphStreamCanvas.captureStream(30);
        modalVideoPlayer.srcObject = activeMediaStream;
        modalVideoPlayer.play().catch(() => {});
      } catch (err) {
        modalVideoPlayer.classList.add("hidden");
        modalFallbackCanvas.classList.remove("hidden");
      }
    }
  }

  function renderSidebarTree() {
    if (!currentFolder) return;
    const itemsHtml = [];

    // Pinned Item 0: 🎬 00_Full_Hieu_Ung.mp4
    const videoActive = currentFileIndex === 0;
    itemsHtml.push(`
      <button type="button" data-file-index="0" class="sidebar-file-btn interactive-el w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
        videoActive
          ? "border-amberGlow bg-amberGlow/12 shadow-[0_0_16px_rgba(245,166,35,0.18)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }">
        <div class="w-14 h-9 rounded-lg bg-gradient-to-br from-cobaltGlow/40 to-amberGlow/40 border border-white/15 flex items-center justify-center shrink-0 text-base">
          🎬
        </div>
        <div class="min-w-0 flex-1">
          <div class="font-mono text-xs font-semibold text-white truncate">00_Full_Hieu_Ung.mp4</div>
          <div class="text-[10px] text-amberGlow mt-0.5">Video Full Morph • Tự động phát</div>
        </div>
      </button>
    `);

    // Slide Image Files (1..N)
    currentFolder.slides.forEach((sl, idx) => {
      const fileIdx = idx + 1;
      const isActive = currentFileIndex === fileIdx;
      itemsHtml.push(`
        <button type="button" data-file-index="${fileIdx}" class="sidebar-file-btn interactive-el w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
          isActive
            ? "border-cobaltGlow bg-cobaltGlow/15 shadow-[0_0_16px_rgba(45,127,249,0.22)]"
            : "border-white/8 bg-white/[0.02] hover:border-white/25"
        }">
          <img src="${sl.src}" alt="${sl.fileName}" class="w-14 h-9 object-cover rounded-lg border border-white/15 shrink-0" />
          <div class="min-w-0 flex-1">
            <div class="font-mono text-xs font-semibold text-white truncate">🖼️ ${sl.fileName}</div>
            <div class="text-[10px] text-mutedText truncate mt-0.5">${sl.title}</div>
          </div>
        </button>
      `);
    });

    sidebarFileList.innerHTML = itemsHtml.join("");
    sidebarFileList.querySelectorAll(".sidebar-file-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        selectModalFile(Number(btn.dataset.fileIndex)),
      );
    });
  }

  function selectModalFile(index) {
    if (!currentFolder) return;
    const maxIndex = currentFolder.slides.length;
    currentFileIndex =
      ((index % (maxIndex + 1)) + (maxIndex + 1)) % (maxIndex + 1);

    if (currentFileIndex === 0) {
      // Video Mode
      stageVideoWrap.classList.remove("hidden");
      stageImageWrap.classList.add("hidden");
      stageImageWrap.classList.remove("flex");
      backToVideoBtn.classList.add("hidden");
      backToVideoBtn.classList.remove("inline-flex");
      stageStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amberGlow animate-pulse"></span><span>Đang phát: Video Full Hiệu Ứng</span>`;
      stageStatusBadge.className =
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amberGlow/15 border border-amberGlow/40 text-amberGlow text-xs font-semibold";
      stageCaption.textContent = `${currentFolder.videoFileName} — Demo chuyển cảnh PowerPoint Morph & Animation`;
      startMorphVideoForFolder(currentFolder);
    } else {
      // Static Slide Image Mode
      stopMorphVideoStream();
      const sl = currentFolder.slides[currentFileIndex - 1];
      stageVideoWrap.classList.add("hidden");
      stageImageWrap.classList.remove("hidden");
      stageImageWrap.classList.add("flex");
      backToVideoBtn.classList.remove("hidden");
      backToVideoBtn.classList.add("inline-flex");
      modalSlideImage.src = sl.src;
      modalSlideImage.alt = sl.caption;
      stageStatusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-cobaltGlow"></span><span>Đang xem ảnh: ${sl.fileName}</span>`;
      stageStatusBadge.className =
        "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cobaltGlow/15 border border-cobaltGlow/40 text-cobaltGlow text-xs font-semibold";
      stageCaption.textContent = `${sl.fileName} — ${sl.caption}`;
    }

    renderSidebarTree();
  }

  function openFolderModal(folderId) {
    const folder = slideFolders.find((f) => f.id === folderId);
    if (!folder) return;
    currentFolder = folder;
    modalFolderTitle.textContent = `📁 ${folder.folderName}`;
    modalFolderCategory.textContent = folder.category;
    sidebarFolderPath.textContent = `📁 ${folder.folderName}/`;
    sidebarFileCount.textContent = `${folder.slides.length + 1} tệp`;

    folderModal.classList.remove("hidden");
    folderModal.classList.add("flex");
    document.body.style.overflow = "hidden";

    selectModalFile(0);
  }

  function closeFolderModal() {
    stopMorphVideoStream();
    folderModal.classList.add("hidden");
    folderModal.classList.remove("flex");
    document.body.style.overflow = "";
  }

  modalCloseBtn.addEventListener("click", closeFolderModal);
  folderModal.addEventListener("click", (e) => {
    if (e.target === folderModal) closeFolderModal();
  });
  backToVideoBtn.addEventListener("click", () => selectModalFile(0));
  modalPrevBtn.addEventListener("click", () =>
    selectModalFile(currentFileIndex - 1),
  );
  modalNextBtn.addEventListener("click", () =>
    selectModalFile(currentFileIndex + 1),
  );

  modalOrderSimilarBtn.addEventListener("click", () => {
    const pkgPrice = currentFolder ? currentFolder.packagePrice : 15000;
    const count = currentFolder ? currentFolder.slideCount : 15;
    closeFolderModal();
    if (typeof onOrderSimilar === "function") {
      onOrderSimilar(pkgPrice, count);
    }
    if (typeof showToast === "function") {
      showToast("Đã điền sẵn gói & số slide tương tự dự án!");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!folderModal.classList.contains("hidden")) {
      if (e.key === "Escape") closeFolderModal();
      if (e.key === "ArrowRight") selectModalFile(currentFileIndex + 1);
      if (e.key === "ArrowLeft") selectModalFile(currentFileIndex - 1);
    }
  });
}

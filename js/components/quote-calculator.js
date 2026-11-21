/* =========================================================================
   BEFORE / AFTER COMPARISON SLIDER & QUICK QUOTE CALCULATOR
   ========================================================================= */
let selectQuotePackageFn = null;
let updateQuoteCalculatorFn = null;
let slideQtySliderRef = null;

export function applyPresetQuote(pricePerSlide, slideCount) {
  if (typeof selectQuotePackageFn === "function") {
    selectQuotePackageFn(pricePerSlide);
  }
  if (slideQtySliderRef && typeof slideCount === "number") {
    slideQtySliderRef.value = Math.min(50, Math.max(5, slideCount));
  }
  if (typeof updateQuoteCalculatorFn === "function") {
    updateQuoteCalculatorFn();
  }
  const quoteEl = document.getElementById("quote");
  if (quoteEl) {
    quoteEl.scrollIntoView({ behavior: "smooth" });
  }
}

export function initQuoteCalculator({ copyTextSafe, showToast } = {}) {
  /* =========================================================================
     7. BEFORE / AFTER INTERACTIVE COMPARISON SLIDER
     ========================================================================= */
  const baRange = document.getElementById("ba-range");
  const baBeforeLayer = document.getElementById("ba-before-layer");
  const baDivider = document.getElementById("ba-divider");

  function updateBeforeAfter(val) {
    const pct = Math.min(95, Math.max(5, Number(val)));
    baBeforeLayer.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    baDivider.style.left = pct + "%";
  }
  baRange.addEventListener("input", (e) => updateBeforeAfter(e.target.value));
  updateBeforeAfter(50);

  /* =========================================================================
         10. QUICK QUOTE CALCULATOR & CONTACT ACTIONS
         ========================================================================= */
  let selectedPricePerSlide = 15000;
  let selectedPkgLabel = "Hiệu ứng Morph (15.000đ/slide)";

  const quotePkgBtns = document.querySelectorAll(".quote-pkg-btn");
  const slideQtySlider = document.getElementById("slide-qty-slider");
  const slideQtyValue = document.getElementById("slide-qty-value");
  const addonUrgent = document.getElementById("addon-urgent");
  const addonSummary = document.getElementById("addon-summary");
  const quoteTotalPrice = document.getElementById("quote-total-price");
  const quoteBreakdown = document.getElementById("quote-breakdown");
  const quoteMessagePreview = document.getElementById("quote-message-preview");
  const copyQuoteBtn = document.getElementById("copy-quote-btn");

  function formatVnd(amount) {
    return Math.round(amount).toLocaleString("vi-VN") + "đ";
  }

  function selectQuotePackage(price) {
    selectedPricePerSlide = Number(price);
    quotePkgBtns.forEach((btn) => {
      const isMatch = Number(btn.dataset.price) === selectedPricePerSlide;
      if (isMatch) {
        selectedPkgLabel = btn.dataset.label;
        btn.className =
          "quote-pkg-btn interactive-el text-left p-3.5 rounded-2xl border border-cobaltGlow bg-cobaltGlow/15 shadow-[0_0_20px_rgba(45,127,249,0.22)] transition-all";
      } else {
        btn.className =
          "quote-pkg-btn interactive-el text-left p-3.5 rounded-2xl border border-white/15 bg-white/[0.04] hover:border-white/35 transition-all";
      }
    });
    updateQuoteCalculator();
  }

  // BẢNG CẤU HÌNH ƯU ĐÃI THEO GÓI (Sửa trực tiếp số liệu tại đây)
  const DISCOUNT_RULES = {
    5000: {
      threshold: 25, // Trên 25 slide (tức từ slide 26 trở đi)
      reducedPrice: 2000, // Giảm còn 2.000đ/slide
    },
    15000: {
      threshold: 20, // Dự phòng nếu dùng gói 15k: từ slide 21 giảm còn 10k
      reducedPrice: 10000,
    },
  };

  function updateQuoteCalculator() {
    const qty = Number(slideQtySlider.value);
    slideQtyValue.textContent = qty;

    // 1. Tính tiền gốc (baseCost) có áp dụng ưu đãi bậc thang
    const rule = DISCOUNT_RULES[selectedPricePerSlide];
    let baseCost = 0;
    let breakdownLabel = `${qty} slide × ${formatVnd(selectedPricePerSlide)}`;

    if (rule && qty > rule.threshold) {
      const normalQty = rule.threshold;
      const discountedQty = qty - rule.threshold;
      baseCost =
        normalQty * selectedPricePerSlide + discountedQty * rule.reducedPrice;

      // Hiển thị rõ số slide giá gốc + số slide được ưu đãi để khách thấy ngay lợi ích
      breakdownLabel = `${normalQty} slide × ${formatVnd(selectedPricePerSlide)} + ${discountedQty} slide ưu đãi × ${formatVnd(rule.reducedPrice)}`;
    } else {
      baseCost = qty * selectedPricePerSlide;
    }

    // 2. Tính các phụ phí (Tóm tắt nội dung & Làm gấp 12h)
    const summaryCost = addonSummary.checked ? qty * 2000 : 0;
    const subTotal = baseCost + summaryCost;
    const urgentFee = addonUrgent.checked ? subTotal * 0.3 : 0;
    const grandTotal = subTotal + urgentFee;

    // 3. Cập nhật tổng tiền & dòng giải thích chi tiết ra giao diện
    quoteTotalPrice.textContent = formatVnd(grandTotal);

    const parts = [breakdownLabel];
    if (addonSummary.checked) parts.push(`Tóm tắt +${formatVnd(summaryCost)}`);
    if (addonUrgent.checked) parts.push(`Làm gấp 12h (+30%)`);
    quoteBreakdown.textContent = parts.join(" • ");

    // 4. Tạo mẫu tin nhắn chốt đơn tự động
    const addonsText = [];
    if (addonUrgent.checked) addonsText.push("Làm gấp trong 12h (+30%)");
    if (addonSummary.checked)
      addonsText.push("Nhờ tóm tắt nội dung (+2k/slide)");

    const orderMsg = `Chào MK SLIDE STUDIO, mình muốn đặt thiết kế PowerPoint:
• Gói thiết kế: ${selectedPkgLabel}
• Số lượng dự kiến: ${qty} slide
• Tùy chọn thêm: ${addonsText.length ? addonsText.join(", ") : "Không có"}
• Tổng ước tính: ${formatVnd(grandTotal)}
Nhờ team tư vấn và nhận file nội dung giúp mình nhé!`;

    quoteMessagePreview.textContent = orderMsg;
  }

  quotePkgBtns.forEach((btn) => {
    btn.addEventListener("click", () => selectQuotePackage(btn.dataset.price));
  });

  // Pricing cards "Tính giá gói này" buttons jump smoothly to Quote Calculator
  document.querySelectorAll(".select-package-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectQuotePackage(btn.dataset.selectPkg);
      document.getElementById("quote").scrollIntoView({ behavior: "smooth" });
    });
  });

  slideQtySlider.addEventListener("input", updateQuoteCalculator);
  addonUrgent.addEventListener("change", updateQuoteCalculator);
  addonSummary.addEventListener("change", updateQuoteCalculator);

  copyQuoteBtn.addEventListener("click", () => {
    copyTextSafe(
      quoteMessagePreview.textContent,
      "Đã copy nội dung đặt hàng! Hãy dán gửi qua Zalo/Messenger.",
    );
  });

  // Contact Email Copy
  document.getElementById("copy-email-btn").addEventListener("click", () => {
    copyTextSafe(
      "khoislide.studio@gmail.com",
      "Đã copy email khoislide.studio@gmail.com!",
    );
  });

  // Direct Social / Contact Action Buttons
  document.querySelectorAll(".contact-action-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const channel = btn.dataset.contactChannel;
      const handle = btn.dataset.contactHandle;
      copyTextSafe(handle, `Đã copy thông tin ${channel}: ${handle}`);
    });
  });

  // Initialize calculator on load
  updateQuoteCalculator();

  selectQuotePackageFn = selectQuotePackage;
  updateQuoteCalculatorFn = updateQuoteCalculator;
  slideQtySliderRef = slideQtySlider;
}

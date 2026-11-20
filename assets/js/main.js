/**
 * OVENCRAFT PRO — Commercial Bakery Equipment & Ovens Dealer
 * Main Interactive Script (Vanilla ES6+)
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeAndRtlControls();
  initStickyHeader();
  initScrollReveal();
  initMobileNavIcon();
  initProductFiltering();
  initProductDetailModal();
  initQuoteFormPrefill();
  initQuoteFormValidation();
});

/**
 * 0. Theme (Light/Dark) & Direction (LTR/RTL) Controls in Header
 */
function initThemeAndRtlControls() {
  const htmlEl = document.documentElement;
  const themeButtons = document.querySelectorAll('.js-theme-toggle');
  const rtlButtons = document.querySelectorAll('.js-rtl-toggle');
  const headerLogos = document.querySelectorAll('.navbar-brand-oc img');

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';
    htmlEl.setAttribute('data-theme', isDark ? 'dark' : 'light');

    headerLogos.forEach((img) => {
      img.src = isDark ? 'assets/images/logo-light.svg' : 'assets/images/logo.svg';
    });

    themeButtons.forEach((btn) => {
      btn.classList.toggle('is-active', isDark);
      btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
      btn.innerHTML = isDark
        ? '<i class="bi bi-sun-fill text-wheat"></i><span class="d-lg-none">Light</span>'
        : '<i class="bi bi-moon-stars"></i><span class="d-lg-none">Dark</span>';
    });
  };

  const applyDirection = (dir) => {
    const isRtl = dir === 'rtl';
    htmlEl.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    rtlButtons.forEach((btn) => {
      btn.classList.toggle('is-active', isRtl);
      btn.setAttribute('aria-pressed', isRtl ? 'true' : 'false');
      btn.innerHTML = isRtl
        ? '<i class="bi bi-text-right"></i><span>LTR</span>'
        : '<i class="bi bi-text-left"></i><span>RTL</span>';
    });
  };

  // Restore saved preferences
  let savedTheme = 'light';
  let savedDir = 'ltr';
  try {
    savedTheme = localStorage.getItem('oc_theme') || 'light';
    savedDir = localStorage.getItem('oc_dir') || 'ltr';
  } catch (_) {}

  applyTheme(savedTheme);
  applyDirection(savedDir);

  themeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextTheme = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      try {
        localStorage.setItem('oc_theme', nextTheme);
      } catch (_) {}
    });
  });

  rtlButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextDir = htmlEl.getAttribute('dir') === 'rtl' ? 'ltr' : 'rtl';
      applyDirection(nextDir);
      try {
        localStorage.setItem('oc_dir', nextDir);
      } catch (_) {}
    });
  });
}

/**
 * 1. Fixed & Sticky Header Elevation on Scroll Across All Pages & Views
 */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const topBar = document.querySelector('.top-utility-bar');

  // Create a dynamic spacer to prevent content jump when header becomes position: fixed
  let spacer = document.querySelector('.site-header-spacer');
  if (!spacer) {
    spacer = document.createElement('div');
    spacer.className = 'site-header-spacer';
    spacer.style.display = 'none';
    header.parentNode.insertBefore(spacer, header.nextSibling);
  }

  const handleScroll = () => {
    const topBarHeight = topBar && topBar.offsetHeight > 0 ? topBar.offsetHeight : 0;
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY > topBarHeight) {
      if (!header.classList.contains('header-fixed')) {
        spacer.style.height = `${header.offsetHeight}px`;
        spacer.style.display = 'block';
        header.classList.add('header-fixed');
      }
      header.classList.add('header-scrolled');
    } else {
      if (header.classList.contains('header-fixed')) {
        header.classList.remove('header-fixed');
        spacer.style.display = 'none';
      }
      if (scrollY > 10) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', () => {
    if (header.classList.contains('header-fixed')) {
      spacer.style.height = `${header.offsetHeight}px`;
    }
    handleScroll();
  });
  handleScroll();
}

/**
 * 2. Scroll-Triggered Reveal Animations (Respects prefers-reduced-motion)
 */
function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealElements = document.querySelectorAll('.reveal-item');

  if (!revealElements.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  document.documentElement.classList.add('js-anim-ready');

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      rootMargin: '0px 0px -48px 0px',
      threshold: 0.12
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/**
 * 3. Mobile Hamburger Menu Icon Toggle
 */
function initMobileNavIcon() {
  const navCollapse = document.getElementById('ovencraftNavbar');
  const togglerIcon = document.querySelector('.navbar-toggler-oc i');
  if (!navCollapse || !togglerIcon) return;

  navCollapse.addEventListener('show.bs.collapse', () => {
    togglerIcon.classList.remove('bi-list');
    togglerIcon.classList.add('bi-x-lg');
  });

  navCollapse.addEventListener('hide.bs.collapse', () => {
    togglerIcon.classList.remove('bi-x-lg');
    togglerIcon.classList.add('bi-list');
  });
}

/**
 * 4. Product Category Filtering (products.html)
 */
function initProductFiltering() {
  const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
  const productItems = document.querySelectorAll('.product-grid-item[data-category]');
  const countDisplay = document.getElementById('equipmentCountBadge');

  if (!filterButtons.length || !productItems.length) return;

  const applyFilter = (filterValue) => {
    let visibleCount = 0;

    filterButtons.forEach((btn) => {
      const isMatch = btn.getAttribute('data-filter') === filterValue;
      btn.classList.toggle('active', isMatch);
      btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
    });

    productItems.forEach((item) => {
      const itemCategory = item.getAttribute('data-category');
      const shouldShow = filterValue === 'all' || itemCategory === filterValue;

      if (shouldShow) {
        item.classList.remove('d-none');
        visibleCount++;
      } else {
        item.classList.add('d-none');
      }
    });

    if (countDisplay) {
      countDisplay.textContent = `Showing ${visibleCount} of ${productItems.length} Commercial Systems`;
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedFilter = button.getAttribute('data-filter');
      applyFilter(selectedFilter);
    });
  });

  // Check URL query parameter ?category=...
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    const matchingBtn = Array.from(filterButtons).find(
      (btn) => btn.getAttribute('data-filter') === categoryParam
    );
    if (matchingBtn) {
      applyFilter(categoryParam);
    }
  }
}

/**
 * 5. Equipment Detail Modal Population
 */
function initProductDetailModal() {
  const detailButtons = document.querySelectorAll('.js-view-details');
  const modalElement = document.getElementById('equipmentDetailModal');
  if (!detailButtons.length || !modalElement) return;

  const modalTitle = document.getElementById('modalEquipmentTitle');
  const modalCategory = document.getElementById('modalEquipmentCategory');
  const modalDesc = document.getElementById('modalEquipmentDesc');
  const modalImage = document.getElementById('modalEquipmentImage');
  const modalFeatures = document.getElementById('modalEquipmentFeatures');
  const modalApplication = document.getElementById('modalEquipmentApplication');
  const modalQuoteBtn = document.getElementById('modalRequestQuoteBtn');

  detailButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title') || 'Commercial Bakery Equipment';
      const category = btn.getAttribute('data-category-label') || 'Commercial Equipment';
      const desc = btn.getAttribute('data-desc') || '';
      const img = btn.getAttribute('data-img') || 'assets/images/deck-oven.png';
      const featuresRaw = btn.getAttribute('data-features') || '';
      const application = btn.getAttribute('data-application') || 'Ideal for commercial bakeries, artisan bread production, and professional pastry kitchens.';

      if (modalTitle) modalTitle.textContent = title;
      if (modalCategory) modalCategory.textContent = category;
      if (modalDesc) modalDesc.textContent = desc;
      if (modalImage) {
        modalImage.src = img;
        modalImage.alt = title;
      }
      if (modalApplication) modalApplication.textContent = application;

      if (modalFeatures) {
        modalFeatures.innerHTML = '';
        featuresRaw.split('|').forEach((feat) => {
          if (feat.trim()) {
            const li = document.createElement('li');
            li.innerHTML = `<i class="bi bi-check2-circle"></i><span>${feat.trim()}</span>`;
            modalFeatures.appendChild(li);
          }
        });
      }

      if (modalQuoteBtn) {
        const encodedEquip = encodeURIComponent(title);
        const encodedCat = encodeURIComponent(category);
        modalQuoteBtn.href = `contact.html?equipment=${encodedEquip}&category=${encodedCat}#quoteFormSection`;
      }
    });
  });
}

/**
 * 6. Pre-fill Quote Form from Query Parameters on contact.html
 */
function initQuoteFormPrefill() {
  const quoteForm = document.getElementById('equipmentQuoteForm');
  if (!quoteForm) return;

  const params = new URLSearchParams(window.location.search);
  const equipmentName = params.get('equipment');
  const categoryName = params.get('category');

  const categorySelect = document.getElementById('equipmentCategory');
  const requirementsField = document.getElementById('additionalRequirements');

  if (categoryName && categorySelect) {
    Array.from(categorySelect.options).forEach((opt) => {
      if (
        opt.value.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName.toLowerCase().includes(opt.value.toLowerCase())
      ) {
        if (opt.value !== '') {
          categorySelect.value = opt.value;
        }
      }
    });
  }

  if (equipmentName && requirementsField) {
    requirementsField.value = `Interested in pricing and configuration consultation for: ${equipmentName}.`;
  }
}

/**
 * 7. Quote Request Form Validation & Honest Local Preparation Feedback
 */
function initQuoteFormValidation() {
  const form = document.getElementById('equipmentQuoteForm');
  if (!form) return;

  const feedbackBox = document.getElementById('quoteFormFeedback');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const phoneRegex = /^[0-9+()\-\s]{7,22}$/;

  const requiredFields = [
    { id: 'fullName', validate: (val) => val.trim().length >= 2 },
    { id: 'businessName', validate: (val) => val.trim().length >= 2 },
    { id: 'emailAddress', validate: (val) => emailRegex.test(val.trim()) },
    { id: 'phoneNumber', validate: (val) => phoneRegex.test(val.trim()) },
    { id: 'businessType', validate: (val) => val.trim() !== '' },
    { id: 'equipmentCategory', validate: (val) => val.trim() !== '' },
    { id: 'estimatedQuantity', validate: (val) => val.trim() !== '' },
    { id: 'budgetRange', validate: (val) => val.trim() !== '' }
  ];

  // Clear error state on user input
  requiredFields.forEach(({ id, validate }) => {
    const input = document.getElementById(id);
    if (!input) return;

    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(eventType, () => {
      if (validate(input.value)) {
        input.classList.remove('is-invalid');
        input.setAttribute('aria-invalid', 'false');
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidEl = null;

    requiredFields.forEach(({ id, validate }) => {
      const input = document.getElementById(id);
      if (!input) return;

      if (!validate(input.value)) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        isValid = false;
        if (!firstInvalidEl) firstInvalidEl = input;
      } else {
        input.classList.remove('is-invalid');
        input.setAttribute('aria-invalid', 'false');
      }
    });

    if (!isValid) {
      if (feedbackBox) {
        feedbackBox.className = 'alert alert-danger mt-4 mb-0 border-0 shadow-sm';
        feedbackBox.setAttribute('role', 'alert');
        feedbackBox.innerHTML = `
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-exclamation-triangle-fill fs-5"></i>
            <div>
              <strong>Please review the highlighted fields.</strong> All required contact and equipment configuration details must be completed before preparing your quote request.
            </div>
          </div>
        `;
        feedbackBox.classList.remove('d-none');
      }
      if (firstInvalidEl) firstInvalidEl.focus();
      return;
    }

    // Gather validated summary without claiming backend server transmission
    const fullName = document.getElementById('fullName').value.trim();
    const businessName = document.getElementById('businessName').value.trim();
    const emailAddress = document.getElementById('emailAddress').value.trim();
    const phoneNumber = document.getElementById('phoneNumber').value.trim();
    const businessType = document.getElementById('businessType').value;
    const equipmentCategory = document.getElementById('equipmentCategory').value;
    const estimatedQuantity = document.getElementById('estimatedQuantity').value;
    const budgetRange = document.getElementById('budgetRange').value;
    const additionalRequirements = document.getElementById('additionalRequirements').value.trim() || 'None specified';

    const mailSubject = encodeURIComponent(`Equipment Quote Inquiry - ${businessName} (${equipmentCategory})`);
    const mailBody = encodeURIComponent(
      `OVENCRAFT PRO Equipment Quote Inquiry\n` +
      `--------------------------------------\n` +
      `Full Name: ${fullName}\n` +
      `Business Name: ${businessName}\n` +
      `Email Address: ${emailAddress}\n` +
      `Phone Number: ${phoneNumber}\n` +
      `Bakery Business Type: ${businessType}\n` +
      `Equipment Category: ${equipmentCategory}\n` +
      `Estimated Quantity: ${estimatedQuantity}\n` +
      `Planned Budget Range: ${budgetRange}\n` +
      `Additional Requirements: ${additionalRequirements}\n`
    );

    if (feedbackBox) {
      feedbackBox.className = 'alert alert-success mt-4 mb-0 border-0 shadow-sm';
      feedbackBox.setAttribute('role', 'status');
      feedbackBox.innerHTML = `
        <div class="d-flex flex-column gap-2">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-check-circle-fill fs-5 text-success"></i>
            <strong class="text-espresso">Quote Request Validated &amp; Prepared for ${businessName}</strong>
          </div>
          <p class="small mb-2 text-muted-warm">
            Note: This website currently operates in preview mode without a live backend server integration. Your inquiry summary for <strong>${equipmentCategory} (${estimatedQuantity})</strong> has been validated locally. You may launch your email client below with your pre-populated specification sheet once your live dealer email endpoint is configured.
          </p>
          <div>
            <a href="mailto:quotes@your-bakery-equipment-domain.example?subject=${mailSubject}&body=${mailBody}" class="btn-oc-secondary btn-sm-oc">
              <i class="bi bi-envelope-paper"></i> Open Pre-Filled Quote Email Draft
            </a>
          </div>
        </div>
      `;
      feedbackBox.classList.remove('d-none');
    }
  });
}

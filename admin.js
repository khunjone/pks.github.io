/**
 * ==============================================================================
 * JavaScript ควบคุมระบบหลังบ้าน Admin Dashboard
 * โรงเรียนวัดโป่งก้อนเส้า - Watpongkonsao School
 * ==============================================================================
 */

const ADMIN_CONFIG = {
    PIN: 'admin1234',
    CACHE_KEY: 'SCHOOL_LOCAL_CACHE_V1',
    API_URL: localStorage.getItem('SCHOOL_API_URL') || ''
};

// ฐานข้อมูลเริ่มต้นสำหรับโรงเรียนวัดโป่งก้อนเส้า
const FALLBACK_DB = {
    settings: {
        school_name_th: 'โรงเรียนวัดโป่งก้อนเส้า',
        school_name_en: 'Watpongkonsao School',
        school_motto: 'มุ่งสู่ความเป็นเลิศ พัฒนาผู้เรียนสู่อนาคต',
        school_logo_abbr: 'ป.ก.ส.',
        school_logo_url: '',
        address: 'หมู่ 5 บ้านโป่งก้อนเส้า ตำบลท่ามะปราง อำเภอแก่งคอย จังหวัดสระบุรี',
        phone: '036-xxx-xxx',
        email: 'watpongkonsao@gmail.com',
        office_hours: 'จ.-ศ. 08.00–16.30 น.',
        social_facebook: '',
        social_youtube: '',
        social_instagram: '',
        copyright_text: '© 2569 โรงเรียนวัดโป่งก้อนเส้า · พัฒนาโดย Khunjone V.1 · สงวนลิขสิทธิ์ทุกประการ'
    },
    hero: [
        {
            BadgeText: '🏫 ยินดีต้อนรับสู่เว็บไซต์โรงเรียน',
            Title: 'ยินดีต้อนรับสู่<br>โรงเรียนวัดโป่งก้อนเส้า',
            Subtitle: 'Watpongkonsao School · มุ่งสู่ความเป็นเลิศ พัฒนาผู้เรียนสู่อนาคต',
            Btn1Text: 'รู้จักเรา →',
            Btn1Link: '#featured-section',
            Btn2Text: 'ติดต่อโรงเรียน',
            Btn2Link: '#footer-contact-info'
        }
    ],
    stats: [
        { IconEmoji: '👨‍🎓', NumberValue: '-', Label: 'นักเรียน' },
        { IconEmoji: '📚', NumberValue: '-', Label: 'กลุ่มสาระ' },
        { IconEmoji: '🚪', NumberValue: '-', Label: 'ห้องเรียน' },
        { IconEmoji: '👩‍🏫', NumberValue: '-', Label: 'บุคลากร' }
    ],
    quickAccess: [
        { IconEmoji: '📰', Title: 'ประชาสัมพันธ์', TargetURL: '#' },
        { IconEmoji: '📝', Title: 'รับสมัครงาน', TargetURL: '#' },
        { IconEmoji: '🛒', Title: 'จัดซื้อจ้าง', TargetURL: '#' },
        { IconEmoji: '⬇️', Title: 'เอกสารดาวน์โหลด', TargetURL: '#' },
        { IconEmoji: '🖼️', Title: 'ภาพกิจกรรม', TargetURL: '#' },
        { IconEmoji: '👥', Title: 'ข้อมูลบุคลากร', TargetURL: '#' },
        { IconEmoji: '📞', Title: 'ติดต่อโรงเรียน', TargetURL: '#footer-contact-info' },
        { IconEmoji: '🏫', Title: 'เว็บโรงเรียนใน', TargetURL: '#' }
    ],
    featuredNews: null,
    latestNews: [],
    gallery: [],
    staff: [],
    contacts: []
};

let db = { ...FALLBACK_DB };

// ==============================================================================
// 1. ตรวจสอบการเข้าสู่ระบบ (Authentication)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuthSession();
    loadLocalDatabase();
    initUI();
    if (ADMIN_CONFIG.API_URL) {
        syncDataWithBackend(false);
    }
});

function checkAuthSession() {
    const isAuth = sessionStorage.getItem('ADMIN_AUTH') === 'true';
    const authScreen = document.getElementById('auth-screen');
    if (authScreen) {
        authScreen.style.display = isAuth ? 'none' : 'flex';
    }
}

window.verifyAdminLogin = function () {
    const input = document.getElementById('login-pin-input');
    if (input && input.value === ADMIN_CONFIG.PIN) {
        sessionStorage.setItem('ADMIN_AUTH', 'true');
        document.getElementById('auth-screen').style.display = 'none';
        showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับผู้ดูแลระบบ', 'success');
        input.value = '';
    } else {
        showToast('รหัสผ่าน PIN ไม่ถูกต้อง (Default: admin1234)', 'error');
    }
};

window.adminLogout = function () {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        sessionStorage.removeItem('ADMIN_AUTH');
        checkAuthSession();
    }
};

// ==============================================================================
// 2. การจัดการฐานข้อมูลและสลับแท็บ
// ==============================================================================
function loadLocalDatabase() {
    const local = localStorage.getItem(ADMIN_CONFIG.CACHE_KEY);
    if (local) {
        try {
            const parsed = JSON.parse(local);
            db = { ...FALLBACK_DB, ...parsed };
            if (parsed.settings) db.settings = { ...FALLBACK_DB.settings, ...parsed.settings };
        } catch (e) {
            db = { ...FALLBACK_DB };
        }
    } else {
        db = { ...FALLBACK_DB };
        saveLocalDatabase();
    }
}

function saveLocalDatabase() {
    localStorage.setItem(ADMIN_CONFIG.CACHE_KEY, JSON.stringify(db));
}

window.navigateTab = function (tabId, clickedBtn) {
    document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(l => l.classList.remove('active'));

    const targetPane = document.getElementById(`pane-${tabId}`);
    if (targetPane) targetPane.style.display = 'block';

    if (clickedBtn) {
        clickedBtn.classList.add('active');
        document.getElementById('current-page-title').textContent = clickedBtn.textContent;
    }

    if (tabId === 'facebook') loadFacebookSettings();
};

function initUI() {
    updateApiStatusIndicator();
    renderOverviewMetrics();
    fillSettingsForm();
    fillHeroForm();
    renderStatsInputs();
    renderQuickInputs();
    renderNewsTable();
    renderGalleryTable();
    renderStaffTable();
    renderContactTable();
}

function updateApiStatusIndicator() {
    const pill = document.getElementById('top-api-status');
    const inputUrl = document.getElementById('input-api-url');
    if (inputUrl) inputUrl.value = ADMIN_CONFIG.API_URL;

    if (pill) {
        if (ADMIN_CONFIG.API_URL) {
            pill.className = 'status-pill pill-online';
            pill.innerHTML = '🟢 เชื่อมต่อกับ Google Apps Script แล้ว';
        } else {
            pill.className = 'status-pill pill-offline';
            pill.innerHTML = '🟡 โหมดจำลองในเบราว์เซอร์ (ยังไม่ใส่ URL)';
        }
    }
}

function renderOverviewMetrics() {
    document.getElementById('metric-news-count').textContent = (db.latestNews || []).length;
    document.getElementById('metric-gallery-count').textContent = (db.gallery || []).length;
    document.getElementById('metric-staff-count').textContent = (db.staff || []).length;
    document.getElementById('metric-contact-count').textContent = (db.contacts || []).length;
}

// ==============================================================================
// 3. จัดการ SITE SETTINGS (ข้อมูลโรงเรียน)
// ==============================================================================
function fillSettingsForm() {
    const s = db.settings || {};
    document.getElementById('set-school-name-th').value = s.school_name_th || '';
    document.getElementById('set-school-name-en').value = s.school_name_en || '';
    document.getElementById('set-school-motto').value = s.school_motto || '';
    document.getElementById('set-school-logo-abbr').value = s.school_logo_abbr || '';
    document.getElementById('set-school-logo-url').value = s.school_logo_url || '';
    document.getElementById('set-address').value = s.address || '';
    document.getElementById('set-phone').value = s.phone || '';
    document.getElementById('set-email').value = s.email || '';
    document.getElementById('set-office-hours').value = s.office_hours || '';
    document.getElementById('set-facebook').value = s.social_facebook || '';
    document.getElementById('set-youtube').value = s.social_youtube || '';
    document.getElementById('set-instagram').value = s.social_instagram || '';
    document.getElementById('set-copyright').value = s.copyright_text || '';
}

window.saveSiteSettings = async function () {
    const s = {
        school_name_th: document.getElementById('set-school-name-th').value.trim(),
        school_name_en: document.getElementById('set-school-name-en').value.trim(),
        school_motto: document.getElementById('set-school-motto').value.trim(),
        school_logo_abbr: document.getElementById('set-school-logo-abbr').value.trim(),
        school_logo_url: document.getElementById('set-school-logo-url').value.trim(),
        address: document.getElementById('set-address').value.trim(),
        phone: document.getElementById('set-phone').value.trim(),
        email: document.getElementById('set-email').value.trim(),
        office_hours: document.getElementById('set-office-hours').value.trim(),
        social_facebook: document.getElementById('set-facebook').value.trim(),
        social_youtube: document.getElementById('set-youtube').value.trim(),
        social_instagram: document.getElementById('set-instagram').value.trim(),
        copyright_text: document.getElementById('set-copyright').value.trim()
    };

    db.settings = s;
    saveLocalDatabase();

    // บันทึกไปยัง Google Sheets
    if (ADMIN_CONFIG.API_URL) {
        try {
            await fetch(ADMIN_CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'updateSettings', settings: s })
            });
        } catch (e) {
            console.error('GAS updateSettings error:', e);
        }
    }

    showToast('บันทึกข้อมูลโรงเรียนเรียบร้อยแล้ว!', 'success');
};

// ==============================================================================
// 4. จัดการ HERO BANNER
// ==============================================================================
function fillHeroForm() {
    const h = (db.hero && db.hero[0]) || {};
    document.getElementById('hero-in-badge').value = h.BadgeText || '';
    document.getElementById('hero-in-title').value = h.Title || '';
    document.getElementById('hero-in-subtitle').value = h.Subtitle || '';
    document.getElementById('hero-in-btn1-text').value = h.Btn1Text || '';
    document.getElementById('hero-in-btn1-link').value = h.Btn1Link || '';
    document.getElementById('hero-in-btn2-text').value = h.Btn2Text || '';
    document.getElementById('hero-in-btn2-link').value = h.Btn2Link || '';
}

window.saveHeroBanner = async function () {
    const heroData = {
        BadgeText: document.getElementById('hero-in-badge').value.trim(),
        Title: document.getElementById('hero-in-title').value.trim(),
        Subtitle: document.getElementById('hero-in-subtitle').value.trim(),
        Btn1Text: document.getElementById('hero-in-btn1-text').value.trim(),
        Btn1Link: document.getElementById('hero-in-btn1-link').value.trim(),
        Btn2Text: document.getElementById('hero-in-btn2-text').value.trim(),
        Btn2Link: document.getElementById('hero-in-btn2-link').value.trim()
    };

    db.hero = [heroData];
    saveLocalDatabase();
    showToast('บันทึกข้อมูลแบนเนอร์เรียบร้อยแล้ว!', 'success');
};

// ==============================================================================
// 5. จัดการ STATISTICS (สถิติ 4 ช่อง)
// ==============================================================================
function renderStatsInputs() {
    const container = document.getElementById('stats-inputs-container');
    if (!container) return;

    const stats = db.stats || [];
    container.innerHTML = stats.map((st, i) => `
        <div style="background:var(--gray-50); padding:16px; border-radius:var(--radius); border:1px solid var(--gray-200);">
            <div style="font-weight:700; color:var(--navy); margin-bottom:10px;">กล่องสถิติที่ ${i + 1}</div>
            <div class="form-grid-3">
                <div class="form-group" style="margin-bottom:0;">
                    <label>ไอคอน</label>
                    <input type="text" id="stat-icon-${i}" value="${st.IconEmoji || '📊'}">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>ตัวเลข</label>
                    <input type="text" id="stat-num-${i}" value="${st.NumberValue || '-'}">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>ข้อความกำกับ</label>
                    <input type="text" id="stat-label-${i}" value="${st.Label || ''}">
                </div>
            </div>
        </div>
    `).join('');
}

window.saveStats = function () {
    const newStats = [];
    for (let i = 0; i < 4; i++) {
        const icon = document.getElementById(`stat-icon-${i}`)?.value || '📊';
        const num = document.getElementById(`stat-num-${i}`)?.value || '-';
        const label = document.getElementById(`stat-label-${i}`)?.value || '';
        newStats.push({ IconEmoji: icon, NumberValue: num, Label: label, SortOrder: i + 1, Status: 'Active' });
    }
    db.stats = newStats;
    saveLocalDatabase();
    showToast('บันทึกข้อมูลสถิติ 4 ช่องเรียบร้อยแล้ว!', 'success');
};

// ==============================================================================
// 6. จัดการ QUICK ACCESS (ทางลัดด่วน)
// ==============================================================================
function renderQuickInputs() {
    const container = document.getElementById('quick-inputs-container');
    if (!container) return;

    const items = db.quickAccess || [];
    container.innerHTML = items.map((q, i) => `
        <div style="background:var(--gray-50); padding:14px; border-radius:var(--radius); border:1px solid var(--gray-200);">
            <div class="form-grid-3">
                <div class="form-group" style="margin-bottom:0; max-width:80px;">
                    <label>ไอคอน</label>
                    <input type="text" id="qa-icon-${i}" value="${q.IconEmoji || '📌'}">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>ชื่อบริการ</label>
                    <input type="text" id="qa-title-${i}" value="${q.Title || ''}">
                </div>
                <div class="form-group" style="margin-bottom:0;">
                    <label>ลิงก์ URL</label>
                    <input type="text" id="qa-url-${i}" value="${q.TargetURL || '#'}">
                </div>
            </div>
        </div>
    `).join('');
}

window.saveQuickAccess = function () {
    const newQA = [];
    const items = db.quickAccess || [];
    for (let i = 0; i < items.length; i++) {
        const icon = document.getElementById(`qa-icon-${i}`)?.value || '📌';
        const title = document.getElementById(`qa-title-${i}`)?.value || '';
        const url = document.getElementById(`qa-url-${i}`)?.value || '#';
        newQA.push({ IconEmoji: icon, Title: title, TargetURL: url, SortOrder: i + 1, Status: 'Active' });
    }
    db.quickAccess = newQA;
    saveLocalDatabase();
    showToast('บันทึกทางลัดด่วนเรียบร้อยแล้ว!', 'success');
};

// ==============================================================================
// 7. จัดการ NEWS ARTICLES (ข่าวสาร & อัปโหลด Drive)
// ==============================================================================
function renderNewsTable() {
    const tbody = document.getElementById('news-table-body');
    if (!tbody) return;

    const list = db.latestNews || [];
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--gray-500);">ยังไม่มีรายการข่าวสารในระบบ กดปุ่ม "➕ เพิ่มข่าวสารใหม่" เพื่อเริ่มสร้างข่าว</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(n => {
        const photoCount = getNewsImageList(n).length;
        return `
        <tr>
            <td style="font-size:12.5px; color:var(--gray-500);">${n.PublishDate || '-'}</td>
            <td style="font-weight:600; color:var(--navy);">${isFacebookNews(n) ? '<span class="fb-badge" title="ซิงค์จาก Facebook">f</span>' : ''}${escapeHtml(n.Title)}${photoCount > 1 ? `<span class="photo-count">🖼 ${photoCount} รูป</span>` : ''}</td>
            <td><span class="status-pill pill-online" style="font-size:11px;">${n.Category || 'ทั่วไป'}</span></td>
            <td>${n.IsPinned ? '📌 ใช่' : '-'}</td>
            <td>👁 ${n.ViewCount || 0}</td>
            <td style="text-align:right;">
                <button class="btn-danger-sm" onclick="deleteNewsItem('${n.ArticleID}')">ลบ</button>
            </td>
        </tr>
    `;
    }).join('');

    renderOverviewMetrics();
}

// ข่าวที่ซิงค์มาจาก Facebook จะมี ArticleID ขึ้นต้นด้วย FB-
function isFacebookNews(n) {
    return String((n && n.ArticleID) || '').indexOf('FB-') === 0 || (n && n.Author) === 'Facebook';
}

// รวมรูปทั้งหมดของข่าว (Attachment_DriveUrls คั่นด้วยลูกน้ำ) โดยรูปแรกคือภาพปก
function getNewsImageList(n) {
    const list = String((n && n.Attachment_DriveUrls) || '').split(',').map(u => u.trim()).filter(Boolean);
    if (n && n.DirectCoverUrl && list.indexOf(n.DirectCoverUrl) === -1) list.unshift(n.DirectCoverUrl);
    return list;
}

const MAX_NEWS_IMAGES = 10;
let newsPreviewUrls = [];

function clearNewsPreview() {
    newsPreviewUrls.forEach(u => URL.revokeObjectURL(u));
    newsPreviewUrls = [];
    const box = document.getElementById('news-file-preview');
    if (box) box.innerHTML = '';
}

window.previewNewsFiles = function (input) {
    clearNewsPreview();
    const box = document.getElementById('news-file-preview');
    if (!box) return;

    const files = Array.from(input.files);
    if (files.length > MAX_NEWS_IMAGES) {
        showToast(`เลือกได้สูงสุด ${MAX_NEWS_IMAGES} รูป ระบบจะใช้ ${MAX_NEWS_IMAGES} รูปแรก`, 'error');
    }

    box.innerHTML = files.slice(0, MAX_NEWS_IMAGES).map((f, i) => {
        const url = URL.createObjectURL(f);
        newsPreviewUrls.push(url);
        return `<div class="thumb"><img src="${url}" alt="">${i === 0 ? '<span class="thumb-cover">ปก</span>' : ''}</div>`;
    }).join('');
};

window.openAddNewsModal = function () {
    document.getElementById('form-news-modal').reset();
    document.getElementById('news-edit-id').value = '';
    clearNewsPreview();
    openModal('modal-add-news');
};

window.submitNewsForm = async function (e) {
    e.preventDefault();

    const title = document.getElementById('news-field-title').value.trim();
    const cat = document.getElementById('news-field-category').value;
    const excerpt = document.getElementById('news-field-excerpt').value.trim();
    const content = document.getElementById('news-field-content').value.trim();
    const isPinned = document.getElementById('news-field-pinned').checked;
    const fileInput = document.getElementById('news-field-file');

    const saveBtn = document.getElementById('btn-save-news');
    saveBtn.disabled = true;
    saveBtn.textContent = 'กำลังบันทึกข้อมูล...';

    try {
        // ── อัปโหลดรูปทีละไฟล์ลง Google Drive (เรียงตามลำดับที่เลือก) ──
        const files = fileInput ? Array.from(fileInput.files).slice(0, MAX_NEWS_IMAGES) : [];
        const imageUrls = [];

        if (files.length > 0 && !ADMIN_CONFIG.API_URL) {
            showToast('ยังไม่ได้เชื่อมต่อ Google Apps Script จึงไม่สามารถบันทึกรูปภาพได้ (ข่าวจะถูกบันทึกโดยไม่มีรูป)', 'error');
        } else if (files.length > 0) {
            let failed = 0;
            for (let i = 0; i < files.length; i++) {
                saveBtn.textContent = `กำลังอัปโหลดรูปที่ ${i + 1}/${files.length}...`;
                try {
                    const img = await prepareImageForUpload(files[i]);
                    const uploadRes = await fetch(ADMIN_CONFIG.API_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                        body: JSON.stringify({
                            action: 'uploadFile',
                            folderCategory: 'news',
                            fileName: img.fileName,
                            mimeType: img.mimeType,
                            base64: img.base64
                        })
                    });
                    const uploadJson = await uploadRes.json();
                    if (uploadJson && uploadJson.directUrl) {
                        imageUrls.push(uploadJson.directUrl);
                    } else {
                        failed++;
                    }
                } catch (err) {
                    console.error('Upload image error:', err);
                    failed++;
                }
            }
            if (failed > 0) {
                showToast(`อัปโหลดรูปไม่สำเร็จ ${failed} จาก ${files.length} รูป`, 'error');
            }
        }

        saveBtn.textContent = 'กำลังบันทึกข่าว...';

        const newArticle = {
            ArticleID: 'NEWS-' + Date.now(),
            Category: cat,
            Title: title,
            Excerpt: excerpt,
            Content: content || excerpt,
            DirectCoverUrl: imageUrls[0] || '',
            Attachment_DriveUrls: imageUrls.join(','),
            IsPinned: isPinned,
            PublishDate: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
            Author: 'admin',
            ViewCount: 0,
            Status: 'Published'
        };

        // ส่งบันทึกเข้า Google Sheets
        if (ADMIN_CONFIG.API_URL) {
            try {
                await fetch(ADMIN_CONFIG.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ action: 'saveNews', ...newArticle })
                });
            } catch (err) {
                console.error('GAS saveNews error:', err);
            }
        }

        if (isPinned) {
            db.featuredNews = newArticle;
        }
        db.latestNews = [newArticle, ...(db.latestNews || [])];
        saveLocalDatabase();

        closeModal('modal-add-news');
        clearNewsPreview();
        renderNewsTable();
        showToast('เพิ่มข่าวสารประชาสัมพันธ์สำเร็จแล้ว!', 'success');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = '🚀 บันทึกและเผยแพร่ข่าว';
    }
};

window.deleteNewsItem = async function (id) {
    if (!confirm('ต้องการลบข่าวสารนี้ใช่หรือไม่?')) return;

    db.latestNews = (db.latestNews || []).filter(n => n.ArticleID !== id);
    if (db.featuredNews && db.featuredNews.ArticleID === id) {
        db.featuredNews = db.latestNews[0] || null;
    }
    saveLocalDatabase();
    renderNewsTable();

    if (ADMIN_CONFIG.API_URL) {
        fetch(ADMIN_CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'deleteNews', id: id })
        }).catch(() => {});
    }

    showToast('ลบข่าวเรียบร้อยแล้ว', 'success');
};

// ==============================================================================
// 8. จัดการ GALLERY (ภาพกิจกรรม)
// ==============================================================================
function renderGalleryTable() {
    const tbody = document.getElementById('gallery-table-body');
    if (!tbody) return;

    const list = db.gallery || [];
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--gray-500);">ยังไม่มีภาพกิจกรรม กดปุ่ม "➕ เพิ่มภาพกิจกรรมใหม่" เพื่ออัปโหลด</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(g => `
        <tr>
            <td>
                ${g.DirectViewUrl ? `<img src="${g.DirectViewUrl}" style="width:50px; height:40px; object-fit:cover; border-radius:6px;">` : '📸'}
            </td>
            <td style="font-weight:600; color:var(--navy);">${g.Caption || ''}</td>
            <td style="font-size:13px; color:var(--gray-500);">${g.EventDate || '-'}</td>
            <td style="text-align:right;">
                <button class="btn-danger-sm" onclick="deleteGalleryItem('${g.ID}')">ลบ</button>
            </td>
        </tr>
    `).join('');

    renderOverviewMetrics();
}

window.openAddGalleryModal = function () {
    document.getElementById('form-gallery-modal').reset();
    openModal('modal-add-gallery');
};

window.submitGalleryForm = async function (e) {
    e.preventDefault();
    const caption = document.getElementById('gal-field-caption').value.trim();
    const date = document.getElementById('gal-field-date').value.trim();
    const fileInput = document.getElementById('gal-field-file');

    const saveBtn = document.getElementById('btn-save-gallery');
    saveBtn.disabled = true;
    saveBtn.textContent = 'กำลังอัปโหลดภาพ...';

    let directUrl = '';
    if (fileInput && fileInput.files.length > 0 && ADMIN_CONFIG.API_URL) {
        try {
            const file = fileInput.files[0];
            const base64 = await fileToBase64(file);
            const uploadRes = await fetch(ADMIN_CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'uploadFile',
                    folderCategory: 'gallery',
                    fileName: file.name,
                    mimeType: file.type,
                    base64: base64
                })
            });
            const json = await uploadRes.json();
            if (json && json.directUrl) directUrl = json.directUrl;
        } catch (err) {
            console.error(err);
        }
    }

    const newItem = {
        ID: 'GAL-' + Date.now(),
        Caption: caption,
        DirectViewUrl: directUrl,
        EventDate: date || '2569',
        Status: 'Active'
    };

    if (ADMIN_CONFIG.API_URL) {
        fetch(ADMIN_CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'saveGallery', ...newItem })
        }).catch(() => {});
    }

    db.gallery = [newItem, ...(db.gallery || [])];
    saveLocalDatabase();
    closeModal('modal-add-gallery');
    renderGalleryTable();
    showToast('เพิ่มภาพกิจกรรมเรียบร้อยแล้ว!', 'success');

    saveBtn.disabled = false;
    saveBtn.textContent = '🚀 บันทึกภาพกิจกรรม';
};

window.deleteGalleryItem = function (id) {
    if (!confirm('ยืนยันลบภาพกิจกรรมนี้?')) return;
    db.gallery = (db.gallery || []).filter(g => g.ID !== id);
    saveLocalDatabase();
    renderGalleryTable();
    if (ADMIN_CONFIG.API_URL) {
        fetch(ADMIN_CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'deleteGallery', id: id })
        }).catch(() => {});
    }
    showToast('ลบภาพกิจกรรมเรียบร้อย', 'success');
};

// ==============================================================================
// 9. จัดการ STAFF DIRECTORY (บุคลากร)
// ==============================================================================
function renderStaffTable() {
    const tbody = document.getElementById('staff-table-body');
    if (!tbody) return;

    const list = db.staff || [];
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--gray-500);">ยังไม่มีรายชื่อบุคลากร กดปุ่ม "➕ เพิ่มข้อมูลบุคลากร" เพื่อเพิ่มข้อมูล</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(s => `
        <tr>
            <td>
                ${s.DirectPhotoUrl ? `<img src="${s.DirectPhotoUrl}" style="width:36px; height:36px; object-fit:cover; border-radius:50%;">` : (s.AvatarEmoji || '👤')}
            </td>
            <td style="font-weight:600; color:var(--navy);">${s.FullName || ''}</td>
            <td>${s.RoleTitle || ''}</td>
            <td>${s.Department || '-'}</td>
            <td style="text-align:right;">
                <button class="btn-danger-sm" onclick="deleteStaffItem('${s.ID}')">ลบ</button>
            </td>
        </tr>
    `).join('');

    renderOverviewMetrics();
}

window.openAddStaffModal = function () {
    document.getElementById('form-staff-modal').reset();
    openModal('modal-add-staff');
};

window.submitStaffForm = async function (e) {
    e.preventDefault();
    const name = document.getElementById('staff-field-name').value.trim();
    const role = document.getElementById('staff-field-role').value.trim();
    const dept = document.getElementById('staff-field-dept').value.trim();
    const fileInput = document.getElementById('staff-field-file');

    const saveBtn = document.getElementById('btn-save-staff');
    saveBtn.disabled = true;
    saveBtn.textContent = 'กำลังบันทึกข้อมูล...';

    let directUrl = '';
    if (fileInput && fileInput.files.length > 0 && ADMIN_CONFIG.API_URL) {
        try {
            const file = fileInput.files[0];
            const base64 = await fileToBase64(file);
            const uploadRes = await fetch(ADMIN_CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'uploadFile',
                    folderCategory: 'staff',
                    fileName: file.name,
                    mimeType: file.type,
                    base64: base64
                })
            });
            const json = await uploadRes.json();
            if (json && json.directUrl) directUrl = json.directUrl;
        } catch (err) {
            console.error(err);
        }
    }

    const newItem = {
        ID: 'STAFF-' + Date.now(),
        FullName: name,
        RoleTitle: role,
        Department: dept,
        DirectPhotoUrl: directUrl,
        AvatarEmoji: '👤',
        Status: 'Active'
    };

    if (ADMIN_CONFIG.API_URL) {
        fetch(ADMIN_CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'saveStaff', ...newItem })
        }).catch(() => {});
    }

    db.staff = [...(db.staff || []), newItem];
    saveLocalDatabase();
    closeModal('modal-add-staff');
    renderStaffTable();
    showToast('เพิ่มข้อมูลบุคลากรเรียบร้อยแล้ว!', 'success');

    saveBtn.disabled = false;
    saveBtn.textContent = '🚀 บันทึกข้อมูลบุคลากร';
};

window.deleteStaffItem = function (id) {
    if (!confirm('ยืนยันลบข้อมูลบุคลากรนี้?')) return;
    db.staff = (db.staff || []).filter(s => s.ID !== id);
    saveLocalDatabase();
    renderStaffTable();
    if (ADMIN_CONFIG.API_URL) {
        fetch(ADMIN_CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'deleteStaff', id: id })
        }).catch(() => {});
    }
    showToast('ลบข้อมูลบุคลากรเรียบร้อย', 'success');
};

// ==============================================================================
// 10. CONTACT INQUIRIES & API CONFIG
// ==============================================================================
function renderContactTable() {
    const tbody = document.getElementById('contact-table-body');
    if (!tbody) return;

    const list = db.contacts || [];
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--gray-500);">ยังไม่มีข้อความส่งเข้ามาจากหน้าเว็บไซต์</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(c => `
        <tr>
            <td style="font-size:12px; color:var(--gray-500);">${c.Submitted_At || '-'}</td>
            <td style="font-weight:600;">${c.SenderName || ''}</td>
            <td>${c.Subject || ''}</td>
            <td style="font-size:13px;">${c.Message || ''}</td>
            <td style="font-size:12px;">${c.Phone || c.Email || '-'}</td>
        </tr>
    `).join('');
}

window.saveApiUrl = function () {
    const url = document.getElementById('input-api-url').value.trim();
    ADMIN_CONFIG.API_URL = url;
    localStorage.setItem('SCHOOL_API_URL', url);
    updateApiStatusIndicator();
    showToast('บันทึก Google Apps Script Web App URL เรียบร้อย', 'success');
};

window.testApiConnection = async function () {
    const url = document.getElementById('input-api-url').value.trim();
    if (!url) {
        showToast('กรุณาระบุ URL ก่อนทำการทดสอบ', 'error');
        return;
    }

    showToast('กำลังเชื่อมต่อทดสอบกับ Google Apps Script...', 'info');
    try {
        const res = await fetch(`${url}?action=getInitialData`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();
        if (json && json.success) {
            showToast('🟢 เชื่อมต่อสำเร็จ! ดึงข้อมูลจาก Google Spreadsheet ได้สมบูรณ์', 'success');
            syncDataWithBackend(true);
        } else {
            showToast('เชื่อมต่อได้แต่รูปแบบข้อมูลไม่ถูกต้อง: ' + JSON.stringify(json), 'error');
        }
    } catch (err) {
        showToast('❌ ไม่สามารถเชื่อมต่อได้: ' + err.message, 'error');
    }
};

window.syncDataWithBackend = async function (notify = true) {
    if (!ADMIN_CONFIG.API_URL) {
        if (notify) showToast('ยังไม่ได้ระบุ Web App URL', 'error');
        return;
    }

    try {
        const res = await fetch(`${ADMIN_CONFIG.API_URL}?action=getInitialData`);
        const json = await res.json();
        if (json && json.success && json.data) {
            db = { ...db, ...json.data };
            saveLocalDatabase();
            initUI();
            if (notify) showToast('อัปเดตข้อมูลล่าสุดจาก Google Sheets สำเร็จ!', 'success');
        }
    } catch (err) {
        if (notify) showToast('ไม่สามารถดึงข้อมูลสดได้: ' + err.message, 'error');
    }
};

window.clearScriptCache = async function () {
    if (!ADMIN_CONFIG.API_URL) {
        showToast('ต้องระบุ URL ก่อนล้างแคช', 'error');
        return;
    }

    try {
        await fetch(`${ADMIN_CONFIG.API_URL}?action=clearCache`);
        showToast('สั่งล้างแคช Script CacheService บน Google สำเร็จ', 'success');
    } catch (err) {
        showToast('เกิดข้อผิดพลาดในการล้างแคช', 'error');
    }
};

window.exportDataJson = function () {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `school_backup_${Date.now()}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('ดาวน์โหลดไฟล์สำรองข้อมูล JSON เรียบร้อยแล้ว', 'success');
};

// ==============================================================================
// 10.5 FACEBOOK AUTO-SYNC (ตั้งค่า / เปิด-ปิด Trigger / ซิงค์ทันที)
// ==============================================================================
const FB_TOKEN_MASK = '••••••••';

function setFbTriggerStatus(active) {
    const pill = document.getElementById('fb-trigger-status');
    if (!pill) return;
    if (active) {
        pill.className = 'status-pill pill-online';
        pill.innerHTML = '🟢 เปิดใช้งานอยู่ (ซิงค์ทุก 1 ชั่วโมง)';
    } else {
        pill.className = 'status-pill pill-offline';
        pill.innerHTML = '🔴 ยังไม่เปิดใช้งาน';
    }
}

async function postToBackend(payload) {
    const res = await fetch(ADMIN_CONFIG.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
    });
    return res.json();
}

function requireApiUrl() {
    if (!ADMIN_CONFIG.API_URL) {
        showToast('ต้องระบุ Google Apps Script Web App URL ก่อน (ตั้งค่าที่แท็บตั้งค่าระบบ)', 'error');
        return false;
    }
    return true;
}

window.loadFacebookSettings = async function () {
    const pageInput = document.getElementById('fb-page-id');
    const tokenInput = document.getElementById('fb-access-token');
    if (!pageInput || !tokenInput) return;

    if (!ADMIN_CONFIG.API_URL) {
        setFbTriggerStatus(false);
        return;
    }

    try {
        const res = await fetch(`${ADMIN_CONFIG.API_URL}?action=getFacebookSettings`);
        const json = await res.json();
        if (json && json.success) {
            pageInput.value = json.fb_page_id || '';
            tokenInput.value = json.fb_has_token ? FB_TOKEN_MASK : '';
            setFbTriggerStatus(!!json.fb_trigger_active);
        }
    } catch (err) {
        showToast('โหลดการตั้งค่า Facebook ไม่สำเร็จ: ' + err.message, 'error');
    }
};

window.saveFacebookSettings = async function () {
    if (!requireApiUrl()) return;

    const pageId = document.getElementById('fb-page-id').value.trim();
    const token = document.getElementById('fb-access-token').value.trim();

    if (!pageId) {
        showToast('กรุณากรอก Facebook Page ID', 'error');
        return;
    }
    if (!token) {
        showToast('กรุณากรอก Page Access Token', 'error');
        return;
    }

    try {
        // ถ้าช่อง Token ยังเป็นตัวจุดที่ระบบซ่อนไว้ backend จะคงค่าเดิมไว้ให้
        const json = await postToBackend({ action: 'saveFacebookSettings', fb_page_id: pageId, fb_access_token: token });
        if (json && json.success) {
            showToast(json.message || 'บันทึกการตั้งค่า Facebook สำเร็จ', 'success');
            document.getElementById('fb-access-token').value = FB_TOKEN_MASK;
        } else {
            showToast((json && json.error) || 'บันทึกไม่สำเร็จ', 'error');
        }
    } catch (err) {
        showToast('บันทึกไม่สำเร็จ: ' + err.message, 'error');
    }
};

window.enableFacebookTrigger = async function () {
    if (!requireApiUrl()) return;
    try {
        const json = await postToBackend({ action: 'setupFacebookTrigger' });
        if (json && json.success) {
            showToast(json.message, 'success');
            setFbTriggerStatus(true);
        } else {
            showToast((json && json.error) || 'เปิดระบบซิงค์ไม่สำเร็จ', 'error');
        }
    } catch (err) {
        showToast('เปิดระบบซิงค์ไม่สำเร็จ: ' + err.message, 'error');
    }
};

window.disableFacebookTrigger = async function () {
    if (!requireApiUrl()) return;
    try {
        const json = await postToBackend({ action: 'removeFacebookTrigger' });
        if (json && json.success) {
            showToast(json.message, 'success');
            setFbTriggerStatus(false);
        } else {
            showToast((json && json.error) || 'ปิดระบบซิงค์ไม่สำเร็จ', 'error');
        }
    } catch (err) {
        showToast('ปิดระบบซิงค์ไม่สำเร็จ: ' + err.message, 'error');
    }
};

window.forceSyncFacebook = async function () {
    if (!requireApiUrl()) return;
    showToast('กำลังดึงโพสต์จาก Facebook... (อาจใช้เวลาสักครู่)', 'info');
    try {
        const res = await fetch(`${ADMIN_CONFIG.API_URL}?action=forceSyncFacebook`);
        const json = await res.json();
        if (json && json.success) {
            showToast(json.message, 'success');
            if (json.added > 0) syncDataWithBackend(false);
        } else {
            showToast((json && (json.message || json.error)) || 'ซิงค์ไม่สำเร็จ', 'error');
        }
    } catch (err) {
        showToast('ซิงค์ไม่สำเร็จ: ' + err.message, 'error');
    }
};

// ==============================================================================
// 11. HELPER UTILITIES
// ==============================================================================
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ย่อรูปก่อนอัปโหลด (ด้านยาวสุด 1600px, JPEG 85%) ให้อัปโหลดหลายรูปได้เร็วขึ้น
// หากย่อไม่ได้หรือไฟล์ไม่เล็กลง จะใช้ไฟล์ต้นฉบับ
async function prepareImageForUpload(file) {
    const MAX_SIDE = 1600;
    try {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error('keep original');

        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        if (bitmap.close) bitmap.close();

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.85));
        if (!blob || blob.size >= file.size) throw new Error('keep original');

        return {
            base64: await fileToBase64(blob),
            mimeType: 'image/jpeg',
            fileName: file.name.replace(/\.[^.]+$/, '') + '.jpg'
        };
    } catch (e) {
        return { base64: await fileToBase64(file), mimeType: file.type, fileName: file.name };
    }
}

window.openModal = function (id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('active');
};

window.closeModal = function (id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('active');
};

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

function showToast(msg, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${msg}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

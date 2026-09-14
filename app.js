/**
 * ==============================================================================
 * JavaScript ควบคุมการทำงานและเชื่อมต่อระบบหลังบ้าน (GAS + Sheets + Drive)
 * โรงเรียนตัวอย่างวิทยา - School of Excellence
 * ==============================================================================
 */

// ── การตั้งค่าระบบ ──
const CONFIG = {
    // ผู้ใช้สามารถระบุ Web App URL ของ Google Apps Script ได้ที่นี่ หรือบันทึกผ่าน Admin Panel ในเว็บ
    API_URL: localStorage.getItem('SCHOOL_API_URL') || '',
    ADMIN_PIN: 'admin1234',
    CACHE_KEY: 'SCHOOL_LOCAL_CACHE_V1'
};

// ── ข้อมูลเริ่มต้นสำรอง (Fallback Seed Data ให้เว็บแสดงผลสวยงามทันที 100%) ──
const DEFAULT_DATA = {
    settings: {
        school_name_th: 'โรงเรียนตัวอย่างวิทยา',
        school_name_en: 'School of Excellence',
        school_motto: 'School of Excellence · มุ่งสู่ความเป็นเลิศ',
        school_logo_abbr: 'ตว.',
        school_logo_url: '',
        address: '123 ถนนการศึกษา ตำบลวิทยา อำเภอเมือง จังหวัดตัวอย่าง 10100',
        phone: '02-123-4567',
        email: 'contact@school.ac.th',
        office_hours: 'จ.-ศ. 08.00–16.30 น.',
        social_facebook: '#',
        social_youtube: '#',
        social_instagram: '#',
        copyright_text: '© 2569 โรงเรียนตัวอย่างวิทยา · พัฒนาโดย SchoolWeb System · สงวนลิขสิทธิ์ทุกประการ'
    },
    hero: [
        {
            BadgeText: '🏫 ยินดีต้อนรับทุกท่าน',
            Title: 'ยินดีต้อนรับสู่<br>โรงเรียนตัวอย่างวิทยา',
            Subtitle: 'School of Excellence · มุ่งสู่ความเป็นเลิศ',
            Btn1Text: 'รู้จักเรา →',
            Btn1Link: '#',
            Btn2Text: 'สมัครเรียน',
            Btn2Link: '#'
        }
    ],
    stats: [
        { IconEmoji: '👨‍🎓', NumberValue: '2,500+', Label: 'นักเรียน' },
        { IconEmoji: '📚', NumberValue: '8', Label: 'กลุ่มสาระ' },
        { IconEmoji: '🚪', NumberValue: '60', Label: 'ห้องเรียน' },
        { IconEmoji: '👩‍🏫', NumberValue: '59', Label: 'บุคลากรในสังคมสถาบัน' }
    ],
    quickAccess: [
        { IconEmoji: '📰', Title: 'ประชาสัมพันธ์', TargetURL: '#' },
        { IconEmoji: '📝', Title: 'รับสมัครงาน', TargetURL: '#' },
        { IconEmoji: '🛒', Title: 'จัดซื้อจ้าง', TargetURL: '#' },
        { IconEmoji: '⬇️', Title: 'เอกสารดาวน์โหลด', TargetURL: '#' },
        { IconEmoji: '🖼️', Title: 'ภาพกิจกรรม', TargetURL: '#' },
        { IconEmoji: '👥', Title: 'ข้อมูลบุคลากร', TargetURL: '#' },
        { IconEmoji: '📞', Title: 'ติดต่อโรงเรียน', TargetURL: '#' },
        { IconEmoji: '🏫', Title: 'เว็บโรงเรียนใน', TargetURL: '#' }
    ],
    featuredNews: {
        ArticleID: 'NEWS-001',
        Category: 'ประชาสัมพันธ์',
        CategoryBadgeClass: 'cat-news',
        Title: 'ประกาศเปิดภาคเรียนที่ 1 ปีการศึกษา 2569',
        Excerpt: 'โรงเรียนตัวอย่างวิทยา ขอแจ้งกำหนดการเปิดภาคเรียนที่ 1 ปีการศึกษา 2569 และรายละเอียดสำคัญที่นักเรียนและผู้ปกครองควรทราบก่อนเปิดเทอม',
        Content: 'โรงเรียนตัวอย่างวิทยา ขอแจ้งกำหนดการเปิดภาคเรียนที่ 1 ปีการศึกษา 2569 อย่างเป็นทางการ\n\n1. กำหนดการเปิดภาคเรียน: วันที่ 16 พฤษภาคม 2569\n2. การแต่งกาย: ให้นักเรียนแต่งกายด้วยชุดนักเรียนที่ถูกต้องตามระเบียบของโรงเรียน\n3. การรับหนังสือเรียนและอุปกรณ์: ติดต่อรับได้ที่อาคารเรียน 1 ในวันและเวลาราชการ\n\nหากมีข้อสงสัยประการใด สามารถติดต่อสอบถามได้ที่ห้องธุรการ โทร 02-123-4567',
        DirectCoverUrl: '',
        IsPinned: true,
        PublishDate: '23 พ.ค. 2569',
        Author: 'admin',
        ViewCount: 542
    },
    latestNews: [
        {
            ArticleID: 'NEWS-001',
            Category: 'ประชาสัมพันธ์',
            CategoryBadgeClass: 'cat-news',
            Title: 'ประกาศเปิดภาคเรียนที่ 1 ปีการศึกษา 2569',
            Excerpt: 'โรงเรียนตัวอย่างวิทยา ขอแจ้งกำหนดการเปิดภาคเรียนที่ 1 ปีการศึกษา 2569',
            Content: 'โรงเรียนตัวอย่างวิทยา ขอแจ้งกำหนดการเปิดภาคเรียนที่ 1 ปีการศึกษา 2569...',
            PublishDate: '23 พ.ค. 2569',
            Author: 'admin',
            ViewCount: 5,
            gradient: 'linear-gradient(135deg,#1a2d6d,#2a3f8f)'
        },
        {
            ArticleID: 'NEWS-002',
            Category: 'ข่าวกิจกรรม',
            CategoryBadgeClass: 'cat-activity',
            Title: 'กิจกรรมวันวิทยาศาสตร์แห่งชาติ ประจำปี 2569',
            Excerpt: 'นักเรียนเข้าร่วมกิจกรรมวันวิทยาศาสตร์ฯ จำนวน 18-20 สิงหาคมนี้',
            Content: 'ขอเชิญชวนนักเรียนทุกระดับชั้นร่วมกิจกรรมสัปดาห์วิทยาศาสตร์ ประจำปี 2569 ชิงทุนการศึกษาและเกียรติบัตรมากมาย...',
            PublishDate: '23 พ.ค. 2569',
            Author: 'admin',
            ViewCount: 3,
            gradient: 'linear-gradient(135deg,#166534,#16a34a)'
        },
        {
            ArticleID: 'NEWS-003',
            Category: 'จัดซื้อจ้าง',
            CategoryBadgeClass: 'cat-procurement',
            Title: 'ประกาศประกวดราคาจัดซื้อครุภัณฑ์คอมพิวเตอร์',
            Excerpt: 'โรงเรียนตัวอย่างวิทยา ประกาศประกวดราคาจัดซื้อครุภัณฑ์คอมพิวเตอร์ประจำปี 2569',
            Content: 'โรงเรียนตัวอย่างวิทยา มีความประสงค์จะประกวดราคาซื้อครุภัณฑ์คอมพิวเตอร์เพื่อการเรียนการสอน ด้วยวิธีประกวดราคาอิเล็กทรอนิกส์ (e-bidding)...',
            PublishDate: '23 พ.ค. 2569',
            Author: 'admin',
            ViewCount: 3,
            gradient: 'linear-gradient(135deg,#6d1a6d,#9f3a9f)'
        },
        {
            ArticleID: 'NEWS-004',
            Category: 'รับสมัครงาน',
            CategoryBadgeClass: 'cat-job',
            Title: 'รับสมัครครูอัตราจ้าง วิชาภาษาอังกฤษ จำนวน 1 อัตรา',
            Excerpt: 'รับสมัครครูอัตราจ้างวิชาภาษาอังกฤษ อัตราเงินเดือน 15,000 บาท',
            Content: 'เปิดรับสมัครบุคคลเพื่อเลือกสรรเป็นครูอัตราจ้าง วิชาเอกภาษาอังกฤษ ผู้สนใจสามารถยื่นใบสมัครด้วยตนเองได้ที่ห้องบุคคล...',
            PublishDate: '23 พ.ค. 2569',
            Author: 'admin',
            ViewCount: 4,
            gradient: 'linear-gradient(135deg,#92400e,#d97706)'
        },
        {
            ArticleID: 'NEWS-005',
            Category: 'ผลงานนักเรียน',
            CategoryBadgeClass: 'cat-academic',
            Title: 'นักเรียนคว้ารางวัลเหรียญทอง คณิตศาสตร์โอลิมปิก',
            Excerpt: 'นักเรียนโรงเรียนตัวอย่างวิทยา ได้รับรางวัลเหรียญทองในการแข่งขันคณิตศาสตร์โอลิมปิก',
            Content: 'ขอแสดงความยินดีกับ นายฉลาด เก่งกาจ นักเรียนชั้น ม.6/1 ที่สามารถคว้าเหรียญทองการแข่งขันคณิตศาสตร์โอลิมปิกระดับชาติ...',
            PublishDate: '23 พ.ค. 2569',
            Author: 'admin',
            ViewCount: 2,
            gradient: 'linear-gradient(135deg,#1e3a5f,#2563eb)'
        },
        {
            ArticleID: 'NEWS-006',
            Category: 'ประชาสัมพันธ์',
            CategoryBadgeClass: 'cat-news',
            Title: 'แจ้งหยุดเรียนกรณีพิเศษ ประจำเดือนพฤษภาคม',
            Excerpt: 'แจ้งกำหนดการหยุดเรียนกรณีพิเศษ สำหรับนักเรียนทุกระดับชั้น',
            Content: 'โรงเรียนแจ้งหยุดเรียนกรณีพิเศษเนื่องจากจัดการอบรมพัฒนาบุคลากรครู โดยจะไม่มีการเรียนการสอนในวันที่ 28 พฤษภาคม 2569...',
            PublishDate: '23 พ.ค. 2569',
            Author: 'admin',
            ViewCount: 2,
            gradient: 'linear-gradient(135deg,#1a2d6d,#374151)'
        }
    ],
    gallery: [
        { ID: 'GAL-01', Caption: 'พิธีไหว้ครูประจำปี 2569', IconEmoji: '🎓', gradient: 'linear-gradient(135deg,#1a2d6d,#2563eb)' },
        { ID: 'GAL-02', Caption: 'กิจกรรมวันสำคัญแห่งชาติ', IconEmoji: '🏃', gradient: 'linear-gradient(135deg,#166534,#22c55e)' },
        { ID: 'GAL-03', Caption: 'กีฬาสีในโรงเรียน', IconEmoji: '⚽', gradient: 'linear-gradient(135deg,#7c2d12,#f97316)' },
        { ID: 'GAL-04', Caption: 'ค่ายวิทยาศาสตร์', IconEmoji: '🔬', gradient: 'linear-gradient(135deg,#4c1d95,#8b5cf6)' }
    ],
    staff: [
        { FullName: 'นายอำนาจ วิทยาลัย', RoleTitle: 'ผู้อำนวยการ', AvatarEmoji: '👨‍💼' },
        { FullName: 'นางสมหญิง จัดการศน', RoleTitle: 'รองผู้อำนวยการ ฝ่ายวิชาการ', AvatarEmoji: '👩‍💼' },
        { FullName: 'นายสยาม โดดี', RoleTitle: 'รองผู้อำนวยการ ฝ่ายบุคคล', AvatarEmoji: '👨‍💼' },
        { FullName: 'นางวารุณี สดแม่ง', RoleTitle: 'ส่วนตัวบริหาร ครั้ง 1 หัว', AvatarEmoji: '👩‍💼' }
    ]
};

// ข้อมูลสถานะปัจจุบันในหน่วยความจำ
let currentSiteData = { ...DEFAULT_DATA };

// ==============================================================================
// 1. การโหลดและผสานข้อมูล (Data Hydration)
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. ดึงข้อมูลจาก LocalStorage ก่อน (Stale-While-Revalidate เพื่อโหลดทันทีใน 0 วินาที)
    const cached = localStorage.getItem(CONFIG.CACHE_KEY);
    if (cached) {
        try {
            currentSiteData = JSON.parse(cached);
            renderAll(currentSiteData);
        } catch (e) {
            renderAll(DEFAULT_DATA);
        }
    } else {
        renderAll(DEFAULT_DATA);
    }

    // 2. ดึงข้อมูลสดจาก Google Apps Script API ในพื้นหลัง
    fetchLiveData();

    // 3. ผูก Events ให้กับปุ่มและส่วนต่างๆ
    setupEvents();
});

async function fetchLiveData() {
    if (!CONFIG.API_URL) {
        console.log('📌 กำลังทำงานในโหมด Standalone (ยังไม่ได้ระบุ Google Apps Script Web App URL)');
        return;
    }

    try {
        const res = await fetch(`${CONFIG.API_URL}?action=getInitialData`);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const json = await res.json();

        if (json && json.success && json.data) {
            currentSiteData = json.data;
            localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(currentSiteData));
            renderAll(currentSiteData);
            console.log('✅ โหลดข้อมูลสดจาก Google Apps Script สำเร็จ');
        }
    } catch (err) {
        console.warn('⚠️ ไม่สามารถเชื่อมต่อ Google Apps Script ได้ (ใช้ข้อมูลแคช):', err);
    }
}

// ==============================================================================
// 2. ฟังก์ชันเรนเดอร์ข้อมูลลงใน DOM แต่ละส่วน
// ==============================================================================
function renderAll(data) {
    if (data.settings) renderSettings(data.settings);
    if (data.hero && data.hero.length > 0) renderHero(data.hero[0]);
    if (data.stats && data.stats.length > 0) renderStats(data.stats);
    if (data.quickAccess && data.quickAccess.length > 0) renderQuickAccess(data.quickAccess);
    if (data.featuredNews) renderFeaturedNews(data.featuredNews);
    if (data.latestNews) renderNewsGrid(data.latestNews);
    if (data.gallery) renderGallery(data.gallery);
    if (data.staff) renderStaff(data.staff);
}

function renderSettings(s) {
    // Topbar
    const addr = document.getElementById('topbar-address');
    if (addr && s.address) addr.textContent = `📍 ${s.address}`;

    const phone = document.getElementById('topbar-phone');
    if (phone && s.phone) phone.textContent = `📞 ${s.phone}`;

    const email = document.getElementById('topbar-email');
    if (email && s.email) email.textContent = `✉️ ${s.email}`;

    // Header Logo & Name
    const logoAbbr = document.getElementById('logo-abbr');
    if (logoAbbr && s.school_logo_abbr) logoAbbr.textContent = s.school_logo_abbr;

    const schoolTitle = document.getElementById('school-title');
    if (schoolTitle && s.school_name_th) schoolTitle.textContent = s.school_name_th;

    const schoolMotto = document.getElementById('school-motto');
    if (schoolMotto && s.school_motto) schoolMotto.textContent = s.school_motto;

    // Footer
    const footerContact = document.getElementById('footer-contact-info');
    if (footerContact) {
        footerContact.innerHTML = `
            <span>📍 ${s.address || ''}</span>
            <span>📞 ${s.phone || ''}</span>
            <span>✉️ ${s.email || ''}</span>
            <span>🕐 ${s.office_hours || 'จ.-ศ. 08.00–16.30 น.'}</span>
        `;
    }

    const footerCopy = document.getElementById('footer-copyright');
    if (footerCopy && s.copyright_text) footerCopy.textContent = s.copyright_text;
}

function renderHero(h) {
    const badge = document.getElementById('hero-badge');
    if (badge && h.BadgeText) badge.textContent = h.BadgeText;

    const title = document.getElementById('hero-title');
    if (title && h.Title) title.innerHTML = h.Title;

    const sub = document.getElementById('hero-subtitle');
    if (sub && h.Subtitle) sub.textContent = h.Subtitle;

    const btn1 = document.getElementById('hero-btn1');
    if (btn1 && h.Btn1Text) {
        btn1.textContent = h.Btn1Text;
        if (h.Btn1Link) btn1.href = h.Btn1Link;
    }

    const btn2 = document.getElementById('hero-btn2');
    if (btn2 && h.Btn2Text) {
        btn2.textContent = h.Btn2Text;
        if (h.Btn2Link) btn2.href = h.Btn2Link;
    }
}

function renderStats(stats) {
    const container = document.getElementById('stats-grid');
    if (!container) return;

    container.innerHTML = stats.map(st => `
        <div class="stat-item">
            <div class="stat-icon">${st.IconEmoji || '📊'}</div>
            <div class="stat-num">${st.NumberValue || '0'}</div>
            <div class="stat-label">${st.Label || ''}</div>
        </div>
    `).join('');
}

function renderQuickAccess(items) {
    const container = document.getElementById('quick-grid');
    if (!container) return;

    container.innerHTML = items.map(q => `
        <a class="quick-item" href="${q.TargetURL || '#'}" ${q.OpenNewTab ? 'target="_blank"' : ''}>
            <div class="quick-icon"><span>${q.IconEmoji || '📌'}</span></div>
            <span class="quick-label">${q.Title || ''}</span>
        </a>
    `).join('');
}

function renderFeaturedNews(n) {
    const container = document.getElementById('featured-card-wrapper');
    if (!container || !n) return;

    const imgHtml = n.DirectCoverUrl
        ? `<img src="${n.DirectCoverUrl}" alt="${n.Title}">`
        : `<div class="featured-img"><span class="featured-badge">📌 ปักหมุด</span></div>`;

    container.innerHTML = `
        <div class="featured-card">
            <div class="featured-img" style="position:relative">
                ${n.DirectCoverUrl ? `<img src="${n.DirectCoverUrl}" alt="${n.Title}">` : ''}
                <span class="featured-badge">📌 ปักหมุด</span>
            </div>
            <div class="featured-body">
                <div class="featured-cat">📢 ${n.Category || 'ประชาสัมพันธ์'} · ${n.PublishDate || ''}</div>
                <div class="featured-title">${n.Title || ''}</div>
                <div class="featured-desc">${n.Excerpt || ''}</div>
                <div class="featured-meta">
                    <span>👤 ${n.Author || 'admin'}</span>
                    <span>👁 <span id="feat-views">${n.ViewCount || 0}</span> ครั้ง</span>
                </div>
                <button class="read-more" onclick="openNewsModal('${n.ArticleID}')">อ่านต่อ →</button>
            </div>
        </div>
    `;
}

function renderNewsGrid(newsList) {
    const container = document.getElementById('news-grid');
    if (!container) return;

    container.innerHTML = newsList.map((n, idx) => {
        const badgeClass = n.CategoryBadgeClass || 'cat-news';
        const coverHtml = n.DirectCoverUrl
            ? `<img src="${n.DirectCoverUrl}" alt="${n.Title}">`
            : '';
        const bgStyle = n.DirectCoverUrl ? '' : (n.gradient || 'background:linear-gradient(135deg,#1a2d6d,#2a3f8f)');

        return `
            <div class="news-card">
                <div class="news-img" style="${bgStyle}">
                    ${coverHtml}
                    📢<span class="news-cat-badge ${badgeClass}">${n.Category || 'ข่าวสาร'}</span>
                </div>
                <div class="news-body">
                    <div class="news-meta">
                        <span>📅 ${n.PublishDate || ''}</span>
                        <span>👁 ${n.ViewCount || 0} อ่าน</span>
                    </div>
                    <div class="news-title">${n.Title || ''}</div>
                    <div class="news-excerpt">${n.Excerpt || ''}</div>
                    <div class="news-footer">
                        <span class="news-author"><span class="author-avatar">👤</span>${n.Author || 'admin'}</span>
                        <button class="news-link" onclick="openNewsModal('${n.ArticleID}')">อ่านต่อ →</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function renderGallery(items) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    container.innerHTML = items.map(g => {
        const bgStyle = g.DirectViewUrl ? '' : (g.gradient || 'background:linear-gradient(135deg,#1a2d6d,#2563eb)');
        const imgHtml = g.DirectViewUrl ? `<img src="${g.DirectViewUrl}" alt="${g.Caption}">` : (g.IconEmoji || '🖼️');

        return `
            <div class="gallery-item" style="${bgStyle}">
                ${imgHtml}
                <div class="gallery-caption">${g.Caption || ''}</div>
            </div>
        `;
    }).join('');
}

function renderStaff(staffList) {
    const container = document.getElementById('staff-grid');
    if (!container) return;

    container.innerHTML = staffList.map(s => {
        const avatarHtml = s.DirectPhotoUrl
            ? `<img src="${s.DirectPhotoUrl}" alt="${s.FullName}">`
            : (s.AvatarEmoji || '👨‍💼');

        return `
            <div class="staff-card">
                <div class="staff-avatar">${avatarHtml}</div>
                <div class="staff-name">${s.FullName || ''}</div>
                <div class="staff-role">${s.RoleTitle || ''}</div>
            </div>
        `;
    }).join('');
}

// ==============================================================================
// 3. โมดอลอ่านข่าวฉบับเต็ม & เพิ่มยอดวิว
// ==============================================================================
window.openNewsModal = async function (id) {
    const modal = document.getElementById('news-modal');
    if (!modal) return;

    // หาข้อมูลข่าวในแคชปัจจุบันก่อน
    let item = null;
    if (currentSiteData.featuredNews && currentSiteData.featuredNews.ArticleID === id) {
        item = currentSiteData.featuredNews;
    } else if (currentSiteData.latestNews) {
        item = currentSiteData.latestNews.find(n => n.ArticleID === id);
    }

    if (!item) {
        showToast('ไม่พบเนื้อหาข่าวที่เลือก', 'error');
        return;
    }

    // อัปเดตข้อมูลลงใน Modal
    document.getElementById('modal-news-title').textContent = item.Title || '';
    document.getElementById('modal-news-meta').innerHTML = `
        <span>📂 ${item.Category || 'ข่าวสาร'}</span>
        <span>📅 ${item.PublishDate || ''}</span>
        <span>👤 ${item.Author || 'admin'}</span>
        <span>👁 <span id="modal-view-count">${(item.ViewCount || 0) + 1}</span> เข้าชม</span>
    `;

    const imgContainer = document.getElementById('modal-news-img-wrap');
    if (imgContainer) {
        if (item.DirectCoverUrl) {
            imgContainer.innerHTML = `<img src="${item.DirectCoverUrl}" class="modal-news-img" alt="${item.Title}">`;
            imgContainer.style.display = 'block';
        } else {
            imgContainer.style.display = 'none';
        }
    }

    document.getElementById('modal-news-body').textContent = item.Content || item.Excerpt || '';

    // เพิ่มยอดวิวในหน่วยความจำ
    item.ViewCount = (item.ViewCount || 0) + 1;

    // เรียก API หลังบ้านเพื่อบันทึกยอดวิว +1 ใน Google Sheets
    if (CONFIG.API_URL) {
        fetch(`${CONFIG.API_URL}?action=getNewsDetail&id=${id}`).catch(() => {});
    }

    modal.classList.add('active');
};

window.closeNewsModal = function () {
    const modal = document.getElementById('news-modal');
    if (modal) modal.classList.remove('active');
};

// ==============================================================================
// 4. ระบบค้นหาแบบเรียลไทม์ (Live Search)
// ==============================================================================
function setupEvents() {
    const searchInput = document.getElementById('site-search-input');
    const dropdown = document.getElementById('search-dropdown');

    if (searchInput && dropdown) {
        searchInput.addEventListener('input', (e) => {
            const val = e.target.value.trim().toLowerCase();
            if (!val) {
                dropdown.classList.remove('active');
                dropdown.innerHTML = '';
                return;
            }

            const newsMatches = (currentSiteData.latestNews || []).filter(n =>
                (n.Title || '').toLowerCase().includes(val) || (n.Excerpt || '').toLowerCase().includes(val)
            );

            const staffMatches = (currentSiteData.staff || []).filter(s =>
                (s.FullName || '').toLowerCase().includes(val) || (s.RoleTitle || '').toLowerCase().includes(val)
            );

            if (newsMatches.length === 0 && staffMatches.length === 0) {
                dropdown.innerHTML = '<div style="padding:16px;text-align:center;color:#8892b0;font-size:13px">ไม่พบข้อมูลที่ค้นหา</div>';
            } else {
                let html = '';
                if (newsMatches.length > 0) {
                    html += '<div class="search-group-title">ข่าวสารและประกาศ</div>';
                    newsMatches.slice(0, 4).forEach(n => {
                        html += `
                            <div class="search-result-item" onclick="openNewsModal('${n.ArticleID}'); document.getElementById('search-dropdown').classList.remove('active');">
                                <div class="search-thumb">📰</div>
                                <div class="search-info">
                                    <div class="search-title">${n.Title}</div>
                                    <div class="search-sub">${n.Category} · ${n.PublishDate}</div>
                                </div>
                            </div>
                        `;
                    });
                }
                if (staffMatches.length > 0) {
                    html += '<div class="search-group-title">บุคลากร</div>';
                    staffMatches.slice(0, 4).forEach(s => {
                        html += `
                            <div class="search-result-item">
                                <div class="search-thumb">${s.AvatarEmoji || '👤'}</div>
                                <div class="search-info">
                                    <div class="search-title">${s.FullName}</div>
                                    <div class="search-sub">${s.RoleTitle}</div>
                                </div>
                            </div>
                        `;
                    });
                }
                dropdown.innerHTML = html;
            }
            dropdown.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }

    // ผูกปุ่มเข้าสู่ระบบด้านบน
    const loginBtn = document.getElementById('btn-topbar-login');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openAdminModal();
        });
    }
}

// ==============================================================================
// 5. ระบบแผงควบคุมผู้ดูแลระบบ (Admin Management Panel)
// ==============================================================================
let isAdminLoggedIn = false;

window.openAdminModal = function () {
    if (isAdminLoggedIn) {
        document.getElementById('admin-dashboard-modal').classList.add('active');
        updateApiStatusIndicator();
    } else {
        document.getElementById('admin-login-modal').classList.add('active');
    }
};

window.closeAdminLoginModal = function () {
    document.getElementById('admin-login-modal').classList.remove('active');
};

window.closeAdminDashboardModal = function () {
    document.getElementById('admin-dashboard-modal').classList.remove('active');
};

window.checkAdminLogin = function () {
    const input = document.getElementById('admin-pin-input');
    if (input && input.value === CONFIG.ADMIN_PIN) {
        isAdminLoggedIn = true;
        closeAdminLoginModal();
        input.value = '';
        document.getElementById('admin-dashboard-modal').classList.add('active');
        showToast('เข้าสู่ระบบผู้ดูแลเรียบร้อยแล้ว', 'success');
        updateApiStatusIndicator();
        renderAdminNewsTable();
    } else {
        showToast('รหัสผ่านไม่ถูกต้อง (ค่าเริ่มต้นคือ admin1234)', 'error');
    }
};

window.switchAdminTab = function (tabName) {
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');

    const btn = document.getElementById(`tab-btn-${tabName}`);
    const content = document.getElementById(`tab-content-${tabName}`);
    if (btn) btn.classList.add('active');
    if (content) content.style.display = 'block';

    if (tabName === 'manage-news') renderAdminNewsTable();
};

function updateApiStatusIndicator() {
    const statusEl = document.getElementById('api-status-badge');
    const urlInput = document.getElementById('setting-api-url');
    if (urlInput) urlInput.value = CONFIG.API_URL;

    if (statusEl) {
        if (CONFIG.API_URL) {
            statusEl.className = 'status-badge status-online';
            statusEl.innerHTML = '🟢 เชื่อมต่อกับ Google Apps Script แล้ว';
        } else {
            statusEl.className = 'status-badge status-offline';
            statusEl.innerHTML = '🟡 โหมดจำลอง (ยังไม่ได้เชื่อมต่อ Apps Script URL)';
        }
    }
}

window.saveApiUrl = function () {
    const url = document.getElementById('setting-api-url').value.trim();
    CONFIG.API_URL = url;
    localStorage.setItem('SCHOOL_API_URL', url);
    updateApiStatusIndicator();
    showToast('บันทึกการตั้งค่า API URL เรียบร้อย', 'success');
    fetchLiveData();
};

window.submitNewArticle = async function (e) {
    e.preventDefault();
    const title = document.getElementById('news-input-title').value.trim();
    const category = document.getElementById('news-input-category').value;
    const excerpt = document.getElementById('news-input-excerpt').value.trim();
    const content = document.getElementById('news-input-content').value.trim();
    const isPinned = document.getElementById('news-input-pinned').checked;
    const fileInput = document.getElementById('news-input-file');

    if (!title || !excerpt) {
        showToast('กรุณากรอกหัวข้อข่าวและเนื้อหาย่อ', 'error');
        return;
    }

    const submitBtn = document.getElementById('btn-submit-news');
    submitBtn.disabled = true;
    submitBtn.textContent = 'กำลังบันทึกข้อมูล...';

    let directCoverUrl = '';

    // ถ้ามีเลือกไฟล์ภาพและต่อ API ไว้ ให้อัปโหลดลง Google Drive
    if (fileInput && fileInput.files.length > 0 && CONFIG.API_URL) {
        try {
            submitBtn.textContent = 'กำลังอัปโหลดรูปลง Google Drive...';
            const file = fileInput.files[0];
            const base64 = await fileToBase64(file);

            const uploadRes = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'uploadFile',
                    folderCategory: 'news',
                    fileName: file.name,
                    mimeType: file.type,
                    base64: base64
                })
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.success) {
                directCoverUrl = uploadJson.directUrl;
            }
        } catch (err) {
            console.error('Upload to Drive error:', err);
        }
    }

    const badgeMap = {
        'ประชาสัมพันธ์': 'cat-news',
        'ข่าวกิจกรรม': 'cat-activity',
        'จัดซื้อจ้าง': 'cat-procurement',
        'รับสมัครงาน': 'cat-job',
        'ผลงานนักเรียน': 'cat-academic'
    };

    const newArticle = {
        ArticleID: 'NEWS-' + Date.now(),
        Category: category,
        CategoryBadgeClass: badgeMap[category] || 'cat-news',
        Title: title,
        Excerpt: excerpt,
        Content: content || excerpt,
        DirectCoverUrl: directCoverUrl,
        IsPinned: isPinned,
        PublishDate: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }),
        Author: 'admin',
        ViewCount: 0
    };

    // ส่งข้อมูลไปบันทึกใน Google Sheets
    if (CONFIG.API_URL) {
        try {
            await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'saveNews',
                    ...newArticle
                })
            });
        } catch (err) {
            console.error('Save to Sheets error:', err);
        }
    }

    // อัปเดตในหน่วยความจำหน้าเว็บทันที
    if (isPinned) {
        currentSiteData.featuredNews = newArticle;
    }
    currentSiteData.latestNews.unshift(newArticle);
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(currentSiteData));
    renderAll(currentSiteData);

    showToast('เพิ่มข่าวประชาสัมพันธ์สำเร็จแล้ว!', 'success');
    document.getElementById('form-add-news').reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'บันทึกและเผยแพร่ข่าว';
    switchAdminTab('manage-news');
};

function renderAdminNewsTable() {
    const list = currentSiteData.latestNews || [];
    const container = document.getElementById('admin-news-table-body');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#8892b0">ไม่มีข่าวสารในระบบ</td></tr>';
        return;
    }

    container.innerHTML = list.map((n, i) => `
        <tr style="border-bottom:1px solid #eef0f6">
            <td style="padding:10px 12px;font-size:13px">${n.PublishDate || ''}</td>
            <td style="padding:10px 12px;font-weight:600;font-size:13.5px">${n.Title || ''}</td>
            <td style="padding:10px 12px;font-size:13px">${n.Category || ''}</td>
            <td style="padding:10px 12px;text-align:right">
                <button onclick="deleteArticle('${n.ArticleID}')" style="background:#fee2e2;color:#ef4444;border:none;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">ลบ</button>
            </td>
        </tr>
    `).join('');
}

window.deleteArticle = async function (id) {
    if (!confirm('ยืนยันการลบข่าวสารนี้?')) return;

    currentSiteData.latestNews = currentSiteData.latestNews.filter(n => n.ArticleID !== id);
    if (currentSiteData.featuredNews && currentSiteData.featuredNews.ArticleID === id) {
        currentSiteData.featuredNews = currentSiteData.latestNews[0] || null;
    }
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(currentSiteData));
    renderAll(currentSiteData);
    renderAdminNewsTable();

    if (CONFIG.API_URL) {
        fetch(CONFIG.API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'deleteNews', id: id })
        }).catch(() => {});
    }

    showToast('ลบข่าวเรียบร้อยแล้ว', 'success');
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

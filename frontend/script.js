// script.js - Afnuz Academy Frontend (Vercel + Render Compatible)

// AUTO HEALTH CHECK BEFORE ENABLE FORM
const API_URL = "http://localhost:5000/api/contact";
const API_URL = `${API_BASE}/api/contact`;



async function checkBackend() {
    try {
        const res = await fetch(`${API_BASE}/api/health`);
        const data = await res.json();
        if (res.ok && data.status === "OK") {
            console.log("Backend is ready ✔");
            showStatus("Backend connected ✔ You can submit the form now.", "success");
        }
    } catch (e) {
        showStatus("Backend waking up... please wait 5–8 seconds ⏳", "info");
        setTimeout(checkBackend, 5000);
    }
}
checkBackend();


// === PRELOADER ===
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.style.display = 'none', 600);
    }
});

// === DOM CONTENT LOADED ===
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("inquiry-form");

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const name = form.name.value.trim();
            const email = form.email.value.trim();
            const whatsapp = form.whatsapp.value.trim();
            const message = form.message?.value?.trim() || "";

            if (!name || !email || !whatsapp) {
                showStatus('Please fill all required fields!', 'error');
                return;
            }

            const payload = { name, email, whatsapp, message };
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;

            submitBtn.disabled = true;
            submitBtn.textContent = "Sending...";
            showStatus('Sending your message...', 'info');

            try {
                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await res.json();

                if (res.ok && data.msg === "Sent!") {
                    showStatus('Thank you! We’ll contact you on WhatsApp soon.', 'success');
                    form.reset();
                } else {
                    showStatus(data.msg || "Failed to send. Please try again.", 'error');
                }

            } catch (err) {
                showStatus('Network error — backend is waking up. Try again in 5 seconds.', 'error');
                console.error("Form error:", err);
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target && targetId !== '#') {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // FAQ Toggle
    document.querySelectorAll('.faq-item h4').forEach(item => {
        item.addEventListener('click', () => {
            item.parentElement.classList.toggle('active');
        });
    });

    // Scroll Progress + Back to Top + Header Shrink
    const progressBar = document.getElementById('progress-bar');
    const backToTop = document.getElementById('backToTop');
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;

        if (progressBar) progressBar.style.width = scrolled + '%';
        if (backToTop) backToTop.style.display = winScroll > 300 ? 'block' : 'none';
        if (header) header.classList.toggle('scrolled', winScroll > 50);
    });

    // Back to Top
    window.topFunction = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Dark Mode
    const toggle = document.getElementById('themeToggle');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme') || 'dark';
    body.setAttribute('data-theme', savedTheme);

    if (toggle) {
        toggle.addEventListener('click', () => {
            const newTheme = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
});

// STATUS MESSAGE
function showStatus(message, type = 'info') {
    const status = document.getElementById('status');
    if (!status) return;

    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#fbbf24'
    };

    status.innerHTML = `
        <div style="
            background: ${colors[type] || colors.info};
            color: white;
            padding: 14px;
            border-radius: 12px;
            margin-top: 1rem;
            text-align: center;
            font-weight: 500;
            animation: fadeIn 0.4s;
        ">
            ${message}
        </div>
    `;

    setTimeout(() => status.innerHTML = '', 6000);
}

// Fade in Animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

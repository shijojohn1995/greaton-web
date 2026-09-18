/**
 * Greaton Food Products - Interactive Engine
 * Theme Controller (Automatic Time-Based & Manual Toggle)
 * Live Signal Indicator & Wayanad Climate Engine
 * Effervescence Particle System, Animated Counters & Product Interactions
 */

(function () {
    // ==========================================
    // 1. Time-Based & Manual Theme Controller
    // ==========================================
    const THEME_STORAGE_KEY = 'greaton_theme_preference';

    function getAutoThemeForCurrentTime() {
        // Auto mode defaults to light theme
        return 'light';
    }

    function updateSignalAndClimate(theme, isManual) {
        const signalIndicator = document.getElementById('signal-indicator-badge');
        if (signalIndicator) {
            if (isManual) {
                signalIndicator.innerHTML = '<span class="signal-dot" style="background-color: var(--primary-color);"></span> <span>MANUAL: ' + theme.toUpperCase() + '</span>';
            } else {
                signalIndicator.innerHTML = '<span class="signal-dot"></span> <span>LIVE AUTO-SYNC</span>';
            }
        }

        // Update Climate Description based on hour and theme
        const weatherEl = document.getElementById('climate-weather');
        if (weatherEl) {
            const hour = new Date().getHours();
            let weatherHtml = '';
            if (hour >= 6 && hour < 11) {
                weatherHtml = '<i class="fas fa-sun"></i> <strong>22°C</strong> • Fresh Wayanad Morning';
            } else if (hour >= 11 && hour < 16) {
                weatherHtml = '<i class="fas fa-cloud-sun"></i> <strong>26°C</strong> • Mild Highland Breeze';
            } else if (hour >= 16 && hour < 19) {
                weatherHtml = '<i class="fas fa-mountain-sun"></i> <strong>23°C</strong> • Cool Mountain Sunset';
            } else {
                weatherHtml = '<i class="fas fa-moon"></i> <strong>18°C</strong> • Chilled Mist Climate';
            }
            weatherEl.innerHTML = weatherHtml;
        }
    }

    function applyTheme(theme, isManual = false) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update all theme toggle buttons across the page
        const themeBtns = document.querySelectorAll('.theme-switch-btn');
        themeBtns.forEach(btn => {
            const icon = btn.querySelector('.theme-switch-icon');
            const text = btn.querySelector('.theme-mode-text');
            const badge = btn.querySelector('.theme-auto-badge');

            if (theme === 'dark') {
                if (icon) icon.className = 'fas fa-moon theme-switch-icon';
                if (text) text.textContent = 'Dark';
            } else {
                if (icon) icon.className = 'fas fa-sun theme-switch-icon';
                if (text) text.textContent = 'Light';
            }

            if (badge) {
                badge.textContent = isManual ? 'Custom' : 'Auto (Time)';
                badge.title = isManual 
                    ? 'Manually selected. Double-click to restore automatic time-based mode.' 
                    : 'Automatically switched based on current time.';
            }
        });

        updateSignalAndClimate(theme, isManual);
        updateThemeManagerUI(isManual ? theme : 'auto');

        // Swap logo for dark/light theme
        const logoEl = document.getElementById('site-logo');
        if (logoEl) {
            if (theme === 'dark') {
                logoEl.src = logoEl.src.replace(/logo(-dark)?\.(jpg|png)/, 'logo-dark.png');
            } else {
                logoEl.src = logoEl.src.replace(/logo(-dark)?\.(jpg|png)/, 'logo.jpg');
            }
        }
    }

    function updateThemeManagerUI(activeMode) {
        const tmBtns = document.querySelectorAll('.tm-btn');
        tmBtns.forEach(btn => {
            if (btn.getAttribute('data-mode') === activeMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function initTheme() {
        const savedPref = localStorage.getItem(THEME_STORAGE_KEY);
        if (savedPref === 'light' || savedPref === 'dark') {
            applyTheme(savedPref, true);
        } else {
            applyTheme(getAutoThemeForCurrentTime(), false);
        }
    }

    // Run theme init immediately
    initTheme();

    // Check time every minute for auto-switching
    setInterval(() => {
        const savedPref = localStorage.getItem(THEME_STORAGE_KEY);
        if (!savedPref || savedPref === 'auto') {
            applyTheme(getAutoThemeForCurrentTime(), false);
        }
    }, 60000);

    // Live Real-Time Clock updater
    function updateClock() {
        const clockEl = document.getElementById('climate-time');
        if (clockEl) {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 becomes 12
            clockEl.innerHTML = `<i class="fas fa-clock"></i> <strong>${hours}:${minutes}:${seconds} ${ampm}</strong>`;
        }
    }

    setInterval(updateClock, 1000);
    document.addEventListener('DOMContentLoaded', updateClock);

    // Global toggle & theme manager functions
    window.setThemeMode = function (mode) {
        if (mode === 'auto') {
            localStorage.removeItem(THEME_STORAGE_KEY);
            const autoTheme = getAutoThemeForCurrentTime();
            applyTheme(autoTheme, false);
        } else if (mode === 'light' || mode === 'dark') {
            localStorage.setItem(THEME_STORAGE_KEY, mode);
            applyTheme(mode, true);
        }
    };

    window.toggleTheme = function () {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        window.setThemeMode(nextTheme);
    };

    window.resetAutoTheme = function () {
        window.setThemeMode('auto');
    };

    // ==========================================
    // Live Location Detector
    // ==========================================
    function updateLocationDisplay(city, state) {
        const locEl = document.getElementById('climate-location');
        if (locEl) {
            locEl.innerHTML = `<i class="fas fa-location-dot"></i> <strong>${city}, ${state}</strong>`;
        }
    }

    function detectLocation() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            function (pos) {
                const lat = pos.coords.latitude.toFixed(4);
                const lon = pos.coords.longitude.toFixed(4);
                fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
                    .then(r => r.json())
                    .then(data => {
                        const addr = data.address || {};
                        const city  = addr.city || addr.town || addr.village || addr.county || 'Unknown';
                        const state = addr.state || '';
                        updateLocationDisplay(city, state);
                    })
                    .catch(() => { /* keep fallback */ });
            },
            function () { /* permission denied – keep fallback */ },
            { timeout: 8000 }
        );
    }

    document.addEventListener('DOMContentLoaded', detectLocation);

})();

document.addEventListener('DOMContentLoaded', () => {

    // Attach Theme Manager segmented buttons click handlers
    document.querySelectorAll('.tm-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const mode = btn.getAttribute('data-mode');
            if (mode && window.setThemeMode) {
                window.setThemeMode(mode);
            }
        });
    });

    // Attach Theme Toggle click events to all legacy switch buttons (if present)
    document.querySelectorAll('.theme-switch-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.toggleTheme();
        });
        // Double-click restores automatic time-based mode
        btn.addEventListener('dblclick', (e) => {
            e.preventDefault();
            window.resetAutoTheme();
        });
    });

    // ==========================================
    // 2. Mobile Menu Toggle
    // ==========================================
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenu && navMenu) {
        const toggleMenu = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            mobileMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll', navMenu.classList.contains('active'));
        };

        const closeMenu = () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };

        mobileMenu.addEventListener('click', toggleMenu);

        mobileMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                toggleMenu(e);
            }
        });

        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close when clicking outside of nav menu
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !mobileMenu.contains(e.target)) {
                closeMenu();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // ==========================================
    // 3. Sticky Navbar with Blur & Shadow
    // ==========================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // ==========================================
    // 4. Smooth Scrolling for Navigation
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const headerOffset = 100;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // ==========================================
    // 5. Scroll-Triggered Reveal Animations
    // ==========================================
    const observerOptions = {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add('animate-visible');
                el.classList.remove('animate-hidden');
                revealObserver.unobserve(el);
            }
        });
    }, observerOptions);

    // Observe ALL elements already marked animate-hidden in the HTML
    const animatedElements = document.querySelectorAll('.animate-hidden');

    animatedElements.forEach((el, index) => {
        el.style.transitionDelay = `${(index % 4) * 0.12}s`;
        revealObserver.observe(el);
    });

    // Also watch for JS-added animate-hidden elements (added below)
    const jsAnimatedElements = document.querySelectorAll(
        '.product-card, .mv-card, .feature-box, .gallery-item, .testimonial-card, .info-item, .contact-form-container'
    );
    jsAnimatedElements.forEach((el, index) => {
        if (!el.classList.contains('animate-hidden')) {
            el.classList.add('animate-hidden');
            el.style.transitionDelay = `${(index % 4) * 0.12}s`;
            revealObserver.observe(el);
        }
    });

    // Immediately reveal elements already visible in viewport on page load
    setTimeout(() => {
        document.querySelectorAll('.animate-hidden').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                el.classList.add('animate-visible');
                el.classList.remove('animate-hidden');
                revealObserver.unobserve(el);
            }
        });
    }, 100);

    // ==========================================
    // 6. Animated Stat Counters
    // ==========================================
    const statsSection = document.querySelector('.stats-section');
    let statsAnimated = false;

    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !statsAnimated) {
                    statsAnimated = true;
                    animateCounters();
                    statsObserver.unobserve(statsSection);
                }
            });
        }, { threshold: 0.3 });

        statsObserver.observe(statsSection);
    }

    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target') || '0', 10);
            const suffix = counter.getAttribute('data-suffix') || '';
            const prefix = counter.getAttribute('data-prefix') || '';
            const duration = 1800; // ms
            const frameRate = 30;
            const totalSteps = duration / frameRate;
            let step = 0;

            const timer = setInterval(() => {
                step++;
                const progress = step / totalSteps;
                // Ease-out cubic
                const current = Math.round(target * (1 - Math.pow(1 - progress, 3)));

                counter.textContent = `${prefix}${current.toLocaleString()}${suffix}`;

                if (step >= totalSteps) {
                    counter.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
                    clearInterval(timer);
                }
            }, frameRate);
        });
    }

    // ==========================================
    // 7. Beverage Particle Effervescence System
    // ==========================================
    const particleContainer = document.getElementById('particles-container');

    if (particleContainer) {
        function createEffervescentBubble() {
            const isMobile = window.innerWidth <= 768;
            const maxBubbles = isMobile ? 18 : 60;
            if (particleContainer.children.length > maxBubbles) return;

            const bubble = document.createElement('div');
            bubble.classList.add('bubble');

            const size = isMobile 
                ? (Math.random() * 24 + 14) // 14px to 38px on mobile (subtle, non-obstructive)
                : (Math.random() * 60 + 20); // 20px to 80px on desktop
            const duration = Math.random() * 5 + 4; // 4s to 9s
            const left = Math.random() * 100;

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}%`;
            bubble.style.animationDuration = `${duration}s`;

            // Click → blast effect (Desktop only to prevent mobile touch obstruction)
            if (!isMobile) {
                bubble.addEventListener('click', function (e) {
                e.stopPropagation();
                const rect = bubble.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                bubble.classList.add('popping');
                const shardCount = Math.floor(size / 3) + 14;
                for (let i = 0; i < shardCount; i++) {
                    const shard = document.createElement('div');
                    shard.classList.add('blast-shard');
                    const angle = (i / shardCount) * 360;
                    const dist  = size * 2.5 + Math.random() * 80;
                    const tx    = Math.cos(angle * Math.PI / 180) * dist;
                    const ty    = Math.sin(angle * Math.PI / 180) * dist;
                    const dur   = (Math.random() * 0.35 + 0.4).toFixed(2);
                    const shardSize = Math.random() * 10 + 5;
                    shard.style.cssText = `
                        left: ${cx - 3}px;
                        top:  ${cy - 3}px;
                        width: ${shardSize}px;
                        height: ${shardSize}px;
                        position: fixed;
                        --tx: ${tx}px;
                        --ty: ${ty}px;
                        --shard-dur: ${dur}s;
                    `;
                    document.body.appendChild(shard);
                    setTimeout(() => shard.remove(), parseFloat(dur) * 1000 + 50);
                }
                setTimeout(() => bubble.remove(), 300);
            });
            }

            particleContainer.appendChild(bubble);
            setTimeout(() => { bubble.remove(); }, duration * 1000);
        }

        function createSparkle() {
            if (particleContainer.children.length > 35) return;
            const sparkle = document.createElement('div');
            sparkle.classList.add('red-sparkle');
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.top = `${Math.random() * 95}%`;
            sparkle.style.animationDuration = `${Math.random() * 3 + 2}s`;

            particleContainer.appendChild(sparkle);
            setTimeout(() => {
                sparkle.remove();
            }, 5000);
        }

        setInterval(createEffervescentBubble, 250);
        setInterval(createSparkle, 1300);

        // Click anywhere → blast ALL bubbles on screen
        function blastBubble(bubble) {
            const rect = bubble.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top  + rect.height / 2;
            const size = rect.width;

            bubble.classList.add('popping');

            const shardCount = Math.floor(size / 3) + 14;
            for (let i = 0; i < shardCount; i++) {
                const shard = document.createElement('div');
                shard.classList.add('blast-shard');
                const angle = (i / shardCount) * 360;
                const dist  = size * 2.5 + Math.random() * 80;
                const tx    = Math.cos(angle * Math.PI / 180) * dist;
                const ty    = Math.sin(angle * Math.PI / 180) * dist;
                const dur   = (Math.random() * 0.35 + 0.4).toFixed(2);
                const shardSize = Math.random() * 10 + 5;
                shard.style.cssText = `
                    left: ${cx - 3}px;
                    top: ${cy - 3}px;
                    width: ${shardSize}px;
                    height: ${shardSize}px;
                    position: fixed;
                    --tx: ${tx}px;
                    --ty: ${ty}px;
                    --shard-dur: ${dur}s;
                `;
                document.body.appendChild(shard);
                setTimeout(() => shard.remove(), parseFloat(dur) * 1000 + 50);
            }

            setTimeout(() => bubble.remove(), 300);
        }

        document.addEventListener('click', () => {
            document.querySelectorAll('.bubble:not(.popping)').forEach(blastBubble);
        });
    }

    // ==========================================
    // 8. 3D Tilt Interaction for Product Cards
    // ==========================================
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const tiltX = (y / (rect.height / 2)) * -5;
            const tiltY = (x / (rect.width / 2)) * 5;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ==========================================
    // 9. Interactive Chat Widget
    // ==========================================
    const chatBtn = document.getElementById('chat-widget-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatBtn = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatPhone = document.getElementById('chat-phone');
    const chatEmail = document.getElementById('chat-email');
    const chatBody = document.getElementById('chat-body');

    if (chatBtn && chatPopup) {
        function toggleChat() {
            chatPopup.classList.toggle('active');
            if (chatPopup.classList.contains('active') && chatInput) {
                chatInput.focus();
            }
        }

        chatBtn.addEventListener('click', toggleChat);
        if (closeChatBtn) closeChatBtn.addEventListener('click', toggleChat);

        function addChatMessage(text, type = 'sent') {
            if (!chatBody) return;
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', type);

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('message-content');
            contentDiv.innerHTML = `<p>${text}</p>`;

            const timestamp = document.createElement('span');
            timestamp.classList.add('timestamp');
            const now = new Date();
            timestamp.innerText = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(timestamp);
            chatBody.appendChild(messageDiv);

            chatBody.scrollTop = chatBody.scrollHeight;
        }

        if (chatForm) {
            chatForm.addEventListener('submit', function (e) {
                e.preventDefault();

                const message = chatInput ? chatInput.value.trim() : '';
                const phone = chatPhone ? chatPhone.value.trim() : '';
                const email = chatEmail ? chatEmail.value.trim() : '';

                if (!message) {
                    alert("Please enter a message.");
                    return;
                }
                if (!phone) {
                    alert("Please enter your phone number.");
                    if (chatPhone) chatPhone.focus();
                    return;
                }

                addChatMessage(message, 'sent');
                if (chatInput) chatInput.value = '';

                fetch('contact_mail.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, phone, email })
                })
                .then(res => res.json())
                .then(() => {
                    setTimeout(() => {
                        addChatMessage(`Thank you! Your inquiry has been received. Our team will contact you shortly at ${phone}.`, 'received');
                    }, 800);
                })
                .catch(() => {
                    setTimeout(() => {
                        addChatMessage(`Thank you! We received your message and will call you soon at ${phone}.`, 'received');
                    }, 800);
                });
            });
        }
    }

    // ==========================================
    // 10. Main Contact Form Submission
    // ==========================================
    const mainContactForm = document.getElementById('main-contact-form');
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const submitBtn = mainContactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            const nameEl = document.getElementById('contact-name');
            const emailEl = document.getElementById('contact-email');
            const messageEl = document.getElementById('contact-message');

            const formData = {
                name: nameEl ? nameEl.value : '',
                email: emailEl ? emailEl.value : '',
                message: messageEl ? messageEl.value : ''
            };

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            fetch('contact_mail.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(res => res.json())
            .then(() => {
                alert("Thank you! Your message has been sent successfully.");
                mainContactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            })
            .catch(() => {
                alert("Thank you! Your message has been received.");
                mainContactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

    // ==========================================
    // 11. Greaton Digital Visiting Card Modal
    // ==========================================
    const openVcBtn = document.getElementById('open-visiting-card-btn');
    const mobileNavVcBtn = document.getElementById('mobile-nav-vc');
    const vcModal = document.getElementById('visiting-card-modal');
    const closeVcBtn = document.getElementById('close-vc-modal');
    const vcOverlay = document.getElementById('vc-modal-overlay');

    if (vcModal) {
        const handleOpenVc = (e) => {
            e.preventDefault();
            vcModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        if (openVcBtn) openVcBtn.addEventListener('click', handleOpenVc);
        if (mobileNavVcBtn) mobileNavVcBtn.addEventListener('click', handleOpenVc);

        const closeVc = () => {
            vcModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (closeVcBtn) closeVcBtn.addEventListener('click', closeVc);
        if (vcOverlay) vcOverlay.addEventListener('click', closeVc);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && vcModal.classList.contains('active')) {
                closeVc();
            }
        });
    }

    // ==========================================
    // 12. Mobile Bottom Navigation Active Tab Controller
    // ==========================================
    const mobileBottomNav = document.querySelector('.mobile-bottom-nav');
    if (mobileBottomNav) {
        const navItems = mobileBottomNav.querySelectorAll('.mobile-nav-item');
        const homeTab = mobileBottomNav.querySelector('[data-tab="home"]');
        const productsTab = mobileBottomNav.querySelector('[data-tab="products"]');
        const productsSection = document.getElementById('products');

        function setActiveTab(tabEl) {
            if (!tabEl) return;
            navItems.forEach(item => item.classList.remove('active'));
            tabEl.classList.add('active');
        }

        navItems.forEach(item => {
            item.addEventListener('click', function (e) {
                const tabType = this.getAttribute('data-tab');
                const href = this.getAttribute('href');

                if (tabType === 'card') {
                    setActiveTab(this);
                    return;
                }

                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    setActiveTab(this);
                    const targetEl = document.querySelector(href);
                    if (targetEl) {
                        const headerOffset = 80;
                        const elementPos = targetEl.getBoundingClientRect().top;
                        const offsetPos = elementPos + window.pageYOffset - headerOffset;
                        window.scrollTo({
                            top: href === '#home' ? 0 : offsetPos,
                            behavior: 'smooth'
                        });
                    }
                } else if (tabType && (tabType === 'home' || tabType === 'products' || tabType === 'partners')) {
                    setActiveTab(this);
                }
            });
        });

        // Dynamic scroll-spy for mobile bottom navigation on index.html
        if (productsSection && homeTab && productsTab) {
            let scrollTimer;
            const updateActiveOnScroll = () => {
                const scrollY = window.pageYOffset;
                const productsTop = productsSection.offsetTop - 220;

                // Don't change active tab if visiting card modal is open
                const vcModal = document.getElementById('visiting-card-modal');
                if (vcModal && vcModal.classList.contains('active')) return;

                if (scrollY >= productsTop) {
                    setActiveTab(productsTab);
                } else {
                    setActiveTab(homeTab);
                }
            };

            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(updateActiveOnScroll, 30);
            }, { passive: true });

            // Run once on load to set proper initial active tab
            updateActiveOnScroll();
        }

        // Restore active tab when visiting card modal is closed
        const closeVcModalBtn = document.getElementById('close-vc-modal');
        const vcModalOverlay = document.getElementById('vc-modal-overlay');
        const restoreActiveTab = () => {
            if (productsSection && window.pageYOffset >= (productsSection.offsetTop - 220)) {
                setActiveTab(productsTab);
            } else if (homeTab) {
                setActiveTab(homeTab);
            }
        };
        if (closeVcModalBtn) closeVcModalBtn.addEventListener('click', restoreActiveTab);
        if (vcModalOverlay) vcModalOverlay.addEventListener('click', restoreActiveTab);
    }

});

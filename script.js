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
        const hour = new Date().getHours();
        // 6:00 AM (06:00) to 6:00 PM (18:00) is Daytime -> Light theme
        // 6:00 PM (18:00) to 6:00 AM (06:00) is Nighttime -> Dark theme
        return (hour >= 6 && hour < 18) ? 'light' : 'dark';
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

    const animatedElements = document.querySelectorAll(
        '.product-card, .mv-card, .feature-box, .gallery-item, .testimonial-card, .info-item, .contact-form-container'
    );

    animatedElements.forEach((el, index) => {
        el.classList.add('animate-hidden');
        el.style.transitionDelay = `${(index % 4) * 0.12}s`;
        revealObserver.observe(el);
    });

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
            if (particleContainer.children.length > 25) return;

            const bubble = document.createElement('div');
            bubble.classList.add('bubble');

            const size = Math.random() * 26 + 8; // 8px to 34px
            const duration = Math.random() * 5 + 4; // 4s to 9s
            const left = Math.random() * 100;

            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${left}%`;
            bubble.style.animationDuration = `${duration}s`;

            particleContainer.appendChild(bubble);

            setTimeout(() => {
                bubble.remove();
            }, duration * 1000);
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

        setInterval(createEffervescentBubble, 650);
        setInterval(createSparkle, 1300);
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

});

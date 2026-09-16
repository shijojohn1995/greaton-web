document.addEventListener('DOMContentLoaded', () => {
    
    // Mobile Menu Toggle
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Sticky Navbar on Scroll
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.padding = '10px 0';
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        } else {
            navbar.style.padding = '15px 0';
            navbar.style.boxShadow = 'none'; // Optional: remove shadow at very top if preferred
        }
    });

    // Smooth Scrolling for Anchor Links (Polyfill-like behavior if CSS scroll-behavior fails or for control)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Offset for fixed header
                const headerOffset = 80; 
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // Reveal animations on scroll using Intersection Observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add specific animation class based on element type or data attribute
                const el = entry.target;
                
                // Add delay for staggered effect if it's part of a group
                if (el.classList.contains('product-card') || el.classList.contains('gallery-item')) {
                    // Calculate index relative to parent to stagger
                    const index = Array.from(el.parentNode.children).indexOf(el);
                    el.style.animationDelay = `${index * 0.1}s`;
                    el.classList.add('fade-in-up');
                } else if (el.classList.contains('info-item')) {
                     const index = Array.from(el.parentNode.children).indexOf(el);
                    el.style.animationDelay = `${index * 0.2}s`;
                    el.classList.add('slide-in-left');
                } else if (el.classList.contains('about-text')) {
                    el.classList.add('fade-in-up');
                } else {
                    el.classList.add('fade-in-up'); // Default fallback
                }

                el.classList.remove('animate-hidden');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements to animate
    const elementsToAnimate = document.querySelectorAll('.product-card, .info-item, .about-text, .gallery-item');
    
    elementsToAnimate.forEach(el => {
        el.classList.add('animate-hidden');
        observer.observe(el);
    });

    // Parallax Effect for Hero
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        // Simple parallax: move background slower than scroll
        hero.style.backgroundPositionY = `${scrolled * 0.5}px`;
    });

    // Particle System (Bubbles & Rain)
    const particleContainer = document.getElementById('particles-container');

    const createBubble = () => {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Random size and position
        const size = Math.random() * 40 + 10; // 10px to 50px
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.animationDuration = `${Math.random() * 5 + 5}s`; // 5-10s
        
        particleContainer.appendChild(bubble);
        
        // Cleanup
        setTimeout(() => {
            bubble.remove();
        }, 10000);
    };

    const createRainDrop = () => {
        const drop = document.createElement('div');
        drop.classList.add('water-drop');
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${Math.random() * 1 + 0.5}s`; // Fast drops
        
        particleContainer.appendChild(drop);
        
        setTimeout(() => {
            drop.remove();
        }, 2000);
    };

    const triggerThunder = () => {
        const flash = document.getElementById('flash-overlay');
        flash.style.animation = 'none';
        flash.offsetHeight; /* trigger reflow */
        flash.style.animation = 'flash 0.3s ease-out';
    };

    // Start intervals
    setInterval(createBubble, 800); // New bubble every 800ms
    setInterval(createRainDrop, 100); // Rain drop every 100ms
    setInterval(triggerThunder, 15000); // Thunder every 15s

    // Chat Widget Logic
    const chatBtn = document.getElementById('chat-widget-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closeChatBtn = document.getElementById('close-chat');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatPhone = document.getElementById('chat-phone');
    const chatEmail = document.getElementById('chat-email');
    const chatBody = document.getElementById('chat-body');

    // Toggle Chat
    function toggleChat() {
        chatPopup.classList.toggle('active');
        if (chatPopup.classList.contains('active')) {
             chatInput.focus();
        }
    }

    chatBtn.addEventListener('click', toggleChat);
    closeChatBtn.addEventListener('click', toggleChat);

    // Add Message to Chat
    function addMessage(text, type = 'sent') {
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
        
        // Scroll to bottom
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Handle Form Submission
    chatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const message = chatInput.value.trim();
        const phone = chatPhone.value.trim();
        const email = chatEmail.value.trim();

        if (!message) {
            alert("Please enter a message.");
            return;
        }
        if (!phone) {
             alert("Please enter your phone number.");
             chatPhone.focus();
             return;
        }

        // Add user message
        addMessage(message, 'sent');
        chatInput.value = '';

        // Simulate "Thinking" or send to backend
        // For now, we will try to send to contact_mail.php
        // If it fails (due to no server), we will simulate a success for demo purposes
        
        fetch('contact_mail.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                message: message,
                phone: phone,
                email: email
            })
        })
        .then(response => {
            // if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            setTimeout(() => {
                // Since this is likely running locally without PHP, simulate success
                // In production, check data.status === 'success'
                addMessage("Thanks! Your details have been sent. We'll call you shortly at " + phone + ".", 'received');
            }, 1000);
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback for local testing/demo where PHP is not running
            setTimeout(() => {
                addMessage("Demo Mode: Message sent! (Backend unreachable locally)", 'received');
            }, 1000);
        });
    });

    // Main Contact Form Logic (Add this)
    const mainContactForm = document.getElementById('main-contact-form');
    if (mainContactForm) {
        mainContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const btn = mainContactForm.querySelector('button');
            const originalText = btn.innerText;
            
            // Collect form data
            const formData = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-message').value
            };

            btn.innerText = 'Sending...';
            btn.disabled = true;

            fetch('contact_mail.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => {
                // if (!response.ok) throw new Error('Network error');
                return response.json();
            })
            .then(data => {
                 // Always simulate success for demo if actual mail fails locally
                 setTimeout(() => {
                    alert("Thank you! Your message has been sent.");
                    mainContactForm.reset();
                    btn.innerText = originalText;
                    btn.disabled = false;
                 }, 1000);
            })
            .catch(error => {
                setTimeout(() => {
                    alert("Demo: Message sent successfully (Local Simulation)");
                    mainContactForm.reset();
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 1000);
            });
        });
    }

    // Update animations for new elements
    const newElements = document.querySelectorAll('.mv-card, .feature-box, .testimonial-card');
    newElements.forEach(el => {
        el.classList.add('animate-hidden');
        observer.observe(el);
    });
});

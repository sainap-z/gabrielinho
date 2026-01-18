// Portfolio JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Initialize portfolio
  initPortfolio();
});

function initPortfolio() {
  // Initialize all components
  initLoader();
  initTheme();
  initNavigation();
  initParticles();
  initAnimations();
  initBackToTop();
  initStatsCounter();
  initSmoothScroll();
  initHoverEffects();
}

// ===== LOADER =====
function initLoader() {
  const loader = document.querySelector('.loader');
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => {
        loader.style.display = 'none';
      }, 300);
    }, 1000);
  });
}

// ===== THEME TOGGLE =====
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle.querySelector('i');
  
  // Check for saved theme or prefer-color-scheme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
}

// ===== NAVIGATION =====
function initNavigation() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
    navToggle.innerHTML = navMenu.classList.contains('show') 
      ? '<i class="fas fa-times"></i>' 
      : '<i class="fas fa-bars"></i>';
  });
  
  // Active link based on scroll position
  window.addEventListener('scroll', () => {
    const scrollPosition = window.scrollY + 100;
    
    // Remove all active classes
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Find current section
    document.querySelectorAll('section[id]').forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
        if (activeLink) activeLink.classList.add('active');
      }
    });
    
    // Fallback to first section at top
    if (scrollPosition < 100) {
      navLinks[0].classList.add('active');
    }
  });
  
  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove('show');
      navToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
  });
}

// ===== PARTICLES BACKGROUND =====
function initParticles() {
  const particlesContainer = document.getElementById('particles');
  
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random position and size
    const size = Math.random() * 4 + 1;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    particle.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: var(--primary);
      border-radius: 50%;
      opacity: ${Math.random() * 0.3 + 0.1};
      top: ${posY}%;
      left: ${posX}%;
      filter: blur(${size / 2}px);
    `;
    
    particlesContainer.appendChild(particle);
    
    // Animate particle
    animateParticle(particle);
  }
  
  function animateParticle(particle) {
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);
    let speedX = (Math.random() - 0.5) * 0.2;
    let speedY = (Math.random() - 0.5) * 0.2;
    
    function move() {
      x += speedX;
      y += speedY;
      
      // Bounce off edges
      if (x < 0 || x > 100) speedX *= -1;
      if (y < 0 || y > 100) speedY *= -1;
      
      // Keep within bounds
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));
      
      particle.style.left = `${x}%`;
      particle.style.top = `${y}%`;
      
      requestAnimationFrame(move);
    }
    
    move();
  }
}

// ===== ANIMATIONS =====
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);
  
  // Observe elements for animation
  document.querySelectorAll('.skill-card, .experience-card, .social-card').forEach(el => {
    observer.observe(el);
  });
  
  // Add CSS for animations
  const style = document.createElement('style');
  style.textContent = `
    .skill-card,
    .experience-card,
    .social-card {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .skill-card.animate-in,
    .experience-card.animate-in,
    .social-card.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
    
    .language-fill {
      width: 0;
      transition: width 1.5s ease 0.3s;
    }
    
    .language-item.animate-in .language-fill {
      width: var(--target-width);
    }
  `;
  document.head.appendChild(style);
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const backToTop = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  });
  
  backToTop.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ===== STATS COUNTER =====
function initStatsCounter() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumber = entry.target;
        const target = parseInt(statNumber.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          statNumber.textContent = Math.round(current);
        }, 16);
        
        observer.unobserve(statNumber);
      }
    });
  }, { threshold: 0.5 });
  
  statNumbers.forEach(stat => observer.observe(stat));
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = document.querySelector('.nav').offsetHeight;
        const targetPosition = targetElement.offsetTop - navHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu.classList.contains('show')) {
          navMenu.classList.remove('show');
          navToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
      }
    });
  });
}

// ===== HOVER EFFECTS =====
function initHoverEffects() {
  // Add hover effects to cards
  document.querySelectorAll('.skill-card, .experience-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '10';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.zIndex = '1';
    });
  });
  
  // Parallax effect for hero
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.transform = `translateY(${scrolled * 0.1}px)`;
    }
  });
}

// ===== TYPEWRITER EFFECT (Optional) =====
function initTypewriter() {
  const elements = document.querySelectorAll('.typewriter');
  
  elements.forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    
    let i = 0;
    function typeWriter() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      }
    }
    
    // Start typing when element is in view
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        typeWriter();
        observer.unobserve(element);
      }
    });
    
    observer.observe(element);
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initPortfolio };
}
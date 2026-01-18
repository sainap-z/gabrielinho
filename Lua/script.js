document.addEventListener('DOMContentLoaded', () => {
  // ===== SMOOTH SCROLLSPY =====
  class SmoothScrollSpy {
    constructor() {
      this.sections = document.querySelectorAll('section[id]');
      this.navLinks = document.querySelectorAll('.nav-links a');
      this.activeClass = 'active';
      this.threshold = 150; // Pixels from top to consider section active
      this.lastScroll = 0;
      this.scrolling = false;
      this.scrollTimer = null;
      
      this.init();
    }
    
    init() {
      this.createProgressIndicator();
      this.setupEventListeners();
      this.updateOnScroll();
      
      // Initial update
      requestAnimationFrame(() => this.updateOnScroll());
    }
    
    createProgressIndicator() {
      // Optional: Create a progress indicator
      const progress = document.createElement('div');
      progress.className = 'nav-progress';
      document.querySelector('nav').appendChild(progress);
      this.progressIndicator = progress;
    }
    
    setupEventListeners() {
      // Throttled scroll event
      window.addEventListener('scroll', () => {
        if (!this.scrolling) {
          this.scrolling = true;
          requestAnimationFrame(() => {
            this.updateOnScroll();
            this.scrolling = false;
          });
        }
      }, { passive: true });
      
      // Smooth scroll on nav link click
      this.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          this.handleNavClick(e, link);
        });
      });
      
      // Intersection Observer for more precise tracking
      this.setupIntersectionObserver();
    }
    
    setupIntersectionObserver() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);
            
            if (entry.isIntersecting) {
              // Calculate intersection ratio for smooth transitions
              const ratio = entry.intersectionRatio;
              this.updateLinkOpacity(link, ratio);
            }
          });
        },
        {
          root: null,
          rootMargin: '-20% 0px -70% 0px',
          threshold: Array.from({length: 101}, (_, i) => i * 0.01)
        }
      );
      
      this.sections.forEach(section => observer.observe(section));
    }
    
    updateLinkOpacity(link, opacity) {
      if (!link) return;
      
      // Smooth opacity transition based on intersection
      const minOpacity = 0.3;
      const maxOpacity = 1;
      const calculatedOpacity = minOpacity + (maxOpacity - minOpacity) * opacity;
      
      // Update all links
      this.navLinks.forEach(l => {
        l.style.opacity = minOpacity;
        l.classList.remove(this.activeClass);
      });
      
      // Update current link
      link.style.opacity = calculatedOpacity;
      
      // Only add active class when mostly visible
      if (opacity > 0.5) {
        link.classList.add(this.activeClass);
      }
    }
    
    updateOnScroll() {
      const scrollY = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Update progress indicator
      if (this.progressIndicator) {
        const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;
        this.progressIndicator.style.width = `${scrollPercent}%`;
      }
      
      // Find active section with smooth transitions
      let currentSection = null;
      let closestDistance = Infinity;
      
      this.sections.forEach(section => {
        const sectionTop = section.offsetTop - this.threshold;
        const sectionId = section.getAttribute('id');
        
        // Calculate distance from viewport center
        const viewportCenter = scrollY + (windowHeight / 2);
        const sectionCenter = sectionTop + (section.offsetHeight / 2);
        const distance = Math.abs(viewportCenter - sectionCenter);
        
        if (distance < closestDistance) {
          closestDistance = distance;
          currentSection = sectionId;
        }
      });
      
      // Update active link with smooth transition
      this.updateActiveLink(currentSection, closestDistance);
      
      // Store last scroll position for direction detection
      this.lastScroll = scrollY;
    }
    
    updateActiveLink(sectionId, distance) {
      // Calculate intensity based on distance (closer = more intense)
      const maxDistance = 500; // Max distance for full effect
      const intensity = Math.max(0, 1 - (distance / maxDistance));
      
      this.navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${sectionId}`;
        
        link.classList.remove(this.activeClass);
        
        if (isActive && sectionId) {
          link.classList.add(this.activeClass);
          
          // Apply intensity-based styling
          link.style.setProperty('--active-intensity', intensity);
          link.style.opacity = 0.3 + (0.7 * intensity);
          
          // Scale effect based on intensity
          const scale = 1 + (0.05 * intensity);
          link.style.transform = `scale(${scale})`;
        } else {
          link.style.opacity = 0.3;
          link.style.transform = 'scale(1)';
        }
      });
    }
    
    handleNavClick(e, link) {
      const targetId = link.getAttribute('href');
      
      if (targetId.startsWith('#')) {
        e.preventDefault();
        
        // Smooth scroll with easing
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          const targetPosition = targetSection.offsetTop - 80;
          const startPosition = window.pageYOffset;
          const distance = targetPosition - startPosition;
          const duration = 800; // ms
          let startTime = null;
          
          const easeInOutCubic = (t) => {
            return t < 0.5 
              ? 4 * t * t * t 
              : 1 - Math.pow(-2 * t + 2, 3) / 2;
          };
          
          const animateScroll = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            window.scrollTo(0, startPosition + (distance * easeProgress));
            
            if (timeElapsed < duration) {
              requestAnimationFrame(animateScroll);
            }
          };
          
          requestAnimationFrame(animateScroll);
        }
      }
    }
  }
  
  // Initialize smooth scrollspy
  const scrollSpy = new SmoothScrollSpy();
  
  // ===== SEARCH FUNCTIONALITY =====
  const searchIcon = document.getElementById('searchIcon');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');
  const searchResults = document.getElementById('searchResults');
  const searchContainer = document.querySelector('.search-container');
  
  // Elementos de contenido para buscar
  const videoCards = document.querySelectorAll('.video-card-compact');
  const modelingCards = document.querySelectorAll('#modeling .card');
  const sectionHeadings = document.querySelectorAll('section h2');
  
  // Variables para control del buscador
  let isSearchOpen = false;
  
  // Abrir/cerrar buscador
  searchIcon.addEventListener('click', () => {
    if (!isSearchOpen) {
      openSearch();
    } else {
      closeSearch();
    }
  });
  
  searchClose.addEventListener('click', closeSearch);
  
  // Función para abrir buscador
  function openSearch() {
    searchInput.classList.add('expanded');
    searchInput.focus();
    isSearchOpen = true;
    searchClose.style.opacity = '1';
  }
  
  // Función para cerrar buscador
  function closeSearch() {
    searchInput.classList.remove('expanded');
    searchInput.value = '';
    searchResults.classList.remove('active');
    searchResults.innerHTML = '';
    isSearchOpen = false;
    searchClose.style.opacity = '0';
  }
  
  // Buscar mientras se escribe
  searchInput.addEventListener('input', performSearch);
  
  // Función de búsqueda
  function performSearch() {
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }
    
    const results = [];
    
    // Buscar en videos
    videoCards.forEach(card => {
      const title = card.getAttribute('data-title').toLowerCase();
      const description = card.getAttribute('data-description').toLowerCase();
      const category = card.getAttribute('data-category');
      
      if (title.includes(query) || description.includes(query)) {
        results.push({
          element: card,
          title: card.getAttribute('data-title'),
          description: card.getAttribute('data-description'),
          category: 'Scripting',
          type: 'video',
          icon: 'fas fa-play-circle'
        });
      }
    });
    
    // Buscar en modeling cards
    modelingCards.forEach(card => {
      const title = card.getAttribute('data-title').toLowerCase();
      const description = card.getAttribute('data-description').toLowerCase();
      const category = card.getAttribute('data-category');
      
      if (title.includes(query) || description.includes(query)) {
        results.push({
          element: card,
          title: card.getAttribute('data-title'),
          description: card.getAttribute('data-description'),
          category: 'Modeling',
          type: 'modeling',
          icon: 'fas fa-cube'
        });
      }
    });
    
    // Buscar en secciones
    sectionHeadings.forEach(heading => {
      const text = heading.textContent.toLowerCase();
      if (text.includes(query)) {
        const section = heading.closest('section');
        results.push({
          element: section,
          title: heading.textContent,
          description: `Jump to ${heading.textContent} section`,
          category: 'Section',
          type: 'section',
          icon: 'fas fa-hashtag'
        });
      }
    });
    
    // Mostrar resultados
    displaySearchResults(results, query);
  }
  
  // Mostrar resultados en el dropdown
  function displaySearchResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="no-results">
          <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px; opacity: 0.5;"></i>
          <div>No results found for "${query}"</div>
          <small style="opacity: 0.7; margin-top: 5px;">Try different keywords</small>
        </div>
      `;
      searchResults.classList.add('active');
      return;
    }
    
    let html = '';
    
    results.forEach((result, index) => {
      html += `
        <div class="search-result-item" data-index="${index}">
          <i class="${result.icon}"></i>
          <div>
            <div class="search-result-title">${highlightText(result.title, query)}</div>
            <div class="search-result-description">${highlightText(result.description.substring(0, 80), query)}${result.description.length > 80 ? '...' : ''}</div>
            <div class="search-result-category">${result.category}</div>
          </div>
        </div>
      `;
    });
    
    searchResults.innerHTML = html;
    searchResults.classList.add('active');
    
    // Añadir event listeners a los resultados
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = item.getAttribute('data-index');
        const result = results[index];
        
        if (result.type === 'video') {
          // Simular click en el video card
          result.element.click();
        } else if (result.type === 'section') {
          // Scroll a la sección
          result.element.scrollIntoView({ behavior: 'smooth' });
        } else if (result.type === 'modeling') {
          // Scroll a la card de modeling
          result.element.scrollIntoView({ behavior: 'smooth' });
          // Efecto visual
          result.element.style.boxShadow = '0 0 0 2px rgba(255,255,255,0.3)';
          setTimeout(() => {
            result.element.style.boxShadow = '';
          }, 2000);
        }
        
        closeSearch();
      });
    });
  }
  
  // Resaltar texto en los resultados
  function highlightText(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span style="color: #fff; background: rgba(255,255,255,0.1); padding: 0 2px; border-radius: 2px;">$1</span>');
  }
  
  // Cerrar buscador al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!searchContainer.contains(e.target) && isSearchOpen) {
      closeSearch();
    }
  });
  
  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSearchOpen) {
      closeSearch();
    }
  });
  
  // ===== MODALS FUNCTIONALITY =====
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const closeBtn = document.getElementById('closeModal');
  const videoModal = document.getElementById('videoModal');
  const expandedVideo = document.getElementById('expandedVideo');
  const closeVideoModal = document.getElementById('closeVideoModal');
  const minimizeVideo = document.getElementById('minimizeVideo');
  const fullscreenVideo = document.getElementById('fullscreenVideo');
  const videoModalTitle = document.getElementById('videoModalTitle');
  let scrollTimer;
  let isFullscreen = false;

  // Configurar videos en grid
  videoCards.forEach(card => {
    const videoId = card.getAttribute('data-video-id');
    const title = card.getAttribute('data-title');
    const iframe = card.querySelector('iframe');
    
    // Configurar el thumbnail (sin autoplay, solo fondo)
    iframe.src = `https://player.vimeo.com/video/${videoId}?background=1&autoplay=0&loop=1&byline=0&title=0&muted=1`;
    
    // Evento para abrir video en modal
    card.addEventListener('click', () => {
      // Actualizar título en la barra
      videoModalTitle.textContent = title;
      
      // Configurar URL del video para modal (con controles)
      expandedVideo.src = `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0`;
      
      // Mostrar modal
      videoModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      
      // Enfocar el modal para que ESC funcione
      videoModal.focus();
    });
  });

  // Cerrar modal de video
  closeVideoModal.addEventListener('click', () => {
    closeVideoModalFunction();
  });

  // Función para cerrar modal
  function closeVideoModalFunction() {
    videoModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Pausar video al cerrar
    expandedVideo.src = '';
    isFullscreen = false;
    document.exitFullscreen?.();
  }

  // Minimizar (hacer pequeña la ventana)
  minimizeVideo.addEventListener('click', () => {
    const macWindow = document.querySelector('.mac-video-window');
    macWindow.style.transform = 'scale(0.7)';
    macWindow.style.opacity = '0.8';
    
    // Restaurar después de un tiempo
    setTimeout(() => {
      macWindow.style.transform = 'scale(1)';
      macWindow.style.opacity = '1';
    }, 300);
  });

  // Fullscreen (alternar pantalla completa)
  fullscreenVideo.addEventListener('click', () => {
    const macWindow = document.querySelector('.mac-video-window');
    
    if (!isFullscreen) {
      if (macWindow.requestFullscreen) {
        macWindow.requestFullscreen();
      } else if (macWindow.webkitRequestFullscreen) {
        macWindow.webkitRequestFullscreen();
      } else if (macWindow.msRequestFullscreen) {
        macWindow.msRequestFullscreen();
      }
      isFullscreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      isFullscreen = false;
    }
  });

  // Detectar cambios en fullscreen
  document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
  });

  // Cerrar modal al hacer clic fuera
  videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
      closeVideoModalFunction();
    }
  });

  // Cerrar modales con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (videoModal.classList.contains('active')) {
        closeVideoModalFunction();
      }
      if (modal.classList.contains('active')) {
        closeModal();
      }
    }
  });

  // Función para cerrar modal de imágenes (existente)
  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    document.body.style.overflow = modal.dataset.prevOverflow || '';
    modalImg.style.display = 'none';
  }

  // Event listeners para imágenes
  document.querySelectorAll('section img, .hero img').forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.style.display = 'block';
      
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      modal.dataset.prevOverflow = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      closeBtn.focus();
    });
  });

  // Event listeners para cerrar modal de imágenes
  closeBtn.addEventListener('click', closeModal);
  closeBtn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeModal();
    }
  });
  
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // ===== SCROLL BLUR EFFECT =====
  document.querySelectorAll('img, video').forEach(el => {
    el.addEventListener('mouseenter', () => el.classList.add('hovered'));
    el.addEventListener('mouseleave', () => el.classList.remove('hovered'));
  });

  window.addEventListener('scroll', () => {
    if (document.body.classList.contains('modal-open') || videoModal.classList.contains('active')) return;
    
    document.querySelectorAll('img, video').forEach(el => {
      if (el.classList.contains('hovered')) return;
      if (el.tagName === 'VIDEO' && !el.paused) return;
      el.style.filter = 'blur(2px)';
    });
    
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      document.querySelectorAll('img, video').forEach(el => {
        el.style.filter = '';
      });
    }, 120);
  });
});
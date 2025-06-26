// Animated Particles and Visual Effects
class AnimationController {
  constructor() {
    this.init();
  }

  init() {
    this.createFloatingParticles();
    this.initScrollAnimations();
    this.initHoverEffects();
    this.initLoadingAnimations();
  }

  // Create floating particles background
  createFloatingParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'floating-particles';
    document.body.appendChild(particlesContainer);

    // Create 50 particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random positioning and timing
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (15 + Math.random() * 10) + 's';
      
      // Random size
      const size = 2 + Math.random() * 4;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      
      particlesContainer.appendChild(particle);
    }
  }

  // Initialize scroll-triggered animations
  initScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationPlayState = 'running';
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observe story cards
    document.querySelectorAll('.story-card').forEach((card, index) => {
      card.style.animationDelay = (index * 0.1) + 's';
      observer.observe(card);
    });

    // Observe other elements
    document.querySelectorAll('.form-group, .page-header, .user-info').forEach(el => {
      observer.observe(el);
    });
  }

  // Initialize hover effects
  initHoverEffects() {
    // Story card hover effects
    document.querySelectorAll('.story-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        this.addRippleEffect(card);
      });
    });

    // Button hover effects
    document.querySelectorAll('.btn, .view-details-btn').forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        this.addButtonGlow(e.target);
      });
      
      btn.addEventListener('mouseleave', (e) => {
        this.removeButtonGlow(e.target);
      });
    });

    // Navigation item effects
    document.querySelectorAll('.nav-item a').forEach(link => {
      link.addEventListener('mouseenter', () => {
        this.addNavGlow(link);
      });
      
      link.addEventListener('mouseleave', () => {
        this.removeNavGlow(link);
      });
    });
  }

  // Add ripple effect to elements
  addRippleEffect(element) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%);
      transform: translate(-50%, -50%);
      animation: ripple 0.8s ease-out;
      pointer-events: none;
      z-index: 1;
    `;

    element.style.position = 'relative';
    element.appendChild(ripple);

    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        0% {
          width: 0;
          height: 0;
          opacity: 1;
        }
        100% {
          width: 300px;
          height: 300px;
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      ripple.remove();
    }, 800);
  }

  // Add glow effect to buttons
  addButtonGlow(button) {
    button.style.boxShadow = '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(99, 102, 241, 0.4)';
    button.style.transform = 'translateY(-5px) scale(1.05)';
  }

  removeButtonGlow(button) {
    button.style.boxShadow = '';
    button.style.transform = '';
  }

  // Add glow effect to navigation
  addNavGlow(nav) {
    nav.style.boxShadow = '0 0 20px rgba(139, 92, 246, 0.5)';
    nav.style.background = 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(139, 92, 246, 0.8))';
  }

  removeNavGlow(nav) {
    nav.style.boxShadow = '';
    nav.style.background = '';
  }

  // Initialize loading animations
  initLoadingAnimations() {
    // Animate page load
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
      this.animatePageLoad();
    });

    // Animate content changes
    this.observeContentChanges();
  }

  // Animate page load sequence
  animatePageLoad() {
    const header = document.querySelector('header');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');

    if (header) {
      header.style.animation = 'slideDown 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) both';
    }

    if (main) {
      main.style.animation = 'fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both';
    }

    if (footer) {
      footer.style.animation = 'fadeInUp 1s cubic-bezier(0.4, 0, 0.2, 1) 0.6s both';
    }

    // Animate story cards in sequence
    document.querySelectorAll('.story-card').forEach((card, index) => {
      card.style.animation = `cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 * index}s both`;
    });
  }

  // Observe content changes for dynamic animations
  observeContentChanges() {
    const contentObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            this.animateNewContent(node);
          }
        });
      });
    });

    contentObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Animate newly added content
  animateNewContent(element) {
    if (element.classList.contains('story-card')) {
      element.style.animation = 'cardSlideIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) both';
    } else if (element.classList.contains('modal-content')) {
      element.style.animation = 'modalSlideIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both';
    } else if (element.classList.contains('alert')) {
      element.style.animation = 'slideInDown 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) both';
    }
  }

  // Add typing effect to text
  addTypingEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    const typeWriter = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
      }
    };
    
    typeWriter();
  }

  // Add parallax effect to elements
  initParallaxEffect() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.parallax');
      
      parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // Add smooth scroll behavior
  initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Add cursor trail effect
  initCursorTrail() {
    const trail = [];
    const trailLength = 10;

    for (let i = 0; i < trailLength; i++) {
      const dot = document.createElement('div');
      dot.className = 'cursor-trail';
      dot.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: rgba(139, 92, 246, ${1 - i / trailLength});
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease;
      `;
      document.body.appendChild(dot);
      trail.push(dot);
    }

    document.addEventListener('mousemove', (e) => {
      trail.forEach((dot, index) => {
        setTimeout(() => {
          dot.style.left = e.clientX + 'px';
          dot.style.top = e.clientY + 'px';
        }, index * 10);
      });
    });
  }

  // Add loading spinner
  showLoadingSpinner(container) {
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
      <div class="spinner-ring"></div>
      <div class="spinner-text">Loading...</div>
    `;
    spinner.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 1000;
    `;

    const style = document.createElement('style');
    style.textContent = `
      .spinner-ring {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(139, 92, 246, 0.3);
        border-top: 4px solid #8b5cf6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 10px;
      }
      .spinner-text {
        color: var(--text-secondary);
        font-size: 14px;
        font-weight: 600;
      }
    `;
    document.head.appendChild(style);

    container.appendChild(spinner);
    return spinner;
  }

  // Remove loading spinner
  hideLoadingSpinner(spinner) {
    if (spinner && spinner.parentNode) {
      spinner.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        spinner.remove();
      }, 300);
    }
  }

  // Add success animation
  showSuccessAnimation(element) {
    const success = document.createElement('div');
    success.className = 'success-animation';
    success.innerHTML = '✓';
    success.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      font-size: 48px;
      color: #10b981;
      font-weight: bold;
      animation: successPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) both;
      z-index: 1000;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes successPop {
        0% {
          transform: translate(-50%, -50%) scale(0) rotate(-180deg);
          opacity: 0;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    element.style.position = 'relative';
    element.appendChild(success);

    setTimeout(() => {
      success.remove();
    }, 2000);
  }
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const animationController = new AnimationController();
  
  // Add some additional interactive features
  animationController.initParallaxEffect();
  animationController.initSmoothScroll();
  animationController.initCursorTrail();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnimationController;
}


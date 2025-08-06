// Common utilities for all pages
class SiteUtils {
  constructor() {
    this.isProjectPage = this.detectProjectPage();
    this.basePath = this.isProjectPage ? '../' : '';
    this.componentsLoaded = 0;
    this.totalComponents = 2;
  }

  detectProjectPage() {
    const path = window.location.pathname;
    return path.includes('/projects/') || path.includes('projects/');
  }

  async loadComponent(url, elementId) {
    try {
      const fullUrl = this.basePath + url;
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status}`);
      }
      
      const data = await response.text();
      const element = document.getElementById(elementId);
      
      if (element) {
        element.outerHTML = data;
        this.componentsLoaded++;
        
        // Initialize features when all components are loaded
        if (this.componentsLoaded === this.totalComponents) {
          this.initializeFeatures();
        }
      }
    } catch (error) {
      console.error('Error loading component:', error);
    }
  }

  initializeFeatures() {
    // Wait a bit for DOM to settle
    setTimeout(() => {
      this.initializeHeaderScroll();
      this.setActiveNavLink();
    }, 100);
  }

  initializeHeaderScroll() {
    let lastScrollTop = 0;
    const header = document.querySelector('header');
    
    if (header && !header.hasScrollListener) {
      header.hasScrollListener = true; // Prevent duplicate listeners
      
      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          header.classList.add('hidden');
        } else {
          header.classList.remove('hidden');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
      });
    }
  }

  setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      
      // Handle different link formats
      const href = link.getAttribute('href');
      const linkPage = href.split('/').pop();
      
      // Check for exact match or root index
      if (linkPage === currentPage || 
          (currentPage === 'index.html' && (linkPage === 'index.html' || href === '../index.html'))) {
        link.classList.add('active');
      }
    });
  }

  async loadComponents() {
    await Promise.all([
      this.loadComponent('header.html', 'header-placeholder'),
      this.loadComponent('footer.html', 'footer-placeholder')
    ]);
  }
}

// Navigation functions for header links
function navigateHome() {
  const isProjectPage = window.location.pathname.includes('/projects/') || window.location.pathname.includes('projects/');
  const homePath = isProjectPage ? '../index.html' : 'index.html';
  window.location.href = homePath;
}

function navigateResume() {
  const isProjectPage = window.location.pathname.includes('/projects/') || window.location.pathname.includes('projects/');
  const resumePath = isProjectPage ? '../resume.pdf' : 'resume.pdf';
  window.open(resumePath, '_blank');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  const siteUtils = new SiteUtils();
  siteUtils.loadComponents();
});
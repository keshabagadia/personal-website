// Common utilities for all pages - GitHub Pages compatible
class SiteUtils {
  constructor() {
    this.isProjectPage = this.detectProjectPage();
    this.basePath = this.isProjectPage ? '../' : '';
    this.componentsLoaded = 0;
    this.totalComponents = 2;
    
    // Debug logging for GitHub Pages
    console.log('SiteUtils initialized');
    console.log('Current path:', window.location.pathname);
    console.log('Is project page?', this.isProjectPage);
    console.log('Base path:', this.basePath);
  }

  detectProjectPage() {
    const path = window.location.pathname;
    return path.includes('/projects/') || path.includes('projects/');
  }

  async loadComponent(url, elementId) {
    try {
      // GitHub Pages path handling
      let fullUrl;
      if (this.isProjectPage) {
        // For project pages, use relative path going up one directory
        fullUrl = url.startsWith('../') ? url : '../' + url;
      } else {
        // For main page, use direct path
        fullUrl = url.startsWith('./') || url.startsWith('../') ? url : './' + url;
      }
      
      console.log(`Loading component: ${fullUrl} into ${elementId}`);
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        // Try alternative paths for GitHub Pages
        const alternatives = [
          url,
          './' + url.replace('../', '').replace('./', ''),
          url.replace('../', './'),
          url.replace('./', '')
        ];
        
        let success = false;
        for (const altUrl of alternatives) {
          if (altUrl !== fullUrl) {
            console.log(`Trying alternative path: ${altUrl}`);
            try {
              const altResponse = await fetch(altUrl);
              if (altResponse.ok) {
                const data = await altResponse.text();
                const element = document.getElementById(elementId);
                if (element) {
                  element.innerHTML = data;
                  this.componentsLoaded++;
                  console.log(`✓ Successfully loaded ${elementId} from ${altUrl}`);
                  
                  // Initialize features when all components are loaded
                  if (this.componentsLoaded === this.totalComponents) {
                    this.initializeFeatures();
                  }
                }
                success = true;
                break;
              }
            } catch (e) {
              console.log(`Alternative ${altUrl} also failed:`, e.message);
            }
          }
        }
        
        if (!success) {
          throw new Error(`Failed to load ${url} from any path. Status: ${response.status}`);
        }
      } else {
        const data = await response.text();
        const element = document.getElementById(elementId);
        
        if (element) {
          element.innerHTML = data;
          this.componentsLoaded++;
          console.log(`✓ Successfully loaded ${elementId}`);
          
          // Initialize features when all components are loaded
          if (this.componentsLoaded === this.totalComponents) {
            this.initializeFeatures();
          }
        }
      }
    } catch (error) {
      console.error(`✗ Error loading component ${elementId}:`, error);
      
      // Show user-friendly error message
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div style="padding: 10px; background: #ffe6e6; border: 1px solid #ff9999; margin: 5px 0;">
            <strong>Could not load ${elementId.replace('-placeholder', '')}</strong><br>
            <small>Path attempted: ${url}</small>
          </div>
        `;
      }
    }
  }

  initializeFeatures() {
    console.log('Initializing features...');
    // Wait a bit for DOM to settle
    setTimeout(() => {
      this.initializeHeaderScroll();
      this.setActiveNavLink();
      this.fixGitHubPagesLinks();
      console.log('All features initialized');
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
      
      console.log('Header scroll initialized');
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
    
    console.log('Active nav link set for:', currentPage);
  }

  // New method to fix GitHub Pages specific link issues
  fixGitHubPagesLinks() {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      
      // Fix home links for GitHub Pages
      if (href === '#' || href === '../' || href === '/') {
        if (this.isProjectPage) {
          link.setAttribute('href', '../index.html');
        } else {
          link.setAttribute('href', './index.html');
        }
      }
      
      // Fix resume links
      if (href.includes('resume.pdf')) {
        const resumePath = this.isProjectPage ? "../assets/documents/resume.pdf" : "./assets/documents/resume.pdf";
        link.setAttribute('href', resumePath);
      }
    });
  }

  async loadComponents() {
    console.log('Starting component loading...');
    
    // Use different strategies for GitHub Pages
    const headerPath = 'partials/header.html';
    const footerPath = 'partials/footer.html';
    
    await Promise.all([
      this.loadComponent(headerPath, 'header-placeholder'),
      this.loadComponent(footerPath, 'footer-placeholder')
    ]);
  }
}

// Navigation functions for header links (GitHub Pages compatible)
function navigateHome() {
  const isProjectPage = window.location.pathname.includes('/projects/') || window.location.pathname.includes('projects/');
  const homePath = isProjectPage ? '../index.html' : './index.html';
  window.location.href = homePath;
}

function navigateResume() {
  const isProjectPage = window.location.pathname.includes('/projects/') || window.location.pathname.includes('projects/');
  const resumePath = isProjectPage ? "../assets/documents/resume.pdf" : "./assets/documents/resume.pdf";
  window.open(resumePath, '_blank');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM ready, initializing SiteUtils...');
  const siteUtils = new SiteUtils();
  siteUtils.loadComponents();
});
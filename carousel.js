// Image carousel functionality
class ImageCarousel {
  constructor(images = []) {
    this.images = images;
    this.currentIndex = 0;
    this.autoAdvanceInterval = null;
    this.init();
  }

  // Method to load all images from a directory
  async loadImagesFromDirectory(directoryPath) {
    try {
      // Common image extensions
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      const images = [];

      // Try to load images with common naming patterns
      const commonNames = [
        'box', 'board', 'components', 'gameplay', 'setup', 'pieces',
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'
      ];

      for (const name of commonNames) {
        for (const ext of imageExtensions) {
          const imagePath = `${directoryPath}${name}.${ext}`;
          if (await this.imageExists(imagePath)) {
            images.push(imagePath);
          }
        }
      }

      // If no images found with common names, try numbered sequence
      if (images.length === 0) {
        for (let i = 1; i <= 20; i++) {
          for (const ext of imageExtensions) {
            const imagePath = `${directoryPath}${i.toString().padStart(2, '0')}.${ext}`;
            if (await this.imageExists(imagePath)) {
              images.push(imagePath);
            }
          }
        }
      }

      // Update carousel with found images
      this.updateImages(images);
      
      if (images.length === 0) {
        console.log(`No images found in ${directoryPath}. Make sure images exist and have common names like: box.jpg, board.png, components.jpg, etc.`);
      }

    } catch (error) {
      console.error('Error loading images from directory:', error);
    }
  }

  // Check if an image exists
  imageExists(imagePath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imagePath;
    });
  }

  init() {
    this.createSlides();
    this.createIndicators();
    this.bindEvents();
    
    // Only show navigation if there are multiple images
    if (this.images.length <= 1) {
      const prevBtn = document.getElementById('prevBtn');
      const nextBtn = document.getElementById('nextBtn');
      const indicators = document.getElementById('indicators');
      
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      if (indicators) indicators.style.display = 'none';
    }
  }

  createSlides() {
    const slidesContainer = document.getElementById('carouselSlides');
    if (!slidesContainer) return;
    
    // Clear existing content
    slidesContainer.innerHTML = '';
    
    // If no images provided, show placeholder
    if (this.images.length === 0) {
      slidesContainer.innerHTML = `
        <div class="carousel-slide">
          <div class="carousel-placeholder">
            <div>
              <h3>🎲 Loading Images...</h3>
              <p>Searching for images in directory</p>
              <p style="font-size: 14px; margin-top: 20px;">
                Make sure images exist in: images/competing-needs/overview-carousel/
              </p>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Create slides for each image
    this.images.forEach((imageSrc, index) => {
      const slide = document.createElement('div');
      slide.className = 'carousel-slide';
      slide.innerHTML = `<img src="${imageSrc}" alt="Game image ${index + 1}" loading="lazy">`;
      slidesContainer.appendChild(slide);
    });
  }

  createIndicators() {
    const indicatorsContainer = document.getElementById('indicators');
    if (!indicatorsContainer) return;
    
    indicatorsContainer.innerHTML = '';
    
    if (this.images.length <= 1) return;

    this.images.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => this.goToSlide(index));
      indicatorsContainer.appendChild(dot);
    });
  }

  bindEvents() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.prevSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
    });

    // Auto-advance slides every 5 seconds
    if (this.images.length > 1) {
      this.startAutoAdvance();
    }

    // Pause auto-advance on hover
    const container = document.querySelector('.carousel-container');
    if (container) {
      container.addEventListener('mouseenter', () => this.stopAutoAdvance());
      container.addEventListener('mouseleave', () => this.startAutoAdvance());
    }
  }

  startAutoAdvance() {
    if (this.images.length > 1) {
      this.autoAdvanceInterval = setInterval(() => this.nextSlide(), 5000);
    }
  }

  stopAutoAdvance() {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
  }

  updateSlides() {
    const slidesContainer = document.getElementById('carouselSlides');
    if (!slidesContainer) return;
    
    const translateX = -this.currentIndex * 100;
    slidesContainer.style.transform = `translateX(${translateX}%)`;
    
    // Update indicators
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });
  }

  nextSlide() {
    if (this.images.length <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.updateSlides();
  }

  prevSlide() {
    if (this.images.length <= 1) return;
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.updateSlides();
  }

  goToSlide(index) {
    this.currentIndex = index;
    this.updateSlides();
  }

  // Method to update images after initialization
  updateImages(newImages) {
    this.stopAutoAdvance();
    this.images = newImages;
    this.currentIndex = 0;
    this.init();
  }
}
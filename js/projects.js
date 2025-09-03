function renderProjectsFromJSON(projects) {
  const container = document.getElementById('project-container');
  container.innerHTML = '';
  
  projects.forEach(project => {
    const div = document.createElement('div');
    div.className = `project ${project.tags.join(' ')}`;
    
    // Create media section
    let mediaHTML = '';
    if (project.video || project.image) {
      mediaHTML = `<div class="project-media">`;
      
      if (project.video) {
        // Use consistent path for both data-video-src and src
        const videoPath = `./assets/videos/${project.video}`;
        
        // Create thumbnail video (paused, showing first frame)
        mediaHTML += `<video class="project-image" muted preload="metadata" data-video-src="${videoPath}">
          <source src="${videoPath}" type="video/mp4">
        </video>`;
        
        // Create hover video (same source, will play on hover)
        mediaHTML += `<video class="project-video" muted loop preload="metadata">
          <source src="${videoPath}" type="video/mp4">
        </video>`;
      } else if (project.image) {
        // For image-only projects, add hover effect
        const imagePath = `./assets/images/${project.image}`;
        mediaHTML += `<img src="${imagePath}" alt="${project.title}" class="project-image" loading="lazy">`;
        // Optional: Add a subtle hover overlay for image projects
        mediaHTML += `<div class="image-hover-overlay"></div>`;
      }
      
      mediaHTML += `</div>`;
    } else {
      mediaHTML = `<div class="project-media no-media">no preview available</div>`;
    }
    
    // Fix project link path - should be relative to current page location
    const projectLink = `./projects/${project.slug ? encodeURIComponent(project.slug) : ''}.html`;
    
    div.innerHTML = `
      ${mediaHTML}
      <div class="project-content">
        <h3><a href="${projectLink}">${project.title ? project.title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Untitled'}</a></h3>
        <p>${project.description ? project.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") : ''}</p>
        <!--<div class="tags">tags: ${Array.isArray(project.tags) ? project.tags.map(tag => tag.replace('-', ' ')).join(', ') : ''}</div>-->
      </div>
    `;
    
    container.appendChild(div);
    
    // Add hover event listeners for video
    if (project.video) {
      const thumbnailVideo = div.querySelector('.project-image[data-video-src]');
      const hoverVideo = div.querySelector('.project-video');
      
      // Set thumbnail to specific frame (e.g., 1 second in)
      if (thumbnailVideo) {
        thumbnailVideo.addEventListener('loadedmetadata', () => {
          const thumbnailTime = project.thumbnailTime || 1; // Default to 1 second
          thumbnailVideo.currentTime = thumbnailTime;
          console.log(`Set thumbnail time to ${thumbnailTime}s for ${project.title}`);
        });
        
        // Add error handling for video loading
        thumbnailVideo.addEventListener('error', (e) => {
          console.error(`Error loading thumbnail video for ${project.title}:`, e);
          // Replace with a placeholder or hide the video
          thumbnailVideo.style.display = 'none';
        });
      }
      
      if (hoverVideo) {
        // Add error handling for hover video
        hoverVideo.addEventListener('error', (e) => {
          console.error(`Error loading hover video for ${project.title}:`, e);
        });
        
        div.addEventListener('mouseenter', () => {
          hoverVideo.currentTime = 0;
          hoverVideo.play().catch(e => {
            console.log('Video play failed:', e);
            // Fallback: could show a static image or do nothing
          });
        });
        
        div.addEventListener('mouseleave', () => {
          hoverVideo.pause();
          hoverVideo.currentTime = 0;
        });
      }
    }
  });
}

function filterProjects(tag, evt) {
  const buttons = document.querySelectorAll('.filters button');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  if (evt && evt.target) {
    evt.target.classList.add('active');
  } else {
    // If no event, find and activate the button for this tag
    const targetButton = document.querySelector(`.filters button[onclick*="${tag}"]`);
    if (targetButton) {
      targetButton.classList.add('active');
    }
  }

  const projects = document.querySelectorAll('.project');
  projects.forEach(project => {
    if (tag === 'all') {
      // Show all projects
      project.classList.remove('hidden');
    } else {
      // Hide projects that do not have the selected tag; show those that do
      project.classList.toggle('hidden', !project.classList.contains(tag));
    }
  });
}

// Path to projects.json - GitHub Pages compatible
const PROJECTS_JSON_PATH = "./data/projects.json";

// Load projects from projects.json
document.addEventListener('DOMContentLoaded', function() {
  console.log('Loading projects from:', PROJECTS_JSON_PATH);
  
  fetch(PROJECTS_JSON_PATH)
    .then(res => {
      console.log('Projects fetch response:', res.status, res.statusText);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Projects data loaded:', data);
      renderProjectsFromJSON(data);
    })
    .catch(error => {
      console.error('Error loading projects:', error);
      const container = document.getElementById('project-container');
      if (container) {
        container.innerHTML = `
          <div class="project-error-message">
            <p>couldn't load projects 😕</p>
            <p style="font-size: 0.9em;">make sure projects.json exists and is properly formatted</p>
            <p style="font-size: 0.8em;">(Expected path: <code>${PROJECTS_JSON_PATH}</code>)</p>
            <details style="margin-top: 10px;">
              <summary>Error details</summary>
              <pre style="font-size: 0.7em; background: #f5f5f5; padding: 10px; margin-top: 5px;">${error.message}</pre>
            </details>
          </div>
        `;
      }
    });
});

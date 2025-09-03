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
        // Create thumbnail video (paused, showing first frame)
        mediaHTML += `<video class="project-image" muted preload="metadata" data-video-src="assets/videos/${project.video}">
          <source src="../assets/videos/${project.video}" type="video/mp4">
        </video>`;
        
        // Create hover video (same source, will play on hover)
        mediaHTML += `<video class="project-video" muted loop preload="metadata">
          <source src="../assets/videos/${project.video}" type="video/mp4">
        </video>`;
      } else if (project.image) {
        // For image-only projects, add hover effect
        mediaHTML += `<img src="../assets/images/${project.image}" alt="${project.title}" class="project-image" loading="lazy">`;
        // Optional: Add a subtle hover overlay for image projects
        mediaHTML += `<div class="image-hover-overlay"></div>`;
      }
      
      mediaHTML += `</div>`;
    } else {
      mediaHTML = `<div class="project-media no-media">no preview available</div>`;
    }
    
    div.innerHTML = `
      ${mediaHTML}
      <div class="project-content">
        <h3><a href="../projects/${project.slug ? encodeURIComponent(project.slug) : ''}.html">${project.title ? project.title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Untitled'}</a></h3>
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
          thumbnailVideo.currentTime = project.thumbnailTime || 1; // Default to 1 second
        });
      }
      
      if (hoverVideo) {
        div.addEventListener('mouseenter', () => {
          hoverVideo.currentTime = 0;
          hoverVideo.play().catch(e => console.log('Video play failed:', e));
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
  }

  const projects = document.querySelectorAll('.project');
  projects.forEach(project => {
    if (tag === 'all') {
      // Hide projects that do not have the selected tag; show those that do
            project.classList.toggle('hidden', !project.classList.contains(tag));
    } else {
      project.classList.toggle('hidden', !project.classList.contains(tag));
    }
  });
}
// Path to projects.json. Update this path if your deployment structure changes.
// Expected location: relative to the HTML file loading this script.
const PROJECTS_JSON_PATH = "data/projects.json";

// Load projects from projects.json
document.addEventListener('DOMContentLoaded', function() {
  fetch(PROJECTS_JSON_PATH)
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => renderProjectsFromJSON(data))
    .catch(error => {
      console.error('Error loading projects:', error);
      const container = document.getElementById('project-container');
      container.innerHTML = `
        <div class="project-error-message">
          <p>couldn't load projects 😕</p>
          <p style="font-size: 0.9em;">make sure projects.json exists and is properly formatted</p>
          <p style="font-size: 0.8em;">(Expected path: <code>${PROJECTS_JSON_PATH}</code>)</p>
        </div>
      `;
    });
});
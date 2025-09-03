function renderPrototypes(jsonPath, containerSelector, collectionName) {
  fetch(jsonPath)
    .then(res => res.json())
    .then(prototypes => {
      const showcase = document.querySelector(containerSelector);
      showcase.innerHTML = '';
      prototypes.forEach(proto => {
        if (collectionName && proto.collection !== collectionName) return;
        const card = document.createElement('div');
        card.className = 'prototype-card';
        card.innerHTML = `
          <div class="card-front">
            <img src="../${proto.thumbnail}" alt="${proto.title}" class="prototype-thumb">
            <h3>${proto.title}</h3>
            <p class="prototype-brief">${proto.brief}</p>
            <div class="prototype-tech">
              ${proto.technologies.map(tech => `<span>${tech}</span>`).join('')}
            </div>
          </div>
          <div class="card-back">
            <div class="prototype-details">
              ${proto.details.map(detail => `
                <div class="detail-card">
                  <h4>${detail.heading}</h4>
                  <p>${detail.text}</p>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        showcase.appendChild(card);
      });
    });
}
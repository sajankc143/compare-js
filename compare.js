let comparisonMode = false, leftSpecies = null, rightSpecies = null, comparisonOverlay = null;

function createComparisonOverlay() {
  if (comparisonOverlay) return comparisonOverlay;
  const overlay = document.createElement('div');
  overlay.id = 'speciesComparisonOverlay';
  overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);backdrop-filter:blur(15px);z-index:10000;display:none;overflow-y:auto;padding:20px;box-sizing:border-box`;
  
  const container = document.createElement('div');
  container.style.cssText = `max-width:1400px;margin:20px auto;background:rgba(255,255,255,0.2);border-radius:24px;padding:30px;position:relative;min-height:calc(100vh - 100px);box-shadow:0 8px 32px rgba(0,0,0,0.2);border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px)`;
  
  const header = document.createElement('div');
  header.style.cssText = `display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;padding-bottom:15px;border-bottom:1px solid rgba(255,255,255,0.2)`;
  const title = document.createElement('h2');
  title.textContent = 'Species Comparison';
  title.style.cssText = `margin:0;color:white;font-size:28px;text-shadow:0 2px 4px rgba(0,0,0,0.3);font-weight:600`;
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `background:rgba(255,68,68,0.8);color:white;border:none;border-radius:50%;width:40px;height:40px;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);transition:all 0.2s ease`;
  closeBtn.onclick = closeComparison;
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  const searchSection = document.createElement('div');
  searchSection.style.cssText = `display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-bottom:30px;position:relative;z-index:100`;
  searchSection.appendChild(createSearchSection('left', 'Left Species'));
  searchSection.appendChild(createSearchSection('right', 'Right Species'));
  
  const comparisonArea = document.createElement('div');
  comparisonArea.id = 'comparisonDisplay';
  comparisonArea.style.cssText = `display:grid;grid-template-columns:1fr 1fr;gap:30px;min-height:400px;position:relative;z-index:1`;
  
  const leftPanel = document.createElement('div');
  leftPanel.id = 'leftSpeciesPanel';
  leftPanel.style.cssText = `border:1px solid rgba(0,123,255,0.4);border-radius:20px;padding:25px;background:rgba(100,149,237,0.2);backdrop-filter:blur(8px);box-shadow:0 4px 20px rgba(0,0,0,0.1);transition:all 0.3s ease`;
  leftPanel.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.8);padding:50px;font-size:16px">Select a species to compare</div>';
  
  const rightPanel = document.createElement('div');
  rightPanel.id = 'rightSpeciesPanel';
  rightPanel.style.cssText = `border:1px solid rgba(40,167,69,0.4);border-radius:20px;padding:25px;background:rgba(144,238,144,0.2);backdrop-filter:blur(8px);box-shadow:0 4px 20px rgba(0,0,0,0.1);transition:all 0.3s ease`;
  rightPanel.innerHTML = '<div style="text-align:center;color:rgba(255,255,255,0.8);padding:50px;font-size:16px">Select a species to compare</div>';
  
  comparisonArea.appendChild(leftPanel);
  comparisonArea.appendChild(rightPanel);
  container.appendChild(header);
  container.appendChild(searchSection);
  container.appendChild(comparisonArea);
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  comparisonOverlay = overlay;
  return overlay;
}

function createSearchSection(side, label) {
  const section = document.createElement('div');
  section.style.cssText = `border:1px solid ${side === 'left' ? 'rgba(0,123,255,0.4)' : 'rgba(40,167,69,0.4)'};border-radius:20px;padding:25px;background:${side === 'left' ? 'rgba(100,149,237,0.15)' : 'rgba(144,238,144,0.15)'};backdrop-filter:blur(8px);box-shadow:0 4px 20px rgba(0,0,0,0.1);transition:all 0.3s ease;position:relative`;
  
  const titleDiv = document.createElement('div');
  titleDiv.style.cssText = `font-weight:bold;margin-bottom:15px;color:${side === 'left' ? 'rgba(173,216,230,0.9)' : 'rgba(144,238,144,0.9)'};font-size:18px;text-shadow:0 1px 3px rgba(0,0,0,0.3)`;
  titleDiv.textContent = label;
  
  const inputContainer = document.createElement('div');
  inputContainer.style.cssText = `position:relative;margin-bottom:10px;z-index:1000`;
  
  const input = document.createElement('input');
  input.type = 'text';
  input.id = `comparison${side.charAt(0).toUpperCase() + side.slice(1)}Search`;
  input.placeholder = 'Search for a species...';
  input.style.cssText = `width:100%;padding:12px 15px;border:1px solid rgba(255,255,255,0.2);border-radius:12px;font-size:16px;box-sizing:border-box;background:rgba(255,255,255,0.15);color:white;box-shadow:0 2px 10px rgba(0,0,0,0.1);transition:all 0.3s ease;backdrop-filter:blur(5px)`;
  
  const suggestionBox = document.createElement('div');
  suggestionBox.id = `comparison${side.charAt(0).toUpperCase() + side.slice(1)}Suggestions`;
  suggestionBox.style.cssText = `position:absolute;top:calc(100% + 5px);left:0;right:0;background:rgba(20,20,20,0.9);border:1px solid rgba(255,255,255,0.2);border-radius:0 0 12px 12px;max-height:250px;overflow-y:auto;z-index:1100;display:none;backdrop-filter:blur(10px);box-shadow:0 8px 20px rgba(0,0,0,0.3)`;
  
  inputContainer.appendChild(input);
  inputContainer.appendChild(suggestionBox);
  section.appendChild(titleDiv);
  section.appendChild(inputContainer);
  setupComparisonSearch(input.id, suggestionBox.id, side);
  return section;
}

function setupComparisonSearch(inputId, suggestionBoxId, side) {
  const input = document.getElementById(inputId);
  const suggestionBox = document.getElementById(suggestionBoxId);
  
  if (!input || !suggestionBox) {
    setTimeout(() => setupComparisonSearch(inputId, suggestionBoxId, side), 100);
    return;
  }
  
  input.addEventListener("input", async () => {
    const query = normalizeText(input.value);
    suggestionBox.innerHTML = "";
    if (!query) {
      suggestionBox.style.display = "none";
      return;
    }
    
    try {
      await fetchAllSpecies();
      const matches = Array.from(allSpeciesIncludingPng.entries())
        .filter(([normalizedName]) => normalizedName.includes(query))
        .map(([, originalName]) => originalName);
      
      if (matches.length === 0) {
        suggestionBox.style.display = "none";
        return;
      }
      
      matches.slice(0, 8).forEach(name => {
        const div = document.createElement("div");
        div.style.cssText = `padding:12px 15px;cursor:pointer;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.9);transition:all 0.2s ease;font-size:15px`;
        
        const dashIndex = name.indexOf(" - ");
        let formattedName = dashIndex !== -1 ? `<i>${name.substring(0, dashIndex)}</i> - ${name.substring(dashIndex + 3)}` : `<i>${name}</i>`;
        div.innerHTML = formattedName;
        
        div.onmouseover = () => {
          div.style.background = side === 'left' ? 'rgba(0,123,255,0.3)' : 'rgba(40,167,69,0.3)';
          div.style.color = 'white';
        };
        div.onmouseout = () => {
          div.style.background = 'transparent';
          div.style.color = 'rgba(255,255,255,0.9)';
        };
        div.onclick = () => {
          input.value = name;
          suggestionBox.innerHTML = "";
          suggestionBox.style.display = "none";
          loadSpeciesForComparison(name, side);
        };
        suggestionBox.appendChild(div);
      });
      suggestionBox.style.display = "block";
    } catch (error) {
      console.error("Error fetching species suggestions:", error);
      suggestionBox.style.display = "none";
    }
  });
  
  document.addEventListener("click", e => {
    if (!e.target.closest(`#${inputId}`) && !e.target.closest(`#${suggestionBoxId}`)) {
      suggestionBox.style.display = "none";
    }
  });
}

async function loadSpeciesForComparison(speciesName, side) {
  const panelId = side === 'left' ? 'leftSpeciesPanel' : 'rightSpeciesPanel';
  const panel = document.getElementById(panelId);
  if (!panel) return;
  
  panel.innerHTML = `<div style="text-align:center;padding:50px"><div style="color:rgba(255,255,255,0.8);font-size:16px">Loading ${speciesName}...</div></div>`;
  
  try {
    const butterfly = butterflies.find(b => normalizeText(b.name) === normalizeText(speciesName));
    if (!butterfly) {
      panel.innerHTML = `<div style="text-align:center;padding:50px;color:rgba(255,100,100,0.9);font-size:16px">Species not found: ${speciesName}</div>`;
      return;
    }
    
    if (side === 'left') leftSpecies = butterfly; else rightSpecies = butterfly;
    
    let speciesDetails = null;
    for (const url of butterfly.urls) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const html = await response.text();
          speciesDetails = extractSpeciesDetails(html, speciesName);
          if (speciesDetails) break;
        }
      } catch (error) {
        console.log(`Failed to fetch from ${url}:`, error);
      }
    }
    displaySpeciesInPanel(butterfly, speciesDetails, panelId, side);
  } catch (error) {
    console.error('Error loading species for comparison:', error);
    panel.innerHTML = `<div style="text-align:center;padding:50px;color:rgba(255,100,100,0.9);font-size:16px">Error loading species data</div>`;
  }
}

function extractSpeciesDetails(html, speciesName) {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const normalizedName = normalizeText(speciesName);
  const links = tempDiv.querySelectorAll('td a');
  let speciesLink = null;

  // Find the species link by text content match
  for (const link of links) {
    if (normalizeText(link.textContent) === normalizedName) {
      speciesLink = link;
      break;
    }
  }
  if (!speciesLink) return null;

  const details = { name: speciesName, images: [], description: '', scientificInfo: {} };
  const td = speciesLink.closest('td');
  const table = td.closest('table');

  if (table) {
    const row = td.closest('tr');
    const colIndex = Array.from(row.children).indexOf(td);
    const rows = table.querySelectorAll('tr');

    rows.forEach(row => {
      const cell = row.children[colIndex];
      if (cell) {
        // Find images inside <a> tags (href) - broaden regex to allow query params after extension
        const links = cell.querySelectorAll('a[href]');
        links.forEach(link => {
          const href = link.getAttribute('href');
          // Regex to match image extensions followed optionally by query params or params after slash:
          // Also allow Blogger URLs that contain '/s<number>/' or '=s<number>' params.
          if (href && /\.(jpe?g|png|gif|webp|bmp)(\?.*|\/s\d+.*)?$/i.test(href) && !details.images.includes(href)) {
            details.images.push(href);
          }
        });

        // ALSO get images from <img> tags directly
        const imgs = cell.querySelectorAll('img[src]');
        imgs.forEach(img => {
          const src = img.getAttribute('src');
          if (src && !details.images.includes(src)) {
            details.images.push(src);
          }
        });
      }
    });
  }

  // Extract scientific and common names
  const dashIndex = speciesName.indexOf(' - ');
  if (dashIndex !== -1) {
    const scientificName = speciesName.substring(0, dashIndex).trim();
    const commonName = speciesName.substring(dashIndex + 3).trim();
    const scientificParts = scientificName.split(' ');
    details.scientificInfo = {
      genus: scientificParts[0] || '',
      species: scientificParts[1] || '',
      commonName: commonName,
      fullScientificName: scientificName
    };
  }

  return details;
}


function displaySpeciesInPanel(butterfly, details, panelId, side) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  
  const borderColor = side === 'left' ? 'rgba(0,191,255,0.6)' : 'rgba(50,205,50,0.6)';
  const accentColor = side === 'left' ? 'rgba(0,123,255,0.15)' : 'rgba(40,167,69,0.15)';
  const textColor = 'rgba(255,255,255,0.9)';
  
  let html = `<div style="border-bottom:1px solid ${borderColor};padding-bottom:15px;margin-bottom:20px"><h3 style="margin:0;color:${borderColor};font-size:20px;text-shadow:0 1px 3px rgba(0,0,0,0.3)">${details ? details.scientificInfo.fullScientificName || butterfly.name : butterfly.name}</h3>${details && details.scientificInfo.commonName ? `<p style="margin:5px 0 0 0;color:${textColor};font-size:16px">${details.scientificInfo.commonName}</p>` : ''}</div>`;
  
  if (details && details.images.length > 0) {
    html += `<div style="margin-bottom:20px"><h4 style="color:${borderColor};margin-bottom:10px;text-shadow:0 1px 3px rgba(0,0,0,0.3)">Images</h4><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px">`;
    details.images.slice(0, 4).forEach(src => {
      html += `<div style="background:rgba(255,255,255,0.1);border-radius:16px;border:1px solid rgba(255,255,255,0.2);overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.2);transition:all 0.3s ease;height:600px;display:flex;align-items:center;justify-content:center;position:relative;backdrop-filter:blur(5px)" onmouseover="this.style.transform='scale(1.02)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'"><img src="${src}" alt="Butterfly image" style="max-width:100%;max-height:100%;object-fit:contain;cursor:pointer;padding:15px;transition:transform 0.4s ease" onmouseover="this.style.transform='scale(1.6)'" onmouseout="this.style.transform='scale(1)'" onclick="openImageModal('${src}')"><div style="position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.5);color:white;padding:8px;text-align:center;font-size:12px;backdrop-filter:blur(5px)">Click to enlarge</div></div>`;
    });
    html += `</div></div>`;
  }
  
  if (details && details.scientificInfo) {
    html += `<div style="margin-bottom:20px"><h4 style="color:${borderColor};margin-bottom:10px;text-shadow:0 1px 3px rgba(0,0,0,0.3)">Scientific Classification</h4><div style="background:${accentColor};padding:15px;border-radius:16px;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1)">`;
    if (details.scientificInfo.genus) html += `<p style="margin:5px 0;color:${textColor}"><strong>Genus:</strong> <i>${details.scientificInfo.genus}</i></p>`;
    if (details.scientificInfo.species) html += `<p style="margin:5px 0;color:${textColor}"><strong>Species:</strong> <i>${details.scientificInfo.species}</i></p>`;
    html += `</div></div>`;
  }
  
  html += `<div style="margin-bottom:20px"><h4 style="color:${borderColor};margin-bottom:10px;text-shadow:0 1px 3px rgba(0,0,0,0.3)">Availability</h4><div style="background:${accentColor};padding:15px;border-radius:16px;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.1)"><p style="margin:5px 0;color:${textColor}"><strong>Found on:</strong> ${butterfly.origins.length} page(s)</p><p style="margin:5px 0;color:${textColor}"><strong>On Homepage:</strong> ${butterfly.onHomepage ? 'Yes' : 'No'}</p>${butterfly.isPng ? `<p style="margin:5px 0;color:rgba(255,165,0,0.9)"><strong>Note:</strong> PNG species</p>` : ''}</div></div>`;
  
  html += `<div><h4 style="color:${borderColor};margin-bottom:10px;text-shadow:0 1px 3px rgba(0,0,0,0.3)">View on Site</h4><div style="display:flex;flex-wrap:wrap;gap:10px">`;
  butterfly.urls.slice(0, 3).forEach((url, index) => {
    const pageName = getPageName(butterfly.origins[index]);
    html += `<a href="${url}" target="_blank" style="display:inline-block;padding:8px 16px;background:${borderColor};color:white;text-decoration:none;border-radius:12px;font-size:14px;box-shadow:0 2px 10px rgba(0,0,0,0.2);transition:all 0.3s ease;backdrop-filter:blur(5px);border:1px solid rgba(255,255,255,0.2)" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 4px 15px rgba(0,0,0,0.3)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 2px 10px rgba(0,0,0,0.2)'">${pageName}</a>`;
  });
  html += `</div></div>`;
  panel.innerHTML = html;
}

function getPageName(url) {
  if (url.includes('/butterflies-of-texas.html')) return 'Texas';
  if (url.includes('/butterflies-of-florida.html')) return 'Florida';
  if (url.includes('/butterflies-of-arizona.html')) return 'Arizona';
  if (url.includes('/butterflies-of-new-mexico.html')) return 'New Mexico';
  if (url.includes('/butterflies-of-puerto-rico.html')) return 'Puerto Rico';
  if (url.includes('/butterflies-of-panama.html')) return 'Panama';
  if (url.includes('butterflyexplorers.com/')) return 'Homepage';
  return 'Page';
}

function openImageModal(src) {
  const modal = document.createElement('div');
  modal.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:transparent;backdrop-filter:blur(20px);display:flex;align-items:center;justify-content:center;z-index:11000;cursor:pointer`;
  const imgContainer = document.createElement('div');
  imgContainer.style.cssText = `width:90%;height:90%;position:relative;background:transparent;border-radius:24px;border:1px solid rgba(255,255,255,0.3);backdrop-filter:blur(10px);box-shadow:0 15px 40px rgba(0,0,0,0.4);overflow:hidden;display:flex;align-items:center;justify-content:center`;
  const img = document.createElement('img');
  img.src = src;
  img.style.cssText = `max-width:100%;max-height:100%;object-fit:contain;box-sizing:border-box`;
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = `position:absolute;top:25px;right:25px;background:rgba(255,68,68,0.9);color:white;border:none;border-radius:50%;width:45px;height:45px;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.3);z-index:10;backdrop-filter:blur(5px);border:1px solid rgba(255,255,255,0.2);transition:all 0.2s ease`;
  closeBtn.onclick = e => { e.stopPropagation(); modal.remove(); };
  imgContainer.appendChild(img);
  imgContainer.appendChild(closeBtn);
  modal.appendChild(imgContainer);
  document.body.appendChild(modal);
  modal.onclick = () => modal.remove();
}

function openComparison() {
  comparisonMode = true;
  const overlay = createComparisonOverlay();
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const leftInput = document.getElementById('comparisonLeftSearch');
    if (leftInput) leftInput.focus();
  }, 100);
}

function closeComparison() {
  comparisonMode = false;
  if (comparisonOverlay) comparisonOverlay.style.display = 'none';
  document.body.style.overflow = 'auto';
  leftSpecies = null;
  rightSpecies = null;
}

function createComparisonButton() {
  const button = document.createElement('button');
  button.id = 'openComparisonBtn';
  button.innerHTML = 'Compare Species';
  button.style.cssText = `position:fixed;bottom:25px;left:25px;padding:14px 24px;background:rgba(0,123,255,0.8);color:white;border:none;border-radius:30px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 8px 25px rgba(0,0,0,0.3);z-index:1000;transition:all 0.3s ease;backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.3)`;
  button.onclick = openComparison;
  document.body.appendChild(button);
}

function initializeComparison() {
  if (typeof fetchAllSpecies === 'undefined') {
    setTimeout(initializeComparison, 500);
    return;
  }
  createComparisonButton();
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      openComparison();
    }
  });
}

(function injectGlassmorphicOverrides() {
  const style = document.createElement('style');
  style.innerHTML = `
    #speciesComparisonOverlay h2 { font-size: 22px !important; }
    #speciesComparisonOverlay h3 { font-size: 16px !important; }
    #speciesComparisonOverlay h4 { font-size: 14px !important; }
    #speciesComparisonOverlay p { font-size: 13px !important; }
    #speciesComparisonOverlay, #speciesComparisonOverlay > div, #comparisonDisplay > div, #comparisonDisplay .img-container, #comparisonDisplay input, #comparisonDisplay .suggestion-box, #comparisonLeftSuggestions, #comparisonRightSuggestions, #openComparisonBtn, button, input {
      background: rgba(255, 255, 255, 0.08) !important;
      backdrop-filter: blur(25px) !important;
      border: 1px solid rgba(255, 255, 255, 0.15) !important;
      box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15) !important;
    }
    button:hover { background-color: rgba(173, 216, 230, 0.2) !important; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25) !important; }
    #speciesComparisonOverlay h2, #speciesComparisonOverlay h3, #speciesComparisonOverlay h4, #speciesComparisonOverlay p {
      color: rgba(255, 255, 255, 0.95) !important;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4) !important;
    }
    #comparisonDisplay input { color: white !important; }
    #comparisonLeftSuggestions div:hover, #comparisonRightSuggestions div:hover {
      background: rgba(0, 150, 255, 0.3) !important;
      color: white !important;
    }
    #speciesComparisonOverlay img { filter: drop-shadow(0 0 10px rgba(255,255,255,0.2)) !important; }
  `;
  document.head.appendChild(style);
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComparison);
} else {
  initializeComparison();
}

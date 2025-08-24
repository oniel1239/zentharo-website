(function(){
  const isRequestsPage = () => location.pathname.includes('request-approval');

  function ensureColumns(){
    const container = document.querySelector('.requests-container');
    if (!container) return null;
    if (document.getElementById('pending-list') && document.getElementById('approved-list') && document.getElementById('completed-list')){
      return container;
    }
    // Build columns wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'requests-columns';
    wrapper.style.display = 'grid';
    wrapper.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    wrapper.style.gap = '1.5rem';

    const sections = [
      { id:'pending', title:'Pending' },
      { id:'approved', title:'Approved' },
      { id:'completed', title:'Completed' }
    ];

    const frag = document.createDocumentFragment();
    sections.forEach(s => {
      const col = document.createElement('div');
      col.className = 'requests-column';
      col.style.background = 'rgba(255,255,255,0.9)';
      col.style.borderRadius = '10px';
      col.style.padding = '1rem';
      col.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';

      const h = document.createElement('h3');
      h.textContent = s.title;
      h.style.margin = '0 0 0.5rem 0';
      h.style.color = '#333';

      const list = document.createElement('div');
      list.id = `${s.id}-list`;
      list.className = 'requests-list';
      list.style.display = 'grid';
      list.style.gap = '1rem';

      col.appendChild(h);
      col.appendChild(list);
      frag.appendChild(col);
    });

    // Move any existing cards to a staging array
    const existingCards = Array.from(container.querySelectorAll('.request-card'));
    container.innerHTML = '';
    container.appendChild(wrapper);
    wrapper.appendChild(frag);

    existingCards.forEach(placeCardInColumn);
    return container;
  }

  function getStatus(card){
    const el = card.querySelector('.status');
    if (!el) return 'pending';
    if (el.classList.contains('completed')) return 'completed';
    if (el.classList.contains('approved')) return 'approved';
    return 'pending';
  }

  function setStatus(card, status){
    const el = card.querySelector('.status');
    if (!el) return;
    el.classList.remove('pending','approved','completed');
    el.classList.add(status);
    el.textContent = status.charAt(0).toUpperCase() + status.slice(1);
  }

  function adjustPrimaryButton(card, status){
    const btn = card.querySelector('.request-actions button');
    if (!btn) return;
    btn.classList.remove('view-details-btn','complete-details-btn');
    btn.disabled = false;
    btn.style.opacity = '';
    if (status === 'pending'){
      btn.textContent = 'View Details';
      btn.classList.add('view-details-btn');
    } else if (status === 'approved'){
      btn.textContent = 'Complete Details';
      btn.classList.add('complete-details-btn');
    } else {
      btn.textContent = 'Completed';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    }
  }

  function placeCardInColumn(card){
    const status = getStatus(card);
    const container = document.querySelector('.requests-container');
    if (!container) return;
    const pending = document.getElementById('pending-list');
    const approved = document.getElementById('approved-list');
    const completed = document.getElementById('completed-list');
    const target = status === 'approved' ? approved : (status === 'completed' ? completed : pending);
    if (target) target.appendChild(card);
    adjustPrimaryButton(card, status);
  }

  function upsertUpdateStatus(card, next){
    // Prefer existing updateRequestStatus if available (keeps progress/statistics in sync)
    if (typeof window.updateRequestStatus === 'function'){
      window.updateRequestStatus(card, next);
    } else {
      setStatus(card, next);
    }
    placeCardInColumn(card);
  }

  function handleClicks(e){
    const t = e.target;
    if (!t) return;
    if (t.classList.contains('view-details-btn')){
      const card = t.closest('.request-card');
      if (!card) return;
      upsertUpdateStatus(card, 'approved');
      e.preventDefault();
    } else if (t.classList.contains('complete-details-btn')){
      const card = t.closest('.request-card');
      if (!card) return;
      upsertUpdateStatus(card, 'completed');
      e.preventDefault();
    }
  }

  function observeContainer(){
    const container = document.querySelector('.requests-container');
    if (!container) return;
    const observer = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(node => {
          if (node && node.nodeType === 1){
            if (node.classList && node.classList.contains('request-card')){
              // A single card appended directly
              ensureColumns();
              placeCardInColumn(node);
            } else {
              // Cards appended within a fragment
              const cards = node.querySelectorAll ? node.querySelectorAll('.request-card') : [];
              if (cards && cards.length){
                ensureColumns();
                cards.forEach(placeCardInColumn);
              }
            }
          }
        });
      });
    });
    observer.observe(container, { childList: true, subtree: true });
  }

  function init(){
    if (!isRequestsPage()) return;
    document.addEventListener('click', handleClicks);
    // Initial layout and watch for async load
    ensureColumns();
    // Move any cards already present
    document.querySelectorAll('.request-card').forEach(placeCardInColumn);
    // Watch for later added cards (loaded from API)
    observeContainer();
  }

  document.addEventListener('DOMContentLoaded', init);
})();

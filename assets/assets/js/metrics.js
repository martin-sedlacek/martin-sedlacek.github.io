// Live GitHub stars + citation counts on publication entries.
// Rendered by _layouts/bib.html for any bib entry with code={github url} or
// arxiv={id}. Each badge stays hidden unless its request succeeds, so a rate
// limit shows nothing rather than a zero.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-gh-stars]').forEach(function (el) {
    fetch('https://api.github.com/repos/' + el.getAttribute('data-gh-stars'))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || typeof d.stargazers_count !== 'number') return;
        el.querySelector('b').textContent = d.stargazers_count;
        el.classList.add('loaded');
      })
      .catch(function () {});
  });

  document.querySelectorAll('[data-citations]').forEach(function (el) {
    var id = el.getAttribute('data-citations'), key = 'ms-cites-' + id, b = el.querySelector('b');
    function show(n) { if (typeof n === 'number' && n > 0) { b.textContent = n; el.classList.add('loaded'); } }
    // Semantic Scholar's unauthenticated pool answers 429 without CORS headers,
    // so render the cached value first and treat the network as an upgrade.
    var cached = null;
    try { cached = parseInt(localStorage.getItem(key), 10); } catch (e) {}
    show(cached);
    function load(retry) {
      fetch('https://api.semanticscholar.org/graph/v1/paper/arXiv:' + id + '?fields=citationCount')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || typeof d.citationCount !== 'number') { if (retry) setTimeout(function () { load(false); }, 1200); return; }
          try { localStorage.setItem(key, d.citationCount); } catch (e) {}
          show(d.citationCount);
        })
        .catch(function () { if (retry) setTimeout(function () { load(false); }, 1200); });
    }
    load(true);
  });
});

/**
 * rajbandi.dev — Main Application
 * Vanilla JS, no dependencies
 */

(function () {
  'use strict';

  // ─── Theme Toggle ────────────────────────────────────────────
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleMobile = document.getElementById('theme-toggle-mobile');
  const iconMoon = document.getElementById('icon-moon');
  const iconSun = document.getElementById('icon-sun');

  function setTheme(dark) {
    if (dark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      iconMoon && (iconMoon.classList.remove('hidden'));
      iconSun && (iconSun.classList.add('hidden'));
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      iconMoon && (iconMoon.classList.add('hidden'));
      iconSun && (iconSun.classList.remove('hidden'));
    }
  }

  function toggleTheme() {
    setTheme(!html.classList.contains('dark'));
  }

  // Initialize theme from localStorage or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    setTheme(savedTheme === 'dark');
  } else {
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  themeToggle && themeToggle.addEventListener('click', toggleTheme);
  themeToggleMobile && themeToggleMobile.addEventListener('click', toggleTheme);

  // ─── Mobile Menu ─────────────────────────────────────────────
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  mobileMenuBtn && mobileMenuBtn.addEventListener('click', function () {
    mobileMenu.classList.toggle('hidden');
  });

  // Close mobile menu on link click
  document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileMenu.classList.add('hidden');
    });
  });

  // ─── Navbar scroll effect ────────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', function () {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
      navbar.classList.add('shadow-lg');
    } else {
      navbar.classList.remove('shadow-lg');
    }

    lastScroll = currentScroll;
  });

  // ─── Active nav link highlighting ───────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', function () {
    let current = '';

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('text-saffron-400');
      link.classList.add('text-zinc-400');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('text-saffron-400');
        link.classList.remove('text-zinc-400');
      }
    });
  });

  // ─── Scroll fade-in animation ───────────────────────────────
  function initFadeIn() {
    const elements = document.querySelectorAll('.skill-card, .project-card, .timeline-item, .blog-card');
    elements.forEach(function (el) {
      el.classList.add('fade-in');
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ─── Blog System ─────────────────────────────────────────────
  var blogPosts = [];

  // Simple Markdown parser (handles common patterns)
  function parseMarkdown(md) {
    var html = md
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold and italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Images
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Horizontal rule
      .replace(/^---$/gm, '<hr>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Paragraphs (lines that aren't already wrapped)
      .replace(/^(?!<[hluobpi]|<\/|<hr|<pre|<code|<strong|<em|<a |<img)(.+)$/gm, '<p>$1</p>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    return html;
  }

  // Parse frontmatter from markdown
  function parseFrontmatter(content) {
    var match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };

    var meta = {};
    match[1].split('\n').forEach(function (line) {
      var parts = line.match(/^(\w+):\s*(.+)$/);
      if (parts) {
        var value = parts[2].trim();
        // Handle arrays like [tag1, tag2]
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(function (s) { return s.trim().replace(/"/g, ''); });
        } else {
          value = value.replace(/^["']|["']$/g, '');
        }
        meta[parts[1]] = value;
      }
    });

    return { meta: meta, body: match[2] };
  }

  // Load blog index
  async function loadBlog() {
    var blogList = document.getElementById('blog-list');
    var blogEmpty = document.getElementById('blog-empty');

    try {
      var response = await fetch('blog/posts/index.json');
      if (!response.ok) throw new Error('No blog index');
      blogPosts = await response.json();
    } catch (e) {
      blogPosts = [];
    }

    if (blogPosts.length === 0) {
      blogList.classList.add('hidden');
      blogEmpty.classList.remove('hidden');
      return;
    }

    blogList.innerHTML = '';
    blogPosts.forEach(function (post) {
      var card = document.createElement('a');
      card.href = '#blog/' + post.slug;
      card.className = 'blog-card block bg-zinc-900 border border-zinc-800 rounded-lg p-6 cursor-pointer';
      card.onclick = function (e) {
        e.preventDefault();
        showArticle(post.slug);
      };

      var tagsHtml = '';
      if (post.tags && post.tags.length) {
        tagsHtml = '<div class="flex flex-wrap gap-2 mt-4">' +
          post.tags.map(function (tag) {
            return '<span class="text-xs text-saffron-400 bg-saffron-400/10 px-2 py-0.5 rounded font-mono">' + tag + '</span>';
          }).join('') +
          '</div>';
      }

      card.innerHTML =
        '<div class="flex items-center gap-2 mb-3">' +
        '<span class="font-mono text-xs text-zinc-500">' + post.date + '</span>' +
        '<span class="text-zinc-700">|</span>' +
        '<span class="text-xs text-zinc-500">' + (post.readTime || '5 min read') + '</span>' +
        '</div>' +
        '<h3 class="font-mono font-semibold text-lg text-zinc-200 mb-2 group-hover:text-saffron-400">' + post.title + '</h3>' +
        '<p class="text-sm text-zinc-400 line-clamp-2">' + (post.excerpt || '') + '</p>' +
        tagsHtml;

      blogList.appendChild(card);
    });

    // Re-init fade-in for new blog cards
    initFadeIn();
  }

  // Show a single article
  async function showArticle(slug) {
    var blogArticle = document.getElementById('blog-article');
    var blogContent = document.getElementById('blog-content');
    var mainSections = document.querySelectorAll('body > section, body > nav, body > footer');

    try {
      var response = await fetch('blog/posts/' + slug + '.md');
      if (!response.ok) throw new Error('Article not found');
      var text = await response.text();
      var parsed = parseFrontmatter(text);

      var headerHtml =
        '<div class="mb-8">' +
        '<h1 class="text-3xl md:text-4xl font-bold font-mono text-zinc-100 mb-4">' + (parsed.meta.title || slug) + '</h1>' +
        '<div class="flex flex-wrap items-center gap-3 text-sm text-zinc-500">' +
        '<span class="font-mono">' + (parsed.meta.date || '') + '</span>' +
        (parsed.meta.tags ? '<div class="flex gap-2">' + parsed.meta.tags.map(function (t) {
          return '<span class="text-xs text-saffron-400 bg-saffron-400/10 px-2 py-0.5 rounded">' + t + '</span>';
        }).join('') + '</div>' : '') +
        '</div>' +
        '</div><hr class="border-zinc-800 mb-8">';

      blogContent.innerHTML = headerHtml + parseMarkdown(parsed.body);

      // Hide main content, show article
      mainSections.forEach(function (el) { el.style.display = 'none'; });
      blogArticle.classList.remove('hidden');
      window.scrollTo(0, 0);

      // Update URL hash
      history.pushState(null, '', '#blog/' + slug);
    } catch (e) {
      blogContent.innerHTML = '<p class="text-zinc-500">Article not found.</p>';
    }
  }

  // Back button
  var blogBack = document.getElementById('blog-back');
  blogBack && blogBack.addEventListener('click', function () {
    hideArticle();
  });

  function hideArticle() {
    var blogArticle = document.getElementById('blog-article');
    var mainSections = document.querySelectorAll('body > section, body > nav, body > footer');

    blogArticle.classList.add('hidden');
    mainSections.forEach(function (el) { el.style.display = ''; });
    history.pushState(null, '', window.location.pathname);

    // Scroll to blog section
    var blogSection = document.getElementById('blog');
    if (blogSection) blogSection.scrollIntoView({ behavior: 'smooth' });
  }

  // Handle hash navigation for blog articles
  function handleHash() {
    var hash = window.location.hash;
    if (hash.startsWith('#blog/')) {
      var slug = hash.replace('#blog/', '');
      showArticle(slug);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ─── Terminal typing effect ──────────────────────────────────
  function typeEffect() {
    var cursor = document.getElementById('typed-cursor');
    if (!cursor) return;

    var commands = [
      'biolang run pipeline.bio',
      'git push origin main',
      'dotnet build --release',
      'flutter run',
      'cargo build --release',
    ];

    var parent = cursor.parentElement;
    var textSpan = document.createElement('span');
    textSpan.className = 'text-zinc-300';
    parent.insertBefore(textSpan, cursor);

    var cmdIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var pauseTime = 2000;

    function tick() {
      var currentCmd = commands[cmdIndex];

      if (!isDeleting) {
        textSpan.textContent = currentCmd.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === currentCmd.length) {
          isDeleting = true;
          setTimeout(tick, pauseTime);
          return;
        }
        setTimeout(tick, 80 + Math.random() * 40);
      } else {
        textSpan.textContent = currentCmd.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          cmdIndex = (cmdIndex + 1) % commands.length;
          setTimeout(tick, 500);
          return;
        }
        setTimeout(tick, 40);
      }
    }

    setTimeout(tick, 1500);
  }

  // ─── Initialize ──────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    loadBlog();
    initFadeIn();
    typeEffect();
    handleHash();
  });

})();

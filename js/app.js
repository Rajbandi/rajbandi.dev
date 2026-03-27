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
    initFadeIn();
    typeEffect();
  });

})();

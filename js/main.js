/* ============================================================
 * 深海个人主页 · 交互逻辑（零依赖，file:// 双击也能跑）
 * ============================================================ */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var P = window.PROJECTS || [];

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function setFill(key, value) {
    var el = $('[data-fill="' + key + '"]');
    if (el) el.textContent = value;
  }

  /* ---------- 主题切换 ---------- */
  function initTheme() {
    var btn = $('#theme-toggle');
    var root = document.documentElement;
    var sync = function () {
      btn.textContent = root.dataset.theme === 'dark' ? '☀️' : '🌙';
    };
    sync();
    btn.addEventListener('click', function () {
      var next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('home-theme', next); } catch (e) { /* ignore */ }
      sync();
    });
  }

  /* ---------- 静态内容渲染 ---------- */
  function renderStatic() {
    document.title = (C.name || '我的主页') + ' · 个人主页';

    setFill('name', C.name || '');
    setFill('role', C.role || '');
    setFill('tagline', C.tagline || '');
    setFill('location', '📍 ' + (C.location || ''));

    var edu = C.education || {};
    setFill('edu-badge', '🎓 ' + (edu.major || '计算机科学与技术'));
    setFill('about1', C.about && C.about[0] ? C.about[0] : '');
    setFill('about2', C.about && C.about[1] ? C.about[1] : '');

    // GitHub 链接（hero 按钮）
    var gh = (C.github || '').replace(/^@/, '');
    var ghHref = gh && gh !== '你的用户名' ? 'https://github.com/' + encodeURIComponent(gh) : 'https://github.com/';
    var ghBtn = $('[data-fill="github-link"]');
    if (ghBtn) { ghBtn.href = ghHref; ghBtn.textContent = 'GitHub'; }

    // 头像
    var avatar = $('#avatar');
    if (avatar && C.avatar) {
      avatar.src = C.avatar;
      avatar.alt = C.name + ' 的头像';
    }

    // 关于信息列表
    var info = $('#info-list');
    if (info) {
      var rows = [];
      if (edu.school) rows.push(['学校', edu.school]);
      if (edu.major) rows.push(['专业', edu.major]);
      if (edu.years) rows.push(['时间', edu.years]);
      if (edu.note) rows.push(['备注', edu.note]);
      info.innerHTML = rows.map(function (r) {
        return '<div class="info-item"><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span></div>';
      }).join('');
    }

    // 兴趣标签
    var chips = $('#chips');
    if (chips) {
      chips.innerHTML = (C.interests || []).map(function (t) {
        return '<span class="chip">' + esc(t) + '</span>';
      }).join('');
    }

    // 当前状态
    var statusBox = $('#status-box');
    if (statusBox && C.status) statusBox.textContent = C.status;

    // 技能
    var grid = $('#skills-grid');
    if (grid) {
      grid.innerHTML = (C.skills || []).map(function (s) {
        return '<div class="card skill">' +
          '<div class="skill-head"><span>' + esc(s.name) + '</span><span>' + Number(s.level) + '%</span></div>' +
          '<div class="skill-level"><i data-level="' + Number(s.level) + '"></i></div>' +
          '</div>';
      }).join('');
      // 进入视口后填充宽度
      $all('.skill-level i', grid).forEach(function (bar) {
        var set = function () { bar.style.width = bar.dataset.level + '%'; };
        if ('IntersectionObserver' in window) {
          new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (e) { if (e.isIntersecting) { set(); obs.disconnect(); } });
          }).observe(bar);
        } else { set(); }
      });
    }

    // 联系链接
    var contact = $('#contact-links');
    if (contact) {
      contact.innerHTML = (C.links || []).map(function (l) {
        return '<a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
      }).join('');
    }

    // 时间线
    var tl = $('#timeline');
    if (tl) {
      tl.innerHTML = (C.timeline || []).map(function (t) {
        return '<li>' +
          '<div class="tl-date">' + esc(t.date) + '</div>' +
          '<div class="tl-title">' + esc(t.title) + '</div>' +
          '<div class="tl-desc">' + esc(t.desc) + '</div>' +
          '</li>';
      }).join('');
    }

    // 随笔
    var blog = $('#blog-list');
    if (blog) {
      if (C.blog && C.blog.length) {
        blog.innerHTML = C.blog.map(function (b) {
          var inner = '<span>' + esc(b.title) + '</span><span class="blog-date">' + esc(b.date) + '</span>';
          return b.url
            ? '<a class="blog-item" href="' + esc(b.url) + '" target="_blank" rel="noopener">' + inner + '</a>'
            : '<div class="blog-item">' + inner + '</div>';
        }).join('');
      } else {
        blog.innerHTML = '<div class="blog-empty">第一篇随笔还在路上 🐋 —— 等你的第一个值得记录的时刻。</div>';
      }
    }

    // 页脚年份与最后更新
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
    var updated = $('#updated');
    if (updated) updated.textContent = new Date().toLocaleDateString('zh-CN');
  }

  /* ---------- 项目筛选 ---------- */
  var STATUS_META = {
    done:    { label: '✅ 已完成' },
    doing:   { label: '🔨 进行中' },
    planned: { label: '🗓 计划中' },
  };

  function renderProjects(status) {
    var grid = $('#project-grid');
    var empty = $('#project-empty');
    if (!grid) return;
    var list = P.filter(function (p) { return p.status === status; });
    empty.hidden = list.length > 0;

    grid.innerHTML = list.map(function (p) {
      var s = STATUS_META[p.status] ? p.status : 'done';
      var html = '<article class="card pcard">';
      html += '<div class="pcard-top"><span class="pcard-title">' + esc(p.title) + '</span>';
      html += '<span class="status ' + s + '">' + (STATUS_META[s] ? STATUS_META[s].label : '') + '</span></div>';

      if (p.status === 'planned' && p.priority) {
        var pr = String(p.priority).toUpperCase();
        html += '<div class="pcard-top"><span class="priority ' + (pr === 'P0' ? 'p0' : pr === 'P1' ? 'p1' : 'p2') + '">' + esc(pr) + ' · 优先级</span></div>';
      }

      html += '<p class="pcard-desc">' + esc(p.desc) + '</p>';

      if (p.status === 'doing' && typeof p.progress === 'number') {
        html += '<div class="progress"><i style="width:' + Math.max(0, Math.min(100, p.progress)) + '%"></i></div>';
      }

      var meta = [];
      if (p.date) meta.push(p.status === 'done' ? '完成于 ' + p.date : '更新于 ' + p.date);
      if (p.note) meta.push(p.note);
      if (meta.length) html += '<div class="pcard-meta">' + esc(meta.join(' · ')) + '</div>';

      if (p.tags && p.tags.length) {
        html += '<div class="pcard-tags">' + p.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>';
      }

      var links = [];
      if (p.links && p.links.repo) links.push('<a href="' + esc(p.links.repo) + '" target="_blank" rel="noopener">源码 ↗</a>');
      if (p.links && p.links.demo) links.push('<a href="' + esc(p.links.demo) + '" target="_blank" rel="noopener">在线演示 ↗</a>');
      if (links.length) html += '<div class="pcard-links">' + links.join('') + '</div>';

      html += '</article>';
      return html;
    }).join('');
  }

  function initProjects() {
    $all('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        $all('.tab').forEach(function (t) {
          t.classList.toggle('is-active', t === tab);
          t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
        });
        renderProjects(tab.dataset.status);
      });
    });
    // tab 上显示数量
    $all('.tab').forEach(function (tab) {
      var n = P.filter(function (p) { return p.status === tab.dataset.status; }).length;
      tab.textContent = STATUS_META[tab.dataset.status].label + ' (' + n + ')';
    });
    renderProjects('done');
  }

  /* ---------- 每日一句（按日期轮换） ---------- */
  function initQuote() {
    var q = C.quotes || [];
    var qText = $('#quote-text');
    var qBy = $('#quote-by');
    if (!qText || !q.length) return;
    var start = new Date(new Date().getFullYear(), 0, 0);
    var dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
    var item = q[dayOfYear % q.length];
    qText.textContent = '「' + item.text + '」';
    if (qBy) qBy.textContent = '—— ' + (item.by || '');
  }

  /* ---------- 每日目标打卡（localStorage + 连击） ---------- */
  var GOALS_KEY = 'home-goals-v1';
  var STREAK_KEY = 'home-streak-v1';

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function loadGoals() {
    try {
      var raw = JSON.parse(localStorage.getItem(GOALS_KEY) || 'null');
      if (raw && Array.isArray(raw)) return raw;
    } catch (e) { /* ignore */ }
    return (C.dailyGoals || []).map(function (g) { return { text: g, done: false }; });
  }

  function saveGoals(goals) {
    try { localStorage.setItem(GOALS_KEY, JSON.stringify(goals)); } catch (e) { /* ignore */ }
  }

  function loadStreak() {
    try { return JSON.parse(localStorage.getItem(STREAK_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveStreak(s) {
    try { localStorage.setItem(STREAK_KEY, JSON.stringify(s)); } catch (e) { /* ignore */ }
  }

  /* 记录打卡：每天只要有 ≥1 个目标完成就记一天，算连续天数 */
  function updateStreak(doneToday) {
    var s = loadStreak();
    var today = todayStr();
    var yesterday = new Date(Date.now() - 86400000);
    var yStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');

    if (doneToday) {
      if (s.last !== today) {
        var streak = s.last === yStr ? (s.streak || 0) + 1 : 1;
        s = { last: today, streak: streak };
        saveStreak(s);
      }
    } else {
      // 今天还没完成任何目标：如果昨天有打卡且今天不是昨天，保留 streak，等今天完成时再续
      if (s.last && s.last !== today && s.last !== yStr) {
        s = { last: s.last, streak: 0 }; // 断签
        saveStreak(s);
      }
    }
    return s;
  }

  function renderGoals() {
    var list = $('#goal-list');
    var fill = $('#goal-progress-fill');
    var streakEl = $('#streak');
    if (!list) return;

    var goals = loadGoals();
    var doneToday = goals.some(function (g) { return g.done; });
    var s = updateStreak(doneToday);

    if (streakEl) streakEl.textContent = '🔥 ' + (s.streak || 0) + ' 天';
    if (fill) fill.style.width = (goals.length ? (goals.filter(function (g) { return g.done; }).length / goals.length) * 100 : 0) + '%';

    list.innerHTML = goals.map(function (g, i) {
      return '<li class="' + (g.done ? 'done' : '') + '" data-index="' + i + '">' +
        '<input type="checkbox" ' + (g.done ? 'checked' : '') + ' aria-label="完成：' + esc(g.text) + '">' +
        '<label>' + esc(g.text) + '</label>' +
        '<button class="goal-del" type="button" aria-label="删除目标">✕</button>' +
        '</li>';
    }).join('');

    $all('li', list).forEach(function (li) {
      var i = Number(li.dataset.index);
      var cb = $('input[type="checkbox"]', li);
      cb.addEventListener('change', function () {
        var g = loadGoals();
        g[i].done = cb.checked;
        saveGoals(g);
        renderGoals();
      });
      $('.goal-del', li).addEventListener('click', function () {
        var g = loadGoals();
        g.splice(i, 1);
        saveGoals(g);
        renderGoals();
      });
    });
  }

  function initGoalForm() {
    var form = $('#goal-add');
    var input = $('#goal-input');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = (input.value || '').trim();
      if (!text) return;
      var g = loadGoals();
      g.push({ text: text, done: false });
      saveGoals(g);
      input.value = '';
      renderGoals();
    });
  }

  /* ---------- GitHub 统计卡片 ---------- */
  function initGithub() {
    var gh = (C.github || '').replace(/^@/, '');
    var box = $('#github-stats');
    if (!box) return;
    if (!gh || gh === '你的用户名') return; // 显示默认引导文案

    var base = 'https://github-readme-stats.vercel.app/api';
    var card1 = base + '?username=' + encodeURIComponent(gh) +
      '&show_icons=true&theme=transparent&hide_border=true&text_color=b5c1dd&title_color=eed299&icon_color=c5a468';
    var card2 = 'https://github-readme-streak-stats.herokuapp.com/?user=' + encodeURIComponent(gh) +
      '&theme=transparent&hide_border=true&ring=eed299&fire=c5a468&currStreakNum=b5c1dd';
    var link = 'https://github.com/' + encodeURIComponent(gh);
    box.innerHTML =
      '<img src="' + esc(card2) + '" alt="GitHub 连击统计">' +
      '<img src="' + esc(card1) + '" alt="GitHub 统计">' +
      '<a href="' + esc(link) + '" target="_blank" rel="noopener">去 GitHub 看看 ↗</a>';
  }

  /* ---------- 滚动浮现 ---------- */
  function initReveal() {
    var els = $all('.section');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el) { el.classList.add('reveal'); obs.observe(el); });
  }

  /* ---------- 启动 ---------- */
  function init() {
    initTheme();
    renderStatic();
    initProjects();
    initQuote();
    renderGoals();
    initGoalForm();
    initGithub();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// ==========================================
// 智能在线考试系统 V2.0 - 前端主逻辑
// 支持三角色: admin / teacher / student
// ==========================================

const APP = {
  currentPage: 'auth',
  currentExam: null,
  currentQuestionIndex: 0,
  examTimer: null,
  remainingSeconds: 0,
  examAutoSubmit: false,
  practiceMode: false,
  practiceQuestions: [],
  practiceIndex: 0,
  cheatCount: 0,

  async init() {
    // 严格校验登录状态
    if (!API.token || !API.user) {
      this.showPage('auth');
      this.bindAuthTabs();
      this.bindEvents();
      return;
    }
    // 验证token有效性
    try {
      const res = await API.getUserInfo();
      if (res.code !== 200) {
        API.clearAuth();
        this.showPage('auth');
        this.bindAuthTabs();
        this.bindEvents();
        return;
      }
      await this.loadHome();
      this.showPage('home');
    } catch (e) {
      API.clearAuth();
      this.showPage('auth');
    }
    this.bindAuthTabs();
    this.bindEvents();
  },

  showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    const el = document.getElementById('page-' + page);
    if (el) el.classList.add('active');
    this.currentPage = page;

    const tabbar = document.getElementById('tabbar');
    tabbar.classList.toggle('active', ['home', 'records', 'wrongbook', 'profile'].includes(page));

    document.querySelectorAll('.tab-item').forEach(t => t.classList.toggle('active', t.dataset.page === page));

    if (page === 'home') this.loadHome();
    else if (page === 'questions') this.loadQuestions();
    else if (page === 'exam-manage') this.loadExamManage();
    else if (page === 'records') this.loadMyRecords();
    else if (page === 'wrongbook') this.loadWrongBook();
    else if (page === 'profile') this.loadProfile();
    else if (page === 'score-manage') this.loadScoreManage();
    else if (page === 'admin-users') this.loadAdminUsers();
    else if (page === 'admin-announcements') this.loadAdminAnnouncementsPage();
    else if (page === 'admin-knowledge') this.loadAdminKnowledge();
    else if (page === 'essay-grade') this.loadEssayGrade();
    else if (page === 'practice') this.loadPractice();
  },

  showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  },

  closeModal(id) { document.getElementById(id).classList.remove('active'); },

  bindEvents() {
    document.getElementById('mq-type')?.addEventListener('change', () => this.updateOptionsVisibility());
    const kw = document.getElementById('q-filter-keyword');
    if (kw) kw.onkeyup = e => { if (e.key === 'Enter') this.doLoadQuestions(); };
  },

  bindAuthTabs() {
    document.querySelectorAll('.auth-tabs .tab-btn').forEach(btn => {
      btn.onclick = function() {
        document.querySelectorAll('.auth-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.getElementById('form-login').classList.toggle('hidden', this.dataset.tab !== 'login');
        document.getElementById('form-register').classList.toggle('hidden', this.dataset.tab !== 'register');
      };
    });
  },

  // ===== 认证 =====
  async login() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    if (!u || !p) return this.showToast('请输入用户名和密码');
    const res = await API.login({ username: u, password: p });
    if (res.code === 200) {
      API.setAuth(res.data.token, res.data.user);
      this.showToast('登录成功');
      this.loadHome();
      this.showPage('home');
    } else this.showToast(res.msg);
  },

  async register() {
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const nickname = document.getElementById('reg-nickname').value.trim();
    const role = document.getElementById('reg-role').value;
    const student_no = document.getElementById('reg-student-no').value.trim();
    const department = document.getElementById('reg-department').value.trim();
    if (!username || !password || !nickname) return this.showToast('请填写所有必填项');
    if (password.length < 6) return this.showToast('密码至少6位');
    const res = await API.register({ username, password, nickname, role, student_no, department });
    if (res.code === 200) {
      this.showToast('注册成功，请登录');
      document.querySelector('.auth-tabs .tab-btn:first-child').click();
    } else this.showToast(res.msg);
  },

  logout() {
    if (this.examTimer) clearInterval(this.examTimer);
    this.unbindCheatDetection();
    API.clearAuth();
    this.showPage('auth');
  },

  // ===== 首页 =====
  async loadHome() {
    const role = API.user?.role;
    // 显示公告
    this.loadAnnouncements();

    document.getElementById('home-student').classList.add('hidden');
    document.getElementById('home-teacher').classList.add('hidden');
    document.getElementById('home-admin').classList.add('hidden');

    if (role === 'admin') await this.loadAdminHome();
    else if (role === 'teacher') await this.loadTeacherHome();
    else await this.loadStudentHome();

    // 更新底部导航
    const tabRecords = document.getElementById('tab-records');
    const tabWrong = document.getElementById('tab-wrongbook');
    if (tabRecords) tabRecords.style.display = role === 'student' ? '' : 'none';
    if (tabWrong) tabWrong.style.display = role === 'student' ? '' : 'none';
  },

  async loadAnnouncements() {
    const res = await API.getAnnouncements();
    const el = document.getElementById('announcement-list');
    if (res.code === 200 && res.data.length > 0) {
      el.innerHTML = res.data.map(a => `
        <div class="announce-item" style="padding:10px 14px;margin-bottom:6px;background:#fff;border-left:3px solid ${a.is_top>0?'var(--primary)':'#ddd'};border-radius:6px;font-size:13px;">
          <strong>${a.is_top>0?'📌 ':''}${a.title}</strong>
          <div style="color:#999;font-size:12px;">${a.content} · ${a.publisher_name} · ${new Date(a.create_time).toLocaleDateString()}</div>
        </div>`).join('');
    } else {
      el.innerHTML = '<div style="text-align:center;color:#999;padding:8px;">暂无公告</div>';
    }
  },

  async loadAdminHome() {
    document.getElementById('home-admin').classList.remove('hidden');
    const stats = await API.getAdminStats();
    if (stats.code === 200) {
      document.getElementById('a-stat-users').textContent = stats.data.total_users;
      document.getElementById('a-stat-questions').textContent = stats.data.total_questions;
      document.getElementById('a-stat-exams').textContent = stats.data.total_exams;
      document.getElementById('a-stat-records').textContent = stats.data.total_records;
      document.getElementById('a-stat-avg').textContent = stats.data.avg_score;
    }
    // 扩展管理员菜单
    const menu = document.querySelector('#home-admin .menu-grid');
    if (menu) {
      menu.innerHTML = `
        <div class="menu-item" onclick="APP.showPage('admin-users')">👥<span>用户管理</span></div>
        <div class="menu-item" onclick="APP.showPage('questions')">📚<span>题库管理</span></div>
        <div class="menu-item" onclick="APP.showPage('exam-manage')">📋<span>试卷管理</span></div>
        <div class="menu-item" onclick="APP.showPage('score-manage')">📊<span>成绩总览</span></div>
        <div class="menu-item" onclick="APP.showPage('admin-announcements')">📢<span>公告管理</span></div>
        <div class="menu-item" onclick="APP.showPage('admin-knowledge')">🧩<span>知识点管理</span></div>
        <div class="menu-item" onclick="APP.showPage('profile')">👤<span>个人信息</span></div>
      `;
    }
    // 在管理员主页底部追加公告快速管理
    let panel = document.getElementById('admin-announce-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'admin-announce-panel';
      panel.style.cssText = 'margin:12px 16px;';
      document.getElementById('home-admin').appendChild(panel);
    }
    this.loadAdminAnnouncePanel(panel);
  },

  async loadAdminAnnouncePanel(panel) {
    const res = await API.getAdminAnnouncements();
    let html = '<div style="font-weight:700;font-size:14px;margin-bottom:8px;">📢 公告管理</div>';
    html += `<div style="display:flex;gap:6px;margin-bottom:8px;">
      <input type="text" id="admin-ann-title" placeholder="标题" style="flex:1;padding:6px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;">
      <button class="btn-sm" style="background:var(--primary);color:#fff;white-space:nowrap;" onclick="APP.createAdminAnnouncement()">+ 发布</button>
    </div>
    <textarea id="admin-ann-content" rows="2" placeholder="公告内容" style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;margin-bottom:6px;resize:vertical;"></textarea>
    <label style="font-size:12px;color:#999;"><input type="checkbox" id="admin-ann-top"> 置顶</label>`;
    if (res.code === 200 && res.data.length > 0) {
      html += res.data.map(a => `
        <div style="padding:10px;margin:6px 0;background:#fff;border-radius:6px;border:1px solid #eee;font-size:13px;">
          <strong>${a.is_top>0?'📌 ':''}${a.title}</strong>
          <span style="font-size:11px;color:#999;"> · ${a.publisher_name} · ${new Date(a.create_time).toLocaleDateString()}</span>
          <div style="color:#666;margin:4px 0;">${a.content}</div>
          <div style="display:flex;gap:4px;margin-top:4px;">
            <button class="btn-sm" style="background:#17a2b8;font-size:11px;padding:2px 8px;" onclick="APP.editAdminAnnouncement(${a.id},'${a.title.replace(/'/g,"\\'")}','${a.content.replace(/'/g,"\\'").replace(/\n/g,'\\n')}',${a.is_top})">✏️</button>
            <button class="btn-sm" style="background:#dc3545;font-size:11px;padding:2px 8px;" onclick="APP.deleteAdminAnnouncement(${a.id})">🗑</button>
          </div>
        </div>`).join('');
    }
    panel.innerHTML = html;
  },

  async createAdminAnnouncement() {
    const title = document.getElementById('admin-ann-title').value.trim();
    const content = document.getElementById('admin-ann-content').value.trim();
    const is_top = document.getElementById('admin-ann-top').checked;
    if (!title || !content) return this.showToast('标题和内容不能为空');
    const res = await API.createAdminAnnouncement({ title, content, is_top });
    if (res.code === 200) {
      this.showToast('发布成功');
      document.getElementById('admin-ann-title').value = '';
      document.getElementById('admin-ann-content').value = '';
      document.getElementById('admin-ann-top').checked = false;
      this.loadHome();
    } else this.showToast(res.msg);
  },

  editAdminAnnouncement(id, title, content, is_top) {
    const newTitle = prompt('标题', title);
    if (!newTitle) return;
    const newContent = prompt('内容', content);
    if (!newContent) return;
    const newTop = confirm('置顶？') ? 1 : 0;
    API.updateAdminAnnouncement(id, { title: newTitle, content: newContent, is_top: newTop }).then(r => {
      if (r.code === 200) { this.showToast('已更新'); this.loadHome(); }
      else this.showToast(r.msg);
    });
  },

  async deleteAdminAnnouncement(id) {
    if (!confirm('确定删除该公告？')) return;
    const res = await API.deleteAdminAnnouncement(id);
    if (res.code === 200) { this.showToast('已删除'); this.loadHome(); }
    else this.showToast(res.msg);
  },

  // ===== 知识点管理（管理员） =====
  async loadAdminKnowledge() {
    const res = await API.getAdminKnowledge();
    const page = document.getElementById('page-admin-knowledge');
    if (!page) return;
    let html = '<div class="topbar"><button class="btn-back" onclick="APP.showPage(\'home\')">←</button><div class="topbar-title">知识点管理</div><button class="btn-add" onclick="APP.showAddKnowledge()">+ 添加</button></div>';
    html += '<div class="list-content" id="knowledge-list">';
    if (res.code === 200 && res.data.length > 0) {
      html += res.data.map(k => `
        <div class="list-item">
          <div style="font-weight:600;">${k.name} <span style="font-size:12px;color:#999;">· ${k.subject}</span></div>
          <div style="font-size:12px;color:#999;">${k.description||''} · ${k.question_count||0}题</div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button class="btn-sm" onclick="APP.editKnowledge(${k.id},'${k.name.replace(/'/g,"\\'")}','${(k.subject||'').replace(/'/g,"\\'")}','${(k.description||'').replace(/'/g,"\\'")}')">✏️</button>
            <button class="btn-sm" style="background:#dc3545;" onclick="APP.deleteKnowledge(${k.id})">🗑</button>
          </div>
        </div>`).join('');
    } else {
      html += '<div style="text-align:center;padding:40px;color:#999;">暂无知识点</div>';
    }
    html += '</div>';
    page.innerHTML = html;
    page.classList.add('active');
  },

  async loadAdminAnnouncementsPage() {
    const page = document.getElementById('page-admin-announcements');
    if (!page) return;
    this.currentPage = 'admin-announcements';
    const res = await API.getAdminAnnouncements();
    let html = '<div class="topbar"><button class="btn-back" onclick="APP.showPage(\'home\')">←</button><div class="topbar-title">公告管理</div></div>';
    html += `<div style="margin:16px;">
      <div style="display:flex;gap:6px;margin-bottom:8px;">
        <input type="text" id="admin-ann-page-title" placeholder="标题" style="flex:1;padding:6px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;">
        <button class="btn-sm" style="background:var(--primary);color:#fff;white-space:nowrap;" onclick="APP.createAdminAnnouncementFromPage()">+ 发布</button>
      </div>
      <textarea id="admin-ann-page-content" rows="3" placeholder="公告内容" style="width:100%;padding:8px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;margin-bottom:6px;resize:vertical;"></textarea>
      <label style="font-size:12px;color:#999;"><input type="checkbox" id="admin-ann-page-top"> 置顶</label>
    </div><div class="list-content">`;
    if (res.code === 200 && res.data.length > 0) {
      html += res.data.map(a => `
        <div class="list-item">
          <strong>${a.is_top>0?'📌 ':''}${a.title}</strong>
          <span style="font-size:11px;color:#999;"> · ${a.publisher_name} · ${new Date(a.create_time).toLocaleDateString()}</span>
          <div style="color:#666;margin:4px 0;">${a.content}</div>
          <div style="display:flex;gap:4px;margin-top:4px;">
            <button class="btn-sm" style="background:#17a2b8;font-size:11px;padding:2px 8px;" onclick="APP.editAdminAnnouncement(${a.id},'${a.title.replace(/'/g,"\\'")}','${a.content.replace(/'/g,"\\'").replace(/\n/g,'\\n')}',${a.is_top})">✏️</button>
            <button class="btn-sm" style="background:#dc3545;font-size:11px;padding:2px 8px;" onclick="APP.deleteAdminAnnouncement(${a.id})">🗑</button>
          </div>
        </div>`).join('');
    } else {
      html += '<div style="text-align:center;padding:40px;color:#999;">暂无公告</div>';
    }
    html += '</div>';
    page.innerHTML = html;
    page.classList.add('active');
  },

  async createAdminAnnouncementFromPage() {
    const title = document.getElementById('admin-ann-page-title').value.trim();
    const content = document.getElementById('admin-ann-page-content').value.trim();
    const is_top = document.getElementById('admin-ann-page-top').checked;
    if (!title || !content) return this.showToast('标题和内容不能为空');
    const res = await API.createAdminAnnouncement({ title, content, is_top });
    if (res.code === 200) {
      this.showToast('发布成功');
      this.loadAdminAnnouncementsPage();
    } else this.showToast(res.msg);
  },

  showAddKnowledge() {
    const name = prompt('知识点名称');
    if (!name) return;
    const subject = prompt('所属学科');
    if (!subject) return;
    const desc = prompt('描述（可选）') || '';
    API.createAdminKnowledge({ name, subject, description: desc }).then(r => {
      if (r.code === 200) { this.showToast('添加成功'); this.loadAdminKnowledge(); }
      else this.showToast(r.msg);
    });
  },

  editKnowledge(id, name, subject, desc) {
    const newName = prompt('知识点名称', name);
    if (!newName) return;
    const newSubject = prompt('学科', subject);
    if (!newSubject) return;
    const newDesc = prompt('描述', desc) || '';
    API.updateAdminKnowledge(id, { name: newName, subject: newSubject, description: newDesc }).then(r => {
      if (r.code === 200) { this.showToast('已更新'); this.loadAdminKnowledge(); }
      else this.showToast(r.msg);
    });
  },

  async deleteKnowledge(id) {
    if (!confirm('确定删除？关联题目将失去知识点标签。')) return;
    const res = await API.deleteAdminKnowledge(id);
    if (res.code === 200) { this.showToast('已删除'); this.loadAdminKnowledge(); }
    else this.showToast(res.msg);
  },

  async loadTeacherHome() {
    document.getElementById('home-teacher').classList.remove('hidden');
    document.getElementById('teacher-nickname').textContent = API.user?.nickname;
    const stats = await API.getTeacherOverview();
    if (stats.code === 200) {
      document.getElementById('t-stat-q').textContent = stats.data.question_count;
      document.getElementById('t-stat-e').textContent = stats.data.exam_count;
      document.getElementById('t-stat-r').textContent = stats.data.record_count;
      document.getElementById('t-stat-avg').textContent = stats.data.avg_score;
    }
  },

  async loadStudentHome() {
    document.getElementById('home-student').classList.remove('hidden');
    document.getElementById('home-nickname').textContent = API.user?.nickname || '同学';
    const stats = await API.getMyOverview();
    if (stats.code === 200) {
      document.getElementById('stat-total').textContent = stats.data.total_exams;
      document.getElementById('stat-passed').textContent = stats.data.passed_exams;
      document.getElementById('stat-avg').textContent = stats.data.avg_score;
    }
    const res = await API.getAvailableExams();
    const list = document.getElementById('exam-list');
    if (res.code === 200 && res.data.length > 0) {
      list.innerHTML = res.data.map(e => `
        <div class="exam-card" style="margin-bottom:12px;">
          <div class="card-title">${e.title}</div>
          <div class="card-info">⏱ ${e.duration}分钟 · 📝 ${e.question_count}题 · 📊 ${e.total_score}分 · 👨‍🏫 ${e.teacher_name}</div>
          ${e.my_attempts > 0 ? '<span class="card-tag tag-published">已参加</span>' : ''}
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="btn-sm" onclick="APP.startExam(${e.id})">📝 参加考试</button>
          </div>
        </div>`).join('');
    } else {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">暂无可用考试</div>';
    }
  },

  // ===== 题库管理 =====
  async loadQuestions() {
    const cats = await API.getCategories();
    if (cats.code === 200) {
      const sel = document.getElementById('q-filter-cat');
      sel.innerHTML = '<option value="">全部分类</option>' + cats.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
    // 添加导入按钮
    let importBtn = document.getElementById('btn-import-questions');
    if (!importBtn && document.querySelector('#page-questions .topbar')) {
      importBtn = document.createElement('button');
      importBtn.id = 'btn-import-questions';
      importBtn.className = 'btn-add';
      importBtn.style.cssText = 'background:#17a2b8;margin-left:6px;';
      importBtn.textContent = '📥 导入';
      importBtn.onclick = () => this.showImportQuestions();
      document.querySelector('#page-questions .topbar').appendChild(importBtn);
    }
    await this.doLoadQuestions();
  },

  showImportQuestions() {
    const cats = document.getElementById('q-filter-cat');
    const catId = cats?.value || '';
    const html = `
      <div style="margin:16px;padding:16px;background:#f8f9fa;border-radius:8px;">
        <div style="font-weight:700;margin-bottom:8px;">📥 批量导入题目</div>
        <div class="form-group"><label>目标分类</label><select id="import-cat"></select></div>
        <div class="form-group"><label>题目文本（每行一题，格式: 题型|难度|题目内容|答案|解析|分值）</label>
          <textarea id="import-text" rows="10" placeholder="单选题|中等|HTTP默认端口是？|C|80端口|5&#10;判断题|简单|Python是编译型语言|错|解释型|5&#10;填空题|中等|MySQL中支持事务的存储引擎是____|InnoDB|ACID|6" style="width:100%;font-size:12px;"></textarea></div>
        <div style="font-size:11px;color:#999;margin-bottom:8px;">题型: 单选题/多选题/判断题/填空题/简答题 | 难度: 简单/中等/困难 | 每行格式: 题型|难度|内容|答案|解析|分值</div>
        <button class="btn-primary" onclick="APP.doImportQuestions()">导入</button>
      </div>`;
    const list = document.getElementById('question-list');
    list.insertAdjacentHTML('afterbegin', `<div id="import-form-container">${html}</div>`);
    // 填充分类下拉
    API.getCategories().then(r => {
      if (r.code === 200) {
        const sel = document.getElementById('import-cat');
        if (sel) sel.innerHTML = r.data.map(c => `<option value="${c.id}" ${c.id==catId?'selected':''}>${c.name}</option>`).join('');
      }
    });
  },

  async doImportQuestions() {
    const category_id = document.getElementById('import-cat')?.value;
    const text = document.getElementById('import-text')?.value.trim();
    if (!category_id || !text) return this.showToast('请选择分类并输入题目');
    const res = await API.importQuestions({ category_id: Number(category_id), text });
    if (res.code === 200) {
      this.showToast(res.msg);
      const container = document.getElementById('import-form-container');
      if (container) container.remove();
      this.doLoadQuestions();
    } else this.showToast(res.msg);
  },

  async doLoadQuestions() {
    const p = {
      category_id: document.getElementById('q-filter-cat').value,
      type: document.getElementById('q-filter-type').value,
      keyword: document.getElementById('q-filter-keyword')?.value || '',
      pageSize: 100
    };
    const res = await API.getQuestions(p);
    const list = document.getElementById('question-list');
    const tmap = { single: '单选', multiple: '多选', judge: '判断', fill: '填空', essay: '简答' };
    const dmap = { easy: '🟢', medium: '🟡', hard: '🔴' };
    if (res.code === 200 && res.data.list.length > 0) {
      list.innerHTML = res.data.list.map(q => `
        <div class="list-item">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:12px;">${q.category_name} · ${tmap[q.type]} · ${dmap[q.difficulty]} ${q.difficulty}</span>
            <span style="font-size:12px;color:var(--primary);font-weight:700;">${q.score}分</span>
          </div>
          <div style="font-weight:600;margin-bottom:6px;">${q.content}</div>
          <div style="font-size:12px;color:#999;margin-bottom:8px;">答案: ${q.answer} ${q.analysis ? ' | '+q.analysis : ''}</div>
          <div style="display:flex;gap:8px;">
            <button class="btn-sm" onclick="APP.editQuestion(${q.id})">✏️</button>
            <button class="btn-sm" style="background:#ff3b30;" onclick="APP.deleteQuestion(${q.id})">🗑</button>
          </div>
        </div>`).join('');
    } else {
      list.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">📭 暂无题目</div>';
    }
  },

  showAddQuestion() {
    document.getElementById('modal-q-title').textContent = '添加题目';
    document.getElementById('mq-edit-id').value = '';
    ['mq-content','mq-options','mq-answer','mq-analysis'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('mq-image').value = '';
    document.getElementById('mq-image-preview').innerHTML = '';
    document.getElementById('mq-score').value = '5';
    document.getElementById('mq-difficulty').value = 'medium';
    document.getElementById('mq-type').value = 'single';
    this.updateOptionsVisibility();
    this.loadCategoriesForModal();
    this.loadKPForModal();
    document.getElementById('modal-question').classList.add('active');
  },

  async editQuestion(id) {
    const res = await API.getQuestions({ pageSize: 200 });
    if (res.code === 200) {
      const q = res.data.list.find(i => i.id === id);
      if (!q) return;
      document.getElementById('modal-q-title').textContent = '编辑题目';
      document.getElementById('mq-edit-id').value = q.id;
      document.getElementById('mq-category').value = q.category_id;
      document.getElementById('mq-kp').value = q.kp_id || '';
      document.getElementById('mq-type').value = q.type;
      document.getElementById('mq-difficulty').value = q.difficulty;
      document.getElementById('mq-content').value = q.content;
      document.getElementById('mq-image').value = q.image || '';
      document.getElementById('mq-image-preview').innerHTML = q.image ? `<img src="${q.image}" style="max-width:200px;max-height:120px;border-radius:6px;margin-top:4px;">` : '';
      document.getElementById('mq-answer').value = q.answer;
      document.getElementById('mq-analysis').value = q.analysis || '';
      document.getElementById('mq-score').value = q.score;
      this.updateOptionsVisibility();
      this.loadCategoriesForModal();
      this.loadKPForModal();
      document.getElementById('modal-question').classList.add('active');
    }
  },

  async saveQuestion() {
    const data = {
      category_id: document.getElementById('mq-category').value,
      kp_id: document.getElementById('mq-kp')?.value || null,
      type: document.getElementById('mq-type').value,
      difficulty: document.getElementById('mq-difficulty').value,
      content: document.getElementById('mq-content').value.trim(),
      image: document.getElementById('mq-image').value.trim(),
      answer: document.getElementById('mq-answer').value.trim(),
      analysis: document.getElementById('mq-analysis').value.trim(),
      score: Number(document.getElementById('mq-score').value)
    };
    if (!data.category_id || !data.content || !data.answer) return this.showToast('请填写必填项');
    const optRaw = document.getElementById('mq-options').value.trim();
    if (optRaw && ['single','multiple'].includes(data.type)) {
      data.options = optRaw.split('\n').map(s => s.trim()).filter(s => s);
    }
    const editId = document.getElementById('mq-edit-id').value;
    const res = editId ? await API.updateQuestion(editId, data) : await API.addQuestion(data);
    if (res.code === 200) {
      this.showToast(editId ? '更新成功' : '添加成功');
      this.closeModal('modal-question');
      this.doLoadQuestions();
    } else this.showToast(res.msg);
  },

  async uploadQuestionImage() {
    const file = document.getElementById('mq-image-file')?.files?.[0];
    if (!file) return this.showToast('请选择图片');
    const res = await API.uploadImage(file);
    if (res.code === 200) {
      document.getElementById('mq-image').value = res.data.url;
      document.getElementById('mq-image-preview').innerHTML = `<img src="${res.data.url}" style="max-width:200px;max-height:120px;border-radius:6px;margin-top:4px;">`;
      this.showToast('上传成功');
    } else this.showToast(res.msg);
  },

  async deleteQuestion(id) {
    if (!confirm('确定删除该题目？')) return;
    const res = await API.deleteQuestion(id);
    if (res.code === 200) { this.showToast('已删除'); this.doLoadQuestions(); }
    else this.showToast(res.msg);
  },

  updateOptionsVisibility() {
    const t = document.getElementById('mq-type')?.value;
    const g = document.getElementById('mq-options-group');
    if (g) g.style.display = ['single','multiple'].includes(t) ? 'block' : 'none';
  },

  async loadCategoriesForModal() {
    const res = await API.getCategories();
    if (res.code === 200) {
      document.getElementById('mq-category').innerHTML = res.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
  },

  async loadKPForModal() {
    const res = await API.getKnowledgePoints();
    if (res.code === 200 && document.getElementById('mq-kp')) {
      document.getElementById('mq-kp').innerHTML = '<option value="">无</option>' + res.data.map(k => `<option value="${k.id}">${k.name} (${k.subject})</option>`).join('');
    }
  },

  // ===== 试卷管理 =====
  async loadExamManage() {
    const isAdmin = API.user?.role === 'admin';
    const res = isAdmin ? await API.getAdminExams() : await API.getMyExams();
    const list = document.getElementById('exam-manage-list');
    if (res.code === 200 && res.data.length > 0) {
      const sm = { draft:'草稿', published:'已发布', closed:'已关闭' };
      const sc = { draft:'#ef6c00', published:'#2e7d32', closed:'#c62828' };
      const sb = { draft:'#fff3e0', published:'#e8f5e9', closed:'#fce4ec' };
      list.innerHTML = res.data.map(e => `
        <div class="exam-card">
          <div style="display:flex;justify-content:space-between;">
            <div class="card-title">${e.title}</div>
            <span style="padding:2px 10px;border-radius:10px;font-size:11px;font-weight:600;color:${sc[e.status]};background:${sb[e.status]}">${sm[e.status]}</span>
          </div>
          <div style="font-size:12px;color:#999;margin:6px 0;">${e.description || ''}</div>
          <div class="card-info">⏱ ${e.duration}分钟 · 📊 ${e.total_score}分 · ✅ 及格${e.pass_score}分 · 👥 ${e.total_records||0}人次</div>
          <div class="action-btns">
            <button class="btn-sm" style="background:#17a2b8;" onclick="APP.viewExamDetail(${e.id})">📋 详情</button>
            <button class="btn-sm" style="background:#6c757d;" onclick="APP.editExam(${e.id})">✏️ 编辑</button>
            ${e.status==='draft'?`<button class="btn-sm" style="background:#28a745;" onclick="APP.publishExam(${e.id})">▶ 发布</button>`:''}
            ${e.status==='published'?`<button class="btn-sm" style="background:#ff9500;" onclick="APP.closeExam(${e.id})">⏸ 关闭</button>`:''}
            ${e.status!=='published'?`<button class="btn-sm" style="background:#dc3545;" onclick="APP.deleteExam(${e.id})">🗑 删除</button>`:''}
          </div>
        </div>`).join('');
    } else {
      list.innerHTML = '<div style="text-align:center;padding:60px;color:#999;">📭 暂无试卷<br><small>点击右上角创建</small></div>';
    }
  },

  async viewExamDetail(eid) {
    const res = await API.getExamDetail(eid);
    if (res.code !== 200) return this.showToast(res.msg);
    const { exam, questions } = res.data;
    const tmap = { single:'单选', multiple:'多选', judge:'判断', fill:'填空', essay:'简答' };
    document.getElementById('modal-detail-title').textContent = exam.title;
    document.getElementById('modal-detail-body').innerHTML = `
      <div class="exam-detail-info">
        <div>⏱ ${exam.duration}分钟 | 📊 ${exam.total_score}分 | ✅ 及格${exam.pass_score}分 | 📝 ${questions.length}题</div>
      </div>
      ${questions.map((q,i) => `
        <div style="padding:10px;border-bottom:1px solid #eee;">
          <span style="font-size:11px;background:#e3f2fd;color:#1565c0;padding:1px 6px;border-radius:4px;">${tmap[q.type]}</span>
          <span style="font-size:11px;color:#999;margin-left:6px;">${q.score}分</span>
          <div style="font-weight:600;margin:4px 0;">${i+1}. ${q.content}</div>
          <div style="font-size:12px;color:var(--success);">答案: ${q.answer}</div>
        </div>`).join('')}`;
    document.getElementById('modal-exam-detail').classList.add('active');
  },

  async editExam(eid) {
    const res = await API.getExamDetail(eid);
    if (res.code !== 200) return this.showToast(res.msg);
    const { exam, questions } = res.data;
    document.getElementById('modal-exam-title').textContent = '编辑试卷';
    document.getElementById('me-edit-id').value = exam.id;
    document.getElementById('me-title').value = exam.title;
    document.getElementById('me-desc').value = exam.description || '';
    document.getElementById('me-duration').value = exam.duration;
    document.getElementById('me-pass-score').value = exam.pass_score;
    document.getElementById('btn-exam-save').textContent = '💾 保存修改';

    const sids = questions.map(q => q.id);
    const allRes = await API.getAllQuestions();
    const sel = document.getElementById('question-selector');
    if (allRes.code === 200 && allRes.data.length > 0) {
      sel.innerHTML = allRes.data.map(q => `
        <label><input type="checkbox" value="${q.id}" ${sids.includes(q.id)?'checked':''} onchange="APP.updateSelectedCount()">
        <span style="flex:1;">${q.content.substring(0,30)}...</span>
        <span style="font-size:11px;color:#999;">${q.category_name} · ${q.score}分</span></label>`).join('');
    }
    document.getElementById('me-selected-count').textContent = sids.length;
    document.getElementById('modal-exam').classList.add('active');
  },

  updateSelectedCount() {
    const cnt = document.querySelectorAll('#question-selector input:checked').length;
    const el = document.getElementById('me-selected-count');
    if (el) el.textContent = cnt;
  },

  showCreateExam() {
    document.getElementById('modal-exam-title').textContent = '创建试卷';
    document.getElementById('me-edit-id').value = '';
    document.getElementById('me-title').value = '';
    document.getElementById('me-desc').value = '';
    document.getElementById('me-duration').value = '60';
    document.getElementById('me-pass-score').value = '60';
    document.getElementById('btn-exam-save').textContent = '创 建';
    document.getElementById('me-selected-count').textContent = '0';

    API.getAllQuestions().then(r => {
      const sel = document.getElementById('question-selector');
      if (r.code === 200 && r.data.length > 0) {
        sel.innerHTML = r.data.map(q => `
          <label><input type="checkbox" value="${q.id}" onchange="APP.updateSelectedCount()">
          <span style="flex:1;">${q.content.substring(0,30)}...</span>
          <span style="font-size:11px;color:#999;">${q.category_name} · ${q.score}分</span></label>`).join('');
      } else sel.innerHTML = '<div style="color:#999;padding:20px;">请先添加题目</div>';
    });
    document.getElementById('modal-exam').classList.add('active');
  },

  async saveExam() {
    const eid = document.getElementById('me-edit-id').value;
    const title = document.getElementById('me-title').value.trim();
    const dur = Number(document.getElementById('me-duration').value);
    const pass = Number(document.getElementById('me-pass-score').value);
    const desc = document.getElementById('me-desc').value.trim();
    if (!title || !dur) return this.showToast('请填写名称和时长');
    const qids = Array.from(document.querySelectorAll('#question-selector input:checked')).map(cb => Number(cb.value));
    if (!qids.length) return this.showToast('请至少选择一道题目');
    const data = { title, description: desc, duration: dur, pass_score: pass, question_ids: qids };
    const res = eid ? await API.updateExam(eid, data) : await API.createExam({ ...data, total_score: 100 });
    if (res.code === 200) {
      this.showToast(eid ? '修改成功' : '创建成功');
      this.closeModal('modal-exam');
      this.loadExamManage();
    } else this.showToast(res.msg);
  },

  async publishExam(id) {
    const res = await API.updateExamStatus(id, 'published');
    if (res.code === 200) { this.showToast('已发布'); this.loadExamManage(); }
    else this.showToast(res.msg);
  },

  async closeExam(id) {
    if (!confirm('关闭后学生无法参加，确定？')) return;
    const res = await API.updateExamStatus(id, 'closed');
    if (res.code === 200) { this.showToast('已关闭'); this.loadExamManage(); }
    else this.showToast(res.msg);
  },

  async deleteExam(id) {
    if (!confirm('确定删除？不可恢复！')) return;
    const res = await API.deleteExam(id);
    if (res.code === 200) { this.showToast('已删除'); this.loadExamManage(); }
    else this.showToast(res.msg);
  },

  // ===== 考试 =====
  async startExam(eid) {
    const res = await API.startExam(eid);
    if (res.code === 200) {
      this.practiceMode = false;
      this.currentExam = res.data;
      this.currentQuestionIndex = 0;
      this.remainingSeconds = res.data.remaining * 60;
      this.examAutoSubmit = false;
      this.cheatCount = 0;
      this.showPage('exam');
      document.getElementById('exam-title').textContent = res.data.exam.title;
      document.getElementById('btn-submit').style.display = '';
      // 防作弊：进入全屏 + 检测切屏
      this.requestFullscreen();
      this.bindCheatDetection();
      this.renderExamQuestion();
      this.startExamTimer();
    } else this.showToast(res.msg);
  },

  requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  },

  bindCheatDetection() {
    if (this._cheatBound) return;
    this._cheatBound = true;
    const warn = () => {
      if (this.currentPage !== 'exam' || this.practiceMode) return;
      this.cheatCount++;
      if (this.cheatCount >= 3) {
        this.showToast('⚠️ 检测到多次切屏，已自动交卷！');
        this.doSubmitExam();
      } else {
        this.showToast(`⚠️ 第${this.cheatCount}次切屏警告！超过3次将自动交卷`);
      }
    };
    document.addEventListener('visibilitychange', () => { if (document.hidden) warn(); });
    window.addEventListener('blur', warn);
  },

  unbindCheatDetection() {
    this._cheatBound = false;
  },

  renderExamQuestion() {
    const questions = this.practiceMode ? this.practiceQuestions : this.currentExam.questions;
    const idx = this.practiceMode ? this.practiceIndex : this.currentQuestionIndex;
    const q = questions[idx];
    if (!q) return;
    const tmap = { single:'单选', multiple:'多选', judge:'判断', fill:'填空', essay:'简答' };
    let optsHtml = '';
    if (['single','multiple','judge'].includes(q.type)) {
      const opts = q.options || (q.type==='judge'?['对','错']:[]);
      const myAns = q.my_answer || '';
      const isMulti = q.type === 'multiple';
      optsHtml = `<div class="q-options">${opts.map((opt,i) => {
        const l = String.fromCharCode(65+i);
        const sel = isMulti ? myAns.toUpperCase().includes(l) : myAns===l || myAns===opt;
        return `<div class="q-option${sel?' selected':''}" onclick="APP.selectOption('${l}','${q.type}')"><span class="opt-letter">${l}</span><span>${opt}</span></div>`;
      }).join('')}</div>`;
    } else {
      optsHtml = `<textarea class="q-fill-input" rows="3" placeholder="请输入答案" onchange="APP.saveFillAnswer(this.value)">${q.my_answer||''}</textarea>`;
    }

    document.getElementById('exam-questions').innerHTML = `
      <div class="question-card"><div class="q-header"><span class="q-type">${tmap[q.type]}</span><span class="q-score">${q.score}分</span></div>
      <div class="q-content">${idx+1}. ${q.content}</div>
      ${q.image ? `<div style="margin:8px 0;"><img src="${q.image}" style="max-width:100%;max-height:300px;border-radius:6px;" onerror="this.style.display='none'"></div>` : ''}
      ${optsHtml}
      ${this.practiceMode && q.my_answer ? (q.is_correct ? '<div style="color:var(--success);margin-top:8px;">✅ 正确！</div>' : `<div style="color:var(--danger);margin-top:8px;">❌ 正确答案: ${q.answer}</div>${q.analysis?`<div class="q-analysis">💡 ${q.analysis}</div>`:''}`) : ''}
      </div>`;
    document.getElementById('exam-current-num').textContent = `${idx+1}/${questions.length}`;
    const pct = ((idx+1)/questions.length*100).toFixed(0);
    document.getElementById('exam-progress-fill').style.width = pct+'%';
    document.getElementById('exam-progress-text').textContent = `${idx+1}/${questions.length}`;
  },

  selectOption(letter, type) {
    const questions = this.practiceMode ? this.practiceQuestions : this.currentExam.questions;
    const idx = this.practiceMode ? this.practiceIndex : this.currentQuestionIndex;
    const q = questions[idx];
    if (type === 'multiple') {
      let cur = q.my_answer || '';
      cur = cur.toUpperCase().includes(letter) ? cur.toUpperCase().replace(letter,'') : (cur+letter).split('').sort().join('');
      q.my_answer = cur;
      // 练习模式多选题：遍历选项判断对错
      if (this.practiceMode) {
        const correct = String(q.answer).toUpperCase().split('').sort().join('');
        const studentSort = String(cur).toUpperCase().split('').sort().join('');
        q.is_correct = (correct === studentSort) ? 1 : 0;
        if (!q.is_correct) API.addPracticeWrong({ question_id: q.id, wrong_answer: cur });
      }
    } else {
      q.my_answer = letter;
      if (this.practiceMode) {
        q.is_correct = (q.my_answer === q.answer || String(q.my_answer).toUpperCase() === String(q.answer).toUpperCase()) ? 1 : 0;
        if (!q.is_correct) API.addPracticeWrong({ question_id: q.id, wrong_answer: letter });
      }
    }
    if (!this.practiceMode) this.submitCurrentAnswer(q.my_answer);
    this.renderExamQuestion();
  },

  saveFillAnswer(val) {
    const questions = this.practiceMode ? this.practiceQuestions : this.currentExam.questions;
    const idx = this.practiceMode ? this.practiceIndex : this.currentQuestionIndex;
    questions[idx].my_answer = val;
    if (!this.practiceMode) this.submitCurrentAnswer(val);
  },

  async submitCurrentAnswer(ans) {
    if (!this.currentExam || this.practiceMode) return;
    const q = this.currentExam.questions[this.currentQuestionIndex];
    await API.submitAnswer({ record_id: this.currentExam.record_id, question_id: q.id, answer: ans || '' });
  },

  prevQuestion() {
    const questions = this.practiceMode ? this.practiceQuestions : this.currentExam.questions;
    const idx = this.practiceMode ? this.practiceIndex : this.currentQuestionIndex;
    if (idx > 0) {
      if (this.practiceMode) this.practiceIndex--; else this.currentQuestionIndex--;
      this.renderExamQuestion();
    }
  },

  nextQuestion() {
    const questions = this.practiceMode ? this.practiceQuestions : this.currentExam.questions;
    const idx = this.practiceMode ? this.practiceIndex : this.currentQuestionIndex;
    if (idx < questions.length - 1) {
      if (this.practiceMode) this.practiceIndex++; else this.currentQuestionIndex++;
      this.renderExamQuestion();
    }
  },

  startExamTimer() {
    if (this.examTimer) clearInterval(this.examTimer);
    const el = document.getElementById('exam-timer');
    this.examTimer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) { clearInterval(this.examTimer); if (!this.examAutoSubmit) { this.examAutoSubmit=true; this.showToast('时间到，自动交卷'); this.doSubmitExam(); } return; }
      const m = Math.floor(this.remainingSeconds/60), s = this.remainingSeconds%60;
      el.textContent = `剩余: ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
      if (this.remainingSeconds <= 300) el.classList.add('warning');
    }, 1000);
  },

  async submitExam() {
    if (this.examAutoSubmit) return;
    const questions = this.currentExam?.questions || [];
    const total = questions.length;
    const answered = questions.filter(q => q.my_answer && q.my_answer.trim()).length;
    const msg = `确定交卷吗？\n\n📝 已答: ${answered} / ${total} 题\n⚠ 未答: ${total - answered} 题\n\n交卷后无法修改答案！`;
    if (!confirm(msg)) return;
    clearInterval(this.examTimer);
    this.unbindCheatDetection();
    if (this.currentExam && !this.practiceMode) {
      const q = this.currentExam.questions[this.currentQuestionIndex];
      if (q) {
        if (['fill','essay'].includes(q.type)) {
          const ta = document.querySelector('.q-fill-input');
          if (ta) q.my_answer = ta.value;
        }
        if (q.my_answer !== undefined) await this.submitCurrentAnswer(q.my_answer);
      }
    }
    await this.doSubmitExam();
  },

  async doSubmitExam() {
    const res = await API.submitExam({ record_id: this.currentExam.record_id });
    if (res.code === 200) {
      this.showToast(`交卷成功！得分: ${res.data.score}分`);
      this.currentExam = null;
      setTimeout(() => this.showPage('records'), 800);
    } else this.showToast(res.msg);
  },

  // ===== 练习模式 =====
  async loadPractice() {
    const res = await API.getPracticeQuestions(20);
    if (res.code !== 200 || !res.data.length) {
      this.showToast('暂无可用题目');
      this.showPage('home');
      return;
    }
    this.practiceMode = true;
    this.practiceQuestions = res.data.map(q => ({ ...q, my_answer: '', is_correct: null }));
    this.practiceIndex = 0;
    this.showPage('exam');
    document.getElementById('exam-title').textContent = '📝 自由练习模式（随机20题）';
    document.getElementById('exam-timer').textContent = '不限时';
    document.getElementById('exam-timer').classList.remove('warning');
    document.getElementById('btn-submit').style.display = 'none';
    // 添加退出按钮
    let exitBtn = document.getElementById('btn-exit-practice');
    if (!exitBtn) {
      exitBtn = document.createElement('button');
      exitBtn.id = 'btn-exit-practice';
      exitBtn.className = 'btn-primary';
      exitBtn.style.cssText = 'background:#6c757d;';
      exitBtn.textContent = '退出练习';
      exitBtn.onclick = () => this.exitPractice();
      document.querySelector('.exam-footer').appendChild(exitBtn);
    }
    exitBtn.style.display = '';
    this.renderExamQuestion();
  },

  exitPractice() {
    this.practiceMode = false;
    this.practiceQuestions = [];
    this.practiceIndex = 0;
    this.cheatCount = 0;
    if (this.examTimer) clearInterval(this.examTimer);
    this.unbindCheatDetection();
    document.getElementById('btn-submit').style.display = '';
    const exitBtn = document.getElementById('btn-exit-practice');
    if (exitBtn) exitBtn.style.display = 'none';
    this.showPage('home');
  },

  // ===== 考试结果 =====
  async showResultDetail(rid) {
    const res = await API.getExamResult(rid);
    if (res.code !== 200) return this.showToast(res.msg);
    const { record, answers } = res.data;
    this.showPage('result');
    document.getElementById('result-score').textContent = record.score || 0;
    const se = document.getElementById('result-status'), me = document.getElementById('result-msg');
    if (record.is_passed) {
      se.textContent = '✅ 通过'; se.style.color = 'var(--success)';
      me.textContent = '恭喜通过考试！';
    } else {
      se.textContent = '❌ 未通过'; se.style.color = 'var(--danger)';
      me.textContent = `及格线: ${record.pass_score}分，继续努力！`;
    }
    const tmap = { single:'单选', multiple:'多选', judge:'判断', fill:'填空', essay:'简答' };
    document.getElementById('result-details').innerHTML = answers.map((a,i) => `
      <div class="list-item">
        <div style="display:flex;justify-content:space-between;">
          <span style="font-size:12px;color:#999;">${tmap[a.type]} · ${a.question_score}分</span>
          <span style="font-weight:700;color:${a.is_correct?'var(--success)':'var(--danger)'}">${a.is_correct?'✓':'✗'}</span>
        </div>
        <div style="font-weight:600;">${i+1}. ${a.content}</div>
        <div style="font-size:12px;">你的答案: ${a.answer||'未作答'}</div>
        ${a.is_correct===0?`<div style="font-size:12px;color:var(--success);">正确: ${a.correct_answer}</div>`:''}
        ${a.analysis?`<div class="q-analysis">💡 ${a.analysis}</div>`:''}
      </div>`).join('');
  },

  // ===== 错题本 =====
  async loadWrongBook() {
    const stats = await API.getWrongStats();
    const res = await API.getWrongBook({ pageSize: 100 });
    const list = document.getElementById('wrongbook-list');
    if (stats.code === 200) {
      document.getElementById('wb-total').textContent = stats.data.total;
      document.getElementById('wb-mastered').textContent = stats.data.mastered;
    }
    if (res.code === 200 && res.data.list.length > 0) {
      const tmap = { single:'单选', multiple:'多选', judge:'判断', fill:'填空', essay:'简答' };
      list.innerHTML = res.data.list.map(w => `
        <div class="list-item">
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:12px;color:#999;">${w.category_name} · ${tmap[w.type]}</span>
            <span style="font-size:12px;">${w.mastered?'✅ 已掌握':'📝 待复习'}</span>
          </div>
          <div style="font-weight:600;margin:6px 0;">${w.content}</div>
          <div style="font-size:12px;">你的答案: <span style="color:var(--danger)">${w.wrong_answer||'未作答'}</span></div>
          <div style="font-size:12px;color:var(--success);">正确: ${w.correct_answer}</div>
          ${w.analysis?`<div style="font-size:12px;color:#999;">💡 ${w.analysis}</div>`:''}
          <div style="display:flex;gap:8px;margin-top:8px;">
            ${!w.mastered?`<button class="btn-sm" style="background:#28a745;" onclick="APP.markWrongMastered(${w.id})">✅ 已掌握</button>`:''}
            <button class="btn-sm" style="background:#dc3545;" onclick="APP.deleteWrong(${w.id})">🗑 删除</button>
          </div>
        </div>`).join('');
    } else {
      list.innerHTML = '<div style="text-align:center;padding:60px;color:#999;">🎉 没有错题，太棒了！</div>';
    }
  },

  async markWrongMastered(id) {
    await API.markWrongMastered(id);
    this.loadWrongBook();
  },

  async deleteWrong(id) {
    await API.deleteWrong(id);
    this.loadWrongBook();
  },

  // ===== 我的记录 =====
  async loadMyRecords() {
    const res = await API.getMyRecords();
    const list = document.getElementById('my-records-list');
    if (res.code === 200 && res.data.length > 0) {
      list.innerHTML = res.data.map(r => `
        <div class="list-item" onclick="APP.showResultDetail(${r.id})">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div style="font-weight:600;">${r.exam_title}</div>
              <div style="font-size:12px;color:#999;">${new Date(r.start_time).toLocaleString()}</div>
            </div>
            <div style="text-align:right;">
              ${r.status==='graded'?`<div style="font-size:22px;font-weight:700;color:${r.is_passed?'var(--success)':'var(--danger)'}">${r.score}分</div><span class="card-tag ${r.is_passed?'tag-passed':'tag-failed'}">${r.is_passed?'通过':'未通过'}</span>`:`<span style="color:var(--warning);">进行中</span>`}
            </div>
          </div>
        </div>`).join('');
    } else {
      list.innerHTML = '<div style="text-align:center;padding:60px;color:#999;">📭 暂无考试记录</div>';
    }
  },

  // ===== 成绩管理 =====
  async loadScoreManage() {
    const isAdmin = API.user?.role === 'admin';
    const res = isAdmin ? await API.getAdminExams() : await API.getMyExams();
    const list = document.getElementById('score-exam-list');
    let html = '';
    if (isAdmin) {
      html += `<div style="padding:12px 16px 0;">
        <button class="btn-primary" style="width:100%;" onclick="APP.viewAllScores()">📊 全系统成绩总览</button>
      </div>`;
    }
    if (res.code === 200 && res.data.length > 0) {
      html += res.data.map(e => `<div class="list-item" onclick="APP.viewExamScores(${e.id},'${e.title.replace(/'/g,"\\'")}')"><div class="card-title">${e.title}</div><div class="card-info">👥 ${e.total_records||0}人次 · 👨‍🏫 ${e.teacher_name||''}</div></div>`).join('');
    } else html += '<div style="text-align:center;padding:40px;color:#999;">暂无试卷</div>';
    list.innerHTML = html;
    document.getElementById('score-detail-list').classList.add('hidden');
    document.getElementById('score-exam-list').classList.remove('hidden');
  },

  async viewAllScores() {
    const res = await API.getAdminScores();
    const dl = document.getElementById('score-detail-list');
    document.getElementById('score-exam-list').classList.add('hidden');
    dl.classList.remove('hidden');
    if (res.code === 200 && res.data.length > 0) {
      dl.innerHTML = `<div class="section-title">📊 全系统成绩总览</div>
        <button class="btn-back" style="margin:0 16px 12px;" onclick="APP.loadScoreManage()">← 返回</button>` +
        res.data.map((r, i) => `
          <div class="list-item">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span style="font-weight:600;">${r.nickname} (${r.username})</span>
                <div style="font-size:12px;color:#999;">${r.exam_title} · ${new Date(r.submit_time).toLocaleString()}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:20px;font-weight:700;color:${r.is_passed?'var(--success)':'var(--danger)'}">${r.score}分</div>
              </div>
            </div>
          </div>`).join('');
    } else {
      dl.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">暂无成绩记录</div>';
    }
  },

  async viewExamScores(eid, title) {
    const res = await API.getExamScores(eid);
    const dl = document.getElementById('score-detail-list');
    const el = document.getElementById('score-exam-list');
    if (res.code === 200) {
      el.classList.add('hidden'); dl.classList.remove('hidden');
      const exportUrl = API.exportExamScores(eid);
      dl.innerHTML = `<div class="section-title">📊 ${title} - 成绩</div>
        <div style="display:flex;gap:8px;margin:0 16px 12px;flex-wrap:wrap;">
          <button class="btn-back" onclick="APP.loadScoreManage()">← 返回</button>
          <button class="btn-sm" onclick="APP.showRanking(${eid},'${title}')">🏆 排名</button>
          <a href="${exportUrl}" class="btn-sm" style="background:#28a745;text-decoration:none;display:inline-block;line-height:1.6;">📥 导出CSV</a>
          <button class="btn-sm" style="background:#6f42c1;" onclick="APP.showQuestionStats(${eid},'${title}')">📈 题目分析</button>
        </div>` +
        (res.data.length > 0 ? res.data.map((r, i) => `
          <div class="list-item">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <span style="font-size:20px;font-weight:700;color:#999;margin-right:10px;">#${i+1}</span>
                <span style="font-weight:600;">${r.nickname}</span>
                <div style="font-size:12px;color:#999;">${new Date(r.submit_time).toLocaleString()}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:20px;font-weight:700;color:${r.score>=60?'var(--success)':'var(--danger)'}">${r.score}分</div>
                <span class="card-tag ${r.is_passed?'tag-passed':'tag-failed'}">${r.is_passed?'通过':'未通过'}</span>
              </div>
            </div>
          </div>`).join('') : '<div style="text-align:center;padding:40px;color:#999;">暂无成绩</div>');
    }
  },

  async showQuestionStats(eid, title) {
    const res = await API.getQuestionStats(eid);
    const dl = document.getElementById('score-detail-list');
    if (res.code === 200) {
      const tmap = { single:'单选', multiple:'多选', judge:'判断', fill:'填空', essay:'简答' };
      dl.innerHTML = `<div class="section-title">📈 ${title} - 题目正确率</div>
        <button class="btn-back" style="margin:0 16px 12px;" onclick="APP.viewExamScores(${eid},'${title}')">← 返回成绩</button>` +
        res.data.map(q => `
          <div class="list-item">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="flex:1;">
                <span style="font-size:11px;background:#e3f2fd;color:#1565c0;padding:1px 6px;border-radius:4px;">${tmap[q.type]}</span>
                <span style="font-size:11px;color:#999;margin-left:4px;">${q.score}分</span>
                <div style="font-weight:600;margin:4px 0;font-size:13px;">${q.content}</div>
                <div style="font-size:11px;color:#999;">${q.correct_count||0}/${q.total_answers||0} 人答对</div>
              </div>
              <div style="text-align:center;min-width:60px;">
                <div style="font-size:24px;font-weight:700;color:${(q.correct_rate||0)>=60?'var(--success)':(q.correct_rate||0)>=30?'var(--warning)':'var(--danger)'}">${q.correct_rate||0}%</div>
                <div style="font-size:11px;color:#999;">正确率</div>
              </div>
            </div>
            <div style="margin-top:6px;height:6px;background:#eee;border-radius:3px;">
              <div style="height:100%;border-radius:3px;background:${(q.correct_rate||0)>=60?'var(--success)':(q.correct_rate||0)>=30?'var(--warning)':'var(--danger)'};width:${q.correct_rate||0}%;"></div>
            </div>
          </div>`).join('');
    } else dl.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">加载失败</div>';
  },

  async showRanking(eid, title) {
    const res = await API.getRanking(eid);
    if (res.code === 200) {
      const { list, total, myRank } = res.data;
      let html = `<div class="section-title">🏆 ${title} - 排行榜 (共${total}人)</div>
        <button class="btn-back" style="margin:0 16px;" onclick="APP.showPage('score-manage')">← 返回</button>`;
      if (myRank) {
        html += `<div style="margin:16px;padding:16px;background:#fff8e1;border-radius:12px;text-align:center;">
          <div style="font-size:14px;color:#999;">我的排名</div>
          <div style="font-size:32px;font-weight:700;color:var(--primary);">#${myRank.rank}</div>
          <div style="font-size:18px;font-weight:600;">${myRank.score}分</div>
        </div>`;
      }
      html += list.map((r, i) => `
        <div class="list-item" style="${i<3?'border-left:3px solid '+(i===0?'#ffd700':i===1?'#c0c0c0':'#cd7f32'):''}">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:${i<3?'24px':'16px'};font-weight:700;min-width:36px;text-align:center;">${i===0?'🥇':i===1?'🥈':i===2?'🥉':'#'+r.rank}</span>
            <div style="flex:1;">
              <div style="font-weight:600;">${r.nickname} (${r.username})</div>
              <div style="font-size:12px;color:#999;">${new Date(r.submit_time).toLocaleString()}</div>
            </div>
            <div style="font-size:20px;font-weight:700;color:var(--primary);">${r.score}分</div>
          </div>
        </div>`).join('');
      document.getElementById('score-exam-list').classList.add('hidden');
      document.getElementById('score-detail-list').classList.remove('hidden');
      document.getElementById('score-detail-list').innerHTML = html;
    }
  },

  // ===== 管理员 =====
  async loadAdminUsers() {
    const res = await API.getAdminUsers();
    const list = document.getElementById('admin-users-list');
    if (res.code === 200) {
      list.innerHTML = `
        <div style="padding:16px;display:flex;gap:8px;">
          <button class="btn-primary" onclick="APP.showAddUser()" style="width:auto;padding:8px 20px;">+ 创建用户</button>
          <button class="btn-sm" onclick="APP.showPage('questions')">题库管理</button>
          <button class="btn-sm" onclick="APP.showPage('exam-manage')">试卷管理</button>
        </div>` +
        res.data.map(u => `
        <div class="list-item">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
            <div>
              <div style="font-weight:600;">${u.nickname} <span style="font-size:12px;color:#999;">@${u.username}</span>
                <span class="card-tag" style="margin-left:6px;">${u.role}</span>
              </div>
              <div style="font-size:12px;color:#999;">${u.gender==='male'?'男':u.gender==='female'?'女':'其他'} · ${u.student_no||'无学号'} · ${u.department||'无院系'} · ${u.phone||'无手机'} · ${u.status?'启用中':'已禁用'} · ${new Date(u.create_time).toLocaleDateString()}</div>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <button class="btn-sm" onclick="APP.editUser(${u.id},'${u.nickname}','${u.role}','${u.phone||''}','${u.gender||'other'}','${u.birth_date||''}','${u.email||''}','${u.student_no||''}','${u.department||''}')">✏️ 编辑</button>
              <button class="btn-sm" style="background:#17a2b8;" onclick="APP.resetPassword(${u.id})">🔑 重置密码</button>
              <button class="btn-sm" style="background:${u.status?'#ff9500':'#28a745'}" onclick="APP.toggleUserStatus(${u.id},${u.status?0:1})">${u.status?'禁用':'启用'}</button>
              ${u.role!=='admin'?`<button class="btn-sm" style="background:#dc3545;" onclick="APP.deleteUser(${u.id})">删除</button>`:''}
            </div>
          </div>
        </div>`).join('');
    }
  },

  showAddUser() {
    const html = `
      <div class="form-group"><label>用户名</label><input type="text" id="au-username" placeholder="请输入"></div>
      <div class="form-group"><label>密码</label><input type="password" id="au-password" placeholder="至少6位"></div>
      <div class="form-group"><label>昵称</label><input type="text" id="au-nickname" placeholder="请输入"></div>
      <div class="form-group"><label>角色</label><select id="au-role"><option value="student">学生</option><option value="teacher">教师</option></select></div>
      <div class="form-group"><label>性别</label><select id="au-gender"><option value="male">男</option><option value="female">女</option><option value="other">其他</option></select></div>
      <div class="form-group"><label>出生日期</label><input type="date" id="au-birth-date"></div>
      <div class="form-group"><label>邮箱</label><input type="email" id="au-email" placeholder="可选"></div>
      <div class="form-group"><label>学号/工号</label><input type="text" id="au-student-no" placeholder="可选"></div>
      <div class="form-group"><label>院系/部门</label><input type="text" id="au-department" placeholder="可选"></div>
      <button class="btn-primary" onclick="APP.doCreateUser()">创建</button>
    `;
    document.getElementById('admin-users-list').insertAdjacentHTML('afterbegin', `<div class="list-item" id="add-user-form">${html}</div>`);
  },

  async doCreateUser() {
    const username = document.getElementById('au-username').value.trim();
    const password = document.getElementById('au-password').value;
    const nickname = document.getElementById('au-nickname').value.trim();
    const role = document.getElementById('au-role').value;
    const gender = document.getElementById('au-gender').value;
    const birth_date = document.getElementById('au-birth-date').value;
    const email = document.getElementById('au-email').value.trim();
    const student_no = document.getElementById('au-student-no').value.trim();
    const department = document.getElementById('au-department').value.trim();
    if (!username || !password || !nickname) return this.showToast('请填写所有字段');
    const res = await API.createUser({ username, password, nickname, role, gender, birth_date: birth_date || null, email, student_no, department });
    if (res.code === 200) { this.showToast('创建成功'); this.loadAdminUsers(); }
    else this.showToast(res.msg);
  },

  editUser(id, nickname, role, phone, gender, birth_date, email, student_no, department) {
    const newNick = prompt('昵称', nickname);
    if (!newNick) return;
    const newRole = prompt('角色 (student/teacher)', role);
    if (!newRole) return;
    const newPhone = prompt('手机号', phone);
    const newGender = prompt('性别 (male/female/other)', gender || 'other');
    const newBirth = prompt('出生日期 (YYYY-MM-DD)', birth_date ? birth_date.substring(0,10) : '');
    const newEmail = prompt('邮箱', email || '');
    const newStudentNo = prompt('学号/工号', student_no || '');
    const newDept = prompt('院系/部门', department || '');
    API.updateUser(id, { nickname: newNick, role: newRole, phone: newPhone || '', gender: newGender || 'other', birth_date: newBirth || null, email: newEmail || '', student_no: newStudentNo || '', department: newDept || '' }).then(res => {
      if (res.code === 200) { this.showToast('已更新'); this.loadAdminUsers(); }
      else this.showToast(res.msg);
    });
  },

  async resetPassword(id) {
    const pwd = prompt('请输入新密码（至少6位）');
    if (!pwd || pwd.length < 6) return this.showToast('密码至少6位');
    const res = await API.resetUserPassword(id, pwd);
    if (res.code === 200) this.showToast('密码已重置');
    else this.showToast(res.msg);
  },

  async toggleUserStatus(uid, st) {
    await API.updateUserStatus(uid, st);
    this.loadAdminUsers();
  },

  async deleteUser(uid) {
    if (!confirm('确定删除？')) return;
    await API.deleteUser(uid);
    this.loadAdminUsers();
  },

  // ===== 个人信息 =====
  async loadProfile() {
    const res = await API.getUserInfo();
    if (res.code === 200) {
      const u = res.data;
      document.getElementById('profile-nickname').textContent = u.nickname;
      document.getElementById('profile-role').textContent = {admin:'管理员',teacher:'教师',student:'学生'}[u.role];
      document.getElementById('profile-username').value = u.username;
      document.getElementById('profile-nickname-input').value = u.nickname;
      document.getElementById('profile-phone').value = u.phone || '';
      document.getElementById('profile-gender').value = u.gender || 'other';
      document.getElementById('profile-birth-date').value = u.birth_date ? u.birth_date.substring(0,10) : '';
      document.getElementById('profile-email').value = u.email || '';
      document.getElementById('profile-student-no').value = u.student_no || '';
      document.getElementById('profile-department').value = u.department || '';
      const av = document.getElementById('profile-avatar-img');
      if (av && u.avatar) { av.innerHTML = `<img src="${u.avatar}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`; }
    }
  },

  async updateProfile() {
    const n = document.getElementById('profile-nickname-input').value.trim();
    const p = document.getElementById('profile-phone').value.trim();
    const g = document.getElementById('profile-gender').value;
    const b = document.getElementById('profile-birth-date').value;
    const e = document.getElementById('profile-email').value.trim();
    const sn = document.getElementById('profile-student-no').value.trim();
    const d = document.getElementById('profile-department').value.trim();
    if (!n) return this.showToast('昵称不能为空');
    const res = await API.updateUserInfo({ nickname: n, phone: p, gender: g, birth_date: b || null, email: e, student_no: sn, department: d });
    if (res.code === 200) {
      if (API.user) { API.user.nickname = n; API.user.phone = p; API.user.gender = g; API.user.email = e; API.user.student_no = sn; API.user.department = d; localStorage.setItem('user', JSON.stringify(API.user)); }
      this.showToast('保存成功');
    } else this.showToast(res.msg);
  },

  async uploadAvatar() {
    const file = document.getElementById('avatar-file')?.files?.[0];
    if (!file) return;
    const res = await API.uploadImage(file);
    if (res.code === 200) {
      await API.updateUserInfo({ nickname: API.user.nickname, phone: API.user.phone, avatar: res.data.url, gender: API.user.gender, birth_date: API.user.birth_date, email: API.user.email, student_no: API.user.student_no, department: API.user.department });
      API.user.avatar = res.data.url;
      localStorage.setItem('user', JSON.stringify(API.user));
      const el = document.getElementById('profile-avatar-img');
      if (el) el.innerHTML = `<img src="${res.data.url}" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">`;
      this.showToast('头像已更新');
    } else this.showToast(res.msg);
  },

  // ===== 批改简答 =====
  async loadEssayGrade() {
    const res = await API.getMyExams();
    const list = document.getElementById('essay-exam-list');
    const dl = document.getElementById('essay-list');
    if (dl) dl.classList.add('hidden');
    if (list) list.classList.remove('hidden');
    if (res.code === 200 && res.data.length > 0) {
      list.innerHTML = res.data.map(e => `<div class="list-item" onclick="APP.viewEssays(${e.id},'${e.title.replace(/'/g,"\\'")}')"><div class="card-title">${e.title}</div><div class="card-info">点击查看待批改简答题</div></div>`).join('');
    } else {
      if (list) list.innerHTML = '<div style="text-align:center;padding:40px;color:#999;">暂无试卷</div>';
    }
  },

  async viewEssays(eid, title) {
    const res = await API.getEssays(eid);
    const el = document.getElementById('essay-exam-list');
    const dl = document.getElementById('essay-list');
    if (el) el.classList.add('hidden');
    if (dl) dl.classList.remove('hidden');
    if (res.code === 200 && res.data.length > 0) {
      dl.innerHTML = `<div class="section-title">✍️ ${title} - 简答题批改</div>
        <button class="btn-back" style="margin:0 16px 12px;" onclick="APP.loadEssayGrade()">← 返回</button>` +
        res.data.map(a => `
          <div class="list-item" id="essay-${a.answer_id}">
            <div style="font-weight:600;margin-bottom:4px;">${a.student_name} (${a.username})</div>
            <div style="font-size:13px;margin-bottom:6px;">📝 ${a.content}</div>
            ${a.image ? `<div style="margin:6px 0;"><img src="${a.image}" style="max-width:100%;max-height:200px;border-radius:4px;"></div>` : ''}
            <div style="background:#f8f9fa;padding:8px;border-radius:6px;margin-bottom:6px;font-size:13px;">
              <span style="color:#999;">学生答案：</span>${a.answer || '<span style="color:#999;">未作答</span>'}
            </div>
            ${a.is_correct !== null ? `
              <div style="font-size:12px;color:${a.is_correct?'var(--success)':'var(--danger)'};margin-bottom:6px;">
                ${a.is_correct ? `✅ 已批改 · 得分: ${a.score}/${a.max_score}` : `❌ 已批改 · 得分: ${a.score}/${a.max_score}`}
              </div>` : `
              <div style="display:flex;gap:6px;align-items:center;">
                <input type="number" id="essay-score-${a.answer_id}" placeholder="分数" min="0" max="${a.max_score}" style="width:70px;padding:4px 8px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;">
                <span style="font-size:12px;color:#999;">/ ${a.max_score}分</span>
                <button class="btn-sm" style="background:var(--success);" onclick="APP.gradeEssay(${a.answer_id},1)">✅ 正确</button>
                <button class="btn-sm" style="background:var(--danger);" onclick="APP.gradeEssay(${a.answer_id},0)">❌ 错误</button>
              </div>`}
          </div>`).join('');
    } else {
      if (dl) dl.innerHTML = `<div class="section-title">✍️ ${title}</div>
        <button class="btn-back" style="margin:0 16px;" onclick="APP.loadEssayGrade()">← 返回</button>
        <div style="text-align:center;padding:40px;color:#999;">🎉 没有待批改的简答题</div>`;
    }
  },

  async gradeEssay(aid, isCorrect) {
    const scoreEl = document.getElementById('essay-score-' + aid);
    let score = isCorrect ? parseFloat(scoreEl?.value) || 0 : 0;
    if (isCorrect && !score) return this.showToast('请先输入分数');
    const res = await API.gradeEssay(aid, { score, is_correct: isCorrect });
    if (res.code === 200) {
      this.showToast('批改成功');
      const item = document.getElementById('essay-' + aid);
      if (item) {
        const maxScore = scoreEl?.getAttribute('max') || '?';
        const gradingDiv = item.querySelector('div:last-of-type');
        if (gradingDiv) gradingDiv.outerHTML = `<div style="font-size:12px;color:${isCorrect?'var(--success)':'var(--danger)'};margin-bottom:6px;">${isCorrect ? `✅ 已批改 · 得分: ${score}/${maxScore}` : `❌ 已批改 · 得分: 0/${maxScore}`}</div>`;
      }
    } else this.showToast(res.msg);
  }
};

document.addEventListener('DOMContentLoaded', () => APP.init());

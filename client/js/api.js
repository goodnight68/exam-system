const API_BASE = '/api';

const API = {
  token: localStorage.getItem('token') || '',
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  setAuth(token, user) {
    this.token = token;
    this.user = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearAuth() {
    this.token = '';
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  async request(method, url, data = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (this.token) opts.headers['Authorization'] = 'Bearer ' + this.token;
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(API_BASE + url, opts);
    const json = await res.json();
    if (json.code === 401) { this.clearAuth(); APP.showPage('auth'); }
    return json;
  },

  get(url) { return this.request('GET', url); },
  post(url, data) { return this.request('POST', url, data); },
  put(url, data) { return this.request('PUT', url, data); },
  delete(url) { return this.request('DELETE', url); },

  // 用户
  register(d) { return this.post('/user/register', d); },
  login(d) { return this.post('/user/login', d); },
  getUserInfo() { return this.get('/user/info'); },
  updateUserInfo(d) { return this.put('/user/info', d); },
  uploadImage(file) {
    const fd = new FormData();
    fd.append('file', file);
    return fetch(API_BASE + '/upload/image', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + this.token },
      body: fd
    }).then(r => r.json());
  },

  // 题目
  getCategories() { return this.get('/question/categories'); },
  getQuestions(p = {}) { return this.get('/question?' + new URLSearchParams(p)); },
  getAllQuestions() { return this.get('/question/all'); },
  getPracticeQuestions(count) { return this.get('/question/practice?count=' + (count || 20)); },
  addQuestion(d) { return this.post('/question', d); },
  importQuestions(d) { return this.post('/question/import', d); },
  updateQuestion(id, d) { return this.put('/question/' + id, d); },
  deleteQuestion(id) { return this.delete('/question/' + id); },

  // 试卷
  createExam(d) { return this.post('/exam', d); },
  updateExam(id, d) { return this.put('/exam/' + id, d); },
  deleteExam(id) { return this.delete('/exam/' + id); },
  getExamDetail(id) { return this.get('/exam/detail/' + id); },
  updateExamStatus(id, s) { return this.put('/exam/' + id + '/status', { status: s }); },
  getMyExams() { return this.get('/exam/my'); },
  getAvailableExams() { return this.get('/exam/available'); },
  startExam(id) { return this.get('/exam/' + id + '/start'); },
  submitAnswer(d) { return this.post('/exam/answer', d); },
  submitExam(d) { return this.post('/exam/submit', d); },
  getExamResult(rid) { return this.get('/exam/result/' + rid); },
  getMyRecords() { return this.get('/exam/my/records'); },
  getExamScores(eid) { return this.get('/exam/' + eid + '/scores'); },
  exportExamScores(eid) { return `${API_BASE}/exam/${eid}/scores/export`; },
  getQuestionStats(eid) { return this.get('/exam/' + eid + '/question-stats'); },
  getEssays(eid) { return this.get('/exam/' + eid + '/essays'); },
  gradeEssay(aid, d) { return this.put('/exam/grade/' + aid, d); },

  // 错题本
  getWrongBook(p = {}) { return this.get('/wrongbook?' + new URLSearchParams(p)); },
  markWrongMastered(id) { return this.put('/wrongbook/' + id + '/mark'); },
  deleteWrong(id) { return this.delete('/wrongbook/' + id); },
  getWrongStats() { return this.get('/wrongbook/stats'); },
  addPracticeWrong(d) { return this.post('/wrongbook/practice', d); },

  // 公告
  getAnnouncements() { return this.get('/announcement'); },
  createAnnouncement(d) { return this.post('/announcement', d); },
  deleteAnnouncement(id) { return this.delete('/announcement/' + id); },

  // 知识点
  getKnowledgePoints() { return this.get('/knowledge'); },

  // 统计
  getTeacherOverview() { return this.get('/stats/overview'); },
  getQuestionsByCat() { return this.get('/stats/questions-by-category'); },
  getMyOverview() { return this.get('/stats/my-overview'); },
  getRanking(examId) { return this.get('/stats/ranking/' + examId); },

  // 管理员
  getAdminUsers() { return this.get('/admin/users'); },
  createUser(data) { return this.post('/admin/users', data); },
  updateUser(id, data) { return this.put('/admin/users/' + id, data); },
  resetUserPassword(id, password) { return this.put('/admin/users/' + id + '/password', { password }); },
  updateUserStatus(id, s) { return this.put('/admin/users/' + id + '/status', { status: s }); },
  deleteUser(id) { return this.delete('/admin/users/' + id); },
  getAdminStats() { return this.get('/admin/stats'); },
  getAdminExams() { return this.get('/admin/exams'); },
  getAdminQuestions() { return this.get('/admin/questions'); },
  adminDeleteExam(id) { return this.delete('/admin/exams/' + id); },
  adminDeleteQuestion(id) { return this.delete('/admin/questions/' + id); },
  getAdminAnnouncements() { return this.get('/admin/announcements'); },
  createAdminAnnouncement(d) { return this.post('/admin/announcements', d); },
  updateAdminAnnouncement(id, d) { return this.put('/admin/announcements/' + id, d); },
  deleteAdminAnnouncement(id) { return this.delete('/admin/announcements/' + id); },
  getAdminKnowledge() { return this.get('/admin/knowledge'); },
  createAdminKnowledge(d) { return this.post('/admin/knowledge', d); },
  updateAdminKnowledge(id, d) { return this.put('/admin/knowledge/' + id, d); },
  deleteAdminKnowledge(id) { return this.delete('/admin/knowledge/' + id); },
  getAdminScores() { return this.get('/admin/scores'); }
};

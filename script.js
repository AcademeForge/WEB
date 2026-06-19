"use strict";

const ANALYTICS_EP = "https://afooyyydhlwngzssgqih.supabase.co/functions/v1/academeforge-analytics";
const AI_EP = "https://afooyyydhlwngzssgqih.supabase.co/functions/v1/academeforge-ai-chat";
const APK_URL = "academeforge2.0.4.apk";

const TEXT = {
  vision: "AcademeForge exists to help students learn beyond textbooks and memorization. The vision is to build a modern learning ecosystem where students develop practical skills, creativity, confidence, AI fluency, communication, and execution ability.",
  about: "AcademeForge began in January 2024 as a Telegram community for students and is now being rebuilt as a premium practical learning platform focused on future-ready skills, digital creativity, AI-powered learning, coding logic, freelancing, and student confidence.",
  founder: "Devraj Kumar is the Founder of AcademeForge. He started the platform as a student with direct understanding of how students struggle with outdated learning systems and lack of practical exposure. The long-term goal is to impact 100,000+ students.",
  privacy: "AcademeForge may collect basic information needed for learning access, support, communication, analytics, security, and platform improvement. Student data is not sold to advertisers.",
  data: "Student data may be used for account creation, login support, batch allocation, class communication, assignment tracking, certificate verification, support tickets, safety monitoring, analytics, and platform improvement.",
  batch: "Batch access, class schedules, assignments, recordings, certificates, support windows, and completion rules will be announced before official admissions open.",
  community: "AcademeForge community spaces should remain respectful and learning-focused. Spam, harassment, abusive language, impersonation, and cheating are not allowed.",
  terms: "By using AcademeForge website, app, or learning services, users should follow platform rules, respect intellectual property, and use official channels for support.",
  safety: "Students should use only official AcademeForge links, avoid sharing passwords, and report suspicious messages. Use the help desk and support channels for platform issues.",
  programs: "AcademeForge planned programs: Video & Media Editing (2 weeks), Creative & Graphic Design (2 weeks), AI Coding & Logic Foundation (2 weeks), Freelancing & Monetization (2 weeks). All fees are to be announced. Admissions are under rebuild.",
  fees: "Fees are currently marked as To be announced. Final fee structure will be published after the platform rebuild, admission structure, and batch policies are finalized.",
  support: "WhatsApp and call support are not available. Use the AcademeForge AI Help Desk on the website or email help.academeforge.in."
};

const KNOWLEDGE = Object.entries(TEXT).map(([k,v]) => ({key:k, content:v}));

function esc(s){ return String(s||"").replace(/[&<>"]/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
function paras(t){ return esc(t).split(/\n\n+/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`).join(""); }

/* ---- THEME SWITCHER ---- */
function getPreferredTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function setTheme(theme) {
  const root = document.documentElement;
  const isDark = theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.setAttribute('data-theme', 'dark');
    document.querySelector('.sun-icon').style.display = 'none';
    document.querySelector('.moon-icon').style.display = 'block';
  } else {
    root.setAttribute('data-theme', 'light');
    document.querySelector('.sun-icon').style.display = 'block';
    document.querySelector('.moon-icon').style.display = 'none';
  }

  localStorage.setItem('theme', theme);

  document.querySelectorAll('.theme-option').forEach(btn => {
    if (btn.getAttribute('data-value') === theme) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function toggleThemeMenu() {
  const menu = document.getElementById('theme-dropdown');
  const btn = document.getElementById('theme-toggle');
  const isOpen = menu.classList.contains('open');

  if (isOpen) {
    closeThemeMenu();
  } else {
    menu.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
  }
}

function closeThemeMenu() {
  const menu = document.getElementById('theme-dropdown');
  const btn = document.getElementById('theme-toggle');
  if (menu) {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
}

function initTheme() {
  const theme = localStorage.getItem('theme') || 'auto';
  setTheme(theme);

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem('theme') === 'auto') {
      setTheme('auto');
    }
  });

  const themeToggle = document.getElementById('theme-toggle');
  if(themeToggle) {
     themeToggle.addEventListener('click', (e) => {
       e.stopPropagation();
       toggleThemeMenu();
     });
  }

  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', (e) => {
      const selectedTheme = e.currentTarget.getAttribute('data-value');
      setTheme(selectedTheme);
      closeThemeMenu();
    });
  });

  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('theme-dropdown');
    if (dropdown && dropdown.classList.contains('open') && !e.target.closest('.theme-switcher')) {
      closeThemeMenu();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
});

/* ---- MODAL ---- */
function info(title, text){ openModal(title, paras(text)); }
function openModal(title, html){
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = html;
  const m = document.getElementById("modal");
  m.classList.add("open");
  document.body.classList.add("scroll-lock");
}
function closeModal(){
  document.getElementById("modal").classList.remove("open");
  document.body.classList.remove("scroll-lock");
}
document.getElementById("modal").addEventListener("click", e => { if(e.target===e.currentTarget) closeModal(); });

function showCourse(name, dur, scope){
  openModal(name, `<table class="course-table"><tr><th>Duration</th><td>${esc(dur)}</td></tr><tr><th>Fees</th><td>To be announced</td></tr><tr><th>Mode</th><td>Hybrid (planned)</td></tr><tr><th>Scope</th><td>${esc(scope)}</td></tr></table>`);
}

/* ---- APK DOWNLOAD ---- */
async function downloadApk(){
  try{
    await fetch(ANALYTICS_EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"apk_download",device_id:getDevId(),page:location.pathname})});
  }catch(e){}
  const a=document.createElement("a"); a.href=APK_URL; a.download="academeforge2.0.4.apk"; document.body.appendChild(a); a.click(); a.remove();
}

function getDevId(){
  try{
    let id=localStorage.getItem("af_devid");
    if(!id){ id=crypto.randomUUID(); localStorage.setItem("af_devid",id); }
    return id;
  }catch(e){ return "anon"; }
}

/* ---- AI CHAT ---- */
let aiSeeded = false;

function toggleAIChat(open){
  const panel = document.getElementById("ai-panel");
  const fab = document.getElementById("ai-fab");
  const isOpen = panel.classList.contains("open");
  const shouldOpen = typeof open==="boolean" ? open : !isOpen;
  panel.classList.toggle("open", shouldOpen);
  panel.setAttribute("aria-hidden", String(!shouldOpen));
  fab.classList.toggle("hidden", shouldOpen);
  if(shouldOpen){ seedAI(); setTimeout(()=>document.getElementById("ai-input").focus(),120); }
}

function seedAI(){
  if(aiSeeded) return;
  aiSeeded = true;
  try{
    const hist = JSON.parse(localStorage.getItem("af_ai_hist")||"[]");
    if(hist.length){
      hist.forEach(m => appendMsg(m.role==="user"?"user":"bot", m.content));
    } else {
      appendMsg("bot","Hi! I'm the AcademeForge AI help desk. Ask me about programs, admissions, fees, founder, policies, certificates, or support.");
    }
  }catch(e){
    appendMsg("bot","Hi! I'm the AcademeForge AI help desk. Ask me about programs, admissions, fees, or support.");
  }
}

function appendMsg(role, text, typing=false){
  const body = document.getElementById("ai-body");
  const div = document.createElement("div");
  div.className = "ai-msg " + (role==="user"?"ai-user":"ai-bot");
  if(typing){
    div.innerHTML='<span class="ai-typing"><i></i><i></i><i></i></span>';
  } else {
    div.textContent = text;
  }
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
  return div;
}

function saveHistory(role, content){
  try{
    const h = JSON.parse(localStorage.getItem("af_ai_hist")||"[]");
    h.push({role, content: content.slice(0,1000)});
    localStorage.setItem("af_ai_hist", JSON.stringify(h.slice(-20)));
  }catch(e){}
}

function localAnswer(q){
  const s = q.toLowerCase();
  if(/^(hi|hello|hey|namaste)[!. ]*$/i.test(q)) return "Hi! How can I help you with AcademeForge?";
  if(/^(thanks|thank you|ok|okay)[!. ]*$/i.test(q)) return "You're welcome!";
  if(s.includes("admission")||s.includes("apply")||s.includes("enroll")) return "Admissions are currently paused while the platform is being rebuilt. New batches will be announced officially.";
  if(s.includes("fee")||s.includes("price")||s.includes("cost")) return TEXT.fees;
  if(s.includes("program")||s.includes("course")||s.includes("coding")||s.includes("design")||s.includes("editing")||s.includes("freelanc")) return TEXT.programs;
  if(s.includes("founder")||s.includes("devraj")||s.includes("owner")) return TEXT.founder;
  if(s.includes("about")||s.includes("what is")) return TEXT.about;
  if(s.includes("vision")||s.includes("mission")||s.includes("goal")) return TEXT.vision;
  if(s.includes("privacy")||s.includes("data")) return TEXT.privacy;
  if(s.includes("batch")||s.includes("class")||s.includes("schedule")) return TEXT.batch;
  if(s.includes("support")||s.includes("help")||s.includes("contact")||s.includes("whatsapp")) return TEXT.support;
  if(s.includes("certificate")||s.includes("verify")) return "Certificate download and verification are planned features. They will be available after the platform rebuild.";
  return "I don't have confirmed information about that in the current website data. Ask me about programs, admissions, fees, founder, policies, batches, certificates, or support.";
}

async function askAI(question){
  try{
    if(!navigator.onLine) return {answer:localAnswer(question),source:"local"};
    const c = new AbortController();
    const t = setTimeout(()=>c.abort(),9000);
    const r = await fetch(AI_EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:question.slice(0,600),session_id:getDevId(),page:location.pathname,knowledge:KNOWLEDGE}),signal:c.signal});
    clearTimeout(t);
    const data = await r.json().catch(()=>null);
    const ans = data?.answer||data?.message||data?.reply||"";
    if(!r.ok||!ans) return {answer:localAnswer(question),source:"local"};
    return {answer:ans.slice(0,2000),source:"remote"};
  }catch(e){
    return {answer:localAnswer(question),source:"local"};
  }
}

async function handleAsk(question){
  const q = question.trim();
  if(!q) return;
  appendMsg("user", q);
  saveHistory("user", q);
  const typing = appendMsg("bot","",true);
  document.getElementById("ai-status").textContent = "Thinking...";
  const {answer,source} = await askAI(q);
  typing.textContent = answer;
  saveHistory("assistant", answer);
  document.getElementById("ai-status").textContent = source==="remote"?"Online help desk":"Local help desk";
}

function sendSuggestion(t){ handleAsk(t); }

document.getElementById("ai-form").addEventListener("submit", e=>{
  e.preventDefault();
  const inp = document.getElementById("ai-input");
  const val = inp.value.trim();
  if(!val) return;
  inp.value=""; inp.style.height="auto";
  handleAsk(val);
});
document.getElementById("ai-input").addEventListener("input", function(){
  this.style.height="auto";
  this.style.height=Math.min(this.scrollHeight,120)+"px";
});
document.getElementById("ai-input").addEventListener("keydown", e=>{
  if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); document.getElementById("ai-form").requestSubmit(); }
});

/* ---- MOBILE MENU ---- */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");
const mobileBackdrop = document.getElementById("mobile-backdrop");
const mobileClose = document.getElementById("mobile-close");

function openMenu(){
  mobileMenu.classList.add("open");
  mobileMenu.setAttribute("aria-hidden","false");
  hamburger.setAttribute("aria-expanded","true");
  document.body.classList.add("scroll-lock");
}
function closeMenu(){
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden","true");
  hamburger.setAttribute("aria-expanded","false");
  document.body.classList.remove("scroll-lock");
}
hamburger.addEventListener("click", openMenu);
mobileClose.addEventListener("click", closeMenu);
mobileBackdrop.addEventListener("click", closeMenu);
document.querySelectorAll(".mnav-link").forEach(l => l.addEventListener("click", closeMenu));

/* ---- FAQ ---- */
document.querySelectorAll(".faq-q").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const item = btn.closest(".faq-item");
    const open = item.classList.contains("open");
    document.querySelectorAll(".faq-item.open").forEach(i=>{ i.classList.remove("open"); i.querySelector(".faq-q").setAttribute("aria-expanded","false"); });
    if(!open){ item.classList.add("open"); btn.setAttribute("aria-expanded","true"); }
  });
});
document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', e => {
    if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === 'U')
    ) {
        e.preventDefault();
    }
});
/* ---- ESC ---- */
document.addEventListener("keydown", e=>{
  if(e.key==="Escape"){ closeModal(); toggleAIChat(false); closeMenu(); closeThemeMenu(); }
});

/* ---- YEAR / ANALYTICS ---- */
document.getElementById("year").textContent = new Date().getFullYear();
if(navigator.onLine){
  try{
    const last = parseInt(localStorage.getItem("af_last_visit")||"0");
    if(Date.now()-last > 1800000){
      localStorage.setItem("af_last_visit", String(Date.now()));
      fetch(ANALYTICS_EP,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"website_visit",device_id:getDevId(),page:location.pathname})}).catch(()=>{});
    }
  }catch(e){}
}

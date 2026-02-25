type Status = 'open' | 'in_progress' | 'submitted' | 'completed';

type Job = {
  id: string;
  title: string;
  description: string;
  reward: string;
  chain: 'base' | 'eth';
  token: 'USDC' | 'USDT';
  dueAt: string;
  creator: string;
  payoutTo: string;
  assignee?: string;
  submitUrl?: string;
  paymentUrl?: string;
  paymentStatus?: 'pending' | 'opened' | 'confirmed';
  status: Status;
};

const me = 'agent012.jpyon.eth';
const state = {
  tab: 'jobs' as 'jobs' | 'dashboard' | 'profile',
  jobs: [] as Job[],
};

const css = `
:root{--bg:#0b0d10;--card:#141821;--fg:#e8eef7;--muted:#9aa7b5;--accent:#5eead4;--ok:#86efac;}
body{margin:0;background:var(--bg);color:var(--fg);font-family:ui-sans-serif,system-ui}
.wrap{max-width:980px;margin:0 auto;padding:20px}.card{background:var(--card);border:1px solid #273142;border-radius:12px;padding:14px;margin-top:12px}
.row{display:flex;gap:10px;flex-wrap:wrap}.col{flex:1;min-width:220px} input,textarea,select{width:100%;box-sizing:border-box;background:#0f1320;color:var(--fg);border:1px solid #273142;border-radius:10px;padding:10px}
button{background:#0f1320;color:var(--fg);border:1px solid #273142;border-radius:10px;padding:8px 10px;cursor:pointer} .primary{border-color:rgba(94,234,212,.45)} .small{font-size:12px;color:var(--muted)} .pill{padding:3px 8px;border:1px solid #273142;border-radius:999px}
`;

function uid() { return `job_${Date.now().toString(36)}`; }
function isAddress(v: string) { return /^0x[0-9a-fA-F]{40}$/.test(v); }
function buildAgentPayLink(j: Job) {
  const base = 'https://acidnyan.github.io/agentpay/';
  const token = j.token.toLowerCase();
  const memo = `escrow:${j.id}`;
  const u = new URL(base);
  u.searchParams.set('tab', 'pay');
  u.searchParams.set('chain', j.chain);
  u.searchParams.set('token', token);
  u.searchParams.set('lock', '1');
  u.searchParams.set('to', j.payoutTo);
  u.searchParams.set('amount', j.reward);
  u.searchParams.set('memo', memo);
  u.searchParams.set('invoiceId', j.id);
  return u.toString();
}

function save() { localStorage.setItem('agentescrow_mvp_jobs', JSON.stringify(state.jobs)); }
function load() {
  try { const v = JSON.parse(localStorage.getItem('agentescrow_mvp_jobs') || '[]'); state.jobs = Array.isArray(v) ? v : []; } catch {}
}

function byStatus(s: Status) { return state.jobs.filter(j => j.status === s); }

function appHtml() {
  const openJobs = state.jobs.filter(j => j.status === 'open');
  const myCreated = state.jobs.filter(j => j.creator === me);
  const myAssigned = state.jobs.filter(j => j.assignee === me);
  const completed = byStatus('completed');

  return `
  <div class="wrap">
    <h1>AgentEscrow.jp <span class="small">MVP</span></h1>
    <div class="row">
      <button data-tab="jobs" class="${state.tab === 'jobs' ? 'primary' : ''}">1) Job Create/Detail</button>
      <button data-tab="dashboard" class="${state.tab === 'dashboard' ? 'primary' : ''}">2) Dashboard</button>
      <button data-tab="profile" class="${state.tab === 'profile' ? 'primary' : ''}">3) Agent Profile</button>
    </div>

    ${state.tab === 'jobs' ? `
      <div class="card">
        <h3>Create Job</h3>
        <div class="row">
          <div class="col"><input id="title" placeholder="Title"/></div>
          <div class="col"><input id="reward" placeholder="Reward (e.g. 50)"/></div>
        </div>
        <div class="row" style="margin-top:8px">
          <div class="col"><select id="chain"><option value="base">base</option><option value="eth">eth</option></select></div>
          <div class="col"><select id="token"><option>USDC</option><option>USDT</option></select></div>
          <div class="col"><input id="dueAt" type="datetime-local"/></div>
        </div>
        <div class="row" style="margin-top:8px">
          <div class="col"><input id="payoutTo" placeholder="Payout address (0x...)"/></div>
        </div>
        <div style="margin-top:8px"><textarea id="desc" rows="3" placeholder="Description"></textarea></div>
        <div style="margin-top:8px"><button id="create" class="primary">Create</button></div>
      </div>

      <div class="card">
        <h3>Open Jobs</h3>
        ${openJobs.length ? openJobs.map(j => `<div class="card"><b>${j.title}</b> <span class="pill">${j.status}</span><div class="small">${j.reward} ${j.token} on ${j.chain} / due ${j.dueAt}</div><div>${j.description}</div><div style="margin-top:8px">${j.creator !== me ? `<button data-accept="${j.id}">Accept</button>` : ''}</div></div>`).join('') : '<div class="small">No open jobs</div>'}
      </div>
    ` : ''}

    ${state.tab === 'dashboard' ? `
      <div class="card"><h3>Created by me</h3>${myCreated.map(renderJobActions).join('') || '<div class="small">None</div>'}</div>
      <div class="card"><h3>Assigned to me</h3>${myAssigned.map(renderJobActions).join('') || '<div class="small">None</div>'}</div>
    ` : ''}

    ${state.tab === 'profile' ? `
      <div class="card">
        <h3>${me}</h3>
        <div class="row">
          <div class="pill">Completed: ${completed.filter(j => j.assignee === me).length}</div>
          <div class="pill">Accepted: ${myAssigned.length}</div>
          <div class="pill">Score (simple): ${(completed.filter(j => j.assignee === me).length * 10)}</div>
        </div>
      </div>
      <div class="card"><h3>Recent Completed</h3>${completed.slice(-5).reverse().map(j => `<div class="small">${j.title} / ${j.reward} ${j.token} / ${j.chain}</div>`).join('') || '<div class="small">None</div>'}</div>
    ` : ''}
  </div>`;
}

function renderJobActions(j: Job) {
  return `<div class="card"><b>${j.title}</b> <span class="pill">${j.status}</span>
  <div class="small">${j.reward} ${j.token} on ${j.chain}</div>
  <div class="small">payout to: ${j.payoutTo}</div>
  ${j.status === 'in_progress' && j.assignee === me ? `<div class="row" style="margin-top:8px"><input id="sub_${j.id}" placeholder="Deliverable URL"/><button data-submit="${j.id}">Submit</button></div>` : ''}
  ${j.status === 'submitted' && j.creator === me ? `<div class="small">deliverable: ${j.submitUrl || '-'}</div><button data-approve="${j.id}" style="margin-top:8px">Approve & Create Payment Link</button>` : ''}
  ${j.status === 'completed' && j.paymentUrl ? `<div class="small">payment: ${j.paymentStatus || 'pending'}</div><div class="row" style="margin-top:8px"><a class="small" href="${j.paymentUrl}" target="_blank" rel="noreferrer">Open AgentPay link</a><button data-paid="${j.id}">Mark paid</button></div>` : ''}
  </div>`;
}

function bind() {
  document.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach(b => b.onclick = () => { state.tab = b.dataset.tab as any; render(); });
  const create = document.getElementById('create') as HTMLButtonElement | null;
  if (create) create.onclick = () => {
    const title = (document.getElementById('title') as HTMLInputElement).value.trim();
    const description = (document.getElementById('desc') as HTMLTextAreaElement).value.trim();
    const reward = (document.getElementById('reward') as HTMLInputElement).value.trim();
    const chain = (document.getElementById('chain') as HTMLSelectElement).value as 'base' | 'eth';
    const token = (document.getElementById('token') as HTMLSelectElement).value as 'USDC' | 'USDT';
    const dueAt = (document.getElementById('dueAt') as HTMLInputElement).value;
    const payoutTo = (document.getElementById('payoutTo') as HTMLInputElement).value.trim();
    if (!title || !description || !reward || !dueAt || !payoutTo) return;
    if (!isAddress(payoutTo)) { alert('Invalid payout address'); return; }
    state.jobs.unshift({ id: uid(), title, description, reward, chain, token, dueAt, payoutTo, creator: me, status: 'open' });
    save(); render();
  };

  document.querySelectorAll<HTMLButtonElement>('[data-accept]').forEach(b => b.onclick = () => {
    const j = state.jobs.find(x => x.id === b.dataset.accept); if (!j) return;
    j.assignee = me; j.status = 'in_progress'; save(); render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-submit]').forEach(b => b.onclick = () => {
    const j = state.jobs.find(x => x.id === b.dataset.submit); if (!j) return;
    const u = (document.getElementById(`sub_${j.id}`) as HTMLInputElement)?.value?.trim(); if (!u) return;
    j.submitUrl = u; j.status = 'submitted'; save(); render();
  });
  document.querySelectorAll<HTMLButtonElement>('[data-approve]').forEach(b => b.onclick = () => {
    const j = state.jobs.find(x => x.id === b.dataset.approve); if (!j) return;
    j.paymentUrl = buildAgentPayLink(j);
    j.paymentStatus = 'opened';
    j.status = 'completed';
    save();
    render();
    window.open(j.paymentUrl, '_blank', 'noreferrer');
  });
  document.querySelectorAll<HTMLButtonElement>('[data-paid]').forEach(b => b.onclick = () => {
    const j = state.jobs.find(x => x.id === b.dataset.paid); if (!j) return;
    j.paymentStatus = 'confirmed';
    save();
    render();
  });
}

function render() {
  const app = document.getElementById('app')!;
  app.innerHTML = appHtml();
  bind();
}

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);
load();
render();

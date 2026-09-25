import React, { useEffect, useRef, useState } from 'react';
import { Bot, Plus, Send, Sparkles, PanelLeftClose, PanelLeftOpen, MessageSquare, Trash2, CheckCircle2, Circle, ClipboardList, Languages, Zap, ChevronDown, Copy, Check, Menu } from 'lucide-react';

const starters = [
  { icon: ClipboardList, title: 'Plan my day', desc: 'Create a practical schedule for today', prompt: 'Plan my day: study, take breaks, and finish my important tasks.' },
  { icon: Sparkles, title: 'Brainstorm ideas', desc: 'Explore ideas and turn one into a plan', prompt: 'Help me brainstorm ideas for a college project and turn the best one into steps.' },
  { icon: CheckCircle2, title: 'Make a to-do list', desc: 'Break a goal into actionable tasks', prompt: 'Make me a to-do list for learning HTML and CSS.' },
  { icon: Languages, title: 'Hindi conversation', desc: 'Chat naturally in Hindi or English', prompt: 'Namaste! Mujhse Hindi mein baat karo aur meri padhai plan karne mein help karo.' }
];

function makePlan(message) {
  const m = message.toLowerCase();
  if (/(plan|schedule|routine|day|study|learn|prepare|roadmap)/.test(m)) {
    return ['Understand your goal and deadline', 'Break the goal into manageable tasks', 'Prioritize tasks and estimate time', 'Review the plan and choose the first action'];
  }
  if (/(todo|to-do|task|checklist|steps|project)/.test(m)) {
    return ['Identify the desired outcome', 'List the key tasks', 'Arrange tasks in a sensible order', 'Start with the smallest actionable step'];
  }
  if (/(idea|brainstorm|creative)/.test(m)) {
    return ['Clarify the problem and audience', 'Generate several possible approaches', 'Compare ideas by effort and impact', 'Choose one idea and define a prototype'];
  }
  return ['Interpret your request', 'Choose a helpful approach', 'Work through the request', 'Present the result and next step'];
}

function answerFor(message, lang) {
  const m = message.toLowerCase();
  if (/(hello|hi\b|hey|namaste|नमस्ते)/i.test(message)) return lang === 'hi'
    ? 'नमस्ते! मैं Orbit हूँ — आपका AI-style agentic assistant। मैं आपके लक्ष्य को छोटे steps में बाँट सकता हूँ, to-do list बना सकता हूँ और सरल calculations कर सकता हूँ। आज क्या करना है?'
    : 'Hey! I’m Orbit, your agentic-style assistant. I can break goals into steps, create a to-do list, help plan your day, and do simple calculations. What would you like to work on?';
  if (/(what can you do|help|capabilities)/.test(m)) return 'I can help you plan projects or study sessions, turn goals into checklists, brainstorm ideas, calculate simple arithmetic, and keep a task list in this session. I’ll show a short action plan before responding. This demo runs locally and does not connect to a live AI model.';
  if (/(calculate|what is|how much|[\d]+\s*[\+\-*\/]\s*[\d]+)/.test(m)) {
    const expr = message.match(/(-?\d+(?:\.\d+)?)\s*([\+\-*\/])\s*(-?\d+(?:\.\d+)?)/);
    if (expr) {
      const a = Number(expr[1]), b = Number(expr[3]);
      const result = expr[2] === '+' ? a+b : expr[2] === '-' ? a-b : expr[2] === '*' ? a*b : b === 0 ? null : a/b;
      if (result !== null) return `I calculated **${a} ${expr[2]} ${b} = ${Number(result.toFixed(6))}**. Want me to add another calculation or help you use this result?`;
      return 'Division by zero is undefined. Try a different divisor.';
    }
  }
  if (/(todo|to-do|checklist|task list)/.test(m)) return 'I’ve prepared a starter checklist for you. You can track each item in the Tasks panel on the right. Tell me your goal or deadline if you want to make it more specific.';
  if (/(plan|schedule|routine|study|learn|roadmap|prepare)/.test(m)) return 'Here’s a practical way to get started:\n\n1. **Set a clear outcome** — define what “done” looks like.\n2. **Split it into small tasks** — aim for 20–40 minute chunks.\n3. **Prioritize** — do the most important task first.\n4. **Take a short break** after each focused session.\n5. **Review progress** and adjust the next step.\n\nShare your deadline and available time, and I can tailor the plan.';
  if (/(hindi|हिंदी|हिन्दी|namaste|मुझे|मेरी|करो)/i.test(message)) return 'बिल्कुल! मैं हिंदी में मदद कर सकता हूँ। अपना लक्ष्य बताइए—मैं उसे छोटे-छोटे steps और एक आसान checklist में बाँट दूँगा।';
  return `I understand you want help with: “${message}”.\n\nA useful next move is to define the outcome, break it into a few small actions, and start with the first one. If you share a little more context (your goal, deadline, or constraints), I can make the plan more specific.\n\n*Note: I’m a front-end demo assistant, not connected to a live language model.*`;
}

export default function App() {
  const [messages, setMessages] = useState([]);
  const [value, setValue] = useState('');
  const [tasks, setTasks] = useState([]);
  const [lang, setLang] = useState('en');
  const [sidebar, setSidebar] = useState(true);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [copied, setCopied] = useState(-1);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const welcome = messages.length === 0;

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, busy]);
  const send = (text = value) => {
    const content = text.trim();
    if (!content || busy) return;
    const userMsg = { role: 'user', content, id: Date.now() };
    const plan = makePlan(content);
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: answerFor(content, lang), plan, id: Date.now()+1 }]);
    if (/(todo|to-do|checklist|task list|tasks)/i.test(content)) {
      setTasks(prev => prev.length ? prev : ['Write down the goal', 'Choose the top priority', 'Complete the first task'].map((t,i)=>({id:Date.now()+i, text:t, done:false})));
    }
    setValue('');
  };
  const addTask = (text) => {
    const clean = text.trim();
    if (clean) setTasks(prev => [...prev, { id: Date.now()+Math.random(), text: clean, done:false }]);
  };
  const toggleTask = id => setTasks(prev => prev.map(t => t.id === id ? {...t, done:!t.done} : t));
  const removeTask = id => setTasks(prev => prev.filter(t => t.id !== id));
  const newChat = () => { setMessages([]); setValue(''); };
  const copyText = async (text, idx) => {
    try { await navigator.clipboard.writeText(text); setCopied(idx); setTimeout(()=>setCopied(-1),1200); } catch {}
  };

  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? '' : 'collapsed'}`}>
      <div className="brand"><div className="brand-mark"><Bot size={21}/></div>{sidebar && <span>orbit<span className="brand-dot">.</span></span>}</div>
      <button className="new-chat" onClick={newChat}><Plus size={17}/>{sidebar && 'New chat'}</button>
      {sidebar && <><div className="side-label">WORKSPACE</div><button className="side-item active"><MessageSquare size={17}/> Chat assistant</button><button className="side-item" onClick={()=>setActiveTab('tasks')}><ClipboardList size={17}/> My tasks <span className="count">{tasks.length}</span></button><div className="side-bottom"><div className="profile"><div className="avatar">C</div><div><strong>Guest user</strong><small>Local workspace</small></div></div></div></>}
      <button className="collapse-btn" title="Toggle sidebar" onClick={()=>setSidebar(!sidebar)}>{sidebar ? <PanelLeftClose size={17}/> : <PanelLeftOpen size={17}/>}</button>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="mobile-brand"><div className="brand-mark"><Bot size={18}/></div><b>orbit<span className="brand-dot">.</span></b></div><div className="model-label"><span className="status-dot"/> Orbit Assistant <span className="model-pill">DEMO</span></div><div className="top-actions"><button className="lang-btn" onClick={()=>setLang(lang==='en'?'hi':'en')}><Languages size={16}/>{lang==='en'?'EN':'हिंदी'}<ChevronDown size={13}/></button><div className="user-mini">C</div></div></header>

      <div className="content-wrap">
        <section className="chat-column">
          {welcome ? <div className="welcome">
            <div className="welcome-icon"><Sparkles size={25}/></div>
            <div className="eyebrow">YOUR PERSONAL AI WORKSPACE</div>
            <h1>What can I help you<br/><span>get done today?</span></h1>
            <p>Think it. Plan it. Make it happen. Your assistant for turning ideas into action.</p>
            <div className="starter-grid">{starters.map((s,i)=><button key={i} className="starter-card" onClick={()=>send(s.prompt)}><div className="starter-icon"><s.icon size={18}/></div><strong>{s.title}</strong><span>{s.desc}</span><span className="card-arrow">↗</span></button>)}</div>
          </div> : <div className="messages">{messages.map((m,i)=><div key={m.id} className={`message-row ${m.role}`}><div className={`message-avatar ${m.role==='assistant'?'bot-avatar':'user-avatar'}`}>{m.role==='assistant'?<Bot size={18}/>: 'C'}</div><div className="message-body"><div className="message-name">{m.role==='assistant'?'Orbit':'You'} {m.role==='assistant'&&<span className="tiny-badge">ASSISTANT</span>}</div>{m.plan && <div className="plan-box"><div className="plan-title"><Zap size={14}/> ACTION PLAN <span>{m.plan.length} steps</span></div>{m.plan.map((p,j)=><div className="plan-step" key={j}><span>{j+1}</span>{p}</div>)}</div>}<div className="message-text">{m.content.split('\n').map((line,j)=><p key={j}>{line.split(/(\*\*.*?\*\*)/g).map((part,k)=>part.startsWith('**')&&part.endsWith('**')?<strong key={k}>{part.slice(2,-2)}</strong>:part)}</p>)}</div>{m.role==='assistant'&&<button className="copy-btn" onClick={()=>copyText(m.content,i)}>{copied===i?<Check size={13}/>:<Copy size={13}/>} {copied===i?'Copied':'Copy'}</button>}</div></div>)}<div ref={bottomRef}/></div>}
          <div className="composer-area"><div className="composer"><textarea ref={inputRef} value={value} onChange={e=>setValue(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Message Orbit... (try “Plan my study session”) " rows={1}/><div className="composer-footer"><span className="composer-hint"><Sparkles size={13}/> Agentic mode <span className="hint-divider">·</span> Enter to send</span><button className="send-btn" onClick={()=>send()} disabled={!value.trim()}><Send size={16}/></button></div></div><div className="disclaimer">Orbit can make mistakes. This is a local demo; no live AI model is connected.</div></div>
        </section>

        <aside className="right-panel"><div className="panel-tabs"><button className={activeTab==='tasks'?'selected':''} onClick={()=>setActiveTab('tasks')}><ClipboardList size={15}/> Tasks</button><button className={activeTab==='activity'?'selected':''} onClick={()=>setActiveTab('activity')}><Zap size={15}/> Activity</button></div>{activeTab==='tasks'?<div className="panel-content"><div className="panel-heading"><div><h3>My tasks</h3><p>Keep your next steps in view.</p></div><span className="task-count">{tasks.filter(t=>t.done).length}/{tasks.length}</span></div><div className="progress-track"><div style={{width:tasks.length?`${tasks.filter(t=>t.done).length/tasks.length*100}%`:'0%'}}/></div><TaskInput onAdd={addTask}/>{tasks.length===0?<div className="empty-tasks"><div className="empty-icon"><ClipboardList size={23}/></div><strong>No tasks yet</strong><p>Ask Orbit to create a to-do list or add a task below.</p></div>:<div className="task-list">{tasks.map(t=><div className={`task-row ${t.done?'done':''}`} key={t.id}><button onClick={()=>toggleTask(t.id)}>{t.done?<CheckCircle2 size={18}/>:<Circle size={18}/>}</button><span>{t.text}</span><button className="delete-task" onClick={()=>removeTask(t.id)} title="Delete task"><Trash2 size={14}/></button></div>)}</div>}<div className="panel-tip"><Sparkles size={15}/><p><strong>Pro tip</strong><br/>Break big goals into small tasks you can finish in one focused session.</p></div></div>:<div className="panel-content"><div className="panel-heading"><div><h3>Activity</h3><p>Your current session at a glance.</p></div></div><div className="activity-stat"><span>Messages</span><strong>{messages.length}</strong></div><div className="activity-stat"><span>Tasks completed</span><strong>{tasks.filter(t=>t.done).length}</strong></div><div className="activity-stat"><span>Tasks remaining</span><strong>{tasks.filter(t=>!t.done).length}</strong></div><button className="clear-btn" onClick={()=>{setMessages([]);setTasks([]);}}>Clear session data</button></div>}</aside>
      </div>
    </main>
  </div>;
}

function TaskInput({onAdd}) {
  const [text,setText] = useState('');
  return <form className="task-input" onSubmit={e=>{e.preventDefault();onAdd(text);setText('');}}><input value={text} onChange={e=>setText(e.target.value)} placeholder="Add a task..." aria-label="New task"/><button disabled={!text.trim()} aria-label="Add task"><Plus size={17}/></button></form>;
}
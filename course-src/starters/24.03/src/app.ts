import {createModel,route,validateTasks,type Task,type State} from './model.mjs';
import {openDatabase,readTasks,writeTasks} from './storage.mjs';
import {onCLS,onINP,onLCP,type Metric} from 'web-vitals';

const text=(tag:string,value:string)=>{const element=document.createElement(tag);element.textContent=value;return element;};
const statuses={todo:'A fazer',doing:'Em andamento',done:'Concluído'} as const;
document.querySelector<HTMLAnchorElement>('a.skip[href="#workspace"]')?.addEventListener('click',event=>{
  event.preventDefault();document.getElementById('workspace')?.focus();
});
class KanbanBoard extends HTMLElement {
  set tasks(tasks:Task[]){
    this.replaceChildren();
    for(const [status,label] of Object.entries(statuses)){
      const section=document.createElement('section');section.className='column';section.setAttribute('aria-label',label);
      section.append(text('h2',`${label} · ${tasks.filter(t=>t.status===status).length}`));
      const list=document.createElement('ul');
      for(const task of tasks.filter(task=>task.status===status)){
        const li=document.createElement('li'),link=document.createElement('a');
        link.href='#/tasks/'+encodeURIComponent(task.id);link.textContent=task.title;
        li.append(link,text('p',`Tarefa ${task.id}`));list.append(li);
      }
      section.append(list);this.append(section);
    }
  }
}
customElements.define('kanban-board',KanbanBoard);
class KanbanApp extends HTMLElement {
  private model?:ReturnType<typeof createModel>;
  private db?:IDBDatabase;
  private message='';
  private readonly navigate=()=>{
    if(this.model&&route(location.hash).name!=='not-found')void this.model.load(this.querySelector<HTMLSelectElement>('#board')!.value);
    else this.render();
    this.querySelector<HTMLElement>('[data-heading]')?.focus();
  };
  connectedCallback(){void this.initialize();}
  disconnectedCallback(){window.removeEventListener('hashchange',this.navigate);this.db?.close();}
  async initialize(){
    this.innerHTML=`<div class="toolbar"><label>Quadro<select id="board" aria-label="Quadro"><option value="all">Todas as tarefas</option><option value="empty">Quadro vazio</option><option value="error">Falha de rede</option><option value="slow">Resposta lenta</option></select></label><button class="secondary" id="refresh">Atualizar</button></div><form id="create"><label>Nova tarefa<input name="title" maxlength="120" required></label><button>Adicionar tarefa</button></form><p class="state" role="status" aria-live="polite"></p><p class="error" role="alert"></p><div id="view"></div><aside class="metrics" aria-label="Métricas locais"><h2>Web Vitals desta navegação</h2><p>Resultados de laboratório; interaja e alterne a aba para finalizar a amostra.</p><ul id="vitals"></ul></aside>`;
    if('serviceWorker' in navigator)void navigator.serviceWorker.register('/sw.js').catch(()=>{this.message='Shell offline indisponível neste navegador.';this.render();});
    const board=this.querySelector<HTMLSelectElement>('#board')!;
    board.addEventListener('change',()=>{location.hash='#/';void this.model?.load(board.value);});
    this.querySelector('#refresh')!.addEventListener('click',()=>void this.model?.load(board.value));
    this.querySelector<HTMLFormElement>('#create')!.addEventListener('submit',event=>{
      event.preventDefault();void this.createTask();
    });
    let initialTasks:Task[]|undefined;
    try {this.db=await openDatabase();initialTasks=validateTasks(await readTasks(this.db));}
    catch(error){this.message=error instanceof Error&&error.message==='Feche outra aba do quadro e tente novamente.'?error.message:'Persistência indisponível: alterações locais não serão preservadas.';}
    this.model=createModel({initialTasks,request:async board=>{
      const response=await fetch('/api/tasks?board='+encodeURIComponent(board));
      if(!response.ok)throw new Error('API');return response.json();
    },changed:(state)=>{
      this.render();
      if(this.db&&state.board==='all'&&['ready','empty'].includes(state.status))void writeTasks(this.db,state.tasks).catch(()=>{this.message='Falha ao salvar localmente.';this.render();});
    }});
    window.addEventListener('hashchange',this.navigate);
    const record=(metric:Metric)=>{
      let item=this.querySelector<HTMLElement>(`[data-metric="${metric.name}"]`);
      if(!item){item=document.createElement('li');item.dataset.metric=metric.name;this.querySelector('#vitals')!.append(item);}
      item.dataset.value=String(metric.value);item.textContent=`${metric.name}: ${metric.value.toFixed(2)} ${metric.name==='CLS'?'':'ms'} (${metric.rating})`;
    };
    onLCP(record,{reportAllChanges:true});onCLS(record,{reportAllChanges:true});onINP(record,{reportAllChanges:true,durationThreshold:16});
    await this.model.load('all');
  }
  async createTask(){
    const form=this.querySelector<HTMLFormElement>('#create')!,input=form.elements.namedItem('title') as HTMLInputElement;
    try{
      const response=await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:input.value})});
      if(!response.ok)throw new Error('create');input.value='';this.message='';
      this.querySelector<HTMLSelectElement>('#board')!.value='all';location.hash='#/';this.model!.invalidate('all');await this.model!.load('all');input.focus();
    }catch{this.message='Não foi possível criar a tarefa.';this.render();}
  }
  render(){
    if(!this.model)return;
    const restoreHeadingFocus=this.querySelector('[data-heading]')===document.activeElement;
    const state:State=this.model.state,view=this.querySelector<HTMLElement>('#view')!,current=route(location.hash);
    const busy=['loading','revalidating'].includes(state.status);view.setAttribute('aria-busy',String(busy));
    const labels:Record<string,string>={loading:'Carregando tarefas…',revalidating:'Atualizando tarefas do cache…',ready:'Tarefas atualizadas.',empty:'Nenhuma tarefa neste quadro.',error:'Falha na atualização.'};
    this.querySelector('[role=status]')!.textContent=labels[state.status]||'';
    this.querySelector('[role=alert]')!.textContent=[state.error,this.message].filter(Boolean).join(' ');
    const task=state.tasks.find(task=>task.id===current.id);
    const retainedPanel=view.querySelector<HTMLElement>('.detail');
    if(current.name==='detail'&&retainedPanel&&retainedPanel.dataset.taskId===current.id&&(task||busy)){
      if(task){
        view.querySelector<HTMLElement>('[data-heading]')!.textContent=task.title;
        const select=retainedPanel.querySelector<HTMLSelectElement>('select[name=status]')!;
        if(select.dataset.dirty!=='true')select.value=task.status;
      }
      return;
    }
    view.replaceChildren();
    if(current.name==='list'){
      const heading=text('h2','Visão do quadro');heading.tabIndex=-1;heading.dataset.heading='';view.append(heading);
      const board=document.createElement('kanban-board') as KanbanBoard;board.tasks=state.tasks;view.append(board);if(restoreHeadingFocus)heading.focus();return;
    }
    const back=document.createElement('a');back.href='#/';back.textContent='Voltar ao quadro';view.append(back);
    const heading=text('h2',task?.title||'Tarefa não encontrada');heading.tabIndex=-1;heading.dataset.heading='';view.append(heading);if(restoreHeadingFocus)heading.focus();
    if(!task)return;
    const panel=document.createElement('section');panel.className='detail';panel.dataset.taskId=task.id;
    const label=document.createElement('label');label.textContent='Estado da tarefa';
    const select=document.createElement('select');select.name='status';
    for(const [value,title] of Object.entries(statuses)){const option=document.createElement('option');option.value=value;option.textContent=title;select.append(option);}
    select.value=task.status;select.addEventListener('change',()=>{select.dataset.dirty='true';});label.append(select);panel.append(label);
    const save=document.createElement('button');save.textContent='Salvar estado';panel.append(save);
    save.addEventListener('click',()=>void this.saveTask(task,select.value,save));view.append(panel);
  }
  async saveTask(task:Task,status:string,button:HTMLButtonElement){
    const select=button.closest('.detail')?.querySelector<HTMLSelectElement>('select[name=status]');
    button.disabled=true;
    try{
      const response=await fetch('/api/tasks/'+encodeURIComponent(task.id),{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});
      if(!response.ok)throw new Error('update');this.message='';this.model!.invalidate('all');await this.model!.load('all');
      if(select?.isConnected&&select.value===status)delete select.dataset.dirty;
      this.render();if(select?.dataset.dirty!=='true')this.querySelector<HTMLElement>('[data-heading]')?.focus();
    }catch{this.message='Não foi possível salvar o estado.';this.render();}
    finally{button.disabled=false;}
  }
}
customElements.define('kanban-app',KanbanApp);

import {useEffect,useId,useRef,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {X} from 'lucide-react';

const layers:HTMLElement[]=[];
const original=new Map<HTMLElement,{inert:boolean;hidden:string|null}>();
let previousOverflow='';
function isolate(){
 const top=layers.at(-1);
 for(const child of document.body.children){
  if(!(child instanceof HTMLElement))continue;
  if(!original.has(child))original.set(child,{inert:child.inert,hidden:child.getAttribute('aria-hidden')});
  if(top){child.inert=child!==top;if(child!==top)child.setAttribute('aria-hidden','true');else child.removeAttribute('aria-hidden');}
 }
 for(const [index,layer] of layers.entries()){layer.style.zIndex=String(100+index*10);layer.querySelector('[role="dialog"]')?.setAttribute('aria-modal',String(layer===top));}
 if(!top){
  for(const [child,state] of original){child.inert=state.inert;if(state.hidden===null)child.removeAttribute('aria-hidden');else child.setAttribute('aria-hidden',state.hidden);}
  original.clear();document.body.style.overflow=previousOverflow;
 }
}
export function Modal({title,subtitle,children,onClose,wide=false}:{title:string;subtitle?:string;children:ReactNode;onClose?:()=>void;wide?:boolean}){
 const backdrop=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
 const close=useRef(onClose);close.current=onClose;const id=useId();
 useEffect(()=>{
  const layer=backdrop.current!,el=dialog.current!,old=document.activeElement as HTMLElement|null;
  if(!layers.length){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}
  layers.push(layer);isolate();heading.current?.focus({preventScroll:true});
  const focusable=()=>[...el.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],summary,[tabindex="0"]')].filter(x=>x.getClientRects().length>0&&!x.closest('[inert]'));
  const key=(e:KeyboardEvent)=>{
   if(layers.at(-1)!==layer)return;
   if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close.current?.();}
   if(e.key==='Tab'){
    const items=focusable(),first=items[0],last=items.at(-1);
    if(!first){e.preventDefault();heading.current?.focus();return;}
    if(!items.includes(document.activeElement as HTMLElement)){e.preventDefault();(e.shiftKey?last:first)?.focus();}
    else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
  };
  const contain=(e:FocusEvent)=>{if(layers.at(-1)===layer&&!el.contains(e.target as Node))heading.current?.focus({preventScroll:true});};
  document.addEventListener('keydown',key,true);document.addEventListener('focusin',contain);
  return()=>{
   document.removeEventListener('keydown',key,true);document.removeEventListener('focusin',contain);
   layers.splice(layers.indexOf(layer),1);original.delete(layer);isolate();
   if(old?.isConnected&&!old.closest('[inert]'))old.focus({preventScroll:true});
   else (layers.at(-1)?.querySelector('h2')||document.querySelector('main'))?.focus({preventScroll:true});
  };
 },[]);
 return createPortal(<div className="modal-backdrop" ref={backdrop}><div className={'modal '+(wide?'wide':'')} ref={dialog} role="dialog" aria-modal="true" aria-labelledby={id}><div className="modal-heading"><div><h2 id={id} tabIndex={-1} ref={heading}>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div>{onClose&&<button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20}/></button>}</div>{children}</div></div>,document.body);
}

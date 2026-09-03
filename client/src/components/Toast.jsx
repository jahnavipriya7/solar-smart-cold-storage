import React from 'react';
import {useStorage} from '../context/StorageContext';
const ICONS={success:'✅',error:'❌',warning:'⚠️'};
export default function Toast(){
  const{toasts,removeToast}=useStorage();
  return(
    <div className="toast-container">
      {toasts.map(t=>(
        <div key={t.id} className={`toast t-${t.type}`}>
          <span>{ICONS[t.type]||'ℹ️'}</span>
          <span style={{flex:1}}>{t.message}</span>
          <span className="toast-close" onClick={()=>removeToast(t.id)}>✕</span>
        </div>
      ))}
    </div>
  );
}

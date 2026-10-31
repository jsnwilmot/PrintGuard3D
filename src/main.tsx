import React from 'react';
import {createRoot} from 'react-dom/client';
import {allowedOrigin,canonicalOrigin} from './appOrigin';
import './styles.css';
const root=createRoot(document.getElementById('root')!);
if(!allowedOrigin(location.href))root.render(<main className="fatal"><h1>Open the canonical PrintGuard 3D address</h1><p>This alias does not initialize a workshop. Each origin has separate browser storage; data does not sync between addresses.</p><a href={canonicalOrigin}>Open PrintGuard 3D</a></main>);
else import('./App').then(({default:App})=>{
 root.render(<React.StrictMode><App/></React.StrictMode>);
 if('serviceWorker' in navigator && import.meta.env.PROD)navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).catch(()=>{});
}).catch(()=>root.render(<main className="fatal"><h1>Compatible application assets are unavailable</h1><p>Reconnect and reload the reviewed application. Your local records have not been cleared.</p></main>));

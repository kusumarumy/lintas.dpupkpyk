'use client';
import { FormEvent, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
function LoginForm(){
  const router=useRouter(); const params=useSearchParams();
  const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [show,setShow]=useState(false); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setError('');setBusy(true);try{const response=await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,redirect:params.get('redirect')||'/'})});const data=await response.json();if(!response.ok)throw new Error(data.message||'Gagal masuk.');router.replace(data.redirect||'/');router.refresh();}catch(err){setError(err instanceof Error?err.message:'Terjadi kesalahan.');}finally{setBusy(false)}}
  return <main className="login-page"><div className="login-box"><h2>SIGN IN</h2>{error&&<div className="login-error" role="alert">{error}</div>}<form onSubmit={submit}><label htmlFor="username">Username</label><input id="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Masukkan username" autoComplete="username" required/><label htmlFor="password">Password</label><div style={{position:'relative'}}><input id="password" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Masukkan password" autoComplete="current-password" required style={{paddingRight:52}}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?'Sembunyikan password':'Tampilkan password'} style={{position:'absolute',right:12,top:10,border:0,background:'transparent',color:'#001a66'}}><i className={`bi ${show?'bi-eye':'bi-eye-slash-fill'}`}/></button></div><button type="submit" disabled={busy}>{busy?'MEMERIKSA...':'SIGN IN'}</button></form><p style={{textAlign:'center',margin:'18px 0 0',fontSize:13}}><Link href="/" style={{color:'#003366'}}>Kembali ke beranda</Link></p></div></main>
}
export default function LoginPage(){return <Suspense fallback={<div className="login-page"/>}><LoginForm/></Suspense>}

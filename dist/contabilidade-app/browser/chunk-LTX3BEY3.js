import{f as T,g as D,h as A,j as V,l as B,n as G,o as R,p as X,q as Y}from"./chunk-AT4CX56Z.js";import{c as $}from"./chunk-ACTGEGDR.js";import"./chunk-6WNS7CKB.js";import"./chunk-X5YLR3NI.js";import{a as W,b as H}from"./chunk-I3XKZ46R.js";import{A as K,B as Q,D as Z,d as M,e as s,g as N,h as _,k as y,m as S,n as P,p as w,r as O,s as F,t as E,u as k}from"./chunk-JRCFCQI6.js";import{ia as j,ja as q,ka as U,la as J}from"./chunk-M7WHMGKP.js";import"./chunk-DCKODCDW.js";import{$ as l,$d as L,Ab as n,Ca as a,Ja as u,Lc as C,Mc as x,Pa as f,Qc as v,Ua as r,ae as I,gb as t,hb as o,ib as p,mc as b,pb as g,rb as z,sc as h}from"./chunk-QWKNK35R.js";import"./chunk-ODN5LVDJ.js";function te(m,c){if(m&1&&p(0,"nz-alert",24),m&2){let i=z();r("nzMessage",i.error())}}var ee=class m{authService=l($);authStore=l(v);router=l(C);fb=l(w);loginForm;submitted=!1;passwordVisible=!1;isLoading=this.authStore.isLoading;error=this.authStore.error;constructor(){this.loginForm=this.fb.group({email:["",[s.required,s.email]],password:["",[s.required,s.minLength(6)]],remember:[!1]})}onSubmit(){if(this.submitted=!0,this.loginForm.invalid){Object.values(this.loginForm.controls).forEach(e=>{e.invalid&&(e.markAsDirty(),e.updateValueAndValidity({onlySelf:!0}))});return}let{email:c,password:i}=this.loginForm.value;this.authService.login(c,i).subscribe({next:e=>{if(e&&e&&e.role){let d=e.role==="contador"?"/contador":"/cliente";this.router.navigateByUrl(d)}else this.router.navigateByUrl("/perfil-incompleto")},error:()=>{this.submitted=!1}})}static \u0275fac=function(i){return new(i||m)};static \u0275cmp=u({type:m,selectors:[["app-login"]],decls:34,vars:7,consts:[[1,"login-container"],["nz-row","","nzJustify","center","nzAlign","middle",1,"h-100"],["nz-col",""],[1,"login-card",3,"nzBordered"],[1,"logo-container"],["nz-icon","","nzType","audit","nzTheme","outline",1,"logo-icon"],[1,"app-name"],[1,"login-title"],[1,"login-subtitle"],["nzType","error","nzShowIcon","","class","mb-4",3,"nzMessage",4,"ngIf"],["nz-form","",3,"ngSubmit","formGroup"],["nzErrorTip","Por favor, insira um email v\xE1lido"],["nzPrefixIcon","mail"],["type","email","nz-input","","formControlName","email","placeholder","Email"],["nzErrorTip","A senha deve ter pelo menos 6 caracteres"],["nzPrefixIcon","lock"],["nz-input","","formControlName","password","placeholder","Senha",3,"type"],["nz-icon","",1,"password-icon",3,"click","nzType"],[1,"login-options"],["nz-checkbox","","formControlName","remember"],["routerLink","/auth/recuperar-senha",1,"forgot-link"],["nz-button","","nzType","primary","nzBlock","",1,"login-button",3,"nzLoading","disabled"],[1,"register-link"],["routerLink","/auth/registro"],["nzType","error","nzShowIcon","",1,"mb-4",3,"nzMessage"]],template:function(i,e){i&1&&(t(0,"div",0)(1,"div",1)(2,"div",2)(3,"nz-card",3)(4,"div",4),p(5,"span",5),t(6,"h1",6),n(7,"Contabilidade App"),o()(),t(8,"h2",7),n(9,"Bem-vindo(a)"),o(),t(10,"p",8),n(11,"Fa\xE7a login para acessar sua conta"),o(),f(12,te,1,1,"nz-alert",9),t(13,"form",10),g("ngSubmit",function(){return e.onSubmit()}),t(14,"nz-form-item")(15,"nz-form-control",11)(16,"nz-input-group",12),p(17,"input",13),o()()(),t(18,"nz-form-item")(19,"nz-form-control",14)(20,"nz-input-group",15),p(21,"input",16),t(22,"span",17),g("click",function(){return e.passwordVisible=!e.passwordVisible}),o()()()(),t(23,"div",18)(24,"label",19),n(25,"Lembrar-me"),o(),t(26,"a",20),n(27,"Esqueceu a senha?"),o()(),t(28,"button",21),n(29," Entrar "),o(),t(30,"div",22),n(31," N\xE3o tem uma conta? "),t(32,"a",23),n(33,"Cadastre-se"),o()()()()()()()),i&2&&(a(3),r("nzBordered",!1),a(9),r("ngIf",e.error()),a(),r("formGroup",e.loginForm),a(8),r("type",e.passwordVisible?"text":"password"),a(),r("nzType",e.passwordVisible?"eye-invisible":"eye"),a(6),r("nzLoading",e.isLoading())("disabled",e.loginForm.invalid))},dependencies:[h,b,O,y,M,N,_,S,P,x,V,E,F,D,T,A,R,B,G,J,U,j,q,H,W,Q,K,Y,X,I,L,k,Z],styles:[".login-container[_ngcontent-%COMP%]{min-height:100vh;background-color:#f0f2f5;display:flex;align-items:center;justify-content:center;padding:16px}.h-100[_ngcontent-%COMP%]{height:100%}.login-card[_ngcontent-%COMP%]{width:100%;max-width:400px;border-radius:8px;box-shadow:0 2px 8px #00000017;padding:24px}.logo-container[_ngcontent-%COMP%]{text-align:center;margin-bottom:24px}.logo-icon[_ngcontent-%COMP%]{font-size:48px;color:#1890ff;margin-bottom:8px}.app-name[_ngcontent-%COMP%]{font-size:24px;color:#000000d9;margin-bottom:0}.login-title[_ngcontent-%COMP%]{font-size:24px;color:#000000d9;font-weight:600;text-align:center;margin-bottom:8px}.login-subtitle[_ngcontent-%COMP%]{font-size:14px;color:#00000073;text-align:center;margin-bottom:40px}.login-options[_ngcontent-%COMP%]{display:flex;justify-content:space-between;margin-bottom:24px}.forgot-link[_ngcontent-%COMP%]{font-size:14px}.login-button[_ngcontent-%COMP%]{height:40px;font-size:16px;margin-bottom:24px}.register-link[_ngcontent-%COMP%]{text-align:center;font-size:14px}.password-icon[_ngcontent-%COMP%]{cursor:pointer;color:#999}.mb-4[_ngcontent-%COMP%]{margin-bottom:16px}.login-subtitle[_ngcontent-%COMP%]{margin-bottom:24px}@media (max-width: 480px){.login-card[_ngcontent-%COMP%]{padding:16px}.login-title[_ngcontent-%COMP%], .app-name[_ngcontent-%COMP%]{font-size:20px}.logo-icon[_ngcontent-%COMP%]{font-size:36px}.login-subtitle[_ngcontent-%COMP%]{margin-bottom:24px}}"]})};export{ee as LoginComponent};

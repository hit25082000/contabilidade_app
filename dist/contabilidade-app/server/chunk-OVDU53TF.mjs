import './polyfills.server.mjs';
import{a as ie,b as ae,c as se}from"./chunk-GRJVBQXF.mjs";import{f as j,g as q,h as J,j as W,l as H,n as K,o as Q,p as te,q as ne}from"./chunk-33JHTNE7.mjs";import{A as $,B as ee,D as oe,d as E,e as d,g as F,h as I,k as O,m as T,n as R,p as D,r as V,s as L,t as A,u as k}from"./chunk-BUTXK5IO.mjs";import{c as re}from"./chunk-VCIU2FCS.mjs";import{ia as U,ja as X,ka as Y,la as Z}from"./chunk-3JIOLUJM.mjs";import"./chunk-NYVSB7IF.mjs";import"./chunk-QUFSXYYJ.mjs";import{$ as m,Ab as l,Ad as P,Bd as w,Fd as y,Ia as s,Ib as b,Jb as r,Je as G,Ke as B,Lc as N,Pa as x,Rc as M,Va as u,Yb as S,bb as i,ja as g,ka as z,pb as t,qb as o,rb as p,sb as C,tb as h,vb as _,yb as v}from"./chunk-S6SYAES4.mjs";import"./chunk-RZ33QJ22.mjs";import"./chunk-S6KH3LOX.mjs";function pe(n,a){if(n&1&&p(0,"nz-alert",19),n&2){let e=l(2);i("nzMessage",e.error())}}function le(n,a){if(n&1){let e=_();C(0),t(1,"h2",9),r(2,"Recuperar Senha"),o(),t(3,"p",10),r(4,"Informe seu email para receber instru\xE7\xF5es de recupera\xE7\xE3o"),o(),u(5,pe,1,1,"nz-alert",11),t(6,"form",12),v("ngSubmit",function(){g(e);let c=l();return z(c.onSubmit())}),t(7,"nz-form-item")(8,"nz-form-control",13)(9,"nz-input-group",14),p(10,"input",15),o()()(),t(11,"button",16),r(12," Enviar Instru\xE7\xF5es "),o(),t(13,"div",17),r(14," Lembrou sua senha? "),t(15,"a",18),r(16,"Voltar para login"),o()()(),h()}if(n&2){let e=l();s(5),i("ngIf",e.error()),s(),i("formGroup",e.resetForm),s(5),i("nzLoading",e.isLoading())("disabled",e.resetForm.invalid)}}function ce(n,a){n&1&&(t(0,"nz-result",20)(1,"div",21)(2,"button",22),r(3,"Voltar para Login"),o()()())}var me=class n{authService=m(re);authStore=m(y);router=m(P);fb=m(D);resetForm;resetSuccess=!1;isLoading=this.authStore.isLoading;error=this.authStore.error;constructor(){this.resetForm=this.fb.group({email:["",[d.required,d.email]]})}onSubmit(){if(this.resetForm.invalid){Object.values(this.resetForm.controls).forEach(e=>{e.invalid&&(e.markAsDirty(),e.updateValueAndValidity({onlySelf:!0}))});return}let{email:a}=this.resetForm.value;this.authService.resetPassword(a).subscribe({next:()=>{this.resetSuccess=!0},error:()=>{}})}static \u0275fac=function(e){return new(e||n)};static \u0275cmp=x({type:n,selectors:[["app-reset-password"]],decls:11,vars:3,consts:[["successTemplate",""],[1,"reset-container"],["nz-row","","nzJustify","center","nzAlign","middle",1,"h-100"],["nz-col",""],[1,"reset-card",3,"nzBordered"],[1,"logo-container"],["nz-icon","","nzType","audit","nzTheme","outline",1,"logo-icon"],[1,"app-name"],[4,"ngIf","ngIfElse"],[1,"reset-title"],[1,"reset-subtitle"],["nzType","error","nzShowIcon","","class","mb-4",3,"nzMessage",4,"ngIf"],["nz-form","",3,"ngSubmit","formGroup"],["nzErrorTip","Por favor, insira um email v\xE1lido"],["nzPrefixIcon","mail"],["type","email","nz-input","","formControlName","email","placeholder","Email"],["nz-button","","nzType","primary","nzBlock","",1,"reset-button",3,"nzLoading","disabled"],[1,"login-link"],["routerLink","/auth/login"],["nzType","error","nzShowIcon","",1,"mb-4",3,"nzMessage"],["nzStatus","success","nzTitle","Email enviado com sucesso!","nzSubTitle","Verifique sua caixa de entrada e siga as instru\xE7\xF5es para redefinir sua senha."],["nz-result-extra",""],["nz-button","","nzType","primary","routerLink","/auth/login"]],template:function(e,f){if(e&1&&(t(0,"div",1)(1,"div",2)(2,"div",3)(3,"nz-card",4)(4,"div",5),p(5,"span",6),t(6,"h1",7),r(7,"Contabilidade App"),o()(),u(8,le,17,4,"ng-container",8)(9,ce,4,0,"ng-template",null,0,S),o()()()()),e&2){let c=b(10);s(3),i("nzBordered",!1),s(5),i("ngIf",!f.resetSuccess)("ngIfElse",c)}},dependencies:[M,N,V,O,E,F,I,T,R,w,W,A,L,q,j,J,Q,H,K,Z,Y,U,X,ee,$,ne,te,B,G,k,oe,se,ae,ie],styles:[".reset-container[_ngcontent-%COMP%]{min-height:100vh;background-color:#f0f2f5;display:flex;align-items:center;justify-content:center;padding:16px}.h-100[_ngcontent-%COMP%]{height:100%}.reset-card[_ngcontent-%COMP%]{width:100%;max-width:400px;border-radius:8px;box-shadow:0 2px 8px #00000017;padding:24px}.logo-container[_ngcontent-%COMP%]{text-align:center;margin-bottom:24px}.logo-icon[_ngcontent-%COMP%]{font-size:48px;color:#1890ff;margin-bottom:8px}.app-name[_ngcontent-%COMP%]{font-size:24px;color:#000000d9;margin-bottom:0}.reset-title[_ngcontent-%COMP%]{font-size:24px;color:#000000d9;font-weight:600;text-align:center;margin-bottom:8px}.reset-subtitle[_ngcontent-%COMP%]{font-size:14px;color:#00000073;text-align:center;margin-bottom:40px}.reset-button[_ngcontent-%COMP%]{height:40px;font-size:16px;margin-bottom:24px}.login-link[_ngcontent-%COMP%]{text-align:center;font-size:14px}.mb-4[_ngcontent-%COMP%]{margin-bottom:16px}@media (max-width: 480px){.reset-card[_ngcontent-%COMP%]{padding:16px}.reset-title[_ngcontent-%COMP%], .app-name[_ngcontent-%COMP%]{font-size:20px}.logo-icon[_ngcontent-%COMP%]{font-size:36px}.reset-subtitle[_ngcontent-%COMP%]{margin-bottom:24px}}"]})};export{me as ResetPasswordComponent};

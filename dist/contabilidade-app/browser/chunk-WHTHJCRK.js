import{$ as t,Lc as e,Qc as o}from"./chunk-QWKNK35R.js";var h=(n,a)=>{let r=t(e);return t(o).isAuthenticated()?!0:r.createUrlTree(["/auth/login"],{queryParams:{returnUrl:a.url}})},d=(n,a)=>{let r=t(e);return t(o).isContador()?!0:r.createUrlTree(["/acesso-negado"])},l=(n,a)=>{let r=t(e);return t(o).isCliente()?!0:r.createUrlTree(["/acesso-negado"])},p=(n,a)=>{let r=t(e);return t(o).isAuthenticated()?r.createUrlTree(["/dashboard"]):!0};export{h as a,d as b,l as c,p as d};

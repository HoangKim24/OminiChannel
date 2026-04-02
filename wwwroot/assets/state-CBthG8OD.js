import{r as O,R as i}from"./react-BPCDCJVn.js";var b={exports:{}},a={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var j=O,v=Symbol.for("react.element"),E=Symbol.for("react.fragment"),R=Object.prototype.hasOwnProperty,g=j.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,I={key:!0,ref:!0,__self:!0,__source:!0};function y(e,t,n){var r,o={},u=null,l=null;n!==void 0&&(u=""+n),t.key!==void 0&&(u=""+t.key),t.ref!==void 0&&(l=t.ref);for(r in t)R.call(t,r)&&!I.hasOwnProperty(r)&&(o[r]=t[r]);if(e&&e.defaultProps)for(r in t=e.defaultProps,t)o[r]===void 0&&(o[r]=t[r]);return{$$typeof:v,type:e,key:u,ref:l,props:o,_owner:g.current}}a.Fragment=E;a.jsx=y;a.jsxs=y;b.exports=a;var P=b.exports;const S=e=>{let t;const n=new Set,r=(s,p)=>{const c=typeof s=="function"?s(t):s;if(!Object.is(c,t)){const d=t;t=p??(typeof c!="object"||c===null)?c:Object.assign({},t,c),n.forEach(x=>x(t,d))}},o=()=>t,f={setState:r,getState:o,getInitialState:()=>m,subscribe:s=>(n.add(s),()=>n.delete(s))},m=t=e(r,o,f);return f},k=e=>e?S(e):S,w=e=>e;function h(e,t=w){const n=i.useSyncExternalStore(e.subscribe,i.useCallback(()=>t(e.getState()),[e,t]),i.useCallback(()=>t(e.getInitialState()),[e,t]));return i.useDebugValue(n),n}const _=e=>{const t=k(e),n=r=>h(t,r);return Object.assign(n,t),n},D=e=>e?_(e):_;export{D as c,P as j};

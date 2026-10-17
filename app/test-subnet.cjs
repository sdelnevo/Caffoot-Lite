'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {validateHierarchy,validateSubnetTypes}=require('./subnet-hierarchy.cjs');
const html = fs.readFileSync(path.join(__dirname, 'caffoot-lite.html'), 'utf8');
const start = html.indexOf('function handleSubnetSubmit(e, subnetId)');
const end = html.indexOf('function ipBelongsToSubnet(',start);
assert(start >= 0 && end > start, 'Subnet submission handler must exist');
const source = html.slice(start,end);
function run({edit=false, cidr='192.168.10.0/24', gateway='192.168.10.1', vlan='10', save=true, dependent=false, allocated=false, overlap=false, parentId='', blocks=false}={}) {
  const initial = {subnets:[{id:'s1',name:'Existing',cidr:'192.168.10.0/24',gateway:'192.168.10.1',vlan:10,description:''}],vlans:[{id:'v1',vlanId:10,name:'Existing',description:''}],devices:dependent?[{id:'d1',primaryIp:'192.168.10.20'}]:[],ipAllocations:allocated?{'192.168.10.1':{status:'Reserved'}}:{}};
  if(blocks)initial.subnets.push(
    {id:'root',kind:'container',cidr:'172.16.0.0/12',name:'Test Address Space',parentId:null},
    {id:'london',kind:'container',cidr:'172.16.0.0/16',name:'London Test Network',parentId:'root'}
  );
  if(overlap)initial.subnets.push({id:'s2',name:'Other',cidr:'192.168.11.0/24',gateway:'192.168.11.1',vlan:11});
  const fields={'sub-kind':'network','sub-parent':parentId,'sub-cidr':cidr,'sub-name':edit?'Existing':'New','sub-vlan':vlan,'sub-gw':gateway,'sub-desc':'Description'};
  const messages=[];
  const ctx=vm.createContext({
    appState:JSON.parse(JSON.stringify(initial)),selectedSubnetId:'s1',deviceFormDraft:null,
    document:{getElementById:id=>({value:fields[id]})},
    isValidCidr24:x=>/^(192\.168\.(10|11)|172\.(16|17)\.1)\.0\/24$/.test(x),
    isValidIpv4:x=>/^(192\.168\.(10|11)|172\.(16|17)\.1)\.\d{1,3}$/.test(x),
    phase12Usable:(ip,range)=>ip.startsWith(range.split('.')[0]+'.'+range.split('.')[1]+'.'+range.split('.')[2]+'.') && Number(ip.split('.')[3])>0 && Number(ip.split('.')[3])<255,
    phase12Overlap:(a,b)=>a===b,
    hierarchyValidate:validateHierarchy,hierarchyValidateTypes:validateSubnetTypes,
    ipBelongsToSubnet:(ip,range)=>ip.startsWith(range.split('/')[0].replace(/\.0$/,'' )+'.'),
    saveState:()=>save,showToast:(m,t)=>messages.push({m,t}),closeModal:()=>{},renderContent:()=>{},switchTab:()=>{},setTimeout:()=>{}
  });
  vm.runInContext(source,ctx);
  ctx.handleSubnetSubmit({preventDefault(){}},edit?'s1':null);
  return {ctx,messages,initial};
}
let v=run({edit:true,gateway:'192.168.10.1',allocated:true});
assert(v.messages.some(x=>/Gateway IP is already assigned/.test(x.m)),'Allocated gateway must be rejected');
v=run({edit:true,cidr:'192.168.11.0/24',gateway:'192.168.11.1',dependent:true});
assert(v.messages.some(x=>/CIDR cannot be changed/.test(x.m)),'CIDR changes with devices must be rejected');
v=run({edit:false,cidr:'192.168.10.0/24'});
assert(v.messages.some(x=>/already exists/.test(x.m)),'Duplicate CIDR must be rejected');
v=run({edit:false,cidr:'192.168.11.0/24',gateway:'192.168.11.1',vlan:'12',save:false});
assert.equal(v.ctx.appState.subnets.length,1,'Failed creation must roll back subnet');
assert.equal(v.ctx.appState.vlans.length,1,'Failed creation must roll back VLAN');
assert.equal(v.ctx.selectedSubnetId,'s1','Failed creation must restore selection');
v=run({edit:true,gateway:'192.168.10.2',save:false});
assert.equal(v.ctx.appState.subnets[0].gateway,'192.168.10.1','Failed edit must restore old gateway');
v=run({edit:true,gateway:'192.168.10.2',save:true});
assert.equal(v.ctx.appState.subnets[0].gateway,'192.168.10.2','Successful edit must update gateway');
v=run({edit:false,blocks:true,cidr:'172.16.1.0/24',gateway:'172.16.1.1',parentId:'london',vlan:'20'});
assert.equal(v.ctx.appState.subnets.find(s=>s.cidr==='172.16.1.0/24')?.parentId,'london','Nested network should save with selected parent');
v=run({edit:false,blocks:true,cidr:'172.16.1.0/24',gateway:'172.16.1.1',vlan:'20'});
assert(v.messages.some(x=>/Overlapping unrelated subnets/.test(x.m)),'Unparented overlapping network must be rejected');
v=run({edit:false,blocks:true,cidr:'172.17.1.0/24',gateway:'172.17.1.1',parentId:'london',vlan:'20'});
assert(v.messages.length>0,'Out-of-range parent must be rejected');
console.log('PASS: executable subnet gateway, duplicate CIDR, dependency and rollback tests.');

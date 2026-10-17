'use strict';
const assert=require('node:assert/strict');
const {parseCidr,validateHierarchy,validateSubnetTypes}=require('./subnet-hierarchy.cjs');
const container=(id,cidr,parentId)=>({id,cidr,kind:'container',parentId});
const network=(id,cidr,parentId)=>({id,cidr,kind:'network',parentId});
const good=[container('company','10.0.0.0/8'),container('london','10.10.0.0/16','company'),network('servers','10.10.10.0/24','london'),network('desktops','10.10.20.0/24','london')];
assert.deepEqual(validateHierarchy(good),[]);
assert.deepEqual(validateHierarchy([network('legacy','192.168.1.0/24')]),[]);
assert.equal(parseCidr('10.10.10.75/26').canonical,'10.10.10.64/26');
assert.equal(parseCidr('10.0.0.0/8').aligned,true);
assert.equal(parseCidr('10.0.0.0/8',{minPrefix:23,maxPrefix:30}),null);
const template=[
 container('site','10.128.96.0/20'),
 container('block','10.128.96.0/21','site'),
 {id:'future',cidr:'10.128.104.0/21',kind:'reserved',parentId:'site'},
 {id:'loop',cidr:'10.128.96.0/32',kind:'loopback',parentId:'block'},
 network('mgmt','10.128.96.128/26','block'),
 network('fortilink','10.128.96.192/26','block'),
 network('wlan','10.128.97.0/26','block'),
 network('servers','10.128.98.0/24','block'),
 network('voice','10.128.99.0/25','block'),
 network('office','10.128.100.0/23','block'),
 network('guest','10.128.102.0/24','block'),
 network('things','10.128.103.0/24','block')
];
assert.deepEqual(validateHierarchy(template),[]);
assert.deepEqual(validateHierarchy([network('twenty','172.16.16.0/20')]),[]);
assert.deepEqual(validateHierarchy([{id:'host',cidr:'10.0.0.1/32',kind:'loopback'}]),[]);
assert(validateHierarchy([...template,network('collision','10.128.98.128/25','block')]).length>0);
assert(validateHierarchy([null]).length>0);
assert(validateHierarchy([42]).length>0);
assert(validateHierarchy([{id:'bad-kind',cidr:'10.0.0.0/24',kind:'nonsense'}]).length>0);
assert(validateHierarchy([network('a','10.0.0.0/24',123)]).length>0);
assert(validateHierarchy([network('same','10.0.0.0/24'),network('same','10.1.0.0/24')]).length>0);
const bad=[
 [container('a','10.0.0.0/8'),network('b','10.10.0.0/16','a'),network('c','10.10.0.0/20','a')],
 [container('a','10.0.0.0/8'),network('b','10.10.0.0/24','missing')],
 [container('a','10.0.0.0/8'),network('b','11.0.0.0/24','a')],
 [container('a','10.0.0.0/8'),container('b','10.0.0.0/8','a')],
 [container('a','10.0.0.0/8','b'),container('b','10.1.0.0/16','a')],
 [network('a','10.1.0.0/24'),network('b','10.1.0.0/25')],
 [network('a','10.1.0.0/24'),network('a','10.2.0.0/24')],
 [network('a','10.10.10.75/24')],
 [network('a','10.1.0.0/24'),network('b','10.1.0.0/24','a')]
];
for(const [i,items] of bad.entries()) assert(validateHierarchy(items).length>0,'invalid case '+i+' should fail');
const typeCases=[
  {id:'legacy',cidr:'192.168.40.0/24',vlan:40,gateway:'192.168.40.1'},
  {id:'parent',kind:'container',cidr:'10.0.0.0/8'},
  {id:'future',kind:'reserved',cidr:'10.1.0.0/16'},
  {id:'host',kind:'loopback',cidr:'10.1.1.1/32'},
  {id:'large',kind:'network',cidr:'10.128.96.0/20',vlan:200,gateway:'10.128.96.1'}
];
assert.deepEqual(validateSubnetTypes(typeCases),[]);
for(const badType of [
  {...typeCases[1],gateway:'10.0.0.1'},
  {...typeCases[2],vlan:5},
  {...typeCases[3],cidr:'10.1.1.0/24'},
  {...typeCases[0],gateway:'192.168.40.255'},
  {...typeCases[0],vlan:0},
  {...typeCases[0],cidr:'192.168.40.0/32'}
]) assert(validateSubnetTypes([badType]).length>0);

// Ensure the offline browser copy and the Node test module stay in sync.
// The HTML is intentionally self-contained and cannot require .cjs at runtime.
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(require('node:path').join(__dirname,'caffoot-lite.html'),'utf8');
const start=html.indexOf('function hierarchyIpNumber(');
const stop=html.indexOf('function normaliseState(raw)',start);
assert(start>=0&&stop>start,'Browser hierarchy functions must be embedded');
const context=vm.createContext({});
vm.runInContext(html.slice(start,stop),context,{timeout:2000});
for(const records of [good,template,...bad,[network('legacy','192.168.1.0/24')]]) {
  assert.deepEqual(Array.from(context.hierarchyValidate(records)),validateHierarchy(records),
    'Browser hierarchy rules must match Node rules');
}
for(const records of [typeCases,...typeCases.map(item=>[item])]) {
  assert.deepEqual(Array.from(context.hierarchyValidateTypes(records)),validateSubnetTypes(records),
    'Browser subnet type rules must match Node rules');
}
console.log('PASS: embedded offline browser validators match Node module.');
console.log('PASS: subnet type-specific VLAN, gateway and loopback rules.');
console.log('PASS: hierarchy CIDR, nesting, boundaries, cycles, overlap, and legacy defaults.');


const {validateVlanDomains,vlanDomainKey}=require('./subnet-hierarchy.cjs');
const scopedNetworks=[
  {id:'london',name:'London 20',kind:'network',parentId:'block-london',vlan:20},
  {id:'manchester',name:'Manchester 20',kind:'network',parentId:'block-manchester',vlan:20}
];
assert.deepEqual(validateVlanDomains(scopedNetworks),[],'same VLAN in separate blocks is valid');
assert.equal(validateVlanDomains([...scopedNetworks,{id:'duplicate',kind:'network',parentId:'block-london',vlan:20}]).length,1,'same VLAN in same block is rejected');
assert.equal(validateVlanDomains([{id:'flat-a',vlan:30},{id:'flat-b',vlan:30}]).length,1,'legacy unassigned networks share a VLAN domain');
assert.equal(vlanDomainKey({parentId:'block-london'}),'block-london','block ID rather than name defines VLAN scope');
assert.deepEqual(validateVlanDomains([{id:'block',kind:'container',vlan:20},...scopedNetworks]),[],'containers are excluded from VLAN uniqueness');
console.log('PASS: scoped VLAN domains allow reuse across blocks and reject duplicates within a block or unassigned domain.');

const {validateVlanInventory}=require('./subnet-hierarchy.cjs');
const vlanRecords=[
  {id:'vlan-london-20',name:'London 20',parentId:'block-london',vlanId:20},
  {id:'vlan-manchester-20',name:'Manchester 20',parentId:'block-manchester',vlanId:20}
];
assert.deepEqual(validateVlanInventory(vlanRecords),[],'same number in different VLAN inventory domains is valid');
assert.equal(validateVlanInventory([...vlanRecords,{id:'vlan-london-20b',name:'Duplicate',parentId:'block-london',vlanId:20}]).length,1,'duplicate number within domain rejected');
assert.equal(validateVlanInventory([{id:'legacy-1',name:'Legacy',vlanId:20},{id:'legacy-2',name:'Legacy duplicate',vlanId:20}]).length,1,'legacy VLAN records share unassigned domain');
assert.equal(validateVlanInventory([...vlanRecords,{id:'vlan-london-20',name:'Duplicate ID',parentId:'block-other',vlanId:21}]).length,1,'record IDs remain globally unique');
console.log('PASS: VLAN inventory IDs remain unique while VLAN numbers are scoped by IP Address Block.');

const {subnetUsesVlanRecord}=require('./subnet-hierarchy.cjs');
assert.equal(subnetUsesVlanRecord(scopedNetworks[0],vlanRecords[0]),true,'London VLAN record belongs to London network');
assert.equal(subnetUsesVlanRecord(scopedNetworks[1],vlanRecords[0]),false,'London VLAN record does not belong to Manchester network');
assert.equal(subnetUsesVlanRecord(scopedNetworks[1],vlanRecords[1]),true,'Manchester VLAN record belongs to Manchester network');
assert.equal(subnetUsesVlanRecord({id:'flat',vlan:20},{id:'legacy',vlanId:20}),true,'legacy unassigned records remain linked');
assert.equal(subnetUsesVlanRecord({id:'flat',vlan:20},vlanRecords[0]),false,'unassigned network cannot link to London VLAN');
assert.equal(subnetUsesVlanRecord({kind:'container',vlan:20,parentId:'block-london'},vlanRecords[0]),false,'containers never link to VLANs');
console.log('PASS: VLAN record ownership is scoped for safe editing and deletion.');

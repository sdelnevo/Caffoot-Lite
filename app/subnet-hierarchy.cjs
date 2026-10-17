'use strict';
// Pure IPv4 hierarchy validation. No DOM, storage, or network dependencies.
// This file is the testable foundation for the upcoming app integration.
function ipNumber(ip) {
  const parts=String(ip).split('.');
  if(parts.length!==4 || !parts.every(p=>/^\d{1,3}$/.test(p)&&Number(p)<=255)) return null;
  return parts.reduce((n,p)=>n*256+Number(p),0);
}
function ipString(n) { return [24,16,8,0].map(k=>Math.floor(n/2**k)%256).join('.'); }
function parseCidr(value,{minPrefix=0,maxPrefix=32}={}) {
  const m=/^([^/]+)\/(\d{1,2})$/.exec(String(value));
  if(!m) return null;
  const raw=ipNumber(m[1]),prefix=Number(m[2]);
  if(raw===null||prefix<minPrefix||prefix>maxPrefix) return null;
  const size=2**(32-prefix),start=Math.floor(raw/size)*size;
  return {prefix,start,end:start+size-1,size,aligned:raw===start,canonical:ipString(start)+'/'+prefix};
}
function validateHierarchy(subnets) {
  const errors=[];
  if(!Array.isArray(subnets)) return ['Subnets must be an array.'];
  const ids=new Map(),cidrs=new Set(),ranges=new Map();
  for(const s of subnets) {
    if(!s||typeof s!=='object'||Array.isArray(s)||typeof s.id!=='string'||!s.id.trim()) {errors.push('Subnet ID is missing.');continue;}
    if(ids.has(s.id)) { errors.push('Duplicate subnet ID: '+s.id); continue; }
    ids.set(s.id,s);
    const kind=s.kind===undefined?'network':s.kind;
    if(kind!=='network'&&kind!=='container'&&kind!=='reserved'&&kind!=='loopback') { errors.push('Invalid subnet kind: '+s.id); continue; }
    if(s.parentId!==undefined&&s.parentId!==null&&s.parentId!==''&&typeof s.parentId!=='string') errors.push('Invalid parent ID for '+s.id);
    const range=parseCidr(s.cidr,{minPrefix:kind==='container'||kind==='reserved'?0:kind==='loopback'?32:1,maxPrefix:kind==='loopback'?32:32});
    if(!range) errors.push('Invalid CIDR for '+s.id+': '+s.cidr);
    else if(!range.aligned) errors.push('Misaligned CIDR '+s.cidr+'; use '+range.canonical);
    else {
      ranges.set(s.id,range);
      if(cidrs.has(range.canonical)) errors.push('Duplicate CIDR: '+range.canonical);
      cidrs.add(range.canonical);
    }
  }
  for(const s of subnets) {
    if(!s||!s.id||!ranges.has(s.id)) continue;
    const parentId=typeof s.parentId==='string'?s.parentId:null;
    if(!parentId) continue;
    if(parentId===s.id) {errors.push('Subnet cannot parent itself: '+s.id);continue;}
    const p=ids.get(parentId);
    if(!p) {errors.push('Missing parent '+parentId+' for '+s.id);continue;}
    if(p.kind!=='container') errors.push('Parent must be a container: '+parentId);
    const child=ranges.get(s.id),parent=ranges.get(parentId);
    if(parent&&!(parent.start<=child.start&&child.end<=parent.end&&child.size<parent.size))
      errors.push('Child '+s.id+' is not strictly inside parent '+parentId);
    const seen=new Set([s.id]);
    let cursor=p;
    while(cursor) {
      if(seen.has(cursor.id)) {errors.push('Parent cycle involving '+s.id);break;}
      seen.add(cursor.id);
      cursor=cursor.parentId?ids.get(cursor.parentId):null;
    }
  }
  // Every intersecting pair must have an explicit ancestor relationship.
  function ancestor(ancestorId,childId) {
    const seen=new Set();
    let s=ids.get(childId);
    while(s&&s.parentId&&!seen.has(s.id)) {
      seen.add(s.id);
      if(s.parentId===ancestorId) return true;
      s=ids.get(s.parentId);
    }
    return false;
  }
  for(let i=0;i<subnets.length;i++) for(let j=i+1;j<subnets.length;j++) {
    const a=subnets[i],b=subnets[j];
    if(!a||!b||typeof a!=='object'||typeof b!=='object'||a.id===b.id) continue;
    const x=ranges.get(a.id),y=ranges.get(b.id);
    if(x&&y&&x.start<=y.end&&y.start<=x.end&&!ancestor(a.id,b.id)&&!ancestor(b.id,a.id))
      errors.push('Overlapping unrelated subnets: '+a.cidr+' and '+b.cidr);
  }
  return errors;
}

// Type-specific rules are kept separate from hierarchy placement rules.
// Missing kind remains a legacy ordinary network without changing saved data.
function validateSubnetTypes(subnets) {
  if(!Array.isArray(subnets)) return ['Subnets must be an array.'];
  const errors=[];
  for(const s of subnets) {
    if(!s||typeof s!=='object'||Array.isArray(s)) {errors.push('Invalid subnet record.');continue;}
    const kind=s.kind===undefined?'network':s.kind;
    if(!['network','container','reserved','loopback'].includes(kind)) {
      errors.push('Invalid subnet kind: '+String(s.id));continue;
    }
    const range=parseCidr(s.cidr);
    if(!range||!range.aligned) {errors.push('Invalid subnet CIDR: '+String(s.cidr));continue;}
    if(kind==='network') {
      if(range.prefix>30||range.prefix<1) errors.push('Network requires a /1–/30 CIDR: '+s.cidr);
      const vlan=Number(s.vlan);
      if(s.vlan===null||s.vlan===undefined||s.vlan===''||!Number.isInteger(vlan)||vlan<1||vlan>4094)
        errors.push('Network requires VLAN 1–4094: '+String(s.id));
      const gateway=ipNumber(s.gateway);
      if(gateway===null||gateway<=range.start||gateway>=range.end)
        errors.push('Network requires a usable gateway: '+String(s.id));
    } else {
      if(kind==='loopback'&&range.prefix!==32) errors.push('Loopback requires /32: '+String(s.id));
      if(s.gateway!==undefined&&s.gateway!==null&&s.gateway!=='')
        errors.push(kind+' must not have a gateway: '+String(s.id));
      if(s.vlan!==undefined&&s.vlan!==null&&s.vlan!=='')
        errors.push(kind+' must not have a VLAN: '+String(s.id));
    }
  }
  return errors;
}
// A parent IP Address Block is the VLAN domain. Legacy flat networks share one domain.
// This helper does not mutate records and can be reused by form and import validators.
function vlanDomainKey(subnet) {
  return subnet && typeof subnet.parentId==='string' && subnet.parentId.trim()
    ? subnet.parentId : '__unassigned__';
}
function validateVlanDomains(subnets) {
  if(!Array.isArray(subnets)) return ['Subnets must be an array.'];
  const seen=new Map(), errors=[];
  for(const subnet of subnets) {
    if(!subnet || typeof subnet!=='object' || (subnet.kind && subnet.kind!=='network')) continue;
    const vlan=Number(subnet.vlan);
    if(!Number.isInteger(vlan)||vlan<1||vlan>4094) continue; // Type validator owns range errors.
    const key=JSON.stringify([vlanDomainKey(subnet),vlan]);
    if(seen.has(key)) errors.push('VLAN '+vlan+' is already used in this IP Address Block by '+(seen.get(key).name||seen.get(key).id)+'.');
    else seen.set(key,subnet);
  }
  return errors;
}
// VLAN inventory records may carry parentId; missing parentId is the legacy unassigned scope.
// Keep record IDs distinct even when VLAN numbers repeat in different domains.
function validateVlanInventory(vlans) {
  if(!Array.isArray(vlans)) return ['VLAN inventory must be an array.'];
  const ids=new Set(), keys=new Set(), errors=[];
  for(const vlan of vlans) {
    if(!vlan || typeof vlan!=='object' || Array.isArray(vlan)) {errors.push('Invalid VLAN record.');continue;}
    if(typeof vlan.id!=='string'||!vlan.id||typeof vlan.name!=='string'||!vlan.name) errors.push('VLAN requires an id and name.');
    if(ids.has(vlan.id)) errors.push('Duplicate VLAN record ID: '+vlan.id);
    ids.add(vlan.id);
    const number=Number(vlan.vlanId);
    if(!Number.isInteger(number)||number<1||number>4094) {errors.push('Invalid VLAN number: '+vlan.vlanId);continue;}
    const key=JSON.stringify([vlanDomainKey(vlan),number]);
    if(keys.has(key)) errors.push('Duplicate VLAN number '+number+' in the same IP Address Block.');
    keys.add(key);
  }
  return errors;
}
// A VLAN record belongs only to networks in its own domain.
// Compare the scope as well as the number before editing or deleting VLAN records.
function subnetUsesVlanRecord(subnet, vlanRecord) {
  if(!subnet || !vlanRecord || (subnet.kind && subnet.kind!=='network')) return false;
  const subnetNumber=Number(subnet.vlan), recordNumber=Number(vlanRecord.vlanId);
  return Number.isInteger(subnetNumber) && subnetNumber>=1 && subnetNumber<=4094 &&
    Number.isInteger(recordNumber) && recordNumber>=1 && recordNumber<=4094 &&
    subnetNumber===recordNumber && vlanDomainKey(subnet)===vlanDomainKey(vlanRecord);
}
module.exports={ipNumber,ipString,parseCidr,validateHierarchy,validateSubnetTypes,vlanDomainKey,validateVlanDomains,validateVlanInventory,subnetUsesVlanRecord};

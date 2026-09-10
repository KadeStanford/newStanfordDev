import fs from 'node:fs';
import path from 'node:path';

// Build-time extraction keeps the existing approved record authoritative.
export function readPortfolioCopy(){
 const source=fs.readFileSync(path.join(process.cwd(),'COPY.md'),'utf8');
 const sections={};let section=null,entry=null;
 for(const line of source.split(/\r?\n/)){
  if(line.startsWith('## ')){section={blocks:[],entries:[]};sections[line.slice(3)]=section;entry=null;continue;}
  if(!section)continue;
  if(line.startsWith('### ')){entry={title:line.slice(4),blocks:[]};section.entries.push(entry);continue;}
  const target=entry?entry.blocks:section.blocks;
  if(line.startsWith('> '))target.push({kind:'p',text:line.slice(2)});
  if(line.startsWith('- '))target.push({kind:'li',text:line.slice(2)});
 }
 const creative=sections.Pricing.entries.at(-1);
 sections.Pricing.note=creative.blocks.pop().text;
 return sections;
}

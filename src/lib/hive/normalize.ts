import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { substackSchema, githubSchema } from './schemas';
function text(html:string) { return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<[^>]+>/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n))).replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16))).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,n)=>(({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '} as Record<string,string>)[n]??' ')).replace(/\s+/g,' ').trim(); }
export function normalizeSubstack(xml:string, fetchedAt=new Date().toISOString()) {
 if (XMLValidator.validate(xml)!==true) throw new Error('Invalid RSS XML');
 const parsed=new XMLParser({ignoreAttributes:false,processEntities:true,parseTagValue:false}).parse(xml);
 if (!parsed.rss?.channel) throw new Error('Missing RSS channel');
 const rows=parsed.rss.channel.item ? (Array.isArray(parsed.rss.channel.item)?parsed.rss.channel.item:[parsed.rss.channel.item]) : [];
 return substackSchema.parse({source:'https://arinzeokigbo.substack.com/feed',fetchedAt,status:'fresh',items:rows.map((row:Record<string,unknown>)=>{
  const url=String(row.link); if(new URL(url).hostname!=='arinzeokigbo.substack.com') throw new Error('Unexpected article origin');
  const html=String(row['content:encoded']??row.description??'');
  const safe=html.replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  const blocks=Array.from(safe.matchAll(/<(h[1-6]|p|li|blockquote|pre)\b[^>]*>([\s\S]*?)<\/\1>/gi)).map((m,index)=>({type:m[1].startsWith('h')?'heading':m[1]==='li'?'list-item':m[1]==='blockquote'?'quote':m[1]==='pre'?'code':'paragraph',text:text(m[2]),id:`section-${index}`,level:m[1].startsWith('h')?Number(m[1][1]):0})).filter(b=>b.text&&!['Subscribe','Share','Leave a comment'].includes(b.text));
  return {slug:new URL(url).pathname.split('/').filter(Boolean).at(-1),title:text(String(row.title)),subtitle:text(String(row.description??'')),url,date:new Date(String(row.pubDate)).toISOString(),cover:(row.enclosure as Record<string,string>|undefined)?.['@_url']??null,bodyHtml:html,blocks,readingMinutes:Math.max(1,Math.ceil(blocks.reduce((n,b)=>n+b.text.split(/\s+/).length,0)/230)),tags:String(row.title).includes('Identity')?['Identity','Security']:String(row.title).includes('Universities')?['AI','Education']:['Technology','Environment']};
 })});
}
export function normalizeRepos(input:unknown) {
 if(!Array.isArray(input))throw new Error('GitHub repos must be an array');
 return githubSchema.shape.repos.parse(input.map(r=>({name:r.name,url:r.html_url,description:r.description,language:r.language,languages:r.language?[r.language]:[],updatedAt:r.pushed_at??r.updated_at,stars:r.stargazers_count})));
}
export function parseContributions(html:string) {
 const tooltips=new Map(Array.from(html.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>([\s\S]*?)<\/tool-tip>/g)).map(m=>[m[1],text(m[2])]));
 const cells=Array.from(html.matchAll(/<td\b[^>]*data-date="\d{4}-\d{2}-\d{2}"[^>]*>/g)).map(m=>{
  const attrs=Object.fromEntries(Array.from(m[0].matchAll(/([\w-]+)="([^"]*)"/g)).map(a=>[a[1],a[2]]));
  const tip=tooltips.get(attrs.id)??'';const count=tip.match(/^(\d+) contributions?/);
  return {date:attrs['data-date'],level:Number(attrs['data-level']),count:count?Number(count[1]):tip.startsWith('No contributions')?0:null};
 });
 if(!cells.length)throw new Error('Contribution calendar unavailable');
 return githubSchema.shape.contributions.parse(cells.sort((a,b)=>a.date.localeCompare(b.date)));
}

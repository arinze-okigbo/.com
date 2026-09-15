import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {normalizeRepos,normalizeSubstack,parseContributions} from './normalize';
import {githubSchema,substackSchema,linkedinSchema} from './schemas';
const item=(extra='')=>`<rss><channel><item><title>Test identity</title><link>https://arinzeokigbo.substack.com/p/test-identity</link><pubDate>Wed, 24 Jun 2026 17:56:11 GMT</pubDate><description><![CDATA[<p>One &amp; two.</p>${extra}]]></description></item></channel></rss>`;
describe('public feed ingestion',()=>{
 it('rejects malformed responses instead of replacing last-good content',()=>{expect(()=>normalizeSubstack('<html>Unavailable</html>')).toThrow();expect(()=>normalizeRepos({message:'API rate limit'})).toThrow();expect(()=>parseContributions('<html>Sign in</html>')).toThrow();});
 it('retains a genuinely empty RSS feed',()=>expect(normalizeSubstack('<rss><channel><title>Empty</title></channel></rss>').items).toEqual([]));
 it('extracts reading blocks as text, excluding executable and embedded content',()=>{
 const article=normalizeSubstack(item('<script>alert(1)</script><iframe>external</iframe><h2>Heading</h2>')).items[0];
 expect(article.blocks.map(b=>b.text)).toEqual(['One & two.','Heading']);expect(article.blocks[1].type).toBe('heading');
 });
 it('rejects article links outside the verified publication',()=>expect(()=>normalizeSubstack(item().replace('https://arinzeokigbo.substack.com/p/test-identity','https://evil.example/redirect'))).toThrow());
 it('reads real calendar dates and tooltip counts without inventing activity',()=>{
 expect(parseContributions('<td id="a" data-date="2026-09-14" data-level="2"></td><tool-tip for="a">3 contributions on September 14.</tool-tip>')).toEqual([{date:'2026-09-14',level:2,count:3}]);
 expect(parseContributions('<td id="a" data-date="2026-09-14" data-level="0"></td>')[0].count).toBeNull();
 });
 it('validates every checked-in fallback',()=>{
 expect(githubSchema.parse(JSON.parse(readFileSync('content/github.json','utf8'))).repos.length).toBeGreaterThan(0);
 expect(substackSchema.parse(JSON.parse(readFileSync('content/substack.json','utf8'))).items.every(a=>a.blocks.length>0)).toBe(true);
 expect(linkedinSchema.parse(JSON.parse(readFileSync('content/linkedin-posts.json','utf8'))).items.every(p=>p.url.startsWith('https://www.linkedin.com/posts/arinzeokigbo_'))).toBe(true);
 });
});

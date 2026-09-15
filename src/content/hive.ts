/** Every biographical assertion is paired with a public source. */
export const sources = {
 site:'https://arinzeokigbo.com',
 nyu:'https://www.linkedin.com/posts/arinzeokigbo_nyu-computerscience-splita-activity-7469756321639198721-MUpx',
 cyera:'https://www.linkedin.com/posts/arinzeokigbo_cybersecurity-datasecurity-cloudsecurity-activity-7450891042796507136-J0J3',
 track:'https://bantamsports.com/sports/mens-track-and-field/roster/arinze-okigbo/14121',
 substack:'https://arinzeokigbo.substack.com',
 github:'https://github.com/arinze-okigbo',
 splita:'https://splita.co',
} as const;
export const profile={name:'Arinze Okigbo',email:'arinze@splita.co',education:'Computer Science at NYU, Class of 2028. Previously Trinity College.',educationSource:sources.nyu,description:'Founder building group payments at Splita, researching browser-native authentication at Queralt, and working in data security.',descriptionSources:[sources.site,sources.cyera],links:[{label:'Email',url:'mailto:arinze@splita.co'},{label:'LinkedIn',url:'https://www.linkedin.com/in/arinzeokigbo'},{label:'GitHub',url:sources.github},{label:'Substack',url:sources.substack},{label:'Splita',url:sources.splita}]};
export const honors=[{name:'Tyree Innovation & Entrepreneurship Fellow',description:'Trinity’s entrepreneurship fellowship; the current site records internal pitch and hackathon competition wins.',source:sources.site},{name:'World Bank Group Youth Summit 2025',description:'Youth delegate. The current site records a speech on youth-led African technology and participation in a digital-currency discussion.',source:sources.site}];
export const experience=[{org:'Cyera',role:'Data Security Intern',period:'',body:'Internal security team, reporting to the CISO.',source:sources.cyera}];
export {projects} from './editorial';

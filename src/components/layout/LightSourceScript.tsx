import type { ReactNode } from "react";

/**
 * The light source — `docs/04 §2.8` (DEV-15), ported from
 * `proto-a-machined.html`.
 *
 * ONE lamp lives in **document** space at `scrollY + LAMP_VIEWPORT_FRACTION *
 * innerHeight`, eased so it lags the scroll the way a fixed lamp lags a moving
 * object. A single `requestAnimationFrame` loop resolves that one point into
 * per-element `--lx` / `--ly` percentages on every `[data-lit]` element, so
 * every masked border, every lit panel, the blueprint grid's mask and the
 * backlit display type are lit from the same origin. **Nothing on the page
 * reads a second light position** (§2.8 rule 3).
 *
 * ## Why this is an inline `<script>` and not a client component
 *
 * Exactly the reason `ThemeScript` is: it renders no DOM, has no props and no
 * state, and the whole port is budgeted at **±0 First Load JS** (`docs/15`
 * §4.1). A `'use client'` module would add a chunk plus its hydration payload
 * to every route for a loop that touches nothing React owns. As an inline
 * script it costs HTML bytes, which `docs/15` §4.2 budgets at +3.9 kB, and
 * zero JavaScript bundle.
 *
 * ## What happens when this never runs
 *
 * Nothing breaks, and this is the contract the CSS is written against. Every
 * consumer in `globals.css` §8b reads `var(--lx, var(--light-x))` /
 * `var(--ly, var(--light-y))`, so with JavaScript disabled — and in the frames
 * before this executes — the whole page is lit from the fixed top-centre lamp
 * declared on `:root` (`50%` / `-10%`). The page loses the travel, not the
 * light. `prefers-reduced-motion: reduce` takes the same path deliberately:
 * the positions are applied once, from a frozen lamp, and no loop is
 * constructed (§2.8 rule 3, M12).
 *
 * ## Cost control
 *
 * The loop reads `getBoundingClientRect()` on the lit set and writes two
 * custom properties per element — no layout-affecting property is ever
 * written, so the write is compositor-only. Elements more than one viewport
 * outside the scroll port are skipped, and the set is re-collected on resize
 * rather than per frame.
 */
const LIGHT_SOURCE_SCRIPT = `(function(){
var d=document,W=window;
var RM=W.matchMedia("(prefers-reduced-motion: reduce)");
var F=0.34,A=0.055,P=14000,E=0.085,M=600;
var lit=[],lampY=0,target=0,on=false;
function collect(){lit=[].slice.call(d.querySelectorAll("[data-lit]"));}
function measure(){target=W.scrollY+W.innerHeight*F;if(!on){lampY=target;on=true;}}
function apply(){
var vw=W.innerWidth,h=W.innerHeight;
var drift=RM.matches?0:Math.sin(performance.now()/P*Math.PI*2)*A*vw;
var lx0=vw/2+drift;
for(var i=0;i<lit.length;i++){var el=lit[i],b=el.getBoundingClientRect();
if(!b.height||b.bottom<-M||b.top>h+M)continue;
var x=(lx0-b.left)/b.width*100,y=(lampY-(b.top+W.scrollY))/b.height*100;
if(x<-260)x=-260;else if(x>360)x=360;
if(y<-420)y=-420;else if(y>520)y=520;
el.style.setProperty("--lx",x.toFixed(2)+"%");
el.style.setProperty("--ly",y.toFixed(2)+"%");}}
function frame(){lampY+=(target-lampY)*E;apply();W.requestAnimationFrame(frame);}
function start(){collect();measure();
if(RM.matches){lampY=W.innerHeight*F;apply();return;}
apply();W.requestAnimationFrame(frame);}
W.addEventListener("scroll",measure,{passive:true});
W.addEventListener("resize",function(){collect();measure();apply();},{passive:true});
function boot(){W.requestAnimationFrame(start);}
if(d.readyState==="complete")boot();else W.addEventListener("load",boot,{once:true});
})()`.replace(/\n/g, "");

/**
 * A Server Component. It renders a static `<script>` and has no
 * interactivity, so shipping it to the client bundle would cost bytes and buy
 * nothing — the emitted DOM is identical either way.
 *
 * It is mounted at the END of `<body>`, unlike `ThemeScript`, and carries no
 * `defer` — `defer` is a no-op on an inline script and writing it would imply
 * a guarantee the attribute does not give. The placement is the guarantee:
 * the theme script must run before first paint or the page flashes, whereas
 * the lamp already has a correct declared resting position in CSS and only
 * improves on it, so it must not sit in front of the LCP text.
 *
 * ## Why the first write waits for `load`, not `DOMContentLoaded`
 *
 * This writes inline `style` properties onto server-rendered nodes, and some
 * of those nodes are inside a **client** subtree — `.panel` is a child of
 * `Reveal`. React hydrates those host instances and compares their attributes
 * against the props it would render. A `style` attribute that the JSX does not
 * declare is a mismatch, and React reports it as an error and declines to
 * patch it: *"A tree hydrated but some attributes of the server rendered HTML
 * didn't match the client properties."* That is a console error on every page
 * load, which costs the Best Practices 100 outright.
 *
 * On `DOMContentLoaded` this was a race with hydration — it fired once and
 * then stopped reproducing, which is the worst way for a defect to behave.
 * `load` fires only after every deferred and async script has executed, which
 * includes the framework chunks that start hydration, and the extra
 * `requestAnimationFrame` hop puts the first write a frame beyond that. The
 * page is not unlit in the meantime: `--light-x` / `--light-y` are already
 * lighting every consumer from `:root`, so what `load` delays is the lamp
 * beginning to travel, not the light existing.
 */
export function LightSourceScript(): ReactNode {
  return <script dangerouslySetInnerHTML={{ __html: LIGHT_SOURCE_SCRIPT }} />;
}

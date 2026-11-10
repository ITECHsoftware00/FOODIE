"use client";

import {useEffect, useRef, useState} from 'react';
import {ArrowDown, ArrowLeft, ArrowUpRight, Pause, Play} from 'lucide-react';

type Props = {onBrowse:()=>void; onDish:()=>void; paused:boolean; onPause:()=>void};

export default function GlassHero({onBrowse,onDish,paused,onPause}:Props) {
  const host = useRef<HTMLDivElement>(null);
  const sceneState = useRef({open:false,paused:false});
  const storyButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const [open,setOpen] = useState(false);
  const [available,setAvailable] = useState(false);
  const interacted = useRef(false);
  useEffect(()=>{sceneState.current={open,paused};},[open,paused]);
  useEffect(()=>{
    if(!interacted.current)return;
    const delay=open&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches?240:0;
    const timer=window.setTimeout(()=>(open?backButton:storyButton).current?.focus({preventScroll:true}),delay);
    return()=>window.clearTimeout(timer);
  },[open]);

  useEffect(()=>{
    const element=host.current;
    if(!element) return;
    let disposed=false;
    let cleanup=()=>{};
    Promise.all([import('three'),import('three/addons/environments/RoomEnvironment.js')]).then(([T,{RoomEnvironment}])=>{
      if(disposed)return;
      let renderer:InstanceType<typeof T.WebGLRenderer>;
      try {renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});} catch {return;}
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
      renderer.toneMapping=T.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.05;
      element.appendChild(renderer.domElement);
      const scene=new T.Scene();
      const camera=new T.PerspectiveCamera(30,1,1,6000);
      const pmrem=new T.PMREMGenerator(renderer);
      const room=new RoomEnvironment();
      const env=pmrem.fromScene(room,.04);
      scene.environment=env.texture;
      scene.environmentIntensity=.42;
      room.dispose();pmrem.dispose();
      const key=new T.DirectionalLight(0xe0e9ff,1.8);key.position.set(-500,600,900);scene.add(key);
      const rim=new T.PointLight(0x99ffc7,65,1900,1.2);rim.position.set(400,-150,200);scene.add(rim);
      const slab=new T.Group();scene.add(slab);
      const pieces: {mesh:InstanceType<typeof T.Mesh>;base:InstanceType<typeof T.Vector3>;z:number;v:number;material:InstanceType<typeof T.MeshPhysicalMaterial>}[]=[];
      let width=0,height=0,frame=0,visible=true,last=0,progress=0,inside=false;
      let px=0,py=0,hover=-1;
      const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
      const fine=window.matchMedia('(hover: hover) and (pointer: fine)');
      const pointer=new T.Vector2(9,9),raycaster=new T.Raycaster();
      const glowPointer={value:new T.Vector2(5000,5000)};
      const sceneSize={value:new T.Vector2(1320,700)};
      function clearPieces(){
        pieces.forEach(({mesh,material})=>{mesh.geometry.dispose();material.dispose();mesh.children.forEach(child=>{const line=child as InstanceType<typeof T.LineSegments>;line.geometry.dispose();(line.material as InstanceType<typeof T.Material>).dispose();});slab.remove(mesh);});pieces.length=0;
      }
      function resize(){
        if(!element)return;
        width=element.clientWidth;height=element.clientHeight;
        sceneSize.value.set(width,height);
        if(!width||!height)return;
        renderer.setSize(width,height);camera.aspect=width/height;camera.position.z=height/2/Math.tan(Math.PI/12);camera.updateProjectionMatrix();
        clearPieces();
        const cells=[[[0,0],[.25,0],[.40,.67],[.30,1],[0,1]],[[.25,0],[.53,0],[.48,.59],[.40,.67]],[[.53,0],[.83,0],[.71,.47],[.48,.59]],[[.40,.67],[.48,.59],[.71,.47],[.86,1],[.30,1]],[[.83,0],[1,0],[1,1],[.86,1],[.71,.47]]];
        const portrait=width<600;
        cells.forEach((cell,index)=>{
          const points=cell.map(([x,y])=>new T.Vector2((portrait?y:x)*width-width/2,height/2-(portrait?x:y)*height));
          const center=points.reduce((a,b)=>a.add(b),new T.Vector2()).multiplyScalar(1/points.length);
          // Inset each convex polygon to expose the black cut between pieces.
          points.forEach(p=>{const delta=center.clone().sub(p);p.add(delta.normalize().multiplyScalar(6));p.sub(center);});
          const shape=new T.Shape();
          points.forEach((p,i)=>{
            const prev=points[(i+points.length-1)%points.length],next=points[(i+1)%points.length];
            const a=p.clone().lerp(prev,Math.min(.08,10/p.distanceTo(prev)));
            const b=p.clone().lerp(next,Math.min(.08,10/p.distanceTo(next)));
            if(i===0)shape.moveTo(a.x,a.y);else shape.lineTo(a.x,a.y);
            shape.quadraticCurveTo(p.x,p.y,b.x,b.y);
          });shape.closePath();
          const geometry=new T.ExtrudeGeometry(shape,{depth:9,bevelEnabled:true,bevelSize:1.8,bevelThickness:2.5,bevelSegments:3,steps:1,curveSegments:8});
          const material=new T.MeshPhysicalMaterial({color:0x161918,metalness:.25,roughness:.29,clearcoat:.7,clearcoatRoughness:.12,iridescence:.55,iridescenceIOR:1.3,iridescenceThicknessRange:[250,650],envMapIntensity:1.1});
          material.onBeforeCompile=shader=>{
            shader.uniforms.uGlassPointer=glowPointer;shader.uniforms.uGlassSize=sceneSize;
            shader.vertexShader='varying vec2 vGlassPosition;\n'+shader.vertexShader;
            shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvGlassPosition = (modelMatrix * vec4(transformed, 1.0)).xy;');
            shader.fragmentShader='varying vec2 vGlassPosition;\nuniform vec2 uGlassPointer;\nuniform vec2 uGlassSize;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`vec2 gp = vGlassPosition / uGlassSize;
              float studio = exp(-18.0 * pow(length((gp - vec2(-.28,.42)) * vec2(1.0,1.5)),2.0));
              studio += .65 * exp(-28.0 * pow(length((gp - vec2(.4,-.18)) * vec2(.85,1.3)),2.0));
              float cursor = exp(-2.5 * pow(length(vGlassPosition-uGlassPointer)/240.0,2.0));
              outgoingLight = outgoingLight * (.25 + studio * 1.6) + vec3(.032,.026,.045) * cursor;
              #include <opaque_fragment>`);
          };
          const mesh=new T.Mesh(geometry,material);mesh.position.set(center.x,center.y,-12);slab.add(mesh);
          const edge=new T.LineSegments(new T.EdgesGeometry(geometry,35),new T.LineBasicMaterial({color:0xbdcbc6,transparent:true,opacity:.36}));mesh.add(edge);
          pieces.push({mesh,base:mesh.position.clone(),z:0,v:0,material});
          mesh.userData.index=index;
        });
        start();
      }
      const observer=new ResizeObserver(resize);observer.observe(element);resize();
      function move(e:PointerEvent){if(!fine.matches)return;const rect=element!.getBoundingClientRect();px=(e.clientX-rect.left)/width*2-1;py=(e.clientY-rect.top)/height*2-1;pointer.set(px,-py);inside=true;}
      function leave(){inside=false;px=py=0;pointer.set(9,9);}
      element.parentElement?.addEventListener('pointermove',move);
      element.parentElement?.addEventListener('pointerleave',leave);
      function tick(now:number){
        frame=0;if(disposed||!visible||document.hidden)return;
        const dt=Math.min((now-last)/1000||.016,.033);last=now;
        const still=reduced.matches||sceneState.current.paused;
        glowPointer.value.set(!still&&inside?px*width/2:5000,!still&&inside?-py*height/2:5000);
        const target=sceneState.current.open?1:0;
        progress=still?target:progress+(target-progress)*(1-Math.exp(-dt*5.8));
        if(Math.abs(target-progress)<.001)progress=target;
        slab.rotation.y+=( (still?0:px*.045)-slab.rotation.y)*(1-Math.exp(-dt*8));
        slab.rotation.x+=( (still?0:py*.025)-slab.rotation.x)*(1-Math.exp(-dt*8));
        raycaster.setFromCamera(pointer,camera);
        hover=!still&&inside&&progress<.1?(raycaster.intersectObjects(pieces.map(p=>p.mesh),false)[0]?.object.userData.index??-1):-1;
        pieces.forEach((p,i)=>{
          const lift=i===hover?26:0;
          p.v+=(170*(lift-p.z)-19*p.v)*dt;p.z+=p.v*dt;
          const spread=progress*progress;
          p.mesh.position.set(p.base.x+spread*(p.base.x*.8+(i-2)*75),p.base.y-spread*(height*(.5+i*.1)),p.base.z+(still?0:p.z)+spread*500);
          p.mesh.rotation.x=spread*(i%2?1.7:-1.3)+(still?0:Math.sin(now*.0003+i)*.008);
          p.mesh.rotation.y=spread*(i-2)*.7;
          p.mesh.rotation.z=spread*(i-2)*.3;
          p.material.iridescence+=( (i===hover?1:.55)-p.material.iridescence)*.12;
          p.material.emissive.setHex(i===hover?0x171024:0x000000);
          p.mesh.visible=progress<.98;
        });
        renderer.render(scene,camera);
        if(!still||progress!==target) frame=requestAnimationFrame(tick);
      }
      function start(){if(!frame&&!disposed){last=performance.now();frame=requestAnimationFrame(tick);}}
      const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;}},{rootMargin:'50px'});visibility.observe(element);
      const mutations=new MutationObserver(start);mutations.observe(element,{attributes:true});
      document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);
      function lost(e:Event){e.preventDefault();setAvailable(false);cancelAnimationFrame(frame);frame=0;}
      renderer.domElement.addEventListener('webglcontextlost',lost);
      setAvailable(true);start();
      cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();visibility.disconnect();mutations.disconnect();document.removeEventListener('visibilitychange',start);reduced.removeEventListener('change',start);element.parentElement?.removeEventListener('pointermove',move);element.parentElement?.removeEventListener('pointerleave',leave);renderer.domElement.removeEventListener('webglcontextlost',lost);clearPieces();env.dispose();renderer.dispose();renderer.domElement.remove();};
    }).catch(()=>setAvailable(false));
    return()=>{disposed=true;cleanup();};
  },[]);

  function toggle(value:boolean){interacted.current=true;setOpen(value);}
  function browseFromStory(){interacted.current=false;setOpen(false);onBrowse();}
  return <section className={`glass-hero ${open?'glass-open':''} ${available?'webgl-ready':''}`} aria-labelledby="hero-title" onKeyDown={e=>{if(e.key==='Escape'&&open)toggle(false);}}>
    <div className="glass-fallback" aria-hidden="true">{[0,1,2,3,4].map(i=><div key={i}/>)}</div>
    <div ref={host} className="glass-canvas" aria-hidden="true" data-open={open} data-paused={paused}/>
    <div className="glass-front" inert={open} aria-hidden={open}>
      <div className="glass-copy">
        <p className="glass-kicker"><span/> A fresh perspective on food</p>
        <h1 id="hero-title">Good food.<br/>Great mood.</h1>
        <p className="glass-description">A world of flavour, beautifully discovered.<br/>Find the local dishes you’ll come back for.</p>
        <div className="glass-actions"><button className="primary" onClick={onBrowse}>Explore the menu <ArrowUpRight size={19}/></button><button ref={storyButton} className="glass-story-trigger" onClick={()=>toggle(true)}>Break the ice <ArrowUpRight size={17}/></button></div>
        <span className="glass-caption">Local kitchens. A little extraordinary.</span>
      </div>
      <div className="glass-food">
        <div className="glass-food-halo"/>
        <button className="glass-plate" onClick={onDish} aria-label="View the featured feel-good bowl"><img src="/images/hero.jpg" alt="Fresh avocado, grains and colourful vegetables in the feel-good bowl" fetchPriority="high" width="700" height="700"/></button>
        <button className="glass-food-label" onClick={onDish}><span><small>YOUR FIRST FOOD CRUSH</small><strong>The feel-good bowl</strong><span>£12.50 <i>·</i> Green & Grain</span></span><ArrowUpRight size={22}/></button>
        <span className="glass-food-note">Freshly picked.<br/>Happily devoured.</span>
      </div>
      <div className="glass-bottom"><span>GOOD TASTE. NO COMPROMISE.</span><button onClick={onBrowse}>Discover what’s cooking <ArrowDown size={15}/></button></div>
    </div>
    <div className="glass-explanation" inert={!open} aria-hidden={!open}>
      <button ref={backButton} className="glass-back" onClick={()=>toggle(false)}><ArrowLeft size={18}/> Back to the good stuff</button>
      <div><span className="glass-kicker">A little discovery. A lot of delicious.</span><h2>Great taste.<br/>Zero guesswork.</h2><p>Foodie brings local favourites into focus. Find your craving, make it your own, and see how a happier mealtime could feel.</p><dl><div><dt>Find your flavour</dt><dd>Browse dishes by mood, kitchen, or what’s on your mind.</dd></div><div><dt>Keep the good ones</dt><dd>Save your favourites. Build a bag worth looking forward to.</dd></div><div><dt>Try the happy ending</dt><dd>Explore our demo checkout. No payment or real delivery.</dd></div></dl><button className="primary" onClick={browseFromStory}>Find your next favourite <ArrowUpRight size={18}/></button></div>
    </div>
    <button className="glass-pause" onClick={onPause} aria-label={paused?'Play animations':'Pause animations'}>{paused?<Play size={16}/>:<Pause size={16}/>}</button>
  </section>;
}

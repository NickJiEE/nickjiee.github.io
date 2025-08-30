
/* ===================== Background Animation ===================== */

(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let centerWidth = Math.min(720, Math.max(420, window.innerWidth * 0.44));
  let centerLeft = Math.round((window.innerWidth - centerWidth) / 2);
  let centerRight = centerLeft + centerWidth;

  function recalcCenter() {
    centerWidth = Math.min(720, Math.max(420, window.innerWidth * 0.44));
    centerLeft = Math.round((window.innerWidth - centerWidth) / 2);
    centerRight = centerLeft + centerWidth;
  }

  function resizeCanvas() {
    const DPR = window.devicePixelRatio || 1;
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.round(w * DPR);
    canvas.height = Math.round(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    recalcCenter();
  }
  window.addEventListener('resize', resizeCanvas, {passive:true});
  resizeCanvas();

  function createDots(spacing = 14) {
    const w = window.innerWidth, h = window.innerHeight;
    const cvs = document.createElement('canvas');
    cvs.width = w;
    cvs.height = h;
    const c = cvs.getContext('2d');
    c.fillStyle = 'rgba(0,191,255,0.08)';
    for (let x=8; x<w; x+=spacing) {
      for (let y=8; y<h; y+=spacing) {
        c.fillRect(x, y, 1, 1);
      }
    }
    return cvs;
  }

  function makeCircuits(cellSize, targetCount) {
    const w = window.innerWidth, h = window.innerHeight;
    const cols = Math.max(8, Math.floor(w / cellSize));
    const rows = Math.max(6, Math.floor(h / cellSize));
    const scene = Array.from({length: cols}, ()=> ({rows: new Array(rows).fill(0), free: rows}));

    function isAvailable(x,y){ return x>=0 && y>=0 && x<cols && y<rows && scene[x].rows[y]===0; }
    function setUsed(x,y){ if(scene[x] && scene[x].rows[y]===0){ scene[x].rows[y]=1; scene[x].free--; } }
    function pickFree() {
      const freeCols = [];
      for(let cx=0; cx<cols; cx++) if(scene[cx].free>0) freeCols.push(cx);
      if(!freeCols.length) return null;
      const col = freeCols[Math.floor(Math.random()*freeCols.length)];
      const freeRows=[];
      for(let r=0;r<rows;r++) if(scene[col].rows[r]===0) freeRows.push(r);
      const row = freeRows[Math.floor(Math.random()*freeRows.length)];
      return [col,row];
    }
    function getDir(from, oldDir) {
      if (oldDir && Math.random() < 0.55) {
        if (isAvailable(from[0]+oldDir[0], from[1]+oldDir[1])) return oldDir;
      }
      const poss=[];
      if (isAvailable(from[0]-1, from[1])) poss.push([-1,0]);
      if (isAvailable(from[0]+1, from[1])) poss.push([1,0]);
      if (isAvailable(from[0], from[1]-1)) poss.push([0,-1]);
      if (isAvailable(from[0], from[1]+1)) poss.push([0,1]);
      if (!poss.length) return [0,0];
      return poss[Math.floor(Math.random()*poss.length)];
    }

    const circuits=[];
    const maxTries = Math.max(400, targetCount * 6);
    let tries = maxTries;
    while (tries-- > 0 && circuits.length < targetCount) {
      const start = pickFree();
      if (!start) break;
      let dir = getDir(start, null);
      setUsed(start[0], start[1]);
      if (dir[0]===0 && dir[1]===0) continue;

      const circuit = {start:[start[0],start[1]], path:[], coords:[], length:0};
      const maxLen = Math.floor(Math.max(cols,rows) * 0.6);
      const minLen = Math.max(6, Math.floor(maxLen*0.25));
      let length = minLen + Math.floor(Math.random() * Math.max(6, Math.floor(maxLen*0.6)));
      let pos = [start[0], start[1]];
      while (length-- > 0) {
        circuit.path.push(dir);
        circuit.coords.push([pos[0], pos[1]]);
        pos = [pos[0]+dir[0], pos[1]+dir[1]];
        if (pos[0]<0 || pos[1]<0 || pos[0]>=cols || pos[1]>=rows) break;
        setUsed(pos[0], pos[1]);
        dir = getDir(pos, dir);
        if (dir[0]===0 && dir[1]===0) break;
      }

      if (circuit.path.length >= Math.max(4, Math.floor(minLen/2))) {
        circuit.length = circuit.path.length * cellSize;
        circuits.push(circuit);
      }
    }

    const cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    const cctx = cvs.getContext('2d');

    cctx.strokeStyle = 'rgba(0,191,255,0.16)';
    cctx.lineWidth = Math.max(1, Math.round(cellSize/6));
    cctx.lineCap = 'round';
    cctx.lineJoin = 'round';

    circuits.forEach(cir => {
      const size = cellSize;
      let p = [...cir.start];
      cctx.beginPath();
      const firstDir = cir.path[0];
      cctx.moveTo(p[0]*size + size/2 + firstDir[0]*size/4, p[1]*size + size/2 + firstDir[1]*size/4);
      cir.path.forEach((d, idx) => {
        p[0] += d[0]; p[1] += d[1];
        if (idx === cir.path.length-1) {
          cctx.lineTo(p[0]*size + size/2 - d[0]*size/4, p[1]*size + size/2 - d[1]*size/4);
        } else {
          cctx.lineTo(p[0]*size + size/2, p[1]*size + size/2);
        }
      });
      cctx.stroke();

      cctx.lineWidth = Math.max(1, Math.round(cellSize/7));
      cctx.strokeStyle = 'rgba(0,191,255,0.24)';
      cctx.beginPath();
      cctx.arc(cir.start[0]*size + size/2, cir.start[1]*size + size/2, Math.max(2, cellSize/5), 0, Math.PI*2);
      cctx.stroke();

      const last = cir.coords[cir.coords.length-1];
      const lastDir = cir.path[cir.path.length-1] || [0,0];
      const endCoord = [last[0] + lastDir[0], last[1] + lastDir[1]];
      cctx.beginPath();
      cctx.arc(endCoord[0]*size + size/2, endCoord[1]*size + size/2, Math.max(2, cellSize/5), 0, Math.PI*2);
      cctx.stroke();
    });

    circuits.forEach(cir => {
      const size = cellSize;
      cir.pixelCoords = cir.coords.map(pt => [pt[0]*size + size/2, pt[1]*size + size/2]);
      const last = cir.coords[cir.coords.length-1];
      const lastDir = cir.path[cir.path.length-1] || [0,0];
      cir.pixelCoords.push([ (last[0]+lastDir[0])*size + size/2, (last[1]+lastDir[1])*size + size/2 ]);
    });

    return {canvas: cvs, circuits, cellSize};
  }

  function makeThingsRenderer(w, h) {
    const cvs = document.createElement('canvas');
    cvs.width = w; cvs.height = h;
    const tctx = cvs.getContext('2d');

    return {
      canvas: cvs,
      draw: function(dt, dotsCanvas, circuitsObj) {
        const ctx = tctx;
        ctx.clearRect(0,0,cvs.width,cvs.height);
        if (dotsCanvas) ctx.drawImage(dotsCanvas, 0, 0, cvs.width, cvs.height);
        if (circuitsObj && circuitsObj.canvas) ctx.drawImage(circuitsObj.canvas, 0, 0, cvs.width, cvs.height);

        if (!circuitsObj || !circuitsObj.circuits) return;
        circuitsObj.circuits.forEach((c) => {
          if (!c._things) {
            const count = 1 + Math.floor(Math.random()*2);
            c._things = [];
            for (let i=0;i<count;i++){
              c._things.push({
                posPx: Math.random() * (c.length || 1),
                speedPx: (6 + Math.random()*28) * (0.6 + Math.random()*1.6),
                offset: Math.random()
              });
            }
          }
          c._things.forEach(t => {
            t.posPx += t.speedPx * dt;
            if (t.posPx > (c.length || 1)) t.posPx -= (c.length || 1);

            const size = circuitsObj.cellSize;
            const seg = Math.floor(t.posPx / size);
            const frac = (t.posPx - seg*size) / size;
            const idx = Math.min(seg, c.pixelCoords.length-2);
            const a = c.pixelCoords[idx];
            const b = c.pixelCoords[idx+1];
            const px = a[0] + (b[0]-a[0]) * frac;
            const py = a[1] + (b[1]-a[1]) * frac;

            const outerR = Math.max(10, size * 1.8);
            const g = ctx.createRadialGradient(px,py,outerR*0.35, px,py, outerR);
            g.addColorStop(0, 'rgba(0,191,255,0.30)');
            g.addColorStop(1, 'rgba(0,191,255,0.00)');
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(px, py, outerR, 0, Math.PI*2);
            ctx.fill();

            ctx.fillStyle = 'rgba(255,255,250,0.98)';
            ctx.beginPath();
            ctx.arc(px, py, Math.max(2.6, size*0.26), 0, Math.PI*2);
            ctx.fill();

            const dirVec = [(b[0]-a[0])||1, (b[1]-a[1])||0];
            const dlen = Math.hypot(dirVec[0], dirVec[1]) || 1;
            const nx = dirVec[0] / dlen, ny = dirVec[1] / dlen;
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = 'rgba(0,191,255,0.7)';
            ctx.beginPath();
            ctx.ellipse(px + nx*4, py + ny*4, Math.max(1.8, size*0.18), Math.max(0.9, size*0.09), Math.atan2(ny,nx), 0, Math.PI*2);
            ctx.fill();
          });
        });
      }
    };
  }

  const dots = createDots(12);
  const minDim = Math.min(window.innerWidth, window.innerHeight);
  const cellSize = Math.max(8, Math.floor(minDim / 45));
  const desired = Math.min(220, Math.max(60, Math.floor((window.innerWidth*window.innerHeight)/(cellSize*cellSize*30))));

  const circuitsObj = makeCircuits(cellSize, desired);
  const thingsRenderer = makeThingsRenderer(window.innerWidth, window.innerHeight);

  function drawSeparators() {
    ctx.save();
    ctx.strokeStyle = 'rgba(0,191,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerLeft + 0.5, 0); ctx.lineTo(centerLeft + 0.5, window.innerHeight);
    ctx.moveTo(centerRight - 0.5, 0); ctx.lineTo(centerRight - 0.5, window.innerHeight);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0,191,255,0.08)';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 18;
    ctx.shadowColor = 'rgba(0,191,255,0.12)';
    ctx.beginPath();
    ctx.moveTo(centerLeft + 0.5, 0); ctx.lineTo(centerLeft + 0.5, window.innerHeight);
    ctx.moveTo(centerRight - 0.5, 0); ctx.lineTo(centerRight - 0.5, window.innerHeight);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawStaticBase() {
    ctx.clearRect(0,0,window.innerWidth, window.innerHeight);
    ctx.fillStyle = '#062a28';
    ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

    ctx.drawImage(dots, 0, 0, window.innerWidth, window.innerHeight);
    ctx.drawImage(circuitsObj.canvas, 0, 0, window.innerWidth, window.innerHeight);
    drawSeparators();
  }
  drawStaticBase();

  if (reduced) {
    return;
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    thingsRenderer.draw(dt, dots, circuitsObj);

    ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
    ctx.fillStyle = '#041b1a';
    ctx.fillRect(0,0, window.innerWidth, window.innerHeight);

    if (centerLeft > 8) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, centerLeft, window.innerHeight);
      ctx.clip();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(dots, 0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(circuitsObj.canvas, 0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(thingsRenderer.canvas, 0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();
    }

    if (centerRight < window.innerWidth - 8) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(centerRight, 0, window.innerWidth - centerRight, window.innerHeight);
      ctx.clip();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(dots, 0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(circuitsObj.canvas, 0, 0, window.innerWidth, window.innerHeight);
      ctx.drawImage(thingsRenderer.canvas, 0, 0, window.innerWidth, window.innerHeight);
      ctx.restore();
    }

    drawSeparators();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  let resizeTimer;
  window.addEventListener('resize', ()=> {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=> {
      resizeCanvas();
      drawStaticBase();
      const newDots = createDots(12);
      const newCell = Math.max(8, Math.floor(Math.min(window.innerWidth, window.innerHeight) / 45));
      const newDesired = Math.min(240, Math.max(60, Math.floor((window.innerWidth*window.innerHeight)/(newCell*newCell*14))));
      const newCir = makeCircuits(newCell, newDesired);
      Object.assign(dots, newDots);
      circuitsObj.canvas = newCir.canvas;
      circuitsObj.circuits = newCir.circuits;
      circuitsObj.cellSize = newCir.cellSize;
      thingsRenderer.canvas.width = window.innerWidth;
      thingsRenderer.canvas.height = window.innerHeight;
      recalcCenter();
    }, 240);
  }, {passive:true});

})();

/* ===================== Name Animation Logic ===================== */

const letters = ["N", "I1", "C", "K", "J", "I2"];
const welcomeText = "Welcome!";
const welcomeEl = document.getElementById('welcome');

// Build welcome spans
(function buildWelcomeSpans(){
  welcomeEl.innerHTML = '';
  for(let i=0;i<welcomeText.length;i++){
    const ch = welcomeText[i];
    const span = document.createElement('span');
    span.className = 'wl-char';
    span.textContent = ch;
    welcomeEl.appendChild(span);
  }
})();

function animateLetters() {
  letters.forEach(id => {
    const p = document.getElementById(id);
    if (!p) return;
    try {
      const L = p.getTotalLength();
      p.style.strokeDasharray = L;
      p.style.strokeDashoffset = L;
      p.style.opacity = 0;
    } catch(e){}
  });

  let index = 0;
  function next(){
    if(index >= letters.length){
      runWelcomeBlinkSequence();
      return;
    }
    const id = letters[index++];
    const path = document.getElementById(id);
    if(!path){ setTimeout(next, 120); return; }
    path.style.opacity = 1;
    const len = path.getTotalLength();
    const duration = Math.min(3500, Math.max(900, Math.round((len / 120) * 1800)));
    path.style.transition = `stroke-dashoffset ${duration}ms cubic-bezier(.2,.8,.2,1)`;
    requestAnimationFrame(()=> { path.style.strokeDashoffset = 0; });

    const onEnd = () => {
      path.removeEventListener('transitionend', onEnd);
      path.classList.add('lit');
      setTimeout(next, 120);
    };
    path.addEventListener('transitionend', onEnd, { once:true });

    setTimeout(()=> {
      if(path.classList.contains('lit')) return;
      onEnd();
    }, duration + 260);
  }
  next();
}

function runWelcomeBlinkSequence(){
  const welcome = document.getElementById('welcome');
  const chars = Array.from(welcome.querySelectorAll('.wl-char'));
  const blinks = [120, 120, 200, 360];
  let i = 0;
  welcome.style.opacity = '1';

  function doBlink(){
    if(i >= blinks.length){
      welcome.classList.add('welcome-on');
      chars.forEach(c => c.classList.add('on'));
      return;
    }
    const t = blinks[i++];
    const perLetterDelay = Math.max(8, Math.round(t / (chars.length * 3)));
    chars.forEach((c, idx) => {
      setTimeout(()=> c.classList.add('on'), idx * perLetterDelay);
    });
    setTimeout(()=> {
      chars.forEach((c, idx) => {
        setTimeout(()=> c.classList.remove('on'), idx * Math.max(5, Math.round(perLetterDelay/2)));
      });
    }, Math.max(40, Math.round(t/2)));
    setTimeout(doBlink, t + 120);
  }
  setTimeout(doBlink, 300);
}

/* ===================== Navigation Functions ===================== */

function goToMainSite() {
  // Smooth transition effect
  document.body.style.transition = 'opacity 0.5s ease';
  document.body.style.opacity = '0';
  
  setTimeout(() => {
    window.location.href = 'main.html';
  }, 500);
}

function skipAnimation(){
  letters.forEach(id => {
    const p = document.getElementById(id);
    if(!p) return;
    try {
      const L = p.getTotalLength();
      p.style.transition = 'none';
      p.style.strokeDasharray = L;
      p.style.strokeDashoffset = 0;
      p.style.opacity = 1;
      p.classList.add('lit');
    } catch(e){}
  });

  const welcome = document.getElementById('welcome');
  welcome.style.opacity = '1';
  welcome.classList.add('welcome-on');
  const chars = welcome.querySelectorAll('.wl-char');
  chars.forEach(c => c.classList.add('on'));

  const caption = document.querySelector('.intro-text');
  caption.style.opacity = '1';
  
  const continueBtn = document.querySelector('.continue-btn');
  continueBtn.style.opacity = '1';
}

// Make functions globally accessible
window.skipAnimation = skipAnimation;
window.goToMainSite = goToMainSite;

// Start animation on load
window.addEventListener('load', () => {
  setTimeout(animateLetters, 120);
}, {passive:true});

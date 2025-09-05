(function(){
  const menu = document.getElementById('menu');
  const game = document.getElementById('game');
  const startBtn = document.getElementById('startBtn');
  const backBtn = document.getElementById('backBtn');
  const modeSel = document.getElementById('mode');
  const limitSel = document.getElementById('limit');
  const scoreEl = document.getElementById('score');
  const totalScoreEl = document.getElementById('totalScore');
  const taskEl = document.getElementById('task');
  const answersEl = document.getElementById('answers');
  const worldEl = document.getElementById('world');
  const overlay = document.getElementById('rewardOverlay');
  const overlayContent = document.getElementById('rewardContent');

  const gridCols = 10;
  let score = 0, bottomFilled = 0;

  const ANIMALS = ['🐶','🐱','🐭','🐹','🐰','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🐣','🦆','🦉','🦊','🐴','🦄','🐝','🦋','🐞','🦖','🦕','🐢'];
  const BIGS = ['🐘','🦒','🦛','🦜','🦚','🐊','🐋','🐳','🐯','🦖','🦕','🐼'];

  let gridTop1 = [], gridTop2 = [], gridProgress = [], gridBottom = [];

  function makeRow(className){
    const row = document.createElement('div');
    row.className = 'grid ' + className;
    row.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
    worldEl.appendChild(row);
    return row;
  }

  function initWorld(){
    worldEl.innerHTML = '';
    const r1 = makeRow('r1');
    const r2 = makeRow('r2');
    const r3 = makeRow('r3');
    const r4 = makeRow('r4');

    gridTop1 = []; gridTop2 = []; gridProgress = []; gridBottom = [];
    for(let c=0;c<gridCols;c++){
      const a1 = document.createElement('div'); a1.className='cell';
      const a2 = document.createElement('div'); a2.className='cell';
      const p  = document.createElement('div'); p.className='cell';
      const b  = document.createElement('div'); b.className='cell';

      r1.appendChild(a1); r2.appendChild(a2); r3.appendChild(p); r4.appendChild(b);
      gridTop1.push(a1); gridTop2.push(a2); gridProgress.push(p); gridBottom.push(b);
    }
    setTotalProgress(0);
    setBottomProgress(0);
  }

  function rand(n){ return Math.floor(Math.random()*n); }
  function pickAnimal(){ return ANIMALS[rand(ANIMALS.length)]; }

  function fillAnimalRows(aCount, bCount, aEmoji, bEmoji){
    gridTop1.forEach((cell,i)=>{ cell.textContent = i < aCount ? aEmoji : ''; });
    gridTop2.forEach((cell,i)=>{ cell.textContent = i < bCount ? bEmoji : ''; });
  }

  function setTotalProgress(total){
    totalScoreEl.textContent = total;
    const n = Math.min(total, gridProgress.length);
    gridProgress.forEach((cell,i)=>{
      cell.classList.toggle('progress-on', i < n);
      cell.textContent = i < n ? '★' : '';
    });
  }

  function setBottomProgress(n){
    gridBottom.forEach((cell,i)=>{
      cell.classList.toggle('bottom-on', i < n);
      cell.textContent = i < n ? '▮' : '';
    });
  }

  function nextChallenge(){
    const limit = parseInt(limitSel.value,10);
    const m = modeSel.value;
    let a,b,op,res;

    const animalA = pickAnimal();
    const animalB = pickAnimal();

    if(m==='add' || (m==='mix' && Math.random()<0.5)){
      a = rand(Math.min(limit, gridCols)+1);
      b = rand(Math.min(limit, gridCols - a)+1);
      op = '+'; res = a+b;
      taskEl.innerHTML = `${animalA.repeat(a)} ${op} ${animalB.repeat(b)} = ?`;
      fillAnimalRows(a, b, animalA, animalB);
    } else {
      a = rand(Math.min(limit, gridCols)+1);
      b = rand(a+1);
      op = '−'; res = a - b;
      taskEl.innerHTML = `${animalA.repeat(a)} ${op} ${animalB.repeat(b)} = ?`;
      fillAnimalRows(a, b, animalA, animalB);
    }

    answersEl.innerHTML = '';
    const correct = res;
    const limitShown = Math.min(limit, 20);
    const options = new Set([correct]);
    while(options.size < 3){
      let delta = Math.max(1, Math.floor(Math.random()*3));
      let cand = correct + (Math.random()<0.5?-delta:delta);
      cand = Math.max(0, Math.min(limitShown, cand));
      options.add(cand);
    }
    Array.from(options).sort(()=>Math.random()-0.5).forEach(v=>{
      const btn = document.createElement('button');
      btn.textContent = v;
      btn.addEventListener('click', ()=> onAnswer(v===correct));
      answersEl.appendChild(btn);
    });
  }

  function onAnswer(ok){
    if(ok){
      score++; scoreEl.textContent = score;
      setTotalProgress(score);
      bottomFilled++; setBottomProgress(bottomFilled);
      playTone(880, 0.08);
      if(bottomFilled >= gridCols){
        showReward();
        bottomFilled = 0;
        setBottomProgress(0);
      }
      nextChallenge();
    } else {
      buzz();
      taskEl.animate([{opacity:1},{opacity:.3},{opacity:1}],{duration:240});
      playTone(200, 0.08);
    }
  }

  function showReward(){
    const big = BIGS[rand(BIGS.length)];
    overlayContent.textContent = big;
    overlay.classList.remove('hidden');
    setTimeout(()=>{ overlay.classList.add('hidden'); }, 1800);
  }

  function buzz(ms=60){
    if(navigator.vibrate) navigator.vibrate(ms);
  }
  let ac;
  function playTone(f=440, dur=0.1){
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.frequency.value = f;
      o.connect(g); g.connect(ac.destination);
      g.gain.value = 0.05;
      o.start();
      setTimeout(()=>{o.stop();}, dur*1000);
    } catch(e){}
  }

  document.getElementById('startBtn').addEventListener('click', ()=>{
    score=0;bottomFilled=0;scoreEl.textContent=score;totalScoreEl.textContent=0;
    menu.classList.add('hidden');
    game.classList.remove('hidden');
    initWorld();
    nextChallenge();
  });
  backBtn.addEventListener('click', ()=>{
    game.classList.add('hidden');
    menu.classList.remove('hidden');
  });

})();
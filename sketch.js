// ---- Sketch p5.js: Proteja a Cidade ----
let trees = [];
let loggers = [];
let arrows = [];
let buildings = [];
let score = 0;
let gameOver = false;
let wave = 1;

// Estatísticas do jogador
let player = {
  x: 0,
  y: 0,
  level: 5,
  maxHealth: 50,
  health: 50,
  kills: 0
};

// Estado do jogo
let state = 'menu'; // 'menu', 'instructions', 'playing'

function setup() {
  createCanvas(800, 600);
  textSize(24);
  textAlign(CENTER, CENTER);
  initBuildings();
}

function draw() {
  if (state === 'menu') {
    background(220);
    drawMenu();
  } else if (state === 'instructions') {
    background(220);
    drawInstructions();
  } else if (state === 'playing') {
    playGame();
  }
}

function drawMenu() {
  fill(0, 200, 0);
  textSize(48);
  text('Proteja a Cidade', width/2, 100);
  textSize(24);
  fill(50);
  rect(width/2 -120,200,240,50,10);
  fill(255);
  text('Iniciar Jogo', width/2,225);
  fill(50);
  rect(width/2 -120,300,240,50,10);
  fill(255);
  text('Instruções', width/2,325);
  fill(0);
  textSize(18);
  let subtitle = 'Os lenhadores querem destruir as árvores para chegar à cidade; não deixe que eles façam isso!';
  text(subtitle, width/2,400,600);
}

function drawInstructions() {
  fill(0);
  textSize(24);
  textAlign(LEFT, TOP);
  let lines = [
    'Jogador: inicia no nível 5 com 50 de vida.',
    'A cada 3 lenhadores mortos, ganha 1 nível, recupera 10 de vida e +5 de vida máxima.',
    'Lenhadores: iniciam no nível 1 com 25 de vida e causam 1 de dano.',
    'A cada nova onda (3 mortes), a próxima onda tem +1 nível, +5 de vida e +3 de dano.',
    'Lenhadores demoram 10 segundos para destruir cada árvore.'
  ];
  for (let i=0; i<lines.length; i++) {
    text(lines[i],50,100 + i*50,700);
  }
  fill(50);
  rect(50,height-80,120,40,10);
  fill(255);
  textSize(18);
  textAlign(CENTER, CENTER);
  text('Voltar',110,height-60);
}

function playGame() {
  // Fundo: céu, cidade e chão
  background(135,206,235);
  drawCity();
  noStroke(); fill(34,139,34);
  rect(0, height*0.75, width, height*0.25);
  drawGrass();

  // Derrota
  if (gameOver) {
    fill(255,0,0);
    textSize(48);
    text('Perdeu, Playboy!',width/2, height/2 - 40);
    fill(0,255,0);
    textSize(24);
    text('Reinicie o jogo e proteja a cidade (use o quadrado à esquerda)',width/2, height/2 + 20,600);
    return;
  }

  // Inicializa entidades
  if (trees.length===0) initTrees();
  if (loggers.length===0) initLoggers();

  player.x = mouseX;
  player.y = mouseY;

  // Desenha árvores, flechas e lenhadores
  for (let tree of trees) tree.show();
  for (let arrow of arrows) { arrow.update(); arrow.show(); }
  for (let logger of loggers) {
    logger.update();
    logger.show();
    logger.tryDestroyTree();
    logger.tryAttackPlayer();
  }

  // Colisões flecha x lenhador
  for (let arrow of arrows) {
    for (let logger of loggers) {
      if (arrow.hits(logger) && !logger.isDead) {
        logger.health -= 10;
        arrow.die();
        if (logger.health <=0) logger.dieAndCount();
      }
    }
  }

  arrows = arrows.filter(a=>!a.isDead);
  loggers = loggers.filter(l=>!l.isDead);

  drawPlayer();
  drawBars();
  drawScore();
}

function mousePressed() {
  if (state==='menu') {
    if (mouseX>width/2-120 && mouseX<width/2+120) {
      if (mouseY>200 && mouseY<250) state='playing';
      if (mouseY>300 && mouseY<350) state='instructions';
    }
  } else if (state==='instructions') {
    if (mouseX>50 && mouseX<170 && mouseY>height-80 && mouseY<height-40) state='menu';
  } else if (state==='playing' && !gameOver) {
    arrows.push(new Arrow(player.x, player.y+20));
  }
}

// Gera árvores e lenhadores
function initTrees() {
  for (let i=0;i<5;i++) trees.push(new Tree(random(50,width/3), random(350,550)));
}
function initLoggers() {
  let stats = loggerStatsForWave(wave);
  for (let i=0;i<3;i++) loggers.push(new Logger(random(width,width+200), random(50,height-150), stats));
}

// Inicializa prédios uma vez
function initBuildings() {
  for (let i=0;i<10;i++) {
    let x = i * 80 + random(-20,20);
    let w = random(50,100);
    let h = random(100,200);
    buildings.push({x, w, h});
  }
}

// Desenha cidade estática
function drawCity() {
  fill(50);
  for (let b of buildings) {
    rect(b.x, height*0.75 - b.h, b.w, b.h);
  }
}

function drawGrass() {
  stroke(20,100,20);
  for (let x=0;x<width;x+=10) {
    let y = height*0.75;
    line(x,y, x+3, y - random(10,20));
  }
  noStroke();
}

// Desenha jogador com arco
function drawPlayer() {
  strokeWeight(4);
  fill(0,0,255); stroke(0,0,255);
  ellipse(player.x, player.y+10,16,16);
  rect(player.x-4, player.y+18,8,30);
  line(player.x, player.y+48, player.x-10, player.y+68);
  line(player.x, player.y+48, player.x+10, player.y+68);
  noFill(); stroke(139,69,19); strokeWeight(3);
  arc(player.x, player.y+30,40,50, PI/3, 2*PI/3);
  strokeWeight(1);
}

// Barras com vida e nível
function drawBars() {
  // Jogador
  noStroke(); fill(0,0,255);
  rect(player.x-50, player.y-70,100*(player.health/player.maxHealth),10);
  noFill(); stroke(0); rect(player.x-50, player.y-70,100,10);
  noStroke(); fill(0); textSize(12); textAlign(CENTER,BOTTOM);
  text(`${player.health}/${player.maxHealth}`, player.x, player.y-75);
  textAlign(LEFT,CENTER); text(`L${player.level}`, player.x+55, player.y-65);

  // Lenhadores
  for (let logger of loggers) {
    noStroke(); fill(255,0,0);
    rect(logger.x-25, logger.y-20,50*(logger.health/logger.maxHealth),5);
    noFill(); stroke(0); rect(logger.x-25, logger.y-20,50,5);
    noStroke(); fill(0); textSize(10); textAlign(CENTER,BOTTOM);
    text(`${logger.health}`, logger.x, logger.y-25);
    textAlign(LEFT,CENTER); text(`L${logger.level}`, logger.x+30, logger.y-17);
  }
}

// Interface
function drawScore() {
  fill(0); textSize(18); textAlign(LEFT,TOP);
  text(`Nível: ${player.level}  Mortes: ${player.kills}  Onda: ${wave}`,20,20);
}

// Classes
class Tree { constructor(x,y){this.x=x;this.y=y;this.width=50;this.height=100;this.health=100;} show(){fill(139,69,19);rect(this.x,this.y,this.width,this.height);fill(34,139,34);ellipse(this.x+25,this.y-30,100,100);} takeDamage(){this.health-=10;} }
function loggerStatsForWave(w) {return {level:w, maxHealth:25+(w-1)*5, health:25+(w-1)*5, damage:1+(w-1)*3};}
class Logger { constructor(x,y,stats){Object.assign(this,{x,y,width:30,height:50});Object.assign(this,stats);this.isDead=false;this.speed=2;this.destroying=false;this.destroyStart=0;} update(){if(!this.isDead){this.x-=this.speed;if(this.x<0)this.x=width;}} show(){if(this.isDead)return;strokeWeight(4);fill(255,0,0);stroke(255,0,0);ellipse(this.x+15,this.y+10,16,16);rect(this.x+9,this.y+18,12,30);line(this.x+15,this.y+48,this.x+3,this.y+68);line(this.x+15,this.y+48,this.x+27,this.y+68);strokeWeight(4);stroke(139,69,19);line(this.x+25,this.y+30,this.x+35,this.y+20);rect(this.x+32,this.y+18,6,12);strokeWeight(1);} hits(t){return this.x+15>t.x&&this.x<t.x+t.width&&this.y+50>t.y&&this.y<t.y+t.height;} tryDestroyTree(){for(let t of trees){if(!this.isDead&&this.hits(t)){if(!this.destroying){this.destroying=true;this.destroyStart=millis();}else if(millis()-this.destroyStart>=10000){t.takeDamage();this.destroying=false;if(t.health<=0)gameOver=true;}}}} tryAttackPlayer(){if(!this.isDead&&dist(this.x,this.y,player.x,player.y)<30){player.health-=this.damage;if(player.health<=0)gameOver=true;}} die(){this.isDead=true;} dieAndCount(){this.die();score++;player.kills++;if(player.kills%3===0){player.level++;player.maxHealth+=5;player.health=min(player.maxHealth,player.health+10);wave++;loggers=[];}} }
class Arrow { constructor(x,y){this.x=x;this.y=y;this.width=20;this.height=3;this.speed=10;this.isDead=false;} update(){this.x+=this.speed;} show(){stroke(255,165,0);strokeWeight(4);line(this.x,this.y,this.x-20,this.y);noStroke();fill(255,165,0);triangle(this.x,this.y,this.x-5,this.y-5,this.x-5,this.y+5);strokeWeight(1);} hits(l){return this.x>l.x&&this.x<l.x+l.width&&this.y>l.y&&this.y<l.y+l.height;} die(){this.isDead=true;} }

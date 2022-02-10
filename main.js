let canvas = document.querySelector('#canvas');
let ctx = canvas.getContext('2d');
//擴充
ctx.circle = function (v, r) {
  this.arc(v.x, v.y, r, 0, Math.PI * 2);
};
ctx.line = function (v1, v2) {
  this.moveTo(v1.x, v1.y);
  this.lineTo(v2.x, v2.y);
};
ctx.drawAnimation = function (obj, position, isLoop, width, height) {
  if (window.innerWidth < 768) {
    this.drawImage(obj.img[obj.index], position.x - width / 2, position.y - height / 2, width, height);
  } else {
    this.drawImage(obj.img[obj.index], position.x - width / 2, position.y - height / 2, width, height);
  }
  updateAnimation(obj, isLoop);
};
//class
// 畫線
class Point {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
  addPoint(point) {
    this.x += point.x;
    this.y += point.y;
  }
  clone() {
    return new Point(this.x, this.y);
  }
}
// 敵人
class Army {
  constructor(args) {
    let def = {
      /* ------------大球數據----------------- */
      position: new Point(),
      width: 140,
      height: 115,
      start: {
        position: {
          origin: new Point(0, 0),
          final: new Point(0, 0),
        },
        move: new Point(10, 0),
      },
      direction: {
        x: {
          type: 'default',
          minus: new Point(-5, 0),
          plus: new Point(5, 0),
          max: 400,
          min: 100,
        },
        y: {
          type: 'default',
          minus: new Point(0, -5),
          plus: new Point(0, 5),
          max: 500,
          min: 100,
        },
      },
      status: {
        life: 4,
        isHit: false,
        hitCount: 0,
        canThrough: false,
      },
      ball: {
        array: new Array(),
        id: 0,
        intervalCount: 0,
        maxIntervalCount: 0,
      },
      /* --------共用的參數------------ */
      armyId: 0,
      action: {
        move: {
          img: canvasContent.army.move,
          index: 0,
          count: 0,
        },
        face: {
          img: canvasContent.army.face,
          index: 0,
          count: 0,
        },
        passDown: {
          img: canvasContent.army.passDown,
          index: 0,
          count: 0,
        },
        dizzy: {
          img: canvasContent.army.dizzy,
          index: 0,
          count: 0,
        },
        died: {
          img: canvasContent.army.died,
          index: 0,
          count: 0,
        },
        throw: {
          img: canvasContent.army.throw,
          index: 0,
          count: 0,
        },
        stand: {
          img: canvasContent.army.stand,
          index: 0,
          count: 0,
        },
      },
    };
    Object.assign(this, def);
  }
  draw() {
    ctx.save();
    // console.log(this.direction)
    // 遊戲開始前的移動
    if (canvasContent.gameProcess == 0) {
      if (this.position.x < this.start.position.final.x) {
        this.position.addPoint(this.start.move);
        ctx.drawAnimation(this.action.move, this.position, true, this.width, this.height);
      } else {
        ctx.drawAnimation(this.action.stand, this.position, true, this.width, this.height);
      }
    }
    // 遊戲開始後的移動
    else if (canvasContent.gameProcess == 1) {
      if (this.status.isHit) {
        if (this.status.life == 3) {
          ctx.drawAnimation(this.action.face, this.position, false, this.width, this.height);
        } else if (this.status.life == 2) {
          ctx.drawAnimation(this.action.passDown, this.position, false, this.width, this.height);
        } else if (this.status.life == 1) {
          ctx.drawAnimation(this.action.dizzy, this.position, false, this.width, this.height);
        } else {
          ctx.drawAnimation(this.action.died, this.position, false, this.width, this.height);
        }
        this.status.hitCount++;
        if (this.status.life == 3 && this.status.hitCount >= 500 / canvasContent.updateFPS) {
          this.status.isHit = false;
          this.status.hitCount = 0;
        } else if (this.status.life == 2 && this.status.hitCount >= 1000 / canvasContent.updateFPS) {
          this.status.isHit = false;
          this.status.hitCount = 0;
        } else if (this.status.life == 1 && this.status.hitCount >= 1500 / canvasContent.updateFPS) {
          this.status.isHit = false;
          this.status.hitCount = 0;
        }
      } else {
        //確認範圍
        if (this.direction.x.type != 'default') {
          if (this.position.x >= this.direction.x.max) {
            this.direction.x.type = 'left';
          }
          if (this.position.x <= this.direction.x.min) {
            this.direction.x.type = 'right';
          }
          if (this.direction.x.type == 'right') {
            this.position.addPoint(this.direction.x.plus);
          }
          if (this.direction.x.type == 'left') {
            this.position.addPoint(this.direction.x.minus);
          }
        }
        if (this.direction.y.type != 'default') {
          if (this.position.y <= this.direction.y.min) {
            this.direction.y.type = 'bottom';
          }
          if (this.position.y >= this.direction.y.max) {
            this.direction.y.type = 'top';
          }
          if (this.direction.y.type == 'bottom') {
            this.position.addPoint(this.direction.y.plus);
          }
          if (this.direction.y.type == 'top') {
            this.position.addPoint(this.direction.y.minus);
          }
        }
        if (this.status.life != 0) {
          this.ball.intervalCount++;
          if (this.ball.intervalCount >= this.ball.maxIntervalCount) {
            this.ball.intervalCount = 0;
            this.addBall();
          }
        }
        ctx.drawAnimation(this.action.move, this.position, true, this.width, this.height);
      }
      this.ball.array.forEach((ball) => {
        ball.draw();
      });
    } else if (canvasContent.gameProcess == 2) {
      if (canvasContent.my.status.life == 0) {
        if (this.status.life == 0) {
          ctx.drawAnimation(this.action.died, this.position, false, this.width, this.height);
        } else {
          ctx.drawAnimation(this.action.stand, this.position, false, this.width, this.height);
        }
      } else {
        ctx.drawAnimation(this.action.died, this.position, false, this.width, this.height);
      }
    }
    //繪製敵人區域
    // ctx.strokeStyle = "black"
    // ctx.strokeRect(0,0,canvasContent.armyArea.x, canvasContent.armyArea.y)

    ctx.restore();
  }
  addBall() {
    var ball = new Ball();
    ball.position = this.position.clone();
    ball.type = 'army';
    ball.force = 1;
    ball.id = this.ball.id;
    ball.armyId = this.armyId;
    this.ball.array.push(ball);
    this.ball.id++;
  }
  deleteBall(id) {
    this.ball.array.forEach((ball, i) => {
      if (ball.id == id) {
        this.ball.array.splice(i, 1);
      }
    });
  }
}
// 本體
class MyBall {
  constructor(args) {
    let def = {
      position: new Point(),
      ballPosition: new Point(-10, -10),
      width: 140,
      height: 115,
      character: 'player',
      isDragging: false,
      start: {
        position: {
          origin: new Point(canvasContent.width, canvasContent.height / 2),
          final: new Point(canvasContent.playerArea.x, canvasContent.height / 2),
        },
        move: new Point(-10, 0),
      },
      status: {
        isDragging: false,
        isHit: false,
        isThrowingBall: false,
        life: 4,
      },
      ball: {
        array: new Array(),
        id: 0,
      },
      isHit: false,
      hitBackCount: 0,
      action: {
        move: {
          img: canvasContent.player.move,
          index: 0,
          count: 0,
        },
        face: {
          img: canvasContent.player.face,
          index: 0,
          count: 0,
        },
        passDown: {
          img: canvasContent.player.passDown,
          index: 0,
          count: 0,
        },
        dizzy: {
          img: canvasContent.player.dizzy,
          index: 0,
          count: 0,
        },
        died: {
          img: canvasContent.player.died,
          index: 0,
          count: 0,
        },
        throw: {
          img: canvasContent.player.throw,
          index: 0,
          count: 0,
        },
        stand: {
          img: canvasContent.player.stand,
          index: 0,
          count: 0,
        },
      },
    };
    Object.assign(this, def, args);
  }
  draw() {
    // 移動單位
    ctx.save();
    if (canvasContent.gameProcess == 0) {
      if (this.position.x > this.start.position.final.x) {
        this.position.addPoint(this.start.move);
        ctx.drawAnimation(this.action.move, this.position, true, this.width, this.height);
      } else {
        ctx.drawAnimation(this.action.stand, this.position, true, this.width, this.height);
      }
    } else if (canvasContent.gameProcess == 1) {
      if (this.status.isHit) {
        if (this.status.life == 3) {
          ctx.drawAnimation(this.action.face, this.position, false, this.width, this.height);
        } else if (this.status.life == 2) {
          ctx.drawAnimation(this.action.passDown, this.position, false, this.width, this.height);
        } else if (this.status.life == 1) {
          ctx.drawAnimation(this.action.dizzy, this.position, false, this.width, this.height);
        } else {
          ctx.drawAnimation(this.action.died, this.position, false, this.width, this.height);
        }
        this.hitBackCount++;
        if (this.hitBackCount >= 500 / canvasContent.updateFPS) {
          this.hitBackCount = 0;
          this.status.isHit = false;
        }
      } else {
        if (this.status.isDragging) {
          if (window.innerWidth < 768) {
            var rect = canvas.getBoundingClientRect();
            var position = new Point(canvasContent.mousePos.y, rect.right - canvasContent.mousePos.x);
            ctx.drawAnimation(this.action.move, position, true, this.width, this.height);
            this.position = position;
            this.isDragging = true;
          } else {
            ctx.drawAnimation(this.action.move, canvasContent.mousePos, true, this.width, this.height);
            this.position = canvasContent.mousePos;
          }
          //要先歸0
          this.isThrowing = true;
        } else {
          if (this.isThrowing) {
            ctx.drawAnimation(this.action.throw, this.position, false, this.width, this.height);
          } else {
            ctx.drawAnimation(this.action.stand, this.position, true, this.width, this.height);
          }
        }
      }
      this.ball.array.forEach((ball) => {
        ball.draw();
      });
    } else if (canvasContent.gameProcess == 2) {
      if (this.status.life == 0) {
        ctx.drawAnimation(this.action.died, this.position, false, this.width, this.height);
      } else {
        ctx.drawAnimation(this.action.stand, this.position, true, this.width, this.height);
      }
    }
    //繪製我方遊戲區域
    // ctx.strokeStyle = "black"
    // ctx.strokeRect(canvasContent.playerArea.x,0,canvasContent.armyArea.x, canvasContent.playerArea.y)
    ctx.restore();
  }
  addBall() {
    var ball = new Ball();
    ball.position = this.position.clone();
    ball.position.addPoint(this.ballPosition);
    // ball.position = (this.position.addPoint(this.ballPosition)   ).clone();
    ball.type = 'player';
    ball.force = canvasContent.force;
    ball.id = this.ball.id;
    this.ball.array.push(ball);
    this.ball.id++;
  }
  deleteBall(id) {
    this.ball.array.forEach((ball, i) => {
      if (ball.id == id) {
        this.ball.array.splice(i, 1);
      }
    });
  }
}
// 雪球
class Ball {
  constructor(args) {
    let def = {
      width: 20,
      height: 20,
      position: new Point(),
      v: new Point(20, 0),
      mobileV: new Point(10, 0),
      a: new Point(0, 1),
      shadow: {
        position: new Point(0, 0),
      },
      r: 10,
      color: 'black',
      type: '',
      force: 1,
      id: '',
      armyId: '',
      action: {
        move: {
          img: canvasContent.snowball.move,
          index: 0,
          count: 0,
        },
      },
    };
    Object.assign(this, def, args);
  }
  draw() {
    ctx.save();
    ctx.beginPath();
    ctx.drawAnimation(this.action.move, this.position, false, this.width, this.height);
    this.shadow.position = this.position.clone();
    this.shadow.position.x -= 50;
    this.shadow.position.y += 50;
    // ctx.circle(this.shadow.position, this.r);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.restore();
    this.move();
  }
  move() {
    //確認陣營
    if (this.type == 'player') {
      //檢查有沒有撞到邊界
      if (this.checkBoundary()) {
        canvasContent.my.deleteBall(this.id);
      }
      //檢查有沒有撞到敵人
      canvasContent.armys.forEach((army, i) => {
        // 判斷是否可以穿越
        if (!army.status.canThrough) {
          if (checkCollision(this, army)) {
            canvasContent.my.deleteBall(this.id);
            //判斷不能連續擊中
            if (!army.status.isHit) {
              if (army.status.life > 0) {
                army.status.life -= 1;
              } else if (army.status.life == 0) {
                army.status.isHit = false;
              }
              army.status.isHit = true;
            }
          }
        }
        if (army.status.life == 0) {
          army.status.canThrough = true;
        }
      });
      //勝利判斷
      var isWin = true;
      canvasContent.armys.forEach((army) => {
        if (army.status.life != 0) {
          isWin = false;
        }
      });
      if (isWin) {
        canvasContent.gameProcess = 2;
        canvasContent.level += 1;
        console.log('win: ' + canvasContent.level);
        endText(true);
        if (canvasContent.level == 4) {
          document.getElementsByClassName('whichLevel')[0].innerHTML = 'LEVEL ' + 3;
          // canvasContent.challengeBtn.classList.add("dn");
        }
      }
      this.position.x -= this.force * 5 + this.v.x;
      this.position.y += this.v.y;
      this.v.y += Math.cos(this.a.y);
    } else if (this.type == 'army') {
      //檢查有沒有撞到邊界
      if (this.checkBoundary()) {
        canvasContent.armys.forEach((army) => {
          if (army.armyId == this.armyId) {
            army.deleteBall(this.id);
          }
        });
      }
      //檢查有沒有撞到玩家
      if (checkCollision(this, canvasContent.my)) {
        canvasContent.armys.forEach((army) => {
          if (army.armyId == this.armyId) {
            army.deleteBall(this.id);
          }
        });
        //判斷不能連續擊中
        if (!canvasContent.my.status.isHit) {
          canvasContent.my.status.life -= 1;
          canvasContent.my.status.isHit = true;
          if (canvasContent.my.status.life == 0) {
            console.log('lose');
            canvasContent.gameProcess = 2;
            endText(false);
          }
        }
      }
      if (window.innerWidth < 768) {
        this.position.x += this.force * 8 + this.mobileV.x;
        this.position.y += this.v.y;
        this.v.y += Math.cos(this.a.y);
      } else {
        this.position.x += this.force * 5 + this.mobileV.x;
        this.position.y += this.v.y;
        this.v.y += Math.cos(this.a.y);
      }
    }
  }
  checkBoundary() {
    var res = false;
    if (this.position.x < 0 || this.position.x > canvasContent.width || this.position.y < 0 || this.position.y > canvasContent.height) {
      res = true;
    }
    return res;
  }
}
// 生命條
class Life {
  constructor(args) {
    let def = {
      width: 193,
      height: 64,
      position: new Point(canvasContent.width - 200, 10),
      life: {
        A: {
          img: canvasContent.lifebarA.life,
          index: 0,
          count: 0,
        },
      },
    };
    Object.assign(this, def, args);
  }
  draw() {
    ctx.save();
    if (canvasContent.my.status.life == 4) {
      ctx.drawImage(this.life.A.img[4], this.position.x, this.position.y, this.width, this.height);
    } else if (canvasContent.my.status.life == 3) {
      ctx.drawImage(this.life.A.img[3], this.position.x, this.position.y, this.width, this.height);
    } else if (canvasContent.my.status.life == 2) {
      ctx.drawImage(this.life.A.img[2], this.position.x, this.position.y, this.width, this.height);
    } else if (canvasContent.my.status.life == 1) {
      ctx.drawImage(this.life.A.img[1], this.position.x, this.position.y, this.width, this.height);
    }
    ctx.restore();
  }
}
let canvasContent = {
  width: 980,
  height: 580,
  bgColor: '#ffffff',
  updateFPS: 30,
  /* -----生成物件------ */
  /* ----縮放---- */
  scaleX: null,
  scaleY: null,
  armys: [],
  armysIndex: 0,
  my: null,
  lifeA: null,
  /* -----計算mousedown的秒數------ */
  force: 1,
  forceTime: 0,
  mousePos: new Point(0, 0),
  /* -------敵人走到定位後，攻擊的觸發------- */
  goAttack: false,
  /* --------關卡設定-------- */
  level: 1,
  /* -------
   *若 gameProcess == 0，代表初始化
   *若 gameProcess == 1，代表遊戲開始
   *若 gameProcess == 2，代表遊戲結束
  ------ */
  gameProcess: 0,
  startNum: document.querySelector('.Startbg-num'),
  startBtn: document.getElementsByClassName('Startbg-txt'),
  mainGame: document.querySelector('.snowCraftGame'),
  challenge: document.querySelector('.challengeBg'),
  challengeTxt: document.querySelector('.challengeBg-level'),
  challengeBtn: document.querySelector('.challengeBg-btn'),
  /* --------圖片檔-------- */
  maxAnimationCount: 10,
  player: {
    move: [],
    face: [],
    passDown: [],
    dizzy: [],
    died: [],
    throw: [],
    stand: [],
  },
  army: {
    move: [],
    face: [],
    passDown: [],
    dizzy: [],
    died: [],
    throw: [],
    stand: [],
  },
  snowball: {
    move: [],
  },
  lifebarA: {
    life: [],
  },
  /* --------控制-------- */
  isControlDown: false,
  playerArea: {
    x: 980 / 2 + 200,
    y: 580,
  },
  armyArea: {
    x: 980 / 2 - 200,
    y: 580,
  },
};
window.addEventListener('load', function () {
  startText();
  init();
  initLevel();
});
// function loaded() {
//   startText();
//   initLevel();
// }

function init() {
  if (window.innerWidth < 768) {
    canvasContent.width = 676;
    canvasContent.height = 286;
    canvasContent.playerArea.x = 676 / 2 + 125;
    canvasContent.playerArea.y = 286;
    canvasContent.armyArea.x = 676 / 2 - 125;
    canvasContent.armyArea.y = 286;
  }
  canvas.width = canvasContent.width;
  canvas.height = canvasContent.height;
  setInterval(render, canvasContent.updateFPS);
  //事件
  canvas.addEventListener('mousemove', mousemove);
  canvas.addEventListener('mousedown', mousedown);
  canvas.addEventListener('mouseup', mouseup);
  // canvas.addEventListener([isMobile() ? 'touchmove' : 'mousemove'], mousemove);
  // canvas.addEventListener([isMobile() ? 'touchstart' : 'mousedown'], mousedown);
  // canvas.addEventListener([isMobile() ? 'touchend' : 'mouseup'], mouseup);
  canvasContent.level = 1;
  canvasContent.startBtn[0].addEventListener('click', function () {
    document.getElementsByClassName('Startbg')[0].classList.add('dn');
    canvasContent.gameProcess = 1;
  });
  canvasContent.challengeBtn.addEventListener('click', () => {
    canvasContent.challenge.classList.remove('false');
    canvasContent.challenge.classList.remove('df');
    canvasContent.gameProcess = 1;
  });
  //讀圖
  loadResource('player');
  loadResource('army');
  loadResource('snowball');
  loadResource('lifebarA');
  // 初始化血條
  var lifeA = new Life();
  canvasContent.lifeA = lifeA;
}
function initLevel() {
  canvasContent.gameProcess = 0;
  canvasContent.armys = new Array();
  if (canvasContent.level == 1) {
    for (var i = 0; i < 2; i++) {
      var army = new Army();
      army.armyId = canvasContent.armysIndex;
      if (i == 0) {
        army.start.position.origin = new Point(0, canvasContent.height * 0.3);
        army.start.position.final = new Point(canvasContent.armyArea.x, canvasContent.height * 0.3);
        army.direction.y.type = 'bottom';
        army.ball.maxIntervalCount = 1000 / 30;
        if (window.innerWidth < 768) {
          army.start.position.origin = new Point(0, canvasContent.height * 0.25);
          army.start.position.final = new Point(canvasContent.armyArea.x - army.width / 2, canvasContent.height * 0.25);
        }
      } else if (i == 1) {
        army.start.position.origin = new Point(0, canvasContent.height * 0.7);
        army.start.position.final = new Point(canvasContent.armyArea.x, canvasContent.height * 0.7);
        army.direction.y.type = 'top';
        army.ball.maxIntervalCount = 700 / 30;
        if (window.innerWidth < 768) {
          army.start.position.origin = new Point(0, canvasContent.height * 0.7);
          army.start.position.final = new Point(canvasContent.armyArea.x - army.width / 2, canvasContent.height * 0.7);
        }
      }
      if (window.innerWidth < 768) {
        army.direction.y.max = 280 - army.height / 2;
        army.direction.y.min = 120 - army.height / 2;
      }
      army.position = army.start.position.origin;
      canvasContent.armys.push(army);
      canvasContent.armysIndex++;
    }
  } else if (canvasContent.level == 2) {
    for (var i = 0; i < 3; i++) {
      var army = new Army();
      army.armyId = canvasContent.armysIndex;
      army.start.position.origin = new Point(0, canvasContent.height * 0.17 * (i + 1));
      army.start.position.final = new Point(canvasContent.armyArea.x * 0.2 * (i + 1), canvasContent.height * 0.17 * (i + 1));
      if (window.innerWidth < 768) {
        army.direction.y.max = 280 - army.height / 2;
        army.direction.y.min = 120 - army.height / 2;
      }
      army.direction.y.type = 'bottom';
      army.ball.maxIntervalCount = 700 / 30;
      army.position = army.start.position.origin;
      canvasContent.armys.push(army);
      canvasContent.armysIndex++;
    }
  } else if (canvasContent.level == 3) {
    for (var i = 0; i < 5; i++) {
      var army = new Army();
      army.armyId = canvasContent.armysIndex;
      army.start.position.origin = new Point(0, canvasContent.height * 0.17 * (i + 1));
      army.start.position.final = new Point(canvasContent.armyArea.x * 0.2 * (i + 1), canvasContent.height * 0.17 * (i + 1));
      if (window.innerWidth < 768) {
        army.direction.y.max = 280 - army.height / 2;
        army.direction.y.min = 120 - army.height / 2;
        army.start.position.final = new Point(canvasContent.armyArea.x * 0.2 * (i + 1) - army.width / 2, canvasContent.height * 0.17 * (i + 1));
      }
      army.direction.y.type = 'bottom';
      army.ball.maxIntervalCount = 700 / 30;
      army.position = army.start.position.origin;
      canvasContent.armys.push(army);
      canvasContent.armysIndex++;
    }
  }
  // 初始化玩家
  var myBall = new MyBall();
  myBall.position = myBall.start.position.origin;
  canvasContent.my = myBall;
  console.log(myBall);
}
function render() {
  ctx.clearRect(0, 0, canvasContent.width, canvasContent.height);
  canvasContent.armys.forEach((army) => {
    army.draw();
  });
  canvasContent.my.draw();
  canvasContent.lifeA.draw();
}
function mousemove(e) {
  mouseEvent(e);
}
function mousedown(e) {
  canvasContent.isControlDown = true;
  canvasContent.forceTime = 0;
  mouseEvent(e);
}
function mouseup() {
  //有拖拉到表示在範圍內
  if (canvasContent.my.status.isDragging) {
    var nowTime = new Date().getTime();
    var diffTime = nowTime - canvasContent.forceTime;
    if ((diffTime / 1000) * 2 > 10) {
      canvasContent.force = 10;
    } else {
      canvasContent.force = (diffTime / 1000) * 2;
    }
    canvasContent.my.addBall();
  }
  canvasContent.isControlDown = false;
  canvasContent.my.status.isDragging = false;
}
function getDistance(p1, p2) {
  let temp1 = p1.x - p2.x;
  let temp2 = p1.y - p2.y;
  //次方
  let dist = Math.pow(temp1, 2) + Math.pow(temp2, 2);
  //開更號
  return Math.sqrt(dist);
}
function checkMousePoint(obj, e) {
  var res = false;
  var x = window.innerWidth < 768 ? e.touches[0].clientX : e.offsetX;
  var y = window.innerWidth < 768 ? e.touches[0].clientY : e.offsetY;
  var minX = obj.position.x - obj.width / 2;
  var maxX = minX + obj.width;
  var minY = obj.position.y - obj.height / 2;
  var maxY = minY + obj.height;
  if (window.innerWidth < 768) {
    res = true;
  } else {
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
      res = true;
    }
  }
  return res;
}
function checkCollision(obj1, obj2) {
  var res = false;
  if (Math.abs(obj1.position.x - obj2.position.x) <= obj2.width / 2 && Math.abs(obj1.position.y - obj2.position.y) <= obj2.height / 2) {
    res = true;
  }
  return res;
}
function mouseEvent(e) {
  var rect = canvas.getBoundingClientRect();
  var x = e.offsetX;
  var y = e.offsetY;
  // var x = window.innerWidth<768 ? e.touches[0].clientX : e.offsetX;
  // var y = window.innerWidth<768 ? e.touches[0].clientY : e.offsetY;

  //判斷滑動範圍
  if (window.innerWidth < 768) {
    if (y < canvasContent.playerArea.x - canvasContent.my.width / 2) {
      y = canvasContent.playerArea.x - canvasContent.my.width / 2;
    }
    if (y > rect.height + canvasContent.my.width / 2 - 10) {
      y = rect.height + canvasContent.my.width / 2 - 10;
    }
    if (x < rect.x + 25) {
      x = rect.x + 25;
    }
    if (x > rect.right - 60) {
      x = rect.right - 60;
    }
    canvasContent.mousePos = new Point(x, y);
  } else {
    if (x < canvasContent.playerArea.x) {
      x = canvasContent.playerArea.x;
    }
    canvasContent.mousePos = new Point(x, y);
  }
  if (checkMousePoint(canvasContent.my, e)) {
    if (canvasContent.isControlDown) {
      if (canvasContent.gameProcess == 1) {
        canvasContent.force = 1;
        canvasContent.my.status.isDragging = true;
        //紀錄按下的時間
        if (canvasContent.forceTime == 0) {
          canvasContent.forceTime = new Date().getTime();
        }
      }
    }
  }
}
function endText(isNext) {
  if (isNext) {
    document.getElementsByClassName('whichLevel')[0].innerHTML = 'LEVEL ' + canvasContent.level;
    canvasContent.challengeTxt.innerHTML = `恭喜通关! <div class="challengeBg-level-2">恭喜通关!</div>`;
    if (canvasContent.level == 2) {
      canvasContent.challengeBtn.innerHTML = '进行下一关';
    } else if (canvasContent.level == 3) {
      canvasContent.challengeBtn.innerHTML = '进行下一关 并领取奖励';
    } else {
      canvasContent.challengeBtn.innerHTML = '领取圣诞大礼包';
    }
    canvasContent.challenge.classList.add('df');
  } else {
    canvasContent.challenge.classList.add('false');
    canvasContent.challengeTxt.innerHTML = `不幸失败了! <div class="challengeBg-level-2">不幸失败了!</div>`;
    canvasContent.challengeBtn.innerHTML = '重新挑战';
  }
  initLevel();
}
function loadResource(character) {
  if (character == 'player') {
    canvasContent.player.move = new Array();
    canvasContent.player.failed = new Array();
    canvasContent.player.throw = new Array();
    canvasContent.player.stand = new Array();
    loadImage(character, 'move', canvasContent.player.move, 2);
    loadImage(character, 'face', canvasContent.player.face, 1);
    loadImage(character, 'passDown', canvasContent.player.passDown, 2);
    loadImage(character, 'dizzy', canvasContent.player.dizzy, 2);
    loadImage(character, 'died', canvasContent.player.died, 2);
    loadImage(character, 'throw', canvasContent.player.throw, 4);
    loadImage(character, 'stand', canvasContent.player.stand, 1);
  } else if (character == 'snowball') {
    canvasContent.snowball.move = new Array();
    loadImage(character, 'snowball', canvasContent.snowball.move, 1);
  } else if (character == 'lifebarA') {
    loadImage(character, 'life', canvasContent.lifebarA.life, 5);
  } else {
    canvasContent.army.move = new Array();
    canvasContent.army.failed = new Array();
    canvasContent.army.throw = new Array();
    canvasContent.army.stand = new Array();
    loadImage(character, 'move', canvasContent.army.move, 2);
    loadImage(character, 'face', canvasContent.army.face, 1);
    loadImage(character, 'passDown', canvasContent.army.passDown, 2);
    loadImage(character, 'dizzy', canvasContent.army.dizzy, 2);
    loadImage(character, 'died', canvasContent.army.died, 2);
    loadImage(character, 'throw', canvasContent.army.throw, 4);
    loadImage(character, 'stand', canvasContent.army.stand, 1);
  }

  function loadImage(character, type, array, count) {
    for (var i = 1; i <= count; i++) {
      var img = new Image();
      if (character != 'snowball') {
        img.src = './img/frame/' + type + '/' + character + '_' + i + '.png';
      } else if (character == 'lifebarA') {
        img.src = `./img/frame/${type}/${character}_${i}.png`;
      } else {
        img.src = './img/snow_ball.png';
      }
      array.push(img);
    }
  }
}
function updateAnimation(obj, isLoop) {
  obj.count++;
  if (obj.count > canvasContent.maxAnimationCount) {
    if (obj.index < obj.img.length - 1) {
      obj.index++;
    } else {
      if (isLoop) {
        obj.index = 0;
      }
    }
    obj.count = 0;
  }
}
function startText() {
  let timer = setInterval(() => {
    canvasContent.startNum.innerHTML--;
    if (canvasContent.startNum.innerHTML == 0) {
      canvasContent.startBtn[0].classList.remove('dn');
      canvasContent.startBtn[0].classList.add('df');
      canvasContent.startNum.classList.remove('df');
      canvasContent.startNum.classList.add('dn');
      clearInterval(timer);
    }
  }, 1000);
}

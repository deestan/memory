bonsai.run(document.getElementById('movie'), {
  code: init,
  width: 800,
  height: 600
});

function init() {
  function shuffle(arrOrig) {
    var arr = arrOrig.slice();
    var j, tmp;
    for (var i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function triangularRandInt(min, max, mode) {
    var u = Math.random();
    var res;
    if (u < (mode - min) / (max - min))
      res = min + Math.sqrt(u * (max - min) * (mode - min));
    else
      res = max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    res = Math.floor(res);
    if (res >= max)
      res = max - 1;
    return res;
  }
    
  function idStream() {
    var queue = [];
    var ids = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ];
    var pickQueue = [];
    function yieldo() {
      if (queue[0] == undefined) {
        if (pickQueue.length == 0)
          pickQueue = shuffle(ids);
        var id = pickQueue.pop();
        queue[0] = id;
        var nxt = triangularRandInt(0, 15, 15);
        while (queue[nxt] != undefined)
          nxt += 1;
        queue[nxt] = id;
      }
      return queue.splice(0, 1);
    }
    return yieldo;
  }

  function mkText(text, size_) {
    var size = size_ || 50;
    return new Text(text).attr({
      'fontFamily': 'monospace',
      'fontSize': size,
      'textFillColor': 'black',
      'textStrokeColor': 'grey',
      'textStrokeWidth': Math.floor(size / 50)
    });
  }

  var bitmaps;
  function loadBitmaps(onDone) {
    data = {};
    toLoad = 1; // 1 dummy value to assure we line up all loads before reaching 0

    function load(id, ext) {
      if (!ext)
        ext = 'png';
      toLoad += 1;
      new Bitmap(id + '.' + ext).on('load', function() {
        data[id] = this;
        loadedOne();
      });
    }

    function loadedOne() {
      --toLoad || setTimeout(onDone, 1000);
    }

    function get(id) {
      return data[id].clone();
    }
    bitmaps = get;

    load('player_dance_1');
    load('player_dance_2');
    load('player_climb_1');
    load('player_climb_2');
    load('player_hang');
    load('player_hold');
    load('player_sit_sad');
    load('exit');
    load('cat1_stand');
    load('cat1_sleep');
    load('back');
    load('difficulty_easy');
    load('difficulty_normal');
    load('difficulty_hard');
    load('background_easy', 'jpg');
    load('background_normal', 'jpg');
    load('background_hard', 'jpg');
    for (var i = 0; i < 20; load(i++));

    loadedOne();
  }

  function difficultySelect() {
    var board = new Group();
    var selected = false;
    
    var bg1 = color('gray').darker(0.1);
    var bg2 = color('gray').lighter(0.1);
    var bg = new Rect(0, 0, 800, 600)
      .addTo(board)
      .fill(gradient.linear('top', [bg1, bg2]));

    var easyButton = new Group()
      .addTo(board)
      .attr({'x': 50, 'y': 200});
    var easyBg = new Rect(0, 0, 200, 200, 10)
      .addTo(easyButton)
      .attr({'fillColor': color('blue').lighter(0.2)});
    var easyIcon = bitmaps('difficulty_easy')
      .addTo(easyButton)
      .attr({'width': 100,
             'height': 142,
             'x': 50,
             'y': 35
            });
    mkText("LETT", 30)
      .addTo(easyButton)
      .attr({'x': 64,
             'y': 160});

    var normalButton = new Group()
      .addTo(board)
      .attr({'x': 300, 'y': 200});
    var normalBg = new Rect(0, 0, 200, 200, 10)
      .addTo(normalButton)
      .attr({'fillColor': color('green').lighter(0.4)});
    var normalIcon = bitmaps('difficulty_normal')
      .addTo(normalButton)
      .attr({'width': 100,
             'height': 142,
             'x': 50,
             'y': 20
            });
    mkText("MIDDELS", 30)
      .addTo(normalButton)
      .attr({'x': 38,
             'y': 160});

    var hardButton = new Group()
      .addTo(board)
      .attr({'x': 550, 'y': 200});
    var hardBg = new Rect(0, 0, 200, 200, 10)
      .addTo(hardButton)
      .attr({'fillColor': color('red').lighter(0.2)});
    var hardIcon = bitmaps('difficulty_hard')
      .addTo(hardButton)
      .attr({'width': 100,
             'height': 142,
             'x': 50,
             'y': 20
            });
    mkText("VANSKELIG", 30)
      .addTo(hardButton)
      .attr({'x': 17,
             'y': 160});

    mkText("MEMORY GAME")
      .addTo(board)
      .attr({'x': 235,
             'y': 40});
    mkText("JENTE REDDER KATTER")
      .addTo(board)
      .attr({'x': 110,
             'y': 100});

    mkText("Grafisk design: Elena og Olive", 30)
      .addTo(board)
      .attr({'x': 130,
             'y': 500});

    function select(button, difficulty) {
      if (selected) return;
      selected = true;
      var bb = button.getBoundingBox();
      button.setOrigin(bb.left + bb.width / 2,
                       bb.top + bb.height / 2);
      button.animate(new KeyframeAnimation(
        '0.2s',
        { 'from': { 'scale': 1 },
          '30%': { 'scale': 0.9 },
          '60%': { 'scale': 1.1 },
          'to': { 'scale': 1 }
        }
      ));
      setTimeout(function() {
        board.onSelect(difficulty);
      }, 300);
    }

    easyButton.on('multi:pointerdown', function() {
      select(easyButton, {background: 'background_easy',
                          climbHeight: 60,
                          slideTimeInterval: 20000,
                          slideTimeHeight: 5,
                          slideWrongHeight: 0});
    });
    normalButton.on('multi:pointerdown', function() {
      select(normalButton, {background: 'background_normal',
              climbHeight: 50,
              slideTimeInterval: 10000,
              slideTimeHeight: 20,
              slideWrongHeight: 4});
    });
    hardButton.on('multi:pointerdown', function() {
      select(hardButton, {background: 'background_hard',
              climbHeight: 50,
              slideTimeInterval: 10000,
              slideTimeHeight: 20,
              slideWrongHeight: 7});
    });

    return board;
  }

  function mkWinScreen(cats) {
    var container = new Group();
    var stopped = false;

    new Rect(0, 0, 800, 600, 0)
      .addTo(container)
      .fill(gradient.linear('top', [
        color('green').lighter(0.1),
        color('green').lighter(0.3)
      ]));
    
    mkText("DU VANT!", 80)
      .addTo(container)
      .attr({'x': 215,
             'y': 40});

    function catPos(i) {
      return [{'x': 150, 'y': 300},
              {'x': 280, 'y': 380},
              {'x': 500, 'y': 350}][i];
    }

    for (var i = 0; i < cats.length; i++) {
      cats[i].remove();
      cats[i].addTo(container);
      cats[i].attr(catPos(i));
      cats[i].wake();
      cats[i].getBig();
    }

    var dancer = new Group()
      .addTo(container)
      .attr({'x': 320,
             'y': 100});

    dancer.animate(new KeyframeAnimation(
      '0.5s',
      { 'from': { 'y': 100 },
        '50%' : { 'y': 150 },
        'to'  : { 'y': 100 }
      }, {
        'easing': 'circInOut',
        'repeat': Infinity
      }));
    
    var danceImg_i = 0;
    var danceImg = [
      bitmaps('player_dance_1')
        .addTo(dancer)
        .attr({'width': 200, 'height': 200}),
      bitmaps('player_dance_2')
        .addTo(dancer)
        .attr({'width': 200, 'height': 200})
    ];

    function dance() {
      danceImg[danceImg_i]
        .animate('1', {'opacity': 0});
      danceImg_i = (danceImg_i + 1) % 2;
      danceImg[danceImg_i]
        .animate('1', {'opacity': 1});
    }
    
    var danceInterval = setInterval(dance, 500);
    dance();

    function stop() {
      clearInterval(danceInterval);
    }

    container.stop = stop;
    
    return container;
  }
  
  function mkGame(difficulty) {
    var gameArea = new Group();

    var stopped = false;
    function gameTimeout(fn, time) {
      var to = setTimeout(function() {
        if (stopped) return;
        fn();
      }, time);
      return { clear: function() { clearTimeout(to); } };
    }
    
    var player_ground_y = 450;
    var player_x = 670;
    var grid = [ [ 0, 0, 0, 0, 0 ],
                 [ 0, 0, 0, 0, 0 ],
                 [ 0, 0, 0, 0, 0 ],
                 [ 0, 0, 0, 0, 0 ] ];
    var GRID_AREA = 20;
    var cards = 0;
    
    function mkWinner() {
      var container = new Group()
        .attr({'x': player_x});
    var img = bitmaps('player_hold').
        addTo(container)
        .attr({'width': 80, 'height': 114});
      function win(y, catImg) {
        container.attr({ 'y': y });
        catImg
          .remove()
          .addTo(container)
          .attr({'x': 0,
                 'y': 22 });
        container.animate('2s',
                          { 'y': player_ground_y },
                          { 'easing': 'bounceOut' });
      }
      
      container.win = win;
      return container;
    }

    function mkGroundCats() {
      var container = new Group();

      var cats = [];

      function goLieDown(cat) {
        var x = Math.floor(Math.random() * 550 + 100);
        var y = Math.floor(Math.random() * 40 + player_ground_y + 50);
        var o_x = cat.attr('x');
        var o_y = cat.attr('y');
        var dist = Math.sqrt((x - o_x) * (x - o_x) + (y - o_y) * (y - o_y));
        var animTimeS = Math.sqrt(dist / 260);
        if (animTimeS < 0.5)
          animTimeS = 0.5;
        cat.animate(animTimeS + 's', {'x': x, 'y': y});
        setTimeout(function replaceWithSleepCat() {
          cat.sleep();
        }, Math.floor(animTimeS * 1000));
      }

      function add(cat) {
        var pos = new Point(cat.attr('x'), cat.attr('y'));
        var spos = cat.localToGlobal(pos);
        cat.remove();
        cat.attr({'x': spos.x, 'y': spos.y});
        cat.addTo(container);
        cats.push(cat);
      }

      function animateLast() {
        goLieDown(cats[cats.length - 1]);
      }
      
      container.add = add;
      container.animateLast = animateLast;
      container.getCats = function() { return cats; };
      return container;
    }
    
    function mkCat() {
      var container = new Group();
      
      var standImg = bitmaps('cat1_stand')
        .attr({'width': 70, 'height': 104})
        .addTo(container);
      var sleepImg = bitmaps('cat1_sleep')
        .attr({'width': 70, 'height': 104});

      function sleep() {
        sleepImg.addTo(container);
        standImg.remove();
      }

      function wake() {
        standImg.addTo(container);
        sleepImg.remove();
      }

      function getBig() {
        standImg.attr({'width': 150, 'height': 224});
        sleepImg.attr({'width': 150, 'height': 224});
      }
      
      container.getBig = getBig;
      container.sleep = sleep;
      container.wake = wake;

      return container;
    }

    function mkTreeCats() {
      var container = new Group()
        .attr({'x': player_x + 3,
               'y': 35});

      var cats = [];
      for (var i = 0; i < 3; i++) {
        var cat = mkCat()
          .addTo(container)
          .attr(position(i));
        cats.push(cat);
      };

      function position(idx) {
        return [{'x': 0, 'y': 0},
                {'x': -40, 'y': -15},
                {'x': 44, 'y': -8}][idx];
      }
    
      function reposition() {
        for (var i = 0; i < cats.length; i++) {
          cats[i].animate('0.5s', position(i));
        }
      }

      function pop() {
        var popped = cats.splice(0, 1)[0];
        reposition();
        return popped;
      }
      
      container.pop = pop;
      container.empty = function() { return cats.length == 0; };

      return container;
    }
    
    function mkClimber(winY) {
      var maxY = player_ground_y;
      var y = maxY;
      var container = new Group()
        .attr({'x': player_x,
               'y': y});
      var imgs = { 'player_sit_sad': 0,
                   'player_climb_1': 0,
                   'player_climb_2': 0,
                   'player_hang': 0 };
      for (var key in imgs) {
        imgs[key] = bitmaps(key)
          .addTo(container)
          .attr({'width': 80,
                 'height': 114,
                 'opacity': 0});
      }
      imgs['player_sit_sad'].attr('opacity', 1);
      function reset() {
        y = player_ground_y;
        container.attr({'y': y});
      }
      function climb() {
        y -= difficulty.climbHeight;
        if (y <= winY) {
          y = winY;
          gameTimeout(container.onWin, 100);
        }
        imgs['player_sit_sad'].attr('opacity', 0);
        imgs['player_climb_1'].animate(new KeyframeAnimation(
          '30',
          { '0': { 'opacity': 0 },
            '7': { 'opacity': 0 },
            '8': { 'opacity': 1 },
            '15': { 'opacity': 1 },
            '16': { 'opacity': 0 },
            '23': { 'opacity': 0 },
            '24': { 'opacity': 1 },
            '29': { 'opacity': 1 },
            '30': { 'opacity': 0 } }));
        imgs['player_climb_2'].animate(new KeyframeAnimation(
          '30',
          { '0': { 'opacity': 1 },
            '7': { 'opacity': 1 },
            '8': { 'opacity': 0 },
            '15': { 'opacity': 0 },
            '16': { 'opacity': 1 },
            '23': { 'opacity': 1 },
            '24': { 'opacity': 0 } }));
        imgs['player_hang'].animate(new KeyframeAnimation(
          '30',
          { '0': { 'opacity': 0 },
            '29': { 'opacity': 0 },
            '30': { 'opacity': 1 } }));
        container.animate('30',
                          { 'y': y });
      }
      function slideDown(dy) {
        y += dy;
        if (y > maxY) {
          imgs['player_hang'].attr('opacity', 0);
          imgs['player_sit_sad'].attr('opacity', 1);
          y = maxY;
        }
        container.animate('1s',
                          { 'y': y });
      }
      container.climb = climb;
      container.reset = reset;
      container.slideDown = slideDown;
      container.getY = function() { return y };
      container.onWin = null;
      return container;
    }
    
    function card(gx, gy, id) {
      var revealed = false;
      
      function gx2x(x) {
        return 5 + x * 125;
      }
      var gy2y = gx2x;
      
      var container = new Group()
        .attr({'x': gx2x(gx),
               'y': gy2y(-1)});
      var border = new Rect(0, 0, 120, 120, 5)
        .addTo(container);
      var back = new Rect(0, 0, 120, 120, 5)
        .addTo(container)
        .attr('fillImage',
              bitmaps('back')
              .attr({'width': 120,
                     'height': 120})
             );
      var pic = bitmaps(id)
        .attr({'width': 110,
               'height': 110,
               'x': 5,
               'y': 5});
      
      function age() {
        border.animate('0.5s',
                       { 'fillColor': 'gray' });
      }
      
      function rejuvenate() {
        border.animate('0.5s',
                       { 'fillColor': 'black' });
      }
      
      function boing(show, hide) {
        var bb = container.getBoundingBox();
        container.setOrigin(bb.left + bb.width / 2,
                            bb.top + bb.height / 2);
        container.animate(new KeyframeAnimation(
          '0.2s',
          { 'from': { 'scale': 1 },
            '30%': { 'scale': 0.9 },
            '60%': { 'scale': 1.1 },
            'to': { 'scale': 1 }
          }
        ));
        gameTimeout(function() {
          hide.remove(container);
          show.addTo(container);
        }, 100);
      }
      
      function gotoGrid(gx, gy) {
        var x = gx2x(gx);
        var y = gy2y(gy);
        container.animate(
          '0.5s',
          { 'x': x,
            'y': y },
          { 'easing': 'bounceOut',
            'delay': Math.random() * 0.1 + 's'
          });
        container.gridX = gx;
        container.gridY = gy;
      }
      
      function reveal() {
        revealed = true;
        boing(pic, back);
        border.attr('fillColor', 'black');
      }
      
      function hide() {
        revealed = false;
        boing(back, pic);
      }
      
      function found() {
        border.animate('0.2s',
                       { 'fillColor': 'orange' });
      }
      
      gotoGrid(gx, gy);
      
      container.isRevealed = function() { return revealed; };
      container.gotoGrid = gotoGrid;
      container.reveal = reveal;
      container.hide = hide;
      container.age = age;
      container.rejuvenate = rejuvenate;
      container.cardId = id;
      container.found = found;
      return container;
    }
    
    var climber = mkClimber(20);
  
    var open = [];
    var pauseFlips = false;
    function flip(crd) {
      if (pauseFlips)
        return;
      climber.slideDown(difficulty.slideWrongHeight);
      if (crd.isRevealed()) {
        if (open.length == 2 && crd == open[0]) {
          var x = open[0];
          open[0] = open[1];
          open[1] = x;
          open[0].age();
          open[1].rejuvenate();
        }
        return;
      }
      while (open.length > 1)
        open.splice(0, 1)[0].hide();
      open.push(crd);
      crd.reveal();
      
      if (open.length == 2) {
        if (open[0].cardId.toString() == open[1].cardId.toString()) {
          var o0 = open[0];
          var o1 = open[1];
          o0.found();
          o1.found();
          open = [];
          gameTimeout(function() {
            grid[o0.gridY][o0.gridX] = 0;
            grid[o1.gridY][o1.gridX] = 0;
            o0.remove().destroy();
            o1.remove().destroy();
            cards -= 2;
            collapseGrid();
            repopulateIn(Math.random() * 10000);
          }, 500);
          climber.climb();
        }
      }
      
      if (open.length == 2)
        open[0].age();
    }
    
    new Rect(0, 0, stage.width, stage.height)
      .addTo(gameArea)
      .attr('fillImage', bitmaps(difficulty.background)
            .attr({'width': 800,
                   'height': 600}));
    
    var treeCats = mkTreeCats();
    treeCats.addTo(gameArea);
    var groundCats = mkGroundCats();
    groundCats.addTo(gameArea);

    climber.addTo(gameArea);
    climber.onWin = function() {
      pauseFlips = true;
      climber.remove();
      var saved = treeCats.pop();
      winner.addTo(gameArea).win(climber.getY(), saved);
      gameTimeout(function() {
        pauseFlips = false;
        groundCats.add(saved);
        if (treeCats.empty()) {
          gameArea.onWin(groundCats.getCats());
        } else {
          winner.remove();
          climber.reset();
          climber.addTo(gameArea);
          climber.climb();
          groundCats.animateLast();
        }
      }, 3000);
    };

    var winner = mkWinner();
    
    var ids = idStream();
    
    function collapseGrid() {
      for (var r=grid.length-2; r>=0; r--) {
        for (var c=0; c<grid[r].length; c++) {
          if (!grid[r][c])
            continue;
          var br = r;
          while ((br < grid.length - 1) && (grid[br+1][c] == 0))
            br = br + 1;
          if (br != r) {
            grid[r][c].gotoGrid(c, br);
            grid[br][c] = grid[r][c];
            grid[r][c] = 0;
          }
        }
      }
    }
    
    var repopulateTimeout = null;
    var repopulateTime = 0;
    function repopulateIn(ms) {
      var newTime = Date.now() + ms;
      if (repopulateTimeout) {
        if (repopulateTime < newTime)
          return;
        repopulateTimeout.clear();
      }
      repopulateTime = newTime;
      repopulateTimeout = gameTimeout(repopulate, ms);
    }

    function repopulate() {
      repopulateTimeout = null;
      if (cards < GRID_AREA) {
        var cols = [];
        for (var c = 0; c < grid[0].length; c++)
          if (grid[0][c] == 0)
            cols.push(c);
        var c = cols[Math.floor(Math.random() * cols.length)];
        var r = 0;
        while ((r < grid.length - 1) && (grid[r+1][c] == 0))
          r += 1;
        var crd = card(c, r, ids());
        cards += 1;
        crd.addTo(gameArea);
        (function(crd) {
          crd.on('multi:pointerdown', function() { flip(crd); });
        })(crd);
        grid[r][c] = crd;
      }
      
      if (cards < GRID_AREA)
        repopulateIn(Math.random() * 1000);
    }

    repopulate();

    function slideTick() {
      climber.slideDown(difficulty.slideTimeHeight);
    }

    var slideTicker = setInterval(slideTick, difficulty.slideTimeInterval);
    function stop() {
      stopped = true;
      clearInterval(slideTicker);
    }
    
    gameArea.stop = stop;
    return gameArea;
  }

  var exitBtn;
  var gameScreen, winScreen;

  function start() {
    if (!exitBtn)
      exitBtn = bitmaps('exit')
      .attr({'width': 50,
             'height': 50,
             'x': 2,
             'y': 550})
      .on('multi:pointerdown', restart);

    var d = difficultySelect()
      .addTo(stage);

    d.onSelect = function(difficulty) {
      d.destroy();
      gameScreen = mkGame(difficulty);
      gameScreen.addTo(stage);
      exitBtn.addTo(stage);

      function won(cats) {
        winScreen = mkWinScreen(cats);
        gameScreen.remove();
        exitBtn.remove();
        winScreen.addTo(stage);
        exitBtn.addTo(stage);
      }
      
      gameScreen.onWin = won;
    }
  }

  function restart() {
    if (winScreen) {
      winScreen.remove();
      winScreen.stop();
      winScreen.destroy();
    }
    if (gameScreen) {
      gameScreen.remove();
      gameScreen.stop();
      gameScreen.destroy();
    }
    setTimeout(start, 0);
  }

  mkText('Loading...').addTo(stage).attr({
    'x': 240,
    'y': 270
  });
  loadBitmaps(start);
}

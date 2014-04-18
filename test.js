bonsai.run(document.getElementById('movie'), {
  code: init,
  width: 800,
  height: 600
});

function init() {
  var player_ground_y = 440;
  var player_x = 675;
  var grid = [ [ 0, 0, 0, 0, 0 ],
               [ 0, 0, 0, 0, 0 ],
               [ 0, 0, 0, 0, 0 ],
               [ 0, 0, 0, 0, 0 ] ];
  var GRID_AREA = 20;
  var cards = 0;

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
        var nxt = Math.floor(Math.random() * 15);
        while (queue[nxt] != undefined)
          nxt += 1;
        queue[nxt] = id;
      }
      return queue.splice(0, 1);
    }
    return yieldo;
  }

  function mkWinner() {
    var container = new Group()
      .attr({'x': player_x});
    var img = new Bitmap('player_hold.png').
      addTo(container)
      .attr({'width': 80});
    function win(y, catImg) {
      container.attr({ 'y': y });
      catImg
        .remove()
        .addTo(container)
        .attr({'x': 15,
               'y': 38 });
      container.animate('2s',
                        { 'y': player_ground_y },
                        { 'easing': 'bounceOut' });
    }

    container.win = win;
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
                 'player_dance_1': 0,
                 'player_dance_2': 0,
                 'player_hang': 0 };
    for (var key in imgs) {
      imgs[key] = new Bitmap(key + '.png')
        .addTo(container)
        .attr({'width': 80,
               'opacity': 0});
    }
    imgs['player_sit_sad'].attr('opacity', 1);
    function climb() {
      y -= 50;
      if (y <= winY) {
        y = winY;
        setTimeout(container.onWin, 1000);
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
            new Bitmap('back.png')
            .attr({'width': 120,
                   'height': 120})
           );
    var pic = new Bitmap(id + '.png')
      .attr({'width': 110,
             'height': 110,
             'x': 5,
             'y': 5});

    function age() {
      border.animate('0.5s',
                     { 'fillColor': 'gray' });
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
      setTimeout(function() {
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
    container.cardId = id;
    container.found = found;
    return container;
  }

  var climber = mkClimber(20);
  
  var open = [];
  function flip(crd) {
    climber.slideDown(2);
    if (crd.isRevealed())
      return;
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
        setTimeout(function() {
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
    .addTo(stage)
    .attr('fillImage', new Bitmap('background_hard.jpg')
          .attr({'width': 800,
                 'height': 600}));

  climber.addTo(stage);
  climber.onWin = function() {
    climber.remove();
    winner.addTo(stage).win(climber.getY(), cat);
  };
  var cat = new Bitmap('cat_test.png')
    .addTo(stage)
    .attr({'width': 40,
           'x': player_x + 15,
           'y': 40});
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
      clearTimeout(repopulateTimeout);
    }
    repopulateTime = newTime;
    repopulateTimeout = setTimeout(repopulate, ms);
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
      crd.addTo(stage);
      (function(crd) {
        crd.on('multi:pointerdown', function() { flip(crd); });
      })(crd);
      grid[r][c] = crd;
    }

    if (cards < GRID_AREA)
      repopulateIn(Math.random() * 1000);
  }

  repopulate();

  function tick() {
    climber.slideDown(10);
  }

  var mainTick = setInterval(tick, 10000);
}

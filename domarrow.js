(()=>{
  function getNumberOrDef(val, def) {
    return typeof val === 'number' && !isNaN(val) ? val : def;
  }

  function isVisible(element) {
    return element && element.style.visibility !== 'hidden';
  }

  function inside(minX, minY, maxX, maxY, x1, y1) {
	  return minX <= x1 && x1 <= maxX && minY <= y1 && y1 <= maxY;
  }

  function intersectionPoint (x1, y1, x2, y2, minX, minY, maxX, maxY) {
    var min = Math.min, max = Math.max;
    var good = inside.bind(null, min(x1, x2), min(y1, y2), max(x1, x2), max(y1, y2));

    if ((x1 <= minX && x2 <= minX) || (y1 <= minY && y2 <= minY) || (x1 >= maxX && x2 >= maxX) || (y1 >= maxY && y2 >= maxY) || (inside(minX, minY, maxX, maxY, x1, y1) && inside(minX, minY, maxX, maxY, x2, y2)))
      return null;

    var m = (y2 - y1) / (x2 - x1);
    var y = m * (minX - x1) + y1;
    if (minY < y && y < maxY && good(minX, y)) return {x: minX, y:y};

    y = m * (maxX - x1) + y1;
    if (minY < y && y < maxY && good(maxX, y)) return {x: maxX, y:y};

    var x = (minY - y1) / m + x1;
    if (minX < x && x < maxX && good(x, minY)) return {x: x, y:minY};

    x = (maxY - y1) / m + x1;
    if (minX < x && x < maxX && good(x, maxY)) return {x: x, y:maxY};

    return null;
  }


  function adjustLine(from, to, line, trafo){
    var color = trafo && trafo.color || 'black';
    var W = trafo && trafo.width || 2;

    var fT = from.offsetTop + from.offsetHeight * getNumberOrDef(trafo && trafo.fromY, getNumberOrDef(trafo, 0.5));
    var tT = to.offsetTop + to.offsetHeight * getNumberOrDef(trafo && trafo.toY, getNumberOrDef(trafo, 0.5));
    var fL = from.offsetLeft + from.offsetWidth * getNumberOrDef(trafo && trafo.fromX, getNumberOrDef(trafo, 0.5));
    var tL = to.offsetLeft + to.offsetWidth * getNumberOrDef(trafo && trafo.toX, getNumberOrDef(trafo, 0.5));

    var CA   = Math.abs(tT - fT);
    var CO   = Math.abs(tL - fL);
    var H    = Math.sqrt(CA*CA + CO*CO);
    var ANG  = 180 / Math.PI * Math.acos( CO/H );

    if((fT >= tT || fL >= tL) && (tT >= fT || tL >= fL)) {
      ANG *= -1;
    }

    if (trafo && trafo.onlyVisible) {
      var arrangeFrom = intersectionPoint(fL, fT, tL, tT, from.offsetLeft, from.offsetTop, from.offsetLeft + from.offsetWidth, from.offsetTop + from.offsetHeight);
      var arrangeTo = intersectionPoint(fL, fT, tL, tT, to.offsetLeft, to.offsetTop, to.offsetLeft + to.offsetWidth, to.offsetTop + to.offsetHeight);

      if (arrangeFrom) {
        fL = arrangeFrom.x;
        fT = arrangeFrom.y;
      }
      if (arrangeTo) {
        tL = arrangeTo.x;
        tT = arrangeTo.y;
      }
      CA   = Math.abs(tT - fT);
      CO   = Math.abs(tL - fL);
      H    = Math.sqrt(CA*CA + CO*CO);
    }

    var top  = (tT+fT)/2 - W/2;
    var left = (tL+fL)/2 - H/2;

    var arrows  = [...line.getElementsByClassName('arrow')];

    var needSwap = (fL > tL || (fL == tL && fT < tT));
    var arrowFw = needSwap && isVisible(arrows[0]) && arrows[0] || !needSwap && isVisible(arrows[1]) && arrows[1];
    var arrowBw = !needSwap && isVisible(arrows[0]) && arrows[0] || needSwap && isVisible(arrows[1]) && arrows[1];
    if (arrowFw) {
      arrowFw.classList.remove('arrow-bw');
      arrowFw.classList.add('arrow-fw');
      arrowFw.style.borderRightColor = color;
    }
    if (arrowBw) {
      arrowBw.classList.remove('arrow-fw');
      arrowBw.classList.add('arrow-bw');
      arrowBw.style.borderLeftColor = color;
    }

    line.style["-webkit-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-moz-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-ms-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-o-transform"] = 'rotate('+ ANG +'deg)';
    line.style["-transform"] = 'rotate('+ ANG +'deg)';
    line.style.top    = top+'px';
    line.style.left   = left+'px';
    line.style.width  = H + 'px';
    line.style.height = W + 'px';
    line.style.background = "linear-gradient(to right, " +
      (arrowFw ? "transparent" : color) +" 10px, " +
      color + " 10px " + (H - 10) + "px, " +
      (arrowBw ? "transparent" : color) + " " + (H - 10) + "px 100%)";
  }

  function repaintConnection(connectionElement) {
    var fromQ = connectionElement.getAttribute('from');
    var fromE = document.querySelector(fromQ);
    var toQ = connectionElement.getAttribute('to');
    var toE = document.querySelector(toQ);

    var lineE = connectionElement.getElementsByClassName('line')[0];
    if (!lineE) {
      lineE = document.createElement('div');
      lineE.classList.add('line');
      connectionElement.appendChild(lineE);
    }
    var needTail = connectionElement.hasAttribute('tail');
    var needHead = connectionElement.hasAttribute('head');
    var arrows = lineE.getElementsByClassName('arrow');
    var tail = arrows[0];
    var head = arrows[1];
    if (!tail && (needHead || needTail)) {
      tail = document.createElement('div');
      tail.classList.add('arrow');
      lineE.appendChild(tail);
    }

    if (!head && needHead) {
      head = document.createElement('div');
      head.classList.add('arrow');
      lineE.appendChild(head);
    }

    tail && (tail.style.visibility = needTail ? 'visible' : 'hidden');
    head && (head.style.visibility = needHead ? 'visible' : 'hidden');

    adjustLine(fromE, toE, lineE, {
      color: connectionElement.getAttribute('color'),
      onlyVisible: connectionElement.hasAttribute('onlyVisible'),
      fromX: parseFloat(connectionElement.getAttribute('fromX')),
      fromY: parseFloat(connectionElement.getAttribute('fromY')),
      toX: parseFloat(connectionElement.getAttribute('toX')),
      toY: parseFloat(connectionElement.getAttribute('toY')),
      width: parseFloat(connectionElement.getAttribute('width'))
    });
  }

  function createOne(newElement) {
    connectionElements.push(newElement);
    repaintConnection(newElement);
    connectionObserver.observe(newElement, {attributes:true, childList:true, subtree: true});
  }

  function create() {
    bodyObserver.observe(document.body, {childList:true, subtree: true});
    [...document.body.getElementsByTagName('connection')].forEach(createOne);
  }

  function removeConnection(tag) {
    for(var i = connectionElements.length - 1; i >= 0; i--)
      if(connectionElements[i] === tag)
        connectionElements.splice(i, 1);

    connectionObserver.observe(tag, {attributeFilter: []});
  }

  function changedConnectionTag(changes) {
    changes.forEach(e => {
      var conn = e.target;
      if (conn.tagName.toLowerCase() !== 'connection' && e.attributeName === 'class')
        ;
      while (conn && conn.tagName.toLowerCase() !== 'connection')
        conn = conn.parentElement;
      if (!conn) return;
      connectionObserver.observe(conn, {attributeFilter: []});
      repaintConnection(conn);
      connectionObserver.observe(conn, {attributes:true, childList:true, subtree: true});
    });
  }

  function bodyNewElement(changes) {
    changes.forEach(e => {
      e.removedNodes.forEach(n => {
        if (n.tagName.toLowerCase() === 'connection')
          removeConnection(n);
      });
      e.addedNodes.forEach(n => {
        if (n.tagName.toLowerCase() === 'connection')
          createOne(n);
      });
    });
  }

  var connectionElements = [];
  var MutationObserver = window.MutationObserver ||
    window.WebKitMutationObserver || window.MozMutationObserver;
  var bodyObserver = new MutationObserver(bodyNewElement);
  var connectionObserver = new MutationObserver(changedConnectionTag);
  document.body && create() || window.addEventListener("load", create);
})();



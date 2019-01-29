function getNumberOrDef(val, def) {
  return typeof val === 'number' ? val : def;
}

function adjustLine(from, to, line, trafo){
	var fT = from.offsetTop + from.offsetHeight * getNumberOrDef(trafo && trafo.fromY, getNumberOrDef(trafo, 0.5));
  var tT = to.offsetTop + to.offsetHeight * getNumberOrDef(trafo && trafo.toY, getNumberOrDef(trafo, 0.5));
  var fL = from.offsetLeft + from.offsetWidth * getNumberOrDef(trafo && trafo.fromX, getNumberOrDef(trafo, 0.5));
  var tL = to.offsetLeft + to.offsetWidth * getNumberOrDef(trafo && trafo.toX, getNumberOrDef(trafo, 0.5));
  
  var CA   = Math.abs(tT - fT);
  var CO   = Math.abs(tL - fL);
  var H    = Math.sqrt(CA*CA + CO*CO);
  var ANG  = 180 / Math.PI * Math.acos( CO/H );

  var top  = (tT+fT)/2 - 1;
  var left = (tL+fL)/2 - H/2;

  if((fT >= tT || fL >= tL) && (tT >= fT || tL >= fL)) {
    ANG *= -1;
  }

  var arrows  = [...line.getElementsByClassName('arrow')];
  if (arrows.length >= 1) {
    if (fL > tL || (fL == tL && fT < tT)) {
      arrows[0].classList.remove('arrow-bw');
      arrows[0].classList.add('arrow-fw');
    } else {
      arrows[0].classList.remove('arrow-fw');
      arrows[0].classList.add('arrow-bw');
    }
  }
  if (arrows.length >= 2) {
    if (fL > tL || (fL == tL && fT < tT)) {
      arrows[1].classList.remove('arrow-fw');
      arrows[1].classList.add('arrow-bw');
    } else {
      arrows[1].classList.remove('arrow-bw');
      arrows[1].classList.add('arrow-fw');
    }
  }
  

  line.style["-webkit-transform"] = 'rotate('+ ANG +'deg)';
  line.style["-moz-transform"] = 'rotate('+ ANG +'deg)';
  line.style["-ms-transform"] = 'rotate('+ ANG +'deg)';
  line.style["-o-transform"] = 'rotate('+ ANG +'deg)';
  line.style["-transform"] = 'rotate('+ ANG +'deg)';
  line.style.top    = top+'px';
  line.style.left   = left+'px';
  line.style.width  = H + 'px';
}

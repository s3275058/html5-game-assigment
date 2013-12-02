function calculateIntersection(rect1, rect2, x, y)
{
  // prevent x|y from being null||undefined
  x = x || 0; y = y || 0;
  
  // first we have to calculate the
  // center of each rectangle and half of
  // width and height
  var dx, dy, r1={}, r2={};
  r1.cx = rect1.x+x+(r1.hw = (rect1.width /2));
  r1.cy = rect1.y+y+(r1.hh = (rect1.height/2));
  r2.cx = rect2.x + (r2.hw = (rect2.width /2));
  r2.cy = rect2.y + (r2.hh = (rect2.height/2));

  dx = Math.abs(r1.cx-r2.cx) - (r1.hw + r2.hw);
  dy = Math.abs(r1.cy-r2.cy) - (r1.hh + r2.hh);

  if (dx < 0 && dy < 0) {
    return {width:-dx,height:-dy};
  } else {
    return null;
  }
}

function calculateCollision(obj, direction, collideables, moveBy)
{
      moveBy = moveBy || {x:0,y:0};
      if ( direction != 'x' && direction != 'y' ) {
        direction = 'x';
      }
      var measure = direction == 'x' ? 'width' : 'height',
        oppositeDirection = direction == 'x' ? 'y' : 'x',
        oppositeMeasure = direction == 'x' ? 'height' : 'width',

        bounds = getBounds(obj),
        cbounds,
        collision = null,
        cc = 0;

    // for each collideable object we will calculate the
    // bounding-rectangle and then check for an intersection
    // of the hero's future position's bounding-rectangle
    while ( !collision && cc < collideables.length ) {
      cbounds = getBounds(collideables[cc]);
      if ( collideables[cc].isVisible ) {
        collision = calculateIntersection(bounds, cbounds, moveBy.x, moveBy.y);
      }

      if ( !collision && collideables[cc].isVisible ) {
        // if there was NO collision detected, but somehow
        // the hero got onto the "other side" of an object (high velocity e.g.),
        // then we will detect this here, and adjust the velocity according to
        // it to prevent the Hero from "ghosting" through objects
        // try messing with the 'this.velocity = {x:0,y:125};'
        // -> it should still collide even with very high values
        var wentThroughForwards  = ( bounds[direction] < cbounds[direction] && bounds[direction] + moveBy[direction] > cbounds[direction] ),
          wentThroughBackwards = ( bounds[direction] > cbounds[direction] && bounds[direction] + moveBy[direction] < cbounds[direction] ),
          withinOppositeBounds = !(bounds[oppositeDirection]+bounds[oppositeMeasure] < cbounds[oppositeDirection])
                    && !(bounds[oppositeDirection] > cbounds[oppositeDirection]+cbounds[oppositeMeasure]);

        if ( (wentThroughForwards || wentThroughBackwards) && withinOppositeBounds ) {
          moveBy[direction] = cbounds[direction] - bounds[direction];
        } else {
          cc++;
        }
      }
    }

    if ( collision ) {
      var sign = Math.abs(moveBy[direction]) / moveBy[direction];
      moveBy[direction] -= collision[measure] * sign;
    }

    return collision;
}

/*
 * Calculated the boundaries of an object.
 *
 * CAUTION: <rotation> OR <skew> attributes are NOT used for this calculation!
 *
 * @method getBounds
 * @param {DisplayObject} the object to calculate the bounds from
 * @return {Rectangle} The rectangle describing the bounds of the object
 */
function getBounds(obj) {
  var bounds={x:Infinity,y:Infinity,width:0,height:0};
  
  if ( obj instanceof createjs.Container ) {
    var children = object.children, l=children.length, cbounds, c;
    for ( c = 0; c < l; c++ ) {
      cbounds = getBounds(children[c]);
      if ( cbounds.x < bounds.x ) bounds.x = cbounds.x;
      if ( cbounds.y < bounds.y ) bounds.y = cbounds.y;
      if ( cbounds.width > bounds.width ) bounds.width = cbounds.width;
      if ( cbounds.height > bounds.height ) bounds.height = cbounds.height;
    }
  } else {
    var gp,imgr;
    if ( obj instanceof createjs.Bitmap ) {
      gp = obj.localToGlobal(0,0);
      imgr = {width:obj.image.width,height:obj.image.height};
    } else if ( obj instanceof createjs.BitmapAnimation ) {
      gp = obj.localToGlobal(0,0);
      imgr = obj.spriteSheet._frames[obj.currentFrame];
    } else {
      return bounds;
    }

    bounds.width = imgr.width * Math.abs(obj.scaleX);
    if ( obj.scaleX >= 0 ) {
      bounds.x = gp.x;
    } else {
      bounds.x = gp.x - bounds.width;
    }

    bounds.height = imgr.height * Math.abs(obj.scaleY);
    if ( obj.scaleX >= 0 ) {
      bounds.y = gp.y;
    } else {
      bounds.y = gp.y - bounds.height;
    }
  }

  return bounds;
}

function getWidth() {
  if( typeof( window.innerWidth ) == 'number' ) {
    return window.innerWidth;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    return document.documentElement.clientWidth;
  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
    return document.body.clientWidth;
  }
}

function getHeight() {
  if( typeof( window.innerWidth ) == 'number' ) {
    return window.innerHeight;
  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
    return document.documentElement.clientHeight;
  } else if( document.body && ( document.body.clientHeight || document.body.clientHeight ) ) {
    return document.body.clientHeight;
  }
}

	function getAngle(player, mouse) {		
		var hypotenuse = Math.sqrt(Math.pow(player['y'] - mouse['y'], 2) + Math.pow(player['x'] - mouse['x'], 2));
		var opposite = Math.abs(player['y'] - mouse['y']);
		var angle = Math.asin(opposite / hypotenuse) * (180/Math.PI);
		
		if (player['x'] > mouse['x'] && player['y'] > mouse['y']) {
			angle = 90 + angle;
		} else if (player['x'] < mouse['x'] && player['y'] > mouse['y']) {
			angle = 270 - angle;
		} else if (player['x'] < mouse['x'] && player['y'] < mouse['y']) {
			angle = 270 + angle;
		} else {
			angle = 90 - angle;
		}
		
		return angle;
	};

	
	function getMousePos(stage, evt) {
		
        var rect = stage.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
      }
	  
	function collide(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(((x1 + w1 - 1) < x2) ||
             ((x2 + w2 - 1) < x1) ||
             ((y1 + h1 - 1) < y2) ||
             ((y2 + h2 - 1) < y1))
  }

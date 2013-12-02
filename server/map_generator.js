var 
    map         = module.exports, 
    MAP_WIDTH   = 30, 
    MAP_HEIGHT  = 15;

//  ground = 0, fixed tree = 1, random tree = 2, spawn point = 3
var template1 = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 3, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 2, 2, 2, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 2, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
    [1, 0, 2, 2, 2, 2, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 3, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

// Get a random template for map generation
function getTemplate() {
    var 
        list = [template1], 
        ind = Math.floor(Math.random() * list.length);
    
    return list[ind];
};

// Set tiles according to template (including random trees and spawn points)
function setTiles(template, map, MAX_PLAYER) {
    var spawnPoints = [new Array(), new Array()]; // 2 lists of spawn points [player, monster]
    
    for (var i = 0; i < MAP_HEIGHT; i++) {
        for (var j = 0; j < MAP_WIDTH; j++) {
            var 
                val, 
                value = template[i][j];
            
            if (value == 2) {
                // Random tiles for trees
                val = Math.floor(Math.random() * 2);
            } else if(value == 3) {
                var p   = spawnPoints[0];
                var mon = spawnPoints[1];
                
                if (p.length == MAX_PLAYER) {
                    val = 4;
                    mon.push([i, j]);
                } else if (mon.length == MAX_PLAYER) {
                    val = 3;
                    p.push([i, j]);
                } else {
                    val = Math.floor(Math.random() * 2) + 3;
                    if (val == 3) {
                        p.push([i, j]);
                    } else {
                        mon.push([i, j]);
                    }
                }
                
                val = 0;
            } else {
                val = parseInt(value);
            }
            
            map[i][j] = val;
        }
    }
    
    //~ console.log(spawnPoints);
    
    return spawnPoints;
};

function createMapArray(width, height) {
    var arr = new Array(height);
    
    for (var i = 0; i < height; i++) {
        arr[i] = new Array(width);
    }
    
    return arr;
};

// Generate two maps:
// - map: for rendering game map
// - path: for pathfinding
map.generateMaps = function(MAX_PLAYER) {
    var 
        template    = getTemplate(),  
        newMap      = createMapArray(MAP_WIDTH, MAP_HEIGHT), 
        spawnPoints = setTiles(template, newMap, MAX_PLAYER);        
    
    return {map: newMap, spawn: spawnPoints};
};

Util.info(__filename + " loaded.");

GLOBAL.rooms = {};

var saveRoom = function(room) {
  var r = rooms[room];

  delete  r.players;
  delete r.mobs;

  var json = JSON.stringify(r);

  var query = "INSERT INTO rooms (vnum, name, area, room) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE room=?;";
  db.query(query, [room, r.name, r.area, json, json]);
};

var loadRoom = function(vnum) {
  var query = "SELECT room, name, area FROM rooms WHERE vnum=?;";
  db.query(query, [ vnum], function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error loading room # " + vnum);
      return;
    }

    for ( var i in rows ) {

      rooms[vnum] = new includes.Room(vnum);//newRoom(vnum);
      rooms[vnum].vnum = vnum;
      if ( rows[i].room == undefined )
        continue;

      Util.debug( "Room Info #"+vnum+ " " +  rows[i].room );

      if ( rows[i].room.length != 0 )
      {
        var json = JSON.parse(rows[i].room);
        for ( var x in json )
        {
          rooms[vnum][x] = json[x];
        }
//        rooms[vnum] = JSON.parse(json);
      }

     rooms[vnum].name = rows[i].name;
      rooms[vnum].area = rows[i].area;
    }

  });
};

var saveRooms = function() {
};

var loadRooms = function() {
  Util.debug("Loading all rooms.");
  var query = "SELECT vnum FROM rooms WHERE 1";
  db.query(query, function (err, rows, field) {
    if (err) throw err;
    if ( rows.length == 0 )
    {
      Util.error("Error: No rooms Found");
      return;
    }
    for ( var i in rows ) {
      loadRoom( rows[i]. vnum );
    }
  });

};

var playerToRoom = function(plr, room) {
  if ( room == -1 )
    room = 1;

 Util.debug("Adding " + plr.name + " to room " + room);

 async.waterfall([
     function(callback) {

  if ( character.room != -1 )
    playerFromRoom(plr);

  if ( rooms[room].in_room == undefined )
    rooms[room].in_room = [];

  callback(null,callback);
     },
     function (arg, callback) {
        rooms[room].in_room.push(plr);// = plr.name;
//        Util.debug("In Room: (to room) " + rooms[room].in_room);
        plr.room = room;
        callback(null,callback);
     },
     function (arg,callback) {
       if ( plr.player.state == 4 )
        Util.msgroom( room, plr.name + " has arrived.", plr.name);
       else
        Util.msgroom( room, plr.name + " materializes in a bright flash.", plr.name);

       Util.debug("Plr " + plr.name + " - In Room " + plr.room + " : " + rooms[plr.room].name);

        callback(null,callback);
     }], function(err, results ) {
       
     });

};

var playerFromRoom = function(plr) {
  var vnum = plr.room;
//  var id = player[plr.id].id;

  Util.debug("Plr: " + plr.name + " Room: " + plr.room);

  if ( !rooms[vnum] ) {
    Util.debug("Char being removed from invaild room");
    return;
  }

  Util.debug( "Room: " + vnum + " ID: " + plr.name + " Players: " + rooms[vnum].in_room);

  var x = rooms[vnum].in_room.indexOf(plr);
  rooms[vnum].in_room.splice(x,1);
//  delete rooms[vnum].players[id];

  plr.room = -1;
  Util.debug("Player removed from room.");
};

module.exports.loadRooms = loadRooms;
module.exports.saveRoom = saveRoom;
module.exports.playerToRoom = playerToRoom;
module.exports.playerFromRoom = playerFromRoom;

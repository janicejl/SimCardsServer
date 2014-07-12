
var io;
var gameSocket;

var connected_players = 0;
var playing = [true, true, true, true];
var turn_num = 0;

var game_valid = false;

exports.initGame = function(sio, socket) {
  io = sio;
  gameSocket = socket;
  console.log("emit connected, id: " + connected_players);
  gameSocket.emit('connected', { player_id : connected_players} );
  connected_players = connected_players + 1;

  if (connected_players == 4) {
    console.log("emit gameFull");
    gameSocket.emit('gameFull');
    gameSocket.broadcast.emit('gameFull');
  }

  gameSocket.on('dealedCards', dealed_cards);
  gameSocket.on('playerMove', player_move);
  gameSocket.on('noMove', no_move);
  gameSocket.on('gameOver', game_over);

};

function dealed_cards(hands) {
  console.log("received dealedCards " + hands);
  game_valid = true;
  console.log("emit gameStart.");
  gameSocket.emit('gameStart', hands);
  gameSocket.broadcast.emit('gameStart', hands);

  // send first player player turn.
  console.log("emit playerTurn " + (turn_num % 4));
  gameSocket.emit('playerTurn', {player_id: turn_num % 4});
  gameSocket.broadcast.emit('playerTurn', {player_id: turn_num % 4});
}

function player_move(card) {
  console.log("received playerMove " + card);
  console.log("emit movePlayed " + card);
  gameSocket.emit('movePlayed', card);
  gameSocket.broadcast.emit('movePlayed', {player_id: turn_num % 4,
                            card: card});
  if (game_valid) {
    get_next_valid_turn();
    console.log("emit playerTurn " + (turn_num % 4));
    gameSocket.emit('playerTurn', {player_id: turn_num % 4});
    gameSocket.broadcast.emit('playerTurn', {player_id: turn_num % 4});
  }
}

function no_move() {
  console.log("received no move");
  console.log("emit playerDied " + (turn_num % 4));
  gameSocket.emit('playerDied', {player_id: turn_num % 4});
  gameSocket.broadcast.emit('playerDied', {player_id: turn_num % 4});
  playing[turn_num % 4] = false;
  if (game_valid) {
    get_next_valid_turn();
    console.log('emit playerTurn ' + (turn_num % 4));
    gameSocket.emit('playerTurn', {player_id: turn_num % 4});
    gameSocket.broadcast.emit('playerTurn', {player_id: turn_num % 4});
  }
}

function get_next_valid_turn() {
  turn_num = turn_num + 1;
  while(playing[turn_num % 4] === false) {
    turn_num = turn_num + 1;
  }
}

function game_over() {
  // reset everything.
  game_valid = false;
  connected_players = 0;
  turn_num = 0;
  playing = [true, true, true, true];
}

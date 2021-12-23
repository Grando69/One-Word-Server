/**
 * @param { number } lenght
 * @returns { string } Id
 */
function makeId(lenght) {
  var result = "";
  var characters =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789";

  for (var i = 0; i < lenght; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
/**
 *
 * @param { string[] } players
 * @param { string } currentPlayer
 * @returns { string } nextPlayer
 */
function calculateNextTurn(players, currentPlayer) {
  // if (!(currentPlayer in players)) return;
  if (currentPlayer < players.length)
    return (parseInt(currentPlayer) + 1).toString();
  else if (currentPlayer == players.length) return "1";
}

// Write a function that removes a number from an array and adjust the rest of the array
/**
 *
 * @param {number[]} array
 * @param {number} number
 * @returns {number[]} array
 */
function removeNumber(array, number) {
  var index = array.indexOf(number);
  if (index > -1) {
    array.splice(index, 1);
  }

  array.forEach((element) => {
    if (element > number) array[array.indexOf(element)] -= 1;
  });

  return array;
}

module.exports = {
  makeId,
  calculateNextTurn,
  removeNumber,
};

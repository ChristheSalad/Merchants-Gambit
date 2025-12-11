# Merchant's Gambit

A 2-player turn-based strategy game where players compete to reach the opponent's castle.

## How to Play

Each player rolls a die and the highest number goes first and places their castle piece first. 

Both players start with a castle piece that are placed on opposite sides of the board. They can be placed anywhere along their respective row.

Each player will take turns either building a road, traveling down a single road piece connected to their castle, or attacking an enemy road (edge).

- You can only build a road connecting to your current player piece.
- You can only attack a road within a 1 block distance from the opponents current player piece.
- For every attack action, there is a 3 turn cooldown
- Building or traversing is available on every turn
- Attacking a road edge will render it unusable for the remainder of the game.
- there must exist SOME path from castle to castle, if attacking a road makes it so that there is NO path then that attack is not valid.
- Attacks are on the specific edges of a tile instead of the entire tile itself. For example, there are 4 edges on any given tile, if you attack one side, there are still 3 other edges that the enemy can traverse from.
- Roads built by the enemy can be traversed if it connects to your road
- In the instance that both players are on the same road, they will commence in a battle
- The player who initiated the battle (the one who moved onto the road) will gain a +1 to their dice roll. Then both players will roll a die, whoever rolls the highest numbers wins and they will gain an additional move (build, move, or attack) at no cost of a turn.

## Technologies Used

- HTML
- CSS
- JavaScript

## How to Run

1. Clone the repository.
2. Open the `index.html` file in your web browser.

## Additional possible cosmetics
1. all tiles are grass until built on
2. grass tiles turn into dirt roads when built
3. attacked tiles become visible blocked
4. castle walls surrounding the entire board
5. background of board should be some themed background of medevial times
6. change player convoy into some carraige or something
7. change castle into real castle

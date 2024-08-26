# Epic Grid Clash 

## Objective
Develop a turn-based 5x5 board game where two players compete using 5 pieces each: 3 pawns (P1, P2, P3), 1 Hero1 (H1), and 1 Hero2 (H2). This project was developed as part of the ```HitWicket Software Engineer assignment```.
## Game Rules 📜

1. **Piece Movement:**
   - **Pawn (P1, P2, P3):** Moves one block in any direction (L, R, F, B).
   - **Hero1 (H1):** Moves exactly two blocks in any straight direction (L, R, F, B) and captures opponent pieces.
   - **Hero2 (H2):** Moves exactly two blocks diagonally (FL, FR, BL, BR) and captures opponent pieces.

2. **Player Interaction:**
   - Players will take turns selecting a piece and move it using the following commands:
     - **F** (Forward)
     - **L** (Left)
     - **B** (Backward)
     - **R** (Right)
     - **FL** (Forward-Left)
     - **FR** (Forward-Right)
     - **BL** (Backward-Left)
     - **BR** (Backward-Right)
   - Each move will be executed, and the board will be updated accordingly.

3. **Turn Exchange:**
   - Players will alternate turns, with one turn per player.

4. **Board Updates and Captures:**
   - The board will be updated after each valid move.
   - Captures will be handled if an opponent's piece is in the path of a Hero piece's movement.

5. **Move History:**
   - A move history will be maintained and displayed during the game. (e.g., "Player A moved P1 Forward").

## Technologies

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js with Express
- **Communication:** WebSockets

# Setup and Run Instructions

## Server Setup 🚀

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/17kowshik/KOWSHIK-21BCE7146
   ```

2. **Navigate to the Project Directory:**

    ```bash
    cd <project-directory>
    ```
3. **Install Dependencies:**

   ```bash
   npm install
   ```

4. **Start the Server:**

   ```bash
   node server.js
   ```

The server will start and listen on port 8080 by default. You can access it at http://localhost:8080.

## Client Setup 🖥️
### Frontend Files:

I placed the frontend files (HTML, CSS, JavaScript) in the Client directory.

### Accessing the Game:

Open a web browser and navigate to http://localhost:8080 to start the game.

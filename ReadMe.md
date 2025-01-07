# Shahrazad
A table top simulator named after the card and character [Shahrazad](https://en.wikipedia.org/wiki/Scheherazade), from *"One Thousand and One Nights."*

## Goals
 - Be FAST!
 - Be extremely fast to create and join games (auth should not be necessary)
 - Be memory efficient on backend and frontend
 - Be opinionated in UX design, design to play one game and one game well.

## Stack
frontend: Next.js + Rust wasm

backend: Rust 

### **State**
The state machine to handle the game logic is written in a shared rust lib.
It is compiled natively on the server and runs as a wasm pkg on client.
In this way server updates and optimistic client updates are running the same code.

State transformations are handled in wasm and rendered in react on the frontend.
State is updated within a game lobby using websockets.
For non-colliding moves, the server only sends the action over the socket not the full game state. 
This keeps socket packets small, though a global state is always managed on the server and is retrieved when reconnecting or resolving race conditions.

### **Rendering**
Everything is HTML, not a canvas.
Card data is rendered and cached using [react-scrycards](https://github.com/LiamS-H/react-scrycards), which fetches the data from the [Scryfall api](https://scryfall.com/docs/api).
Card data is not stored on the server or in the game state. Instead only card identifiers are stored in the state which are then used to retrieve cards on client. 

### **DND**
Drag and drop is powered by [dnd-kit](https://dndkit.com/).

## Game Board Design
Here is an *optimistic* feature set for what shahrazad could be.
(?) = considering
1. **Zones & Layouts**  
   - Separate land and spell zones: lands resolve in a land section, bottom left; artifacts/enchantments bottom right. (Debate about mirrored view vs. standard orientation for opponents)  
   - Auras attach to cards based on aura typing.  
   - Attached cards are rendered inside the same draggable component, reflecting context state.  
   - Cards overlap in a top-down order to avoid occupying the same space.  
   - Stack: shared re-arrangeable list, cards played to the stack or board.  
   - Cards track abilities like haste, flying, vigilance, and prompt corrections when inconsistencies arise. (weak enforcement, just reminders) ie. "did you mean to tap that, it has vigilance"
   - Land borders reflect mana colors usage (similar to Arena).  
   - View mode options: either long bottom with three players on top (combat mode) or 4 players in a grid like MTGO.
   - Accessing zones in a large view such as clicking on graveyard, or a trigger, applies gray scale to the rest of the board to highlight the selection
   - Make certain zones hidden when empty (like command or impulse draw)
   - impulse draw zone next to hand - prompts user to move to exile at end of turn (could have two type for eot and eont)

2. **Card Interactions & Visuals**  
   - Stack items can target board objects; hovering shows a black-and-white view except for the target.  
   - Board elements can add actions to the stack.  
   - (?) When a targeted stack item resolves, controllers are prompted to destroy/exile their cards.
   - Cards resolve straight to graveyard, exile, or other zones (instants/sorceries).  
   - Combat phases have designated attacker/blocker zones for clarity.  
   - Automatic tracking of summoning sickness; unobtrusive visual effect for creatures without haste.  
   - Compact board views, clumping for tokens/duplicate cards.  
   - (?) 3D board perspective with distant objects appearing smaller for a real-table feel.  

3. **Combat & Game History**  
   - History displayed concisely like Hearthstone; actions of the same type are bunched together.  
   - History sidebar consolidates turns; hovering over a player shows detailed stats (lands this turn, storm count).  
   - Undo system with crtl+Z for actions unless another player’s action intervenes.
   - History allows rollback to a point of interaction for priority checking.
   - Combat cleanup allows for easy removal of creatures that died; optional exile symbol.

4. **Automation & Game Logic**  
   - Fetch lands, Cascade, Discover, and other complex mechanics (like land tutors) are automated using OTAG card database or hard-coded values.  
   - MTGA’s 3-phase system enforced (1 phase for when no creatures are present).  
   - Game stops can be enabled table-wide, particularly for complex interactions (e.g., Teferi’s Puzzle Box).  
   - Instants/sorceries resolve directly to graveyard/exile and prompt shuffle or custom zones if necessary.  
   - Automation for complex mechanics hidden under special action tabs (e.g., Cascade, Discover).  
   - Features like “Mill until,” “Bottom until,” “Exile until,” and Scry/Surveil are automated in a separate interface.

5. **Customization & UI**  
   - Players select colors for avatar, play space, and card border for consistency.  
   - Playmats support compact views with “summaries” of positions, combining like cards (e.g., tokens, basics).  
   - Custom card hovering behavior, possibly triggered by clicking and holding instead of just hovering.  
   - Card duplication handled efficiently, with count displayed in deck view.  

## Potentially More Trouble Than Worth
1. **Undo & Stack**  
   - Undoing another player’s action places it back on the stack, enabling a priority check.
   - Undo system considers deck object with known cards; shuffling maintains known deck states.

2. **Trigger & Binding System**  
   - Triggers can be bound to actions, both before and after effects (e.g., Narset stopping draws or Orcish Bowmasters).  
   - Repeated trigger patterns learned and offered for automatic binding.  
   - Bound triggers tracked in a list similar to the stack, revealed upon hover.  
   - Context-sensitive actions scan bind lists for potential triggers.

3. **AI & UX Enhancements**  
   - Game histories stored on a server, training models to predict player actions and reduce UI interaction. ie. "players always do x after y, this becomes the default."
   - Players can write simple scripts to describe card interactions, gradually improving UX.  

4. **Mobile View**  
   - Mobile view supports horizontal play, with decks/gy shifted to a sidebar.  
   - Special minification of cards in mobile view.
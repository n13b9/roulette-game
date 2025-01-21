import { WebSocket } from "ws";
import { Number, OutgoingMessages } from "../../../packages/common/src/types";
import { User } from "./User";
import { GameManager } from "./GameManager";

let ID = 1;

export class UserManager {
  private _users: { [key: string]: User } = {};
  private static _instance: UserManager;

  private constructor() {}

  public static getInstance() {
    if (!this._instance) {
      this._instance = new UserManager();
    }

    return this._instance;
  }

  addUser(ws: WebSocket, name: string, isAdmin: boolean) {
    let id = ID;
    const user = new User(id, name, ws, isAdmin);
    this._users[id] = user;
    user.send({
      type: "current-state",
      state: GameManager.getInstance().state,
    });
    ws.on("close", () => this.removeUser(id));
    ID++;
  }

  removeUser(id: number) {
    delete this._users[id];
  }

  /*
   * Broadcast messsage to everyone who has joined the game
   */
  broadcast(message: OutgoingMessages, id?: number) {
    Object.keys(this._users).forEach((userId) => {
      const user = this._users[userId] as User;
      if (id !== user.id) {
        user.send(message);
      }
    });
  }

  won(id: number, amount: number, output: number) {
    console.log("won");
    this._users[id]?.won(amount, output);
  }

  lost(id: number, amount: number, output: number) {
    console.log("lost");
    this._users[id]?.lost(amount, output);
  }

  flush(output: Number) {
    Object.keys(this._users).forEach((userId) => {
      const user = this._users[userId] as User;
      user.flush(output);
    });
  }
}

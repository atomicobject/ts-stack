import * as State from "../state";
import { ActionTypeKeys, ActionTypes } from "client/actions";

export function rootReducer(
  state: State.Type = State.DEFAULT,
  action: ActionTypes
): State.Type {
  switch (action.type) {
    case ActionTypeKeys.SET_POPULARITY:
      return State.popularityMode.set(state, action.popularityMode);

    default:
      return state;
  }
}

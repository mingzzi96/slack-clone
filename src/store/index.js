import { combineReducers } from "redux";
import userReducer from "./userReducer";
import channelReducer from "./channelReducer";
import themeReducer from "./themeReducer";

const rootReducer = combineReducers({
    user: userReducer,
    channel: channelReducer,
    theme: themeReducer
})

export default rootReducer;
import { combineReducers } from 'redux';
import auth from './auth';
import menu from './menu';
import dic from './dic';

const rootReducer = combineReducers({
  auth,
  menu,
  dic
});

export default rootReducer;

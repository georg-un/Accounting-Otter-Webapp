import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromCore from "./reducers/core.reducer";
import * as fromLayout from "./reducers/layout.reducer";
import { AppState } from "./states/app.state";

export const reducers: ActionReducerMap<AppState> = {
  core: fromCore.reducer,
  layout: fromLayout.reducer
};


export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];
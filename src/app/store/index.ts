import {
  ActionReducerMap,
  MetaReducer
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromCore from "./reducers/core.reducer";
import { AppState } from "./states/app.state";

export const reducers: ActionReducerMap<AppState> = {
  core: fromCore.reducer
};


export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];

import {configureStore,createSlice,type PayloadAction} from '@reduxjs/toolkit';
import type {AppState} from '../domain/types';
const initial={} as AppState;
const slice=createSlice({name:'app',initialState:initial,reducers:{replace:(_s,a:PayloadAction<AppState>)=>a.payload}});
export const {replace}=slice.actions;
export const store=configureStore({reducer:slice.reducer});
export type RootState=ReturnType<typeof store.getState>;export type AppDispatch=typeof store.dispatch;

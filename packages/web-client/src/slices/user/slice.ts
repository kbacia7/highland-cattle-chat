import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { get, set } from "idb-keyval";

import {
  USER_ID_KEY_ITEM_NAME,
  DISPLAY_NAME_KEY_ITEM_NAME,
  EMAIL_KEY_ITEM_NAME,
  PROFILE_PICTURE_KEY_ITEM_NAME,
} from "@utils/localStorage";

type State = {
  userId?: string;
  displayName?: string;
  email?: string;
  profilePicture?: string;
};

const loadUserState = async () => ({
  userId: await get(USER_ID_KEY_ITEM_NAME),
  displayName: await get(DISPLAY_NAME_KEY_ITEM_NAME),
  email: await get(EMAIL_KEY_ITEM_NAME),
  profilePicture: await get(PROFILE_PICTURE_KEY_ITEM_NAME),
});

const initialState: State = await loadUserState();

export const loadUserAccountSettingsFromIDB = createAsyncThunk(
  "loggedUser/loadUserIdFromIDB",
  async () => loadUserState(),
);

export const saveUserAccountSettingsToIDB = createAsyncThunk(
  "loggedUser/saveUserIdToIDB",
  async (state: State) => {
    await set(USER_ID_KEY_ITEM_NAME, state.userId);
    await set(DISPLAY_NAME_KEY_ITEM_NAME, state.displayName);
    await set(EMAIL_KEY_ITEM_NAME, state.email);
    await set(PROFILE_PICTURE_KEY_ITEM_NAME, state.profilePicture);

    return state;
  },
);

const userSlice = createSlice({
  name: "loggedUser",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        loadUserAccountSettingsFromIDB.fulfilled,
        (_state, action) => action.payload,
      )
      .addCase(
        saveUserAccountSettingsToIDB.fulfilled,
        (_state, action) => action.payload,
      );
  },
});

export default userSlice.reducer;

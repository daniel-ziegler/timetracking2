import * as R from "remeda";
import { Outlet, useNavigate } from "solid-app-router";
import { Toaster } from "solid-headless";
import {
  Accessor,
  Component,
  createContext,
  For,
  onMount,
  Setter,
  Show,
  useContext
} from "solid-js";
import { createStore } from "solid-js/store";
import { BulkRename } from "./components/BulkRename";
import { LabelEditContextMenu } from "./components/LabelEdit";
import { SyncState } from "./components/SyncState";

import { EntriesProvider, useEntries } from "./context/EntriesContext";
import { UserProvider } from "./context/UserContext";
import { debug } from "./lib/util";
import { defaultCalendarState } from "./pages/Calendar";
import { defaultReportState } from "./pages/Report";
import { defaultTrackState } from "./pages/Track";

const defaultUIState = {
  track: defaultTrackState,
  report: defaultReportState,
  calendar: defaultCalendarState,
};

const UIState = createStore(defaultUIState);

const UIStateContext = createContext(UIState);

export function useUIState<T>(...path): [get: Accessor<T>, set: Setter<T>] {
  const [UIState, setUIState] = useContext(UIStateContext);
  // @ts-ignore
  const cursor: Accessor<T> = () => R.pathOr(UIState, path, "error");
  // @ts-ignore
  const setCursor: Setter<T> = (...args: any[]) => setUIState(...path, ...args);
  return [cursor, setCursor];
}

const App: Component = () => {
  const navigate = useNavigate();
  onMount(() => {
    document.addEventListener("keydown", (e) => {
      if (e.altKey) {
        e.code === "Digit1" && navigate("/track");
        e.code === "Digit2" && navigate("/report");
        e.code === "Digit3" && navigate("/calendar");
        e.code === "Backquote" && navigate("/");
      }
    });
  });

  return (
    <UserProvider>
      <EntriesProvider>
        <UIStateContext.Provider value={UIState}>
          <Show when={debug}>
            <SyncState />
          </Show>
          <Outlet />
          <LabelEditContextMenu />
          <BulkRename />
          <Toaster class="fixed right-4 bottom-4">
            <div class="text-sm">
              <For each={useEntries().history.filter(({ show }) => show())}>
                {({ event, type }) => (
                  <div class="capitalize">
                    <span>{type}</span>{" "}
                    <span class="text-gray-500">({event})</span>
                  </div>
                )}
              </For>
            </div>
          </Toaster>
        </UIStateContext.Provider>
      </EntriesProvider>
    </UserProvider>
  );
};

export default App;

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** False during SSR/hydration, true afterwards. Avoids the setState-in-effect "mounted" pattern. */
export function useMounted() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

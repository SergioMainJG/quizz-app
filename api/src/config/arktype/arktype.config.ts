import { configure } from "arktype/config";

configure({
  onUndeclaredKey: "delete",
});

declare global {
  interface ArkEnv {
    meta(): {
      writeOnly?: boolean;
      readOnly?: boolean;
    };
  }
}

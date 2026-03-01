import {
  staticClasses,
  Unregisterable,
} from "@decky/ui";
import {
  callable,
  definePlugin,
} from "@decky/api"
import { LuSunMoon } from "react-icons/lu";
import { localizationManager } from "./i18n";

const BRIGHTNESS_DELTA = 0.01;

let lastBrightness = 1.;
let unregisterBrightnessCallback: Unregisterable | null = null;

const backendSetBrightness = callable<[number], void>("set_brightness");
const backendReset = callable<[], void>("reset");
const backendActivate = callable<[], void>("activate");

const clampBrightness = (value: number) => Math.min(Math.max(value, 0.), 1.);

const setBrightness = (value: number) => {
  value = clampBrightness(value);
  console.log(`Setting brightness to ${value}`);
  lastBrightness = value;
  backendSetBrightness(value);
};

const onBrightnessChangedCallback = (value: { flBrightness: number; }) => {
  const brightness = value.flBrightness;
  console.log(`Brightness changed to ${brightness}`);
  lastBrightness = brightness;
  setBrightness(lastBrightness + BRIGHTNESS_DELTA);
}
const setShortcutControl = (enabled: boolean) => {
  if (enabled && unregisterBrightnessCallback === null)
    unregisterBrightnessCallback =
      window.SteamClient.System.Display.RegisterForBrightnessChanges(onBrightnessChangedCallback);
  else if (!enabled && unregisterBrightnessCallback !== null) {
    backendReset();
    unregisterBrightnessCallback.unregister();
    unregisterBrightnessCallback = null;
  }
}

function Content() {
  return (
    <>
    </>
  );
};

export default definePlugin(() => {
  localizationManager.init();
  backendActivate();
  setShortcutControl(true);

  return {
    // The name shown in various decky menus
    name: "Dimmer DeckSight",
    // The element displayed at the top of your plugin's menu
    titleView: <div className={staticClasses.Title}>Dimmer DeckSight</div>,
    // The content of your plugin's menu
    content: <Content />,
    // The icon displayed in the plugin list
    icon: <LuSunMoon />,
    onDismount() {
      setShortcutControl(false);
    },
  };
});

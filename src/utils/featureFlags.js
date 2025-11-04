import Constants from "expo-constants";

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value === 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "n", "off"].includes(normalized)) {
      return false;
    }
  }

  return false;
};

const hideComingSoonFeaturesFlag = normalizeBoolean(
  Constants.expoConfig?.extra?.hideComingSoonFeatures
);

export const shouldHideComingSoonFeatures = () => hideComingSoonFeaturesFlag;

export const shouldShowComingSoonFeatures = () => !hideComingSoonFeaturesFlag;

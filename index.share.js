import { AppRegistry } from "react-native";

// could be any component you want to use as the root component of your share extension's bundle
import IOSShareExtension from "./components/ios-share-extension";

// IMPORTANT: the first argument to registerComponent, must be "shareExtension"
AppRegistry.registerComponent("shareExtension", () => IOSShareExtension);

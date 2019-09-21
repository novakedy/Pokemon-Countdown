import { AppRegistry } from "react-native";
import { YellowBox } from "react-native";

import App from "./src/App";

YellowBox.ignoreWarnings(["Warning: componentWillReceiveProps"]);

AppRegistry.registerComponent("PokemonCountdown", () => App);

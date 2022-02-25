// Constants
import { Alert } from 'react-native' ;

export const defaultEtdrsScale = {
    "4/40": 0.1,
    "4/32": 0.13,
    "4/25": 0.16,
    "4/20": 0.2,
    "4/16": 0.25,
    "4/12.5": 0.32,
    "4/10": 0.4,
    "4/8": 0.5,
    "4/6.3": 0.63,
    "4/5": 0.8,
    "4/4": 1,
    "3/4": 1.33
};

export const defaultTargetLines = "5";

export const defaultQrSize = "3";


export function showAlert(
    message,
    onPress,
    moreButtons = [],
    title = "Configuration de la tablette"
) {
    Alert.alert(title, message, [
        ...moreButtons,
        {
            text: "OK",
            onPress
        }
    ]);
}

// Dictionnaire
export const lettersDict = {

    a:["Ah", "ah", "A", "à", "a", "Ah"],
    b:["B", "b", "baie", "Bay", "beh"],
    c:["c'est", "C'est", "c' est", "Seth", "s'est", "c'est"],
    d:["dès", "des", "D", "Dès", "dès"],
    e:["e"],
    f:["f", "F", "œuf", "éph", "eff", ""],
    g:["j'ai", "G", "g", "J'ai", "j' ai", "j'ai"],
    h:["H", "h", "Ash", "hache", "ash", "H"],
    i:["i"],
    j: ["J", "j", "j'y", "ji", "GIE"],
    k: ["K", "caca", "CAC", "k", "cas"],
    l: ["elle", "Elle", "L", "el", "l", "elle"],
    m: ["M", "m", "em", "aime", "Hem", "M"],
    n : ["n", "N", "haine", "and", "ène", "n"],
    o :["o"],
    p :["p"],
    q :["cul", "Q", "cu", "q", "qq", "cul"],
    r :["r"],
    s: ["s", "S", "est-ce", "Ace", "où est-ce", ""],
    t :["t"],
    u :["u"],
    v :["v"],
    w: ["W", "w", "EW", "WP", "W"],
    x: ["X", "XX", "x", "IKKS", "xx", "X"],
    y: ["y", "Y", "îles grecques", "Isaac", ""],
    z: ["z", "Z", "Zed", "Zedd", "ZZ", "z"]
};

import React, { Component } from 'react'
import { Text, StyleSheet, View, PermissionsAndroid, Image, TouchableOpacity, Dimensions, PixelRatio, Animated } from 'react-native'
import { Permissions } from 'expo'
import Voice from "@react-native-voice/voice";
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import { getId, getTargetLines, getAcuites, } from '../src/utils/asyncFunctions';
import { checkScoreAndSend } from '../src/utils/mailFunctions';
import { showAlert, mailEnum, lettersDict } from '../src/utils/config';
import { styles as common } from '../src/styles/common';
import { getDistance } from '../src/utils/dbFunctions';
import Tts from 'react-native-tts';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { check } from 'react-native-permissions';
import { TestResult } from './TestResult';
import { addLetter,getLetter, getLetterID, updateLetter } from '../src/utils/dbFunctions';


const numberOfLetterByLine = 5;

const letters = "azertyuiopqsdfghjklmwxcvbn";
var uid = null;
var idx = -1;
const screenFactor = (160 * PixelRatio.get()) / 2.54;
/**
 * Gets font size for current line
 * @param {number} lineCoefficient acuité visuelle
 * @param {number} d distance en m
 */
const getLineLength = (lineCoefficient, d) =>
    Math.floor((screenFactor * 5 * 0.291 * d) / (10 * lineCoefficient));

const mic_on = require("../assets/mic_on.png");
const mic_off = require("../assets/mic_off.png");

// TODO: le faire en bon js...
function intersection(array, letter) {
    for (const el of array) {
        if (lettersDict[letter].includes(el)) {
            return true;
        }
    }
    return false;
}
export default class TestLetters extends Component {
    constructor(props) {
        super(props);
        Voice.onSpeechStart = this.onSpeechStart;
        Voice.onSpeechRecognized = this.onSpeechRecognized;
        Voice.onSpeechEnd = this.onSpeechEnd;
        Voice.onSpeechError = this.onSpeechError;
        Voice.onSpeechResults = this.onSpeechResults;
        Voice.onSpeechPartialResults = this.onSpeechPartialResults;
        Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;

        this.state = {

            //State de gestion de la reconnaissance vocal
            recognized: false,
            pitch: '',
            error: '',
            end: false,
            started: false,
            results: [],
            partialResults: [],
            statusVoice: null,

            //Variables stateCar le prof est de l'etat du test :
            hasPressedStart: false,
            hasStarted: false,
            hasEnded: false,
            isPaused: false,

            //Variables nécessaires pour le déroulement du test
            letterCount: 0,
            lineNumber: 0,
            targetLines: null,
            errorsInLine: 0,
            letter: '',

            wellPlaced: true,
            id: null,
            distance: null,
            etdrsScale: null,
            lineSizes: null,


            scores: 0,
        }

        this.previousLetter = null;
        this.mounted = false;
        this.isSpeaking = false;
        this.eventListener = [];
        Tts.getInitStatus().then(() => {
            this.initTts();
        }, (err) => {
            if (err.code === 'no_engine') {  //Verification of an installed tts engine
                Tts.requestInstallEngine();  //If not we request to install it (on PlayStore)
            }
        });
    }



    async componentDidMount() {
        this.mounted = true;
        // Desactive la mise en veille de l'ecran
        activateKeepAwake();

        await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.CAMERA
        ]);

        const userId = await getId();
        uid = userId;
        const savedEtdrsScale = await getAcuites();
        const savedDistance = await getDistance(userId);
        const vs = Object.values(savedEtdrsScale);
        this.lineSizes = vs.map(v => getLineLength(v, savedDistance / 100)); // distance en m
        this.setState({
            id: userId,
            distance: savedDistance,
            // qrsize: await getQrSize(),
            targetLines: await getTargetLines(),
            etdrsScale: savedEtdrsScale,
            lineSizes: this.lineSizes[0]
        });

        // Timer pour contrôler la detection de l'utilisateur dans le champs
        // this.timer = setInterval(this.tick, 1000);

        Voice.isAvailable()
            .then((res) => {
                if (!res) { console.error("No Voice Available") }
            })
            .catch((error) => console.error(error))

    }


    componentWillUnmount() {
        this.mounted = false;
        Voice.destroy().then(Voice.removeAllListeners);

        for (const iterator of this.eventListener) {
            iterator.remove();
        }

        // Reactive la mise en veille de l'ecran
        deactivateKeepAwake();
        console.log("Component Unmount TestScreen")
    }

    getChar(letters) {
        idx = idx+1;
        if (idx == 26) idx=0;
        return letters[idx];
    }

    /*
  * Met à jour la lettre lue et effectue tous les changements nécessaires
  * ex: fin de ligne -> incrémente la ligne
  */
    setNextLetter() {
        const { hasEnded, hasStarted, isPaused } = this.state;
        if (hasEnded || !hasStarted || isPaused) return;

        const { letterCount, lineNumber, targetLines, errorsInLine } = this.state;
        let newLineNumber = lineNumber; // default is current line number
        let newErrorsInLine = errorsInLine;
        let newLetterCount = letterCount;

        this.setState(
            {
                letter: this.getChar(letters),
                letterCount: newLetterCount,
                lineNumber: newLineNumber,
                lineSize: this.lineSizes[newLineNumber - 1],
                errorsInLine: newErrorsInLine
            },
            () => {
                if (letterCount <= targetLines * numberOfLetterByLine) this._startRecognizing();
                if (letterCount === targetLines * numberOfLetterByLine) this.endTest();
                this.previousLetter = this.state.letter;
            }
        );
    }

    endTest() {
        if (this.mounted) {
            this.setState(
                {
                    hasEnded: true
                },
                () => {
                    this._destroyRecognizer()
                    clearInterval(this.setNextLetterId);
                    clearInterval(this.timer);
                    console.log("FIN DU TEST");
                }
            );
        }
    }

    onSpeechStart = (e) => {
        console.log('onSpeechStart: ', e);
        if (this.mounted) {
            this.setState({
                started: true
            });
        }
    };

    onSpeechRecognized = (e) => {
        console.log('onSpeechRecognized: ', e);
        if (this.mounted) {
            this.setState({
                recognized: true
            });
        }
    };

    onSpeechEnd = (e) => {
        console.log('onSpeechEnd: ', e);
        if (this.mounted) {
            this.setState({
                end: true,
            });
        }
    };

    /**
     * Fonction lors de detection d'une erreur de reconnaissance vocale
     * Si rien n'a ete dit, c'est une erreur et on incrémente de 1
     * Si aucun mot n'a ete reconnu, on incrémente de 1
     * @param {*} e
     */
    onSpeechError =  async (e)  => {
        console.log("onSpeechError: ", e);
        
        switch (e.error.code) {
            case "7": //No Match
            case "6":
                //this.toggleSpeak("Je ne vous ai pas compris. Veuillez répéter.");

                //incremente de 1 le score dans la table Letter
                let Idl = await getLetterID(letters[idx],uid);
                Idl = JSON.stringify(Idl);
                Idl = JSON.parse(Idl);
                await updateLetter(Idl[0].id);
                const { errorsInLine } = this.state;
                if (this.mounted) {
                    this.setState({ errorsInLine: errorsInLine + 1 }, () =>
                        this.setNextLetter()
                    );
                }
                break;

            case "5": //Client side error
                break;
            default:
                console.error(e.error);
                break;
        }
    };

    onSpeechResults = async(e) => {
        const { partialResults, scores, whichEye, errorsInLine } = this.state;
        const newResults = [...e.value, ...partialResults];
        const [newScore, gotErrors] = this.getNewScore(newResults);

        //incremente de 1 le score dans la table Letter en cas d'erreur
        if(gotErrors==1){
          let Idl = await getLetterID(letters[idx],uid);
          Idl = JSON.stringify(Idl);
          Idl = JSON.parse(Idl);
          await updateLetter(Idl[0].id);
        }
        console.log("onSpeechResults: ", newResults, newScore);
        if (this.mounted) {
            this.setState(
                {
                    results: newResults,
                    scores: newScore,
                    errorsInLine: gotErrors ? errorsInLine + 1 : errorsInLine
                },
                () => {
                    this.setNextLetter();
                    console.log(`current score: ${JSON.stringify(this.state.scores)}  previous letter : ${this.previousLetter}`);

                }
            );
        }
    };

    onSpeechPartialResults = e => {
        console.log("onSpeechPartialResults: ", e);
        if (this.mounted) {
            this.setState({
                partialResults: e.value
            });
        }
    };

    onSpeechVolumeChanged = (e) => {
        // console.log('onSpeechVolumeChanged: ', e);
        if (this.mounted) {
            this.setState({
                pitch: e.value,
            });
        }
    };

    // Demarre la reconnaissance si le test est en cours
    _startRecognizingIfTest() {
        const { wellPlaced, hasEnded, hasStarted, isPaused } = this.state;
        if (!wellPlaced) return;
        if (hasStarted && !hasEnded && !isPaused) {
            this.setState({ isListening: true });
            this._startRecognizing();
        }
    }


    _startRecognizing = async () => {
        console.log("_startRecognizing");
        if (this.mounted) {
            this.setState({
                recognized: false,
                pitch: "",
                error: "",
                started: false,
                results: [],
                partialResults: [],
                end: false,
                statusVoice: 'started'
            })
        }

        try {
            await Voice.start("fr-FR", {
                "RECOGNIZER_ENGINE": "GOOGLE",
                "EXTRA_PARTIAL_RESULTS": true
            });
        } catch (e) {
            console.error("_startRecognizing : ", e);
        }
    };

    _stopRecognizing = async () => {
        console.log("_stopRecognizing");
        try {
            await Voice.stop();
            if (this.mounted) {
                this.setState({
                    statusVoice: 'stopped'
                })
            }
        } catch (e) {
            console.error("_stopRecognizing : ", e);
        }
    };

    _cancelRecognizing = async () => {
        try {
            await Voice.cancel();
            if (this.mounted) {
                this.setState({
                    statusVoice: 'cancel'
                })
            }
        } catch (e) {
            console.error("_cancelRecognizing : ", e);
        }
    };

    _destroyRecognizer = async () => {
        console.log(" _destroyRecognizer")
        try {
            await Voice.destroy();
        } catch (e) {
            console.error("_destroyRecognizer :", e);
        }
        if (this.mounted) {
            this.setState({
                recognized: false,
                pitch: '',
                error: '',
                started: false,
                results: [],
                partialResults: [],
                end: false,
                statusVoice: null
            });
        }
    };


    /**
     * Intialisation of the TTS
     */
    initTts() {
        const onStartTTS = (e) => {
            // console.log("onStartTTS");
            this.isSpeaking = true;
            this._stopRecognizing();
        }

        const onFinishTTS = () => {
            // console.log("onFinishTTS");
            this.isSpeaking = false;
            this._startRecognizing().then(() => { });
        }

        const onCancelTTS = () => {
            // console.log("onCancelTTS");
            this.isSpeaking = false;
            this._startRecognizing().then(() => { });
        }

        try {
            Tts.setDefaultLanguage('fr-FR');
            Tts.setDefaultRate(0.5);
            this.eventListener.push(Tts.addEventListener("tts-start", onStartTTS));
            this.eventListener.push(Tts.addEventListener("tts-finish", onFinishTTS));
            this.eventListener.push(Tts.addEventListener("tts-cancel", onCancelTTS));
            this.eventListener.push(Tts.addEventListener("tts-error", error => console.error("tts-error : ", error)) );
        } catch (error) {
            console.error("initTTS : ", error);
        }
    }


    /**
     * Start the speaker to say the sentence
     * @param {*} sentence to pronounce
     */
    _speak = async (sentence) => {
        this._stop();
        return Tts.speak(sentence);
    };

    /**
     * Stop the speaker
     */
    _stop() {
        Tts.stop();
    }

    /**
     *
     * @param {*} sentence
     * @returns Promise
     */
    async toggleSpeak(sentence) {
        if (this.isSpeaking) {
            setTimeout(() => { this.toggleSpeak(sentence) }, 1000);
        }
        else {
            return this._speak(sentence);
        }
    }


    /**
   * Vérifie si les résultats obtenus correspondent à la table d'equivalence
   * @param {string[]} newResults tableau contenant les mots reconnus par la reconnaissance
   * @returns {boolean}
   */
    checkResults(newResults) {
        const { letter } = this.state;
        return intersection(newResults, letter);
    }




    UrgeWithPleasureComponent = () => {
        if (!this.state.hasStarted && this.state.hasPressedStart) {
            return (
                <CountdownCircleTimer
                    size={400}
                    isPlaying
                    duration={5}
                    colors={[
                        ['#004777', 0.4],
                        ['#F7B801', 0.4],
                        ['#A30000', 0.2],
                    ]}
                    onComplete={() => {
                        this.setState(
                            {
                                hasStarted: true
                            },
                            () => this.setNextLetter()
                        );
                    }}
                >
                    {({ remainingTime, animatedColor }) => (
                        <Animated.Text style={{ color: animatedColor, fontSize: 150 }}>
                            {remainingTime}
                        </Animated.Text>
                    )}
                </CountdownCircleTimer>
            )
        }
    }
 getNewScore(newResults) {
        const { scores, whichEye } = this.state;
        const gotResult = this.checkResults(newResults);
        const gotErrors = !gotResult;
        const newScore = gotResult ? scores + 1 : scores;
        return [newScore, gotErrors];
    }


    _displayMicro() {
        const { hasStarted, hasEnded, isPaused, statusVoice } = this.state;
        if (hasStarted && !hasEnded && !isPaused) {
            let srcImage = require('../assets/mic_on.png');
            if (statusVoice !== 'started') {
                srcImage = require('../assets/mic_off.png');
            }
            return (
                <Image style={styles.micro} source={srcImage} />
            )
        }

    }
    render() {
        const {
            letter,
            lineSize,
            targetLines,
            scores,
            wellPlaced,
            statusVoice,
        } = this.state;

        const { hasPressedStart, hasStarted, hasEnded, isPaused } = this.state;
        return (
            <View style={styles.container}>
                {this._displayMicro()}

                {/* Affichage des instructions avant le premier test */}
                {!hasPressedStart && (
                    <Instructions
                        wellPlaced={wellPlaced}
                        handleStartPressed={() => this.setState({ hasPressedStart: true })}
                        whichEye={this.state.whichEye}
                    />
                )}

                {this.UrgeWithPleasureComponent()}

                {/* Affichage des lettres lors du texte */}
                {hasStarted && !hasEnded && !isPaused && wellPlaced && (
                    <Text style={{ fontFamily: "optician-sans", fontSize: 200 }}>
                        {letter}
                    </Text>
                )}

            </View>
        )
    }

}

// handleStartPressed : fonction appelee lors de l'appuie du bouton
// wellPlaced : true si l'utilisateur est bien place
function Instructions({ handleStartPressed, wellPlaced, whichEye }) {
    return (
        <>
            <Text style={common.headers}>Test de vision</Text>

            <Text style={common.important}>Nous allons ameliorer la detection de votre voix.
               Nous vous recommandons de <Text style={{ fontWeight: "bold" }}>faire le test au moins 5 min </Text> pour avoir un résultat efficace.
              <Text style={{ fontWeight: "bold" }}> Vous pouvez arréter le test à tout moment en cliquant sur la fleche de retour. </Text>.
                Placez-vous confortablement et appuyez sur le bouton lorsque vous êtes
                prêt.
        </Text>
            {wellPlaced && (
                <TouchableOpacity
                    style={styles.actionButtons}
                    onPress={() => handleStartPressed()}
                >
                    <Text style={styles.actionButtonsText}>PRÊT</Text>
                </TouchableOpacity>
            )}
        </>
    );
}


const styles = StyleSheet.create({
    container: {
        // position: 'absolute',
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        position: "relative"
    },
    actionButtons: {
        ...common.actionButtons,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        maxWidth: Dimensions.get("window").width - 20,
        height: 300,
        position: "absolute",
        bottom: 0,
        marginBottom: 20
    },
    actionButtonsText: {
        ...common.actionButtonsText,
        fontSize: 30
    },
    indication: { fontSize: 30 },
    micro: {
        position: "absolute",
        bottom: "25%"
    }
});

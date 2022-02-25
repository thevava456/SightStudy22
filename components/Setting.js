import React, { Component } from 'react'
import { Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native'
import SystemSetting from 'react-native-system-setting'
//import * as Speech from 'expo-speech';
import Tts from 'react-native-tts';
import Slider from '@react-native-community/slider';
import { styles as common } from "../src/styles/common";
import { setQrSize, setTargetLines, getAllSettings, setVolume, setAdminPin, setBrightness, setDoctorEmail } from '../src/utils/asyncFunctions';
import { showAlert } from '../src/utils/config';
export default class Setting extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pin: "",
            mail: "",
            targetLines: null,
            qrSize: "",
            volume: null,
            brightness: null
        };
        this.handleChangeField = this.handleChangeField.bind(this);
        this.eventListener = [];
        Tts.getInitStatus().then(() => {
            this.initTts();
        }, (err) => {
            if (err.code === 'no_engine') {  //Verification of an installed tts engine
                Tts.requestInstallEngine();  //If not we request to install it (on PlayStore)
            }
        });
    }

    componentWillUnmount() {
        for (const iterator of this.eventListener) {
            iterator.remove();
        }
    }

    initTts() {

        try {
            Tts.setDefaultLanguage('fr-FR');
            Tts.setDefaultRate(0.5);
            this.eventListener.push(Tts.addEventListener("tts-error", error => console.error("tts-error : ", error)));
        } catch (error) {
            console.error("initTTS : ", error);
        }
    }

    // Sauvegarde d'un parametre
    handleChangeField(e, field) {
        this.setState({ [field]: e });
    }

    async componentDidMount() {

        // Chargement des parametres sauvegardes
        const currentVolume = await SystemSetting.getVolume();
        const currentBrightness = await SystemSetting.getAppBrightness();
        const {
            volume,
            brightness,
            mail,
            pin,
            targetLines,
            qrsize
        } = await getAllSettings();
        this.setState({
            pin,
            mail,
            targetLines: targetLines ? targetLines.toString() : "",
            volume: volume || currentVolume,
            brightness: brightness || currentBrightness,
            qrSize: qrsize ? qrsize.toString() : ""
        });
    }
    // Si les champs on ete verifies, les parametres sont appliques
    async handleOnOk() {
        const { mail, volume, brightness, pin, targetLines, qrSize } = this.state;
        const { goBack } = this.props.navigation;

        if (this.verifyField()) {
            goBack();
            await Promise.all([
                setDoctorEmail(mail),
                setVolume(volume.toString()),
                setBrightness(brightness.toString()),
                setAdminPin(pin),
                setTargetLines(targetLines),
                setQrSize(qrSize)
            ]);
        }
    }


    // Sauvegarde de la luminosite et son application
    changeBrightness(value) {
        SystemSetting.setAppBrightness(value);
        this.setState({
            brightness: value
        });
    }

    // Sauvegarde du volume et son application
    changeSound(value) {
        SystemSetting.setVolume(value);
        this.setState({
            volume: value
        });
    }

    /**
   * Start the speaker to say the sentence
   * @param {*} sentence to pronounce
   */
    _speak = async (sentence) => {
        this._stop();
        return Tts.speak(sentence);
    };

    toggleSpeak(sentence) {

        this._stop()
        this._speak(sentence)

    }

    /**
     * Stop the speaker
     */
    _stop() {
        Tts.stop();
    }

    // Declenche la synthese vocale
    // toggleSpeak(sentence) {
    //     console.log('toogleSpeak') ;
    //     Speech.isSpeakingAsync()
    //         .then(isSpeaking =>
    //             isSpeaking ? this.stop(sentence) : this.speak(sentence)
    //         )
    //         .catch((e) => {console.error(e)});
    // }

    // Lorsqu'on lache le slider du volume une voix de test est lancee
    volumeRelease() {
        this.toggleSpeak("Essai du volume.");
    }

    // Verifie les champs
    // le mail doit inclure "@"
    // le code PIN, s'il est remplit, doit contenir 4 caracteres
    // le nombre de lignes du test ne doit pas etre 0
    // la taille du QR Code doit etre un float
    verifyField() {
        const { mail, pin, targetLines, qrSize } = this.state;
        const show = str => showAlert(str, null, [], "Erreur de saisie");
        if (!mail || !mail.includes("@")) {
            show("Veuillez renseigner une adresse valide");
            return false;
        }
        if (!pin || pin.length !== 4) {
            show("Le code PIN doit contenir 4 caractères");
            return false;
        }
        if (!targetLines || targetLines.length === 0) {
            show("Veuillez renseigner le nombre de lignes du test");
            return false;
        }
        if (parseFloat(qrSize) != qrSize) {
            show("La taille du QR code doit être en décimal");
            return false;
        }
        return true;
    }

    // Si les champs on ete verifies, les parametres sont appliques
    async handleOnOk() {
        const { mail, volume, brightness, pin, targetLines, qrSize } = this.state;
        const { goBack } = this.props.navigation;
        if (this.verifyField()) {
            goBack();
            await Promise.all([
                setDoctorEmail(mail),
                setVolume(volume.toString()),
                setBrightness(brightness.toString()),
                setAdminPin(pin),
                setTargetLines(targetLines),
                setQrSize(qrSize)
            ]);
        }
    }

    render() {
        const { volume, brightness, pin, mail, targetLines, qrSize } = this.state;
        return (
            <View style={styles.container}>
                <Text style={styles.header}>Paramètres généraux</Text>

                {/* Parametre : luminosite (slider) */}
                <Text style={common.inputsLabels}>Luminosité</Text>
                <Slider
                    step={0.1}
                    maximumValue={1}
                    minimumValue={0.05}
                    onValueChange={this.changeBrightness.bind(this)}
                    value={brightness}
                />

                {/* Parametre : volume sonore (slider) */}
                <Text style={common.inputsLabels}>Volume</Text>
                <Slider
                    step={0.1}
                    maximumValue={1}
                    onValueChange={this.changeSound.bind(this)}
                    onSlidingComplete={this.volumeRelease.bind(this)}
                    value={volume}
                />

                {/* Parametre : code PIN */}
                <Field
                    label="PIN"
                    maxLength={4}
                    value={pin}
                    type="numeric"
                    handleOnChange={e => this.handleChangeField(e, "pin")}
                />

                {/* Parametre : email du medecin */}
                <Field
                    label="Email du médecin"
                    value={mail}
                    handleOnChange={e => this.handleChangeField(e, "mail")}
                />

                {/* Parametre : nombre de lignes du test */}
                <Field
                    label="Nombre de lignes du test"
                    value={targetLines}
                    maxLength={2}
                    type="numeric"
                    handleOnChange={e => this.handleChangeField(e, "targetLines")}
                />

                {/* Parametre : taille du QR code */}
                {/* <Field
                    label="Taille du QR code (en cm)"
                    value={qrSize}
                    maxLength={4}
                    handleOnChange={e => this.handleChangeField(e, "qrSize")}
                /> */}
                <TouchableOpacity
                    style={common.actionButtons}
                    onPress={() => this.handleOnOk()}
                >
                    <Text style={common.actionButtonsText}>CONFIRMER ✅</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

// Champ pour chaque parametre
// label : nom du parametre
// value : valeur actuellement sauvegarde
// type : numerique ou par defaut
// handleOnChange : fonction appelee lors de validation
// maxLength : taille maximale du champs
function Field({ label, value, type, handleOnChange, maxLength = 50 }) {
    return (
        <>
            <Text style={common.inputsLabels}>{label}</Text>
            <TextInput
                value={value}
                keyboardType={type === "numeric" ? "numeric" : "default"}
                style={common.inputs}
                maxLength={maxLength}
                autoCorrect={false}
                placeholder={label}
                onChangeText={handleOnChange}
            />
        </>
    );


}

const styles = StyleSheet.create({
    container: {
        margin: 15
    },
    form: {},
    header: {
        fontSize: 30,
        fontWeight: "bold",
        margin: 10,
        textAlign: "center"
    },
    label: {
        fontSize: 25,
        marginTop: 3,
        justifyContent: "center",
        alignItems: "center"
    }
});


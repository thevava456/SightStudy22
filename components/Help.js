import React from "react";
//import * as Speech from "expo-speech";
import Tts from 'react-native-tts';
import { View, Button } from "react-native";
import { withNavigation } from '@react-navigation/compat';
import { colors } from "../src/styles/common";


const sentences = "Bienvenue sur l'application Sight Study.Vous êtes sur votre compte. Pour commencer le test, appuyez sur l'icône de gauche. Pour consulter vos résultats, appuyez sur l'icône de droite."

/**
 * Composant correspondant au bouton en haut à droite, il contrôle l'état de la synthèse vocale
 */
class Help extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isSpeakingText: "Aide 📢",
      isSpeakingButton: colors.SUCESS,
      isSpeaking: false
    };

    this.eventListener = [] ;
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
  /**
     * Intialisation of the TTS
     */
  initTts() {
    const onStartTTS = (e) => {
      this.setState({
        isSpeakingText: "Stop 🔇",
        isSpeakingButton: colors.DANGER,
        isSpeaking: true
      })
    }

    const onFinishTTS = () => {
      this.setState({
        isSpeakingText: "Aide 📢",
        isSpeakingButton: colors.SUCESS,
        isSpeaking: false
      })
    }

    const onCancelTTS = () => {
      this.setState({
        isSpeakingText: "Aide 📢",
        isSpeakingButton: colors.SUCESS,
        isSpeaking: false
      })
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

  toggleSpeak(sentence) {
    if (this.state.isSpeaking) {
      this._stop()
    } else {
      this._speak(sentence)
    }
  }
  /**
   * Stop the speaker
   */
  _stop() {
    Tts.stop();
  }




  render() {
    const { isSpeakingText, isSpeakingButton } = this.state;
    return (
      <View style={{ marginHorizontal: 10 }}>
        <Button
          color={isSpeakingButton}
          onPress={() => { this.toggleSpeak(sentences) }}
          title={isSpeakingText}
        />
      </View>
    );
  }
}

export default withNavigation(Help);

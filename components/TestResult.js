import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native'
import { styles as common } from '../src/styles/common'
import { getId } from '../src/utils/asyncFunctions' ;
import { checkScoreAndSend, mailEnum } from '../src/utils/mailFunctions' ;
import { addScore } from '../src/utils/dbFunctions' ;
// Message de fin du test,
// scores : scores de chaque oeil
// targetLines : nombre de lignes du test
// handleOnEnd : fonction appelee lors de l'appuie sur le bouton



export default class TestResult extends Component {

    constructor(props) {
        super(props)

        this.state = {
            score: this.props.route.params.scores,
            targetLines: this.props.route.params.targetLines,
            oeil: this.props.route.params.oeil,
            numberOfLetterByLine: this.props.route.params.numberOfLetterByLine
        }
    }

    async componentDidMount() {
        const id = await getId();
        const { score } = this.state;
        addScore(id,this.state.oeil, this.state.score, this.state.targetLines*this.state.numberOfLetterByLine);

       /*  const gotPerformance = await checkScoreAndSend(id, this.state.targetLines*this.state.numberOfLetterByLine);
        if (gotPerformance === mailEnum.INSUFFISCIENT) {
            showAlert(
                "Vous avez passé le test. Vos résultats indiquent un problème et un mail a été envoyé à votre docteur.",
                null,
                [],
                "Attention !"
            );
        } */
    }


    render() {

        return (
            <View>
                <Text style={common.headers}>Fin du test</Text>
                <Text style={common.important}>Le test est maintenant terminé.</Text>
                <Text style={common.important}>
                    Score œil {this.state.oeil === 'left' ? 'gauche' : 'droit'}:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                        {this.state.score} / {this.state.numberOfLetterByLine*this.state.targetLines}
                    </Text>
                </Text>

                <TouchableOpacity
                    style={common.actionButtons}
                    onPress={() => this.props.navigation.navigate('ChooseEye')}
                >
                    <Text style={common.actionButtonsText}>TERMINER</Text>
                </TouchableOpacity>
            </View>
        );
    }
}


const styles=StyleSheet.create({
    actionButtons : {

    }

})
import React, { Component } from 'react'
import { View, TouchableHighlight, StyleSheet, Text } from 'react-native'

export default class ChooseEye extends Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.headerText}>Choisissez l'oeil que vous-voulez tester :</Text>
                <View style={styles.viewChoose}>
                    <TouchableHighlight
                    underlayColor="#D6D6D6"
                    style={[styles.card, styles.cardLeft]} onPress={() => { this.props.navigation.navigate('TestScreen', { oeil: 'left' }) }}>
                        <Text style={styles.textEye} > Oeil Gauche </Text>
                    </TouchableHighlight>
                    <TouchableHighlight 
                    underlayColor="#D6D6D6"
                    style={[styles.card, styles.cardRight]} onPress={() => { this.props.navigation.navigate('TestScreen', { oeil: 'right' }) }}>
                        <Text style={styles.textEye}> Oeil Droit </Text>
                    </TouchableHighlight>
                </View>
            </View>

        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    card: {
        flex: 1,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 12,
        },
        shadowOpacity: 0.58,
        shadowRadius: 16.00,
        elevation: 24,
        maxHeight : 700,
        backgroundColor: 'white',
        marginBottom : 10,
        alignSelf :'center',
        borderRadius : 10,
    },
    viewChoose: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center'
    },
    headerText: {
        fontSize: 35,
        textAlign: 'center',
        marginTop: 90,

    },
    textEye: {
        textAlign: 'center',
        textAlignVertical: 'center',
        flex: 1,
        fontSize: 40,
        // borderLeftWidth: 1
    },
    cardLeft: {
        marginLeft: 10,
        marginRight : 5,
    },
    cardRight: {
        marginRight : 10,
        marginLeft : 5,
    }
});
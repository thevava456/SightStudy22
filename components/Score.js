import React, { Component } from 'react'
import { Text, StyleSheet, View, Dimensions, ActivityIndicator, FlatList, Alert } from 'react-native'
import { LineChart } from 'react-native-chart-kit'
import { getScore } from '../src/utils/dbFunctions'
import { getId } from '../src/utils/asyncFunctions'
import moment from 'moment'
import "moment/locale/fr";

export default class Score extends Component {

    constructor(props) {
        super(props);
        this.state = {
            id: "",
            dates: [],
            scoresOeilDroit: [],
            scoresOeilGauche: [],
            isLoading: true,
            scoreLeftEye: [],
            scoreRightEye: [],
            scoreBothEyes: []
        };
    }

    componentDidMount() {
        getId().then(id => {
            getScore(id).then(
                (rows) => {
                    let scoreLeftEye = []
                    let scoreRightEye = []
                    for (const row of rows) {
                        if (row['wich_eye'] == "left") {
                            scoreLeftEye.push({ score: row['score'] / row['total_letters'], date: moment(new Date(row['date_score'])).format('DD/MM/YYYY') })
                        }
                        else {
                            scoreRightEye.push({ score: row['score'] / row['total_letters'], date: moment(new Date(row['date_score'])).format('DD/MM/YYYY') })
                        }
                    }

                    this.setState({
                        scoreLeftEye: scoreLeftEye,
                        scoreRightEye: scoreRightEye,
                        id: id,
                        isLoading: false,
                        scoreBothEyes: rows.reverse() // Pour avoir la liste du plus récent au plus ancien 
                    });
                }
            )
        });
    }

    _displayLoading() {
        if (this.state.isLoading) {
            return (
                <View style={styles.loading_container} >
                    <ActivityIndicator size="large" color="#00ff00" />
                </View>
            )
        }
    }

    _displayLineChart(label, data, color, title) {
        if (data.length > 0) {
            return (
                <View style={styles.viewLineChart}>
                    <Text style={styles.titleLineChart}>{title}</Text>
                    <LineChart
                        data={{
                            labels: label,
                            datasets: [
                                {
                                    data: data,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
                                }
                            ]
                        }}
                        width={Dimensions.get("window").width - 50} // from react-native
                        height={250}
                        fromZero={true}
                        onDataPointClick={(value) => {
                            let IntValue = value.value * 25
                            let message = "Le patient à obtenu la note de " + IntValue.toString() + " / 25 à ce test."
                             Alert.alert('Détails', message); 
                        }}
                        chartConfig={{
                            backgroundColor: color['background'],
                            backgroundGradientFrom: color['backgroundGradient'],
                            backgroundGradientTo: color['backgroundGradient'],
                            decimalPlaces: 2, // optional, defaults to 2dp
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16
                            }
                        }}
                        bezier
                        style={{
                            borderRadius: 16
                        }}
                    />
                </View>
            )
        }
    }


    _renderItem = ({ item }) => {
        return (
            <View style={styles.viewRenderItem}>
                <View style={styles.viewLeftPartRenderItem}>
                    <Text style={styles.textDate}>{moment(new Date(item.date_score)).locale(['fr','tq']).format('LLLL')}</Text>
                    <Text style={styles.textWhichEye}>Oeil {item.wich_eye === 'left' ? 'gauche' : 'droit'}</Text>
                </View>
                <Text style={styles.textScore}>{item.score} sur {item.total_letters}</Text>
            </View>
        )

    }

    render() {
        const { isLoading, dates } = this.state;
        return (

            <View style={styles.container}>
                {this._displayLoading()}
                {this._displayLineChart(
                    this.state.scoreLeftEye.map((row) => { return row['date'] }),
                    this.state.scoreLeftEye.map(row => { return row['score'] }),
                    { backgroundGradient: "#f74a4a", background: "#eee" },
                    "Scores oeil gauche"
                )}

                {this._displayLineChart(
                    this.state.scoreRightEye.map((row) => { return row['date'] }),
                    this.state.scoreRightEye.map(row => { return row['score'] }),
                    { backgroundGradient: "#1f9ad3", background: "#e26a00" },
                    "Scores oeil droit"
                )}

                
                <FlatList
                    data={this.state.scoreBothEyes}
                    renderItem={this._renderItem}
                    keyExtractor={(item) => item.id}
                    ListEmptyComponent={<Text style={{textAlign:'center', fontSize:20}}>Données vides </Text>}
                    ListHeaderComponent={<Text style={styles.headerFlatList}>Historique des résultats</Text>}
                >

                </FlatList>
            </View>

        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loading_container: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 100,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    viewLineChart: {
        alignItems: 'center',
        marginVertical: 10
    },
    titleLineChart: {
        marginBottom: 10,
        fontSize: 30,
    },
    viewRenderItem: {
        flex: 1,
        flexDirection: 'row',
        height: 70,
        marginVertical: 10,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding : 10,
        marginHorizontal: 20,

        borderRadius: 7,

        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height : 2,
        },
        shadowRadius: 3.84,
        shadowOpacity: 0.25,
        elevation: 5,
    },
    textDate : {
        fontSize : 20
    },
    textWhichEye : {
        fontSize : 15,
    },
    textScore : {
        alignSelf : 'center',
        fontSize : 25,
    },
    headerFlatList: {
        textAlign : 'center',
        fontSize : 30,

    }
});

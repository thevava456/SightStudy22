import React, { Component } from 'react'
import {
    Text, StyleSheet, View,
    Dimensions, TouchableHighlight
} from 'react-native'
import {
    TextInput,
    TouchableOpacity,
    ScrollView,
} from "react-native-gesture-handler";
import { addUser, getUserId } from '../src/utils/dbFunctions';
import { addLetter,getLetter } from '../src/utils/dbFunctions';
import { styles as common, colors } from "../src/styles/common";
import { formatDate, showAlert } from '../src/utils/mailFunctions';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

/**
 * Composant permettant d'ajouter un utilisateur (patient) dans la base de données
 */
export default class AddUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            prenom: "",
            nom: "",
            date: new Date(0),
            distance: "",
            sex: "H",
            show: false
        };
        this.handleChangeField = this.handleChangeField.bind(this);
    }

    componentDidMount() {
        this.willFocusSub = this.props.navigation.addListener("willFocus", () => {
            const { getParam } = this.props.navigation;
            const distance = getParam("distance", "");
            this.setState({ distance: distance.toString() });
        });
    }

    componentWillUnmount() {
        this.willFocusSub();
        this.setState({ prenom: "", nom: "", date: "", distance: null });
    }

    /**
     * Gère la modification d'un champ (lorsque l'on écrit)
     * @param {string} field - le nom de la propriété étant modifiée
     */
    handleChangeField(e, field) {
        this.setState({ [field]: e });
    }

    handleDistanceTest() {
        const { navigate } = this.props.navigation;
        navigate("DistanceFinder", { backRoute: "AddUser" });
    }

    /**
     * Ajoute l'utilisateur en cours dans la BDD
     */
    async handleAddUser() {
        const { goBack } = this.props.navigation;
        const { nom, prenom, sex, date, distance } = this.state;
        if (nom != "" && prenom != "" && date != "" && distance != "") {
            await addUser(nom, prenom, sex, date.toISOString(), distance);
            let res1 = await getUserId(nom,prenom,date.toISOString(), distance);
            res1 = JSON.stringify(res1);
            const nb = JSON.parse(res1);

            //initialise l'alphabet dans la table letters de la BDD pour le nouvel utilisateur
            let alphabet = ['a','z','e','r','t','y','u','i','o','p','q','s','d','f','g','h','j','k','l','m','w','x','c','v','b','n'];
            for (let i=0;i<26;i++) await addLetter(alphabet[i],nb[0].id);
            let res2 = await getLetter(nb[0].id);
            console.log(res2);
            goBack();
        } else {
            showAlert("Veuillez remplir tous les champs", null, [], "Erreur lors de l'ajout du patient")
        }

    }

    onChange = (event, selectedDate) => {
        const currentDate = selectedDate || this.state.date;
        if (event.type === "set") {
            this.setState({ show: false, date: currentDate })
            // this.handleChangeField(currentDate, "date");
        }
        else {
            this.setState({ show: false });
        }
    };

    /**
     * Affiche le composant de choix de date
     */
    showDatePickerAndSet() {
        const { date } = this.state;
        if (this.state.show) {
            return (

                <DateTimePicker
                    testID="dateTimePicker"
                    value={this.state.date}
                    mode={'date'}
                    is24Hour={true}
                    display="default"
                    onChange={this.onChange}
                />
            )
        }
    }

    render() {
        const { prenom, nom, sex, date, distance } = this.state;
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Nouveau patient</Text>
                <Form
                    userInfo={{ prenom, nom, date, sex, distance }}
                    handleChange={this.handleChangeField}
                    showDatePickerAndSet={() => { this.setState({ show: true }) }}
                >
                    {this.showDatePickerAndSet()}
                    {/* <TouchableOpacity
                        style={{
                            ...common.actionButtons,
                            backgroundColor: colors.SECONDARY,
                            borderColor: colors.SECONDARY,
                            marginVertical: 10
                        }}
                        onPress={() => this.handleDistanceTest()}
                    >
                        <Text style={common.actionButtonsText}>🔎 TEST DE DISTANCE 🔎</Text>
                    </TouchableOpacity> */}
                    <TouchableOpacity
                        style={{ ...styles.form, ...common.actionButtons, marginVertical: 10 }}
                        onPress={() => this.handleAddUser()}
                    >
                        <Text style={common.actionButtonsText}>CONFIRMER ✅</Text>
                    </TouchableOpacity>
                </Form>
            </ScrollView>
        );
    }
}

/**
 * Formulaire
 * @param {Object} props - les propriétés du formulaire
 * @param {Function} props.handleChange - la fonction de mise à jour
 * @param {Object} props.userInfo - toutes les données de l'utilisateur en cours
 * @returns {JSX}
 */
function Form({ children, handleChange, userInfo, showDatePickerAndSet }) {
    const { prenom, nom, sex, date, distance } = userInfo;
    return (
        <View style={styles.form}>
            <Field
                value={prenom}
                label="Prénom"
                handleOnChange={e => handleChange(e, "prenom")}
            />
            <Field
                value={nom}
                label="Nom"
                handleOnChange={e => handleChange(e, "nom")}
            />
            <Text style={common.inputsLabels}>Date de naissance</Text>
            <TouchableHighlight
                underlayColor="#fff"
                onPress={() => showDatePickerAndSet()}
            >
                <Text style={common.inputViews}>{date && formatDate(date)}</Text>
            </TouchableHighlight>
            <Field
                value={distance}
                label="Distance"
                type={"numeric"}
                handleOnChange={e => handleChange(e, "distance")}
            />
            <Select
                label="Sexe"
                value={sex}
                handleOnChange={e => handleChange(e, "sex")}
            >
                <Picker.Item label="Homme" value="H" />
                <Picker.Item label="Femme" value="F" />
            </Select>
            {children}
        </View>
    );
}

/**
 * Un champ
 * @param {Object} props - les propriétés
 * @param {string} props.value - valeur du champ
 * @param {string} props.label - le label du champ
 * @param {string} props.type - le type du clavier
 * @param {Function} props.handleOnChange - fonction de mise à jour
 */
function Field({ label, value, type, handleOnChange }) {
    return (
        <>
            <Text style={common.inputsLabels}>{label}</Text>
            <TextInput
                value={typeof value === "object" ? formatDate(value) : value}
                keyboardType={type === "numeric" ? "numeric" : "default"}
                style={common.inputs}
                maxLength={20}
                autoCorrect={false}
                placeholder={label}
                onChangeText={handleOnChange}
            />
        </>
    );
}

function Select({ label, handleOnChange, value, children }) {
    return (
        <>
            <Text style={common.inputsLabels}>{label}</Text>
            <View style={common.inputs}>
                <Picker selectedValue={value} onValueChange={handleOnChange}>
                    {children}
                </Picker>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingBottom: 15
    },
    form: {
        marginTop: 50,
        transform: [{
            scale: 1.2
        }],
        maxWidth: Dimensions.get("window").width
    },
    header: {
        fontSize: 32,
        fontWeight: "bold",
        margin: 10
    }
})

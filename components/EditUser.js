import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableHighlight, Dimensions } from 'react-native'
import { TextInput, TouchableOpacity, ScrollView } from "react-native-gesture-handler";
import { styles as common, colors } from "../src/styles/common";
import { showAlert } from '../src/utils/config'
import { formatDate } from '../src/utils/mailFunctions'
import { removeUser, setDistance } from '../src/utils/dbFunctions'
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default class EditUser extends Component {
    constructor(props) {
        super(props);
        const user = this.props.route.params.user;
        const { id, prenom, nom, date_de_naissance, distance, sex } = user;
        this.state = {
            id,
            prenom,
            nom,
            date: new Date(date_de_naissance),
            distance: distance.toString(),
            sex,
            newDistance: "&"
        };
        this.handleChangeField = this.handleChangeField.bind(this);
        this.showDatePickerAndSet = this.showDatePickerAndSet.bind(this);
    }

    async componentDidMount() {
        this.willFocusSub = this.props.navigation.addListener("willFocus", () => {
            const { getParam } = this.props.navigation;
            const distance = getParam("distance", "&");
            this.setState({ newDistance: distance.toString() });
        });
    }

    handleChangeField(e, field) {
        this.setState({ [field]: e });
    }

    handleDelete() {
        const { id, prenom, nom } = this.state;
        const { goBack } = this.props.navigation;
        showAlert(
            `Le patient ${prenom} ${nom} va être supprimé.`,
            async () => {
                await removeUser(id);
                goBack();
            },
            [{ text: "Annuler" }]
        );
    }

    async handleEdit() {
        const { goBack } = this.props.navigation;
        const { id, distance, newDistance } = this.state;
        var d = newDistance == "&" ? distance : newDistance
        if (d != "") {
            await setDistance(id, d);
            goBack();
        } else {
            showAlert("Veuillez renseigner la distance", null, [], "Erreur lors de la modfication du patient")
        }
    }

    async showDatePickerAndSet() {
        const { date } = this.state;
        try {
            const { action, year, month, day } = await DatePickerAndroid.open({
                date: date || new Date(1981, 1, 1)
            });
            if (action !== DatePickerAndroid.dismissedAction) {
                this.handleChangeField(new Date(year, month, day), "date");
            }
        } catch ({ code, message }) {
            console.warn("Cannot open date picker", message);
        }
    }

    handleDistanceTest() {
        const { navigate } = this.props.navigation;
        navigate("DistanceFinder", { backRoute: "EditUser" });
    }

    render() {
        const { prenom, nom, sex, date, distance, newDistance } = this.state;
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Éditer un patient</Text>
                <Form
                    userInfo={{ prenom, nom, date, sex, distance }}
                    handleChange={this.handleChangeField}
                    newDistance={newDistance}
                />
                {/* <TouchableOpacity
                    style={{
                        ...styles.form, ...styles.confirmButton,
                        backgroundColor: colors.SECONDARY,
                        borderColor: colors.SECONDARY
                    }}
                    onPress={() => this.handleDistanceTest()}
                >
                    <Text style={common.actionButtonsText}>🔎 TEST DE DISTANCE 🔎</Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                    style={{ ...styles.form, ...styles.confirmButton }}
                    onPress={() => this.handleEdit()}
                >
                    <Text style={styles.confirmButtonText}>CONFIRMER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={{ ...styles.form, ...styles.deleteButton }}
                    onPress={() => this.handleDelete()}
                >
                    <Text style={styles.confirmButtonText}>SUPPRIMER</Text>
                </TouchableOpacity>
            </ScrollView>
        );
    }
}

function Form({ handleChange, userInfo, showDatePickerAndSet, newDistance }) {
    const { prenom, nom, sex, date, distance } = userInfo;
    return (
        <View style={styles.form}>
            <Field value={prenom} label="Prénom" editable={false} />
            <Field value={nom} label="Nom" editable={false} />
            <Text style={common.inputsLabels}>Date de naissance</Text>
            <TouchableHighlight
                underlayColor="#fff"
                onPress={() => showDatePickerAndSet()}
                disabled={true}
            >
                <Text style={common.inputsDisabled}>{date && formatDate(date)}</Text>
            </TouchableHighlight>
            <Field
                value={newDistance == "&" ? distance : newDistance}
                type="numeric"
                label="Distance"
                handleOnChange={e => handleChange(e, "newDistance")}
                editable={true}
            />
            <Select label="Sexe" value={sex}>
                <Picker.Item label="Homme" value="H" />
                <Picker.Item label="Femme" value="F" />
            </Select>
        </View>
    );
}

function Field({ label, editable, value, type, handleOnChange }) {
    return (
        <>
            <Text style={common.inputsLabels}>{label}</Text>
            <TextInput
                value={typeof value === "object" ? formatDate(value) : value}
                keyboardType={type === "numeric" ? "numeric" : "default"}
                editable={editable}
                style={editable ? common.inputs : common.inputsDisabled}
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
            <View style={common.inputsDisabled}>
                <Picker
                    selectedValue={value}
                    enabled={false}
                    onValueChange={handleOnChange}
                >
                    {children}
                </Picker>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        paddingBottom: 15
    },
    form: {
        // width: scale(320),
        maxWidth: Dimensions.get("window").width
    },
    header: {
        fontSize: 32,
        fontWeight: "bold",
        margin: 10
    },
    confirmButton: {
        borderWidth: 1,
        borderColor: "#007BFF",
        backgroundColor: "#007BFF",
        padding: 15,
        marginTop: 7
    },
    deleteButton: {
        borderWidth: 1,
        borderColor: colors.DANGER,
        backgroundColor: colors.DANGER,
        padding: 15,
        marginTop: 7
    },
    confirmButtonText: {
        color: "#FFFFFF",
        fontSize: 20,
        textAlign: "center"
    }
});

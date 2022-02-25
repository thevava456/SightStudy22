import React, { Component } from 'react'
import {
    Text, StyleSheet, View, TextInput,
    FlatList, Button, TouchableOpacity,
    TouchableHighlight
} from 'react-native'
import { styles as common, colors } from "../src/styles/common";
import { getUsers, getUsersLike } from '../src/utils/dbFunctions';
import {
    setId,
    setUserName,
    getId, getDoctorEmail
} from "../src/utils/asyncFunctions";

import {
    formatDate,
    sendUserResults
} from '../src/utils/mailFunctions';
import { showAlert } from '../src/utils/config' ;
import { CommonActions } from '@react-navigation/native';

export default class SetUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentUserId: null,
            users: [],
            mail: null
        };
        this.handleSearch = this.handleSearch.bind(this);
        this.handleEdit = this.handleEdit.bind(this);
        this.handleSelect = this.handleSelect.bind(this);
        this.handleExport = this.handleExport.bind(this);
    }

    componentDidMount() {

        this.willFocusSub = this.props.navigation.addListener(
            "focus",
            async () => {
                this.setState({
                    users: await getUsers(),
                    currentUserId: await getId(),
                    mail: await getDoctorEmail()
                }, () => { });
            }
        );
    }

    componentWillUnmount() {
        this.willFocusSub();
    }

    async handleSearch(e) {
        this.setState({
            users: await getUsersLike(e.nativeEvent.text)
        });
    }

    async handleSelect(user) {
        if (this.state.mail == null) {
            showAlert("Veuillez configurer les paramètres généraux");
        } else {
            const id = user.id;
            let first
            if (this.state.currentUserId == null) first = true
            else first = false
            await setId(id.toString());
            await setUserName(user);
            showAlert(
                `La tablette est configurée pour ${user.prenom} ${user.nom}.`,
                () => {
                    this.setState({ currentUserId: id });
                    if (first) this.props.navigation.replace("Menu")
                    else {
                        this.props.navigation.dispatch(CommonActions.goBack());
                    }
                }
            );
        }
    }

    handleEdit(user) {
        const { navigate } = this.props.navigation;
        navigate("EditUser", {
            user
        });
    }

    async handleExport(user) {
        const { mail } = this.state;
        const fullName = `${user.prenom} ${user.nom}`;
        const isSucess = await sendUserResults(user);
        if (isSucess){
            showAlert(
                `Un email contenant les informations de ${fullName} a été envoyé à ${mail}`,
                null,
                [],
                `Information`
            );
        }
        else{
            showAlert(
                `Une erreur s'est produite durant l'envoie de mail.`,
                null,
                [],
                `Erreur`
            );
        }
    }

    render() {
        const { users, currentUserId } = this.state;
        const { navigate } = this.props.navigation;
        return (
            <View style={styles.container}>
                <View style={styles.noAccount}>
                    <TouchableOpacity
                        onPress={() => navigate("AddUser")}
                        style={styles.actionButtons}
                    >
                        <Text style={common.actionButtonsText}>Ajouter un patient</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigate("Setting")}
                        style={styles.actionButtons}
                    >
                        <Text style={common.actionButtonsText}>Paramètres généraux</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => navigate("Etdrs")}
                        style={styles.actionButtons}
                    >
                        <Text style={common.actionButtonsText}>
                            Échelle ETDRS et acuités
                        </Text>
                    </TouchableOpacity>
                </View>
                {this.SearchBar({ handleSearch: this.handleSearch })}
                <UsersList
                    users={users}
                    currentUserId={currentUserId}
                    handlers={[
                        this.handleSearch,
                        this.handleSelect,
                        this.handleEdit,
                        this.handleExport
                    ]}
                />
            </View>
        )
    }

    /**
    * Search user in the list
    */
    SearchBar({ handleSearch }) {
        return (
            <>
                <TextInput
                    style={{ marginHorizontal: 10, ...common.inputs }}
                    placeholder="Rechercher un patient"
                    onChange={handleSearch}
                />
                <View style={styles.userBox}>
                    <Text style={styles.tableHeader}>Patient</Text>
                    <Text style={styles.tableHeader}>Sexe</Text>
                    <Text style={styles.tableHeader}>Distance</Text>
                    <Text style={styles.tableHeader}>Naissance</Text>
                    <Text style={styles.tableHeader}>Actions</Text>
                </View>
            </>
        );
    }



}

/**
   * List of users
   */
function UsersList({ users, currentUserId, handlers }) {
    const [handleSearch, handleSelect, handleEdit, handleExport] = handlers;
    return (
        <View style={styles.usersList}>
            <FlatList
                data={users}
                keyExtractor={item => item.id.toString()}
                // ListHeaderComponent={<View />}
                renderItem={({ item }) => (
                    <UserElement
                        user={item}
                        currentUserId={currentUserId}
                        handleEdit={handleEdit}
                        handleSelect={handleSelect}
                        handleExport={handleExport}
                    />
                )}
            />
        </View >
    );
}

/**
 * A row of the users list
 */
function UserElement({
    user,
    currentUserId,
    handleEdit,
    handleSelect,
    handleExport
}) {
    const isSelected = user.id === currentUserId;
    return (
        <TouchableHighlight
            underlayColor="#f5f5f5"
            style={{ backgroundColor: isSelected ? "#e8e8e8" : "#fff" }}
            onPress={() => handleSelect(user)}
        >
            <View style={styles.userBox}>
                <Text style={styles.userText}>
                    {user.prenom} {user.nom}
                </Text>
                <Text style={styles.userTextMore}>
                    ({user.sex === "F" ? "Femme" : "Homme"})
          </Text>
                <Text style={{ fontSize: 18 }}>{user.distance} cm</Text>
                <Text style={{ fontSize: 18 }}>
                    {formatDate(new Date(user.date_de_naissance))}
                </Text>
                <View style={styles.actions}>
                    <Button
                        title="Éditer"
                        color={colors.SUCESS}
                        onPress={() => handleEdit(user)}
                    />
                    <Button
                        title="Exporter"
                        onPress={() => handleExport(user)}
                        color={colors.PRIMARY}
                    />
                </View>
            </View>
        </TouchableHighlight>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    usersList : {
        flex: 1
    },  
    noAccount: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 10
    },
    actions: {
        flexDirection: "row"
    },
    userBox: {
        // flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        paddingTop: 26,
        paddingBottom: 26,
        borderBottomWidth: 2,
        borderBottomColor: "#e8e8e8",
        height: 100
    },
    userText: {
        fontSize: 18,
        fontWeight: "bold"
    },
    tableHeader: {
        fontSize: 16,
        fontStyle: "italic"
    },
    userTextMore: {
        fontSize: 14,
        fontStyle: "italic",
        color: colors.DISABLED
    },
    actionButtons: {
        ...common.actionButtons,
        flex: 1,
        alignContent: "space-around",
        marginHorizontal: 5,
        padding: 20
    }
});

import React, { Component } from 'react'
import { StyleSheet,TextInput,TouchableOpacity,Text,View,ActivityIndicator } from "react-native";
  import { setAcuites, getAcuites } from "../src/utils/asyncFunctions";
  import { defaultEtdrsScale } from "../src/utils/config"
  import { styles as common, colors } from "../src/styles/common";
  import { scale } from "react-native-size-matters";


export default class Etdrs extends Component {
    constructor(props) {
    super(props);
    this.state = {
      acuites: {}
    };
    this.handleChangeField = this.handleChangeField.bind(this);
    this.handleChangeAcuite = this.handleChangeAcuite.bind(this);
    this.handleSetAcuites = this.handleSetAcuites.bind(this);
    this.reinitAcuites = this.reinitAcuites.bind(this);
  }

  async componentDidMount() {
    this.setState({
      acuites: await getAcuites()
    });
  }

  handleChangeField(e, field) {
    this.setState({ [field]: e.nativeEvent.text });
  }

  async handleSetAcuites() {
    const { acuites } = this.state;
    const { goBack } = this.props.navigation;
    await setAcuites(acuites);
    goBack();
  }

  handleChangeAcuite(e, i) {
    let { acuites } = this.state;
    acuites[i] = e.nativeEvent.text;
    this.setState({ acuites });
  }

  reinitAcuites() {
    this.setState({
        acuites: {...defaultEtdrsScale}
    });
  }

  render() {
    const { acuites } = this.state;
    return (
      <View style={{ marginBottom: 20 }}>
        <Text style={styles.header}>
          Valeurs des acuités visuelles à tester
        </Text>
        <Form
          acuites={acuites}
          reinitAcuites={this.reinitAcuites}
          handleSetAcuites={this.handleSetAcuites}
          handleChangeAcuite={this.handleChangeAcuite}
        />
      </View>
    );
  }
}

function Form({
    acuites,
    reinitAcuites,
    handleSetAcuites,
    handleChangeAcuite
  }) {
    const acuitesEntries = Object.entries(acuites);
    return (
      <View style={styles.form}>
        <View style={styles.table}>
          <Text style={styles.label}>Échelle EDTRS St-Joseph</Text>
          <Text style={styles.label}>Acuité Visuelle (décimale)</Text>
        </View>
        {acuitesEntries.map(([etdrs, acuite]) => (
          <Field
            key={etdrs}
            value={acuite.toString()}
            label={etdrs}
            handler={e => handleChangeAcuite(e, etdrs)}
          />
        ))}
        <ActivityIndicator
          size="large"
          color="#0000ff"
          animating={acuitesEntries.length === 0}
        />
        <View
          style={{
            justifyContent: "center",
            flexDirection: "row"
          }}
        >
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => handleSetAcuites()}
          >
            <Text style={styles.confirmButtonText}>CONFIRMER ✅</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reinitButton}
            onPress={() => reinitAcuites()}
          >
            <Text style={styles.confirmButtonText}>RÉINITIALISER 🔄</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  function Field({ value, label, handler }) {
    return (
      <View style={styles.table}>
        <View
          style={{
            flex: 1,
            alignSelf: "stretch"
          }}
        >
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={{ flex: 1, alignSelf: "stretch" }}>
          <TextInput
            defaultValue={value}
            style={common.inputs}
            autoCorrect={false}
            defaultValue={value}
            keyboardType="number-pad"
            textContentType="none"
            onChange={handler}
          />
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    form: { width: scale(320), marginVertical: 30 },
    board: {
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 5,
      alignItems: "center"
    },
    header: {
      fontSize: 30,
      fontWeight: "bold",
      margin: 10,
      textAlign: "center"
    },
    table: {
      justifyContent: "space-around",
      flexDirection: "row",
      marginVertical : 5
    },
    confirmButton: {
      ...common.actionButtons,
      borderColor: colors.PRIMARY,
      backgroundColor: colors.PRIMARY,
      width: 300,
      maxWidth: 400
    },
    reinitButton: {
      ...common.actionButtons,
      borderColor: colors.SECONDARY,
      backgroundColor: colors.SECONDARY,
      maxWidth: 400,
      width: 220
    },
    confirmButtonText: {
      color: "#FFFFFF",
      fontSize: 20,
      textAlign: "center"
    },
    label: {
      fontSize: 25,
      marginTop: 3,
      textAlign: "center"
    }
  });



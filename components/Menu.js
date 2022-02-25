import React, { Component } from "react";
import { Text, StyleSheet, View, ActivityIndicator } from "react-native";
import Card from './Card'
import {styles as common } from '../src/styles/common'
import { getFullName, getDoctorEmail} from '../src/utils/asyncFunctions';
import Help from './Help' ;

const texts = [
  {
    id: 1,
    route: "ChooseEye",
    title: "Commencer le test 📝",
    description:
      "Vous allez devoir lire les lettres affichées à l’écran. Veuillez vous installez dans une pièce sombre et silencieuse.",
    image: require("../assets/racing-flag.png"),
  },
  {
    id: 2,
    route: "Score",
    title: "Suivez vos résultats 📈",
    description:
      "Vous pouvez suivre l’évolution de vos résultats au fil du temps ici.",
    image: require("../assets/diagram.png"),
  },
  {
    id: 3,
    route: "SetUser",
    title: "",
    description: "",
    image: require("../assets/settings.png"),
  },
  {
     id: 4,
      route: "TestLetters",
      title: "Améliorer la détection des lettres",
      description:
        "Vous allez devoir lire les lettres affichées à l’écran. Veuillez vous installez dans une pièce sombre et silencieuse.",
      image: require("../assets/icon_letter.png"),
    },

];

export default class Menu extends Component {

  constructor(props) {
    super(props);
    this.state = {
      fullName: null,
      doctorEmail: null,
      isLoaded: false,
    };
  }

  async componentDidMount() {
    await this.getLoggedState();
    this.willFocusSub = this.props.navigation.addListener( 'focus',
      async () => {
        await this.getLoggedState();
      }
    );
    this.props.navigation.setOptions({headerRight : () => (<Help/>)})
  }

  async componentWillUnmount() {
    this.willFocusSub();
  }

  async getLoggedState() {
    this.setState({
      fullName: await getFullName(),
      doctorEmail: await getDoctorEmail(),
      isLoaded: true,
    });
  }

  render() {
    const { fullName, doctorEmail, isLoaded } = this.state;
    const { navigate } = this.props.navigation;
    return (
      <View style={styles.container}>
        <View style={styles.greetings}>
          {isLoaded ? (
            <>
              <UserConnected fullName={fullName} />
              <DoctorMail email={doctorEmail} />
            </>
          ) : (
            <ActivityIndicator size="large" color="#0000ff" />
          )}
        </View>
        <View style={styles.cards}>
          <Cards navigate={navigate} />
        </View>
      </View>
    );
  }
}

function Cards({ navigate }) {
  const [start, scores, params, tests] = texts;
  return (
    <>
      <>

        <Card
          title={start.title}
          description={start.description}
          route={start.route}
          navigate={navigate}
          image={start.image}
        />
        <Card
           title={params.title}
           description={params.description}
           route={params.route}
           navigate={navigate}
           image={params.image}
           style="settings"
         />
      </>
      <View style={styles.rightSide}>
        <Card
          title={scores.title}
          description={scores.description}
          route={scores.route}
          navigate={navigate}
          image={scores.image}
        />

        <Card
            title={tests.title}
            description={tests.description}
            route={tests.route}
            navigate={navigate}
            image={tests.image}
         />

      </View>
    </>
  );
}

function UserConnected({ fullName }) {
  return (
    <View>
      {fullName === null ? (
        <Text style={common.important}>La tablette n'est pas configurée.</Text>
      ) : (
        <Text style={common.important}>
          Le patient <Text style={{ fontWeight: "bold" }}>{fullName}</Text>{" "}
          utilise la tablette.
        </Text>
      )}
    </View>
  );
}

function DoctorMail({ email }) {
  return (
    <View>
      {email ? (
        <Text style={common.important}>
          L'email du médecin est{" "}
          <Text style={{ fontWeight: "bold" }}>{email}</Text>.
        </Text>
      ) : (
        <Text style={common.important}>
          Le mail du médecin n'est pas configurée.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
  },
  greetings: {
    alignItems: "center",
    marginVertical: 5,
  },
  cards: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  rightSide: {
    maxWidth: 250,
  },
});

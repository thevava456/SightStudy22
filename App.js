/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, { Component, useEffect  } from 'react'
import { PermissionsAndroid } from 'react-native'
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SetUser from './components/SetUser';
import Score from './components/Score';
import TestScreen from './components/TestScreen';
import TestLetters from './components/TestLetters';
import Menu from './components/Menu';
import Setting from './components/Setting';
import DistanceFinder from './components/DistanceFinder';
import AddUser, { addUser} from './components/AddUser' ;
import Etdrs from './components/Etdrs';
import EditUser from './components/EditUser'
import * as Font from "expo-font";
import { initDB } from './src/utils/dbFunctions';
import { clear, initDefault, getId } from './src/utils/asyncFunctions';
import ChooseEye from './components/ChooseEye';
import TestResult from './components/TestResult';
import { dropDB} from './src/utils/dbFunctions' ;
import SplashScreen from 'react-native-splash-screen' ;



const Stack = createStackNavigator();

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fontLoaded: false,
      idUser: null
    }
  }

  HomeStack() {
    return (
      <Stack.Navigator initialRouteName={this.state.idUser !== null ? "Menu" : "setUser"}>
        <Stack.Screen name="SetUser" component={SetUser} options={{headerTitle: 'Page medecin'}}/>
        <Stack.Screen name="ChooseEye" component={ChooseEye} options={{headerTitle: 'Choix de l\'oeil'}}/>
        <Stack.Screen name="Score" component={Score} options={{headerTitle: 'Historique des résultats'}}/>
        <Stack.Screen name="TestScreen" component={TestScreen} options={{headerTitle: 'Test'}}/>
        <Stack.Screen name="Menu" component={Menu} options={{headerTitle: 'Menu'}}/>
        <Stack.Screen name="Setting" component={Setting} options={{headerTitle: 'Paramètres'}}/>
        <Stack.Screen name="DistanceFinder" component={DistanceFinder} options={{headerTitle: 'Distance'}}/>
        <Stack.Screen name="EditUser" component={EditUser} options={{headerTitle: 'Edition'}}/>
        <Stack.Screen name="Etdrs" component={Etdrs} options={{headerTitle: 'ETDRS'}}/>
        <Stack.Screen name="AddUser" component={AddUser} options={{headerTitle: 'Ajout d\'un utilisateur'}}/>
        <Stack.Screen name="TestResult" component={TestResult} options={{headerTitle: 'Fin du test'}} />
        <Stack.Screen name="TestLetters" component={TestLetters} options={{headerTitle: 'Amelioration de la detection'}} />
      </Stack.Navigator>

    )
  }

  async componentDidMount() {
    //SplashScreen.show();

    
    this.setState({ idUser: await getId() })
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.CAMERA
    ]);
    // await clear()
    await initDB();


    await Font.loadAsync({
      "optician-sans": require("./assets/fonts/Optician-Sans.otf")
    });


    this.setState({
      fontLoaded: true
    });
    await initDefault();
    
    SplashScreen.hide();
    
  }

  render() {
    return this.state.fontLoaded ? (
      <NavigationContainer>
        {this.HomeStack()}
      </NavigationContainer>
    ) : null
  }
}

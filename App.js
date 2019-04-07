import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, Alert, TouchableWithoutFeedback, Keyboard, Image, AsyncStorage, Button } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'SelfieLessActs',
    headerLeft: null,
    headerRight: null,
  };

  constructor(props) {
    super(props)
    this.state = {
      teamId: "",
      ipAddress: ""
    }
  }

  onLogIn = () => {
    AsyncStorage.setItem("teamId", this.state.teamId);
    AsyncStorage.setItem("ipAddress", this.state.ipAddress);
    this.props.navigation.navigate("Home", { name: "Home" });
  }

  componentDidMount = () => {
    AsyncStorage.getItem("teamId").then((teamId) => {
      if (teamId != null) this.props.navigation.navigate("Home", { name: "Home" });
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Image source={require('./assets/selfie_icon.png')} style={{ width: 100, height: 100 }} />
          <Text style={styles.text}>Welcome to SelfieLessActs!</Text>
          <TextInput style={styles.textInput} placeholder="Enter your TEAM ID" onChangeText={(teamId) => this.setState({ teamId })} />
          <TextInput style={styles.textInput} placeholder="Enter your IP" onChangeText={(ipAddress) => this.setState({ ipAddress })} />
          <TouchableHighlight style={styles.button} onPress={this.onLogIn}>
            <Text style={{ fontSize: 17 }}>LOG IN</Text>
          </TouchableHighlight>
          <View style={{ height: 100 }} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

class HomeScreen extends React.Component {
  static navigationOptions = {
    title: 'Home',
    headerLeft: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      team: 'YOUR TEAM',
      ip: 'YOUR IP',
      modalVisible: false
    }
  }

  onLogOut = () => {
    AsyncStorage.removeItem("teamId");
    AsyncStorage.removeItem("ipAddress");
    this.props.navigation.navigate("Login", { name: "Login" });
  }

  componentDidMount = () => {
    AsyncStorage.getItem("teamId").then((teamId) => {
      AsyncStorage.getItem("ipAddress").then((ipAddress) => {
        this.setState({
          team: teamId,
          ip: ipAddress
        });
      });
    });
  }

  setModalVisible = (visible) => {
    this.setState({ modalVisible: visible });
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Text style={styles.text}>{this.state.team}-{this.state.ip}</Text>
          <TouchableHighlight style={styles.button} onPress={this.onLogOut}>
            <Text style={{ fontSize: 17 }}>LOG OUT</Text>
          </TouchableHighlight>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 17,
    padding: 10,
  },
  textInput: {
    fontSize: 17,
    paddingTop: 10,
    paddingBottom: 10,
    textAlign: 'center',
  },
  button: {
    height: 40,
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10
  }
});

const MainNavigator = createStackNavigator({
  Login: { screen: LoginScreen },
  Home: { screen: HomeScreen },
});

const App = createAppContainer(MainNavigator);

export default App;

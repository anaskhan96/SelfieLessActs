import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, Alert, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import { verticalScale, moderateScale } from './dimensions';

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      teamId: "",
      ipAddress: ""
    }
  }

  onLogIn = () => {
    Alert.alert("TeamId entered is " + this.state.teamId);
    Alert.alert("IP Addr is " + this.state.ipAddress);
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
      <Image source={require('./assets/selfie_icon.png')} style={{width: 100, height: 100}}/>
        <Text style={styles.text}>Welcome to SelfieLessActs!</Text>
        <TextInput style={styles.textInput} placeholder="Enter your TEAM ID" onChangeText={(teamId) => this.setState({teamId})} />
        <TextInput style={styles.textInput} placeholder="Enter your IP" onChangeText={(ipAddress) => this.setState({ipAddress})}/>
        <TouchableHighlight style={styles.button} onPress={this.onLogIn}>
          <Text style={{fontSize: 17}}>LOG IN</Text>
        </TouchableHighlight>
      </View>
      </TouchableWithoutFeedback>
    );
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

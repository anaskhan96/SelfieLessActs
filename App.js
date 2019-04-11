import React from 'react';
import { Modal, StyleSheet, Text, View, TextInput, TouchableHighlight, Alert, TouchableWithoutFeedback, Keyboard, Image, AsyncStorage, Button, TouchableOpacity } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';
import Menu, { MenuItem } from 'react-native-material-menu';
import { ScrollView } from 'react-native-gesture-handler';
import { Camera, Permissions, ImageManipulator } from 'expo';

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
    if (this.state.teamId == "" || this.state.ipAddress == "") {
      Alert.alert("Inputs cannot be empty");
      return;
    }
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
          <TextInput style={styles.textInput} placeholder="Enter your IP + PORT" onChangeText={(ipAddress) => this.setState({ ipAddress })} />
          <TouchableHighlight style={styles.button} onPress={this.onLogIn}>
            <Text style={{ fontSize: 17 }}>LOG IN</Text>
          </TouchableHighlight>
          <View style={{ height: 200 }} />
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
  _menu = null;

  setMenuRef = ref => {
    this._menu = ref;
  };

  hideMenu = (key) => {
    this._menu.hide();
    if (this.state.categories[key] != 'Loading...') {
      this.setState({ currentCategory: this.state.categories[key] });
      this.loadActs(this.state.categories[key]);
    }
  };

  showMenu = () => {
    this._menu.show();
  };

  constructor(props) {
    super(props);
    this.state = {
      team: 'YOUR TEAM',
      ip: 'YOUR IP',
      categories: ['Loading...'],
      currentCategory: 'Click Here',
      acts: [{ actId: 'NO_ACTS', text: 'No category selected' }],
      modalVisible: false,
      currentImgB64: ''
    }
  }

  toggleModal = (visible) => {
    this.setState({
      modalVisible: visible,
    });
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
        this.loadCategories();
      });
    });
  }

  loadCategories = () => {
    let categoryApi = 'http://' + this.state.ip + '/api/v1/categories';
    console.log('Making call to ' + categoryApi);
    fetch(categoryApi).then(response => {
      if (response.status == 200) {
        response.json().then(res => {
          let categories = [];
          for (let key in res) {
            categories.push(key);
          }
          this.setState({ categories: categories });
        }).catch(err => {
          Alert.alert("Error parsing response json while fetching categories :- " + err);
        });
      } else if (response.status == 204) {
        Alert.alert("No categories found :/");
      } else {
        Alert.alert("Error fetching categories :- " + response.status + " " + response.statusText);
      }
    }).catch(err => {
      console.log(err);
      Alert.alert('Error fetching categories :- ' + err);
    });
  }

  loadActs = (category) => {
    let actsApi = 'http://' + this.state.ip + '/api/v1/categories/' + category + '/acts';
    console.log('Making call to ' + actsApi);
    this.setState({
      acts: [{
        actId: 'NO_ACTS',
        text: 'Please wait while we fetch acts for category ' + category
      }]
    });
    fetch(actsApi).then(response => {
      if (response.status == 200) {
        response.json().then(res => {
          this.setState({ acts: res });
        }).catch(err => {
          Alert.alert("Error parsing json while fetching acts :- " + err);
        });
      } else if (response.status == 204) {
        Alert.alert("No acts found for given category :/");
      } else {
        Alert.alert("Error fetching acts for given category :- " + response.status + " " + response.text);
      }
    }).catch(err => {
      console.log(err);
      Alert.alert('Error fetching acts for ' + category + ' :- ' + err);
    })
  }

  viewImage = (key) => {
    console.log(key);
    this.setState({
      currentImgB64: this.state.acts[key].imgB64,
    }, () => {
      console.log(this.state.currentImgB64);
      this.toggleModal(true);
    });
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'stretch' }}>
        <View style={{ flex: 0.4 }}>
          <Text style={styles.text}>{this.state.team} :- {this.state.ip}</Text>
        </View>
        <View style={{ flex: 0.4, flexDirection: 'row', alignItems: 'stretch' }}>
          <Text style={styles.text}>Select Category: </Text>
          <Menu
            ref={this.setMenuRef}
            button={<Text onPress={this.showMenu} style={styles.text}>{this.state.currentCategory}</Text>}
          >
            {this.state.categories.map((value, key) => {
              return (
                <MenuItem onPress={() => this.hideMenu(key)} key={key}>{value}</MenuItem>
              )
            })}
          </Menu>
        </View>
        <View style={{ flex: 5 }}>
          <ScrollView>
            {this.state.acts.map((value, key) => {
              if (value.actId == "NO_ACTS")
                return (
                  <Text style={styles.text} key={key}>{value.text}</Text>
                )
              return (
                <View key={key}>
                  <Text style={styles.minorText}>actId: {value.actId}</Text>
                  <Text style={styles.minorText}>username: {value.username}</Text>
                  <Text style={styles.minorText}>caption: {value.caption}</Text>
                  <TouchableHighlight style={styles.button} onPress={() => this.viewImage(key)}>
                    <Text style={{ fontSize: 17 }}>VIEW IMAGE</Text>
                  </TouchableHighlight>
                </View>
                //<View style={{ borderBottomColor: 'black', borderBottomWidth: 1 }}></View>
              )
            })}
          </ScrollView>
        </View>
        <View style={{ flex: 0.6, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'stretch', alignContent: 'stretch' }}>
          <TouchableHighlight style={styles.button} onPress={this.onLogOut}>
            <Text style={{ fontSize: 17 }}>LOG OUT</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button} onPress={this.addImage}>
            <Text style={{ fontSize: 17 }} onPress={() => this.props.navigation.navigate("Camera", { name: "Camera" })}>ADD IMAGE</Text>
          </TouchableHighlight>
        </View>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Closed.');
          }}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <View>
              <Image source={{ uri: `data:image/jpg;base64,${this.state.currentImgB64}`, width: 350, height: 350 }} resizeMode='contain' />
              <TouchableHighlight style={styles.button}
                onPress={() => {
                  this.toggleModal(!this.state.modalVisible);
                }}>
                <Text style={{ fontSize: 17 }}>GO BACK</Text>
              </TouchableHighlight>
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

class CameraScreen extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
    modalVisible: false,
    capturedImgB64: '',
  };
  _camera = null;

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  toggleModal = (visible) => {
    this.setState({
      modalVisible: visible,
    })
  }

  async takePic() {
    let data = await this._camera.takePictureAsync({ skipProcessing: true, base64: true })
    let resizedPic = await ImageManipulator.manipulateAsync(data.uri, [{ resize: { width: 350, height: 350 } }], { compress: 0, format: "jpg", base64: true });
    console.log(resizedPic.base64);
    this.setState({
      capturedImgB64: resizedPic.base64,
    });
    this.toggleModal(true);
  }

  saveImage = (imgB64) => {
    console.log('Save image called');
    this.toggleModal(false);
    this.props.navigation.navigate("ActAdd", { imgB64: imgB64 });
  }

  render() {
    const { hasCameraPermission } = this.state;
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.type} ref={(ref) => this._camera = ref}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={{ fontSize: 20, marginBottom: 12, color: 'white' }}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }} onPress={this.takePic.bind(this)}>
                <Text
                  style={{ fontSize: 20, marginBottom: 12, color: 'white' }}>
                  {' '}Take Photo{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              Alert.alert('Closed.');
            }}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <View>
                <Image source={{ uri: `data:image/jpg;base64,${this.state.capturedImgB64}`, width: 350, height: 350 }} resizeMode='contain' />
                <TouchableHighlight style={styles.button}
                  onPress={() => {
                    this.toggleModal(!this.state.modalVisible);
                  }}>
                  <Text style={{ fontSize: 17 }}>GO BACK</Text>
                </TouchableHighlight>
                <TouchableHighlight style={styles.button}
                  onPress={() => {
                    this.saveImage(this.state.capturedImgB64);
                  }}>
                  <Text style={{ fontSize: 17 }}>SAVE IMAGE</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </View>
      );
    }
  }
}

class ActAddScreen extends React.Component {
  static navigationOptions = {
    title: 'Add a new act'
  }

  constructor(props) {
    super(props);
    this.state = {
      imgB64: '',
      username: '',
      caption: '',
      category: '',
      ip: '',
      processingImage: true,
    };
  }

  componentDidMount = () => {
    AsyncStorage.getItem('ipAddress').then(ip => {
      this.setState({
        ip: ip,
        imgB64: this.props.navigation.getParam('imgB64'),
      });
    });
  }

  saveAct = () => {
    console.log('Save act called');
    let newAct = {
      actId: (new Date).getTime(),
      username: this.state.username,
      timestamp: "10-10-2019:45-23-03",
      caption: this.state.caption,
      categoryName: this.state.category,
      imgB64: this.state.imgB64
    }
    console.log(newAct);
    let addActApi = 'http://' + this.state.ip + "/api/v1/acts";
    console.log('Making a call to ' + addActApi);
    fetch(addActApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(newAct)
    }).then(response => {
      if (response.status == 201) {
        Alert.alert('Act successfully added!');
      } else {
        Alert.alert("Act couldn't be added :/ Check if the usernames, category are valid.");
      }
    }).catch(err => {
      Alert.alert('API to add act failed: ' + err);
    });
  }

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <TextInput style={styles.textInput} placeholder="Enter a valid username" onChangeText={(username) => this.setState({ username })} />
          <TextInput style={styles.textInput} placeholder="Enter a caption" onChangeText={(caption) => this.setState({ caption })} />
          <TextInput style={styles.textInput} placeholder="Enter a valid category" onChangeText={(category) => this.setState({ category })} />
          <TouchableHighlight style={styles.button} onPress={this.saveAct}>
            <Text style={{ fontSize: 17 }}>ADD ACT</Text>
          </TouchableHighlight>
          <TouchableHighlight style={styles.button} onPress={() => this.props.navigation.navigate("Home", { name: "Home" })}>
            <Text style={{ fontSize: 17 }}>GO TO HOME</Text>
          </TouchableHighlight>
          <View style={{ height: 200 }} />
        </View>
      </TouchableWithoutFeedback>
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
  minorText: {
    fontSize: 15,
    padding: 6,
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
  Camera: { screen: CameraScreen },
  ActAdd: { screen: ActAddScreen },
});

const App = createAppContainer(MainNavigator);

export default App;

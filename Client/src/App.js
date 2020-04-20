import React from 'react';
import Checkers from './components/Checkers';
import Display from './components/Display';
import CenteredButton from './components/CenteredButton';

//connection
import io from 'socket.io-client';

let socket;

const initialState = {
  step: "Welcome",
  connected: false,
}

var name = "";
var roomName = "";
var opponentName = "";
var isRoomHost = false;
var matchStarted = false;

const ENDPOINT = 'localhost:5000';

class App extends React.Component {

  state = initialState;

  handleChangeName = (e) => {
	name = e.target.value;
  }

  handleRoom = (e) => {
    roomName = e.target.value;
  }

  enteredName = () => {
    if(name === undefined || name === "") {
      name = names[Math.floor(Math.random() * names.length)]
    }

    this.setState({
      step: "Searching",
	})
	
	socket = io(ENDPOINT);
	socket.emit('user-login', name);

	socket.on('user-created-room', this.createRoomSuccess);
	socket.on('creating-failed', this.createRoomFailed);

	socket.on('user-joined', this.joinRoomSuccess);
	socket.on('joining-failed', this.joinRoomFailed);

	socket.on('user-left', () => {
		console.log('user left');

		opponentName = "";
		isRoomHost = false;

		this.setState({
			step: "Searching",
		})
	})
  }

  requestJoinRoom = () => {
	if(this.validateRoomName() === false){
		console.log("Room name not valid");
		return;
	}

	socket.emit('user-join-room', {
		name: name,
		roomName: roomName
	});
  }

  joinRoomSuccess = (enemy) => {
	opponentName = enemy;
	matchStarted = true;

	this.setState({
		step: "Playing",
	})
  }

  joinRoomFailed = (reason) => {
	console.log(reason);
  }

  requestCreateRoom = () => {
	if(this.validateRoomName() === false){
		console.log("Room name not valid");
		return;
	}

	socket.emit('user-create-room', roomName);
  }

  createRoomSuccess = (reason) => {
		isRoomHost = true;

		this.setState({
			step: "Playing",
		});
	}

  createRoomFailed = (reason) => {
	console.log(reason);
  }

  validateRoomName = () => {
	  if(roomName === undefined || roomName === ""){
		  return false;
	  }

	  return true;
  }

  render() {

    var UI = "";
    if(this.state.step === "Welcome") {
      UI = [
        <div>
          <input placeholder="Enter name..." onChange={ this.handleChangeName } style={{marginTop: '10%'}}></input>
          <CenteredButton callback={this.enteredName} text="Confirm name"></CenteredButton>
        </div>
      ]
    } else if (this.state.step === "Searching") {
      UI = [
        <h1>Welcome {name}</h1>,
        <div style={{marginTop: '7%'}}>
          <input placeholder="Enter room name..." onChange={ this.handleRoom }></input>
          <div>
            <CenteredButton callback={this.requestCreateRoom} text="Create room"></CenteredButton>
            <CenteredButton callback={this.requestJoinRoom} text="Join room"></CenteredButton>
          </div>
      </div>
      ]
    } else {
      UI = [
        <div className="container">
			<Display dir="left" text={ isRoomHost ? name : opponentName }></Display>
			<div className="boardContainer">
				<Checkers matchStarted={matchStarted} player={isRoomHost ? "P1" : "P2"} socket={socket}/>
			</div>
			<Display dir="right" text={isRoomHost ? opponentName : name}></Display>
        </div>
      ]
    }

    return (
      <div className="App">
        <div className="Title">Checkers Online</div>

        {UI}
      </div>
    );
  }
}

export default App;

const names = [
		"nar",
		"An",
		"Alfr",
		"Alvi",
		"Ari",
		"Arinbjorn",
		"Arngeir",
		"Arngrim",
		"Arnfinn",
		"Asgeirr",
		"Askell",
		"Asvald",
		"Bard",
		"Baror",
		"Bersi",
		"Borkr",
		"Bjarni",
		"Bjorn",
		"Brand",
		"Brandr",
		"Cairn",
		"Canute",
		"Dar",
		"Einarr",
		"Eirik",
		"Egill",
		"Engli",
		"Eyvindr",
		"Erik",
		"Eyvind",
		"Finnr",
		"Floki",
		"Fromund",
		"Geirmundr",
		"Geirr",
		"Geri",
		"Gisli",
		"Gizzur",
		"Gjafvaldr",
		"Glumr",
		"Gorm",
		"Grmir",
		"Gunnarr",
		"Guomundr",
		"Hak",
		"Halbjorn",
		"Halfdan",
		"Hallvard",
		"Hamal",
		"Hamundr",
		"Harald",
		"Harek",
		"Hedinn",
		"Helgi",
		"Henrik",
		"Herbjorn",
		"Herjolfr",
		"Hildir",
		"Hogni",
		"Hrani",
		"Ivarr",
		"Hrolf",
		"Jimmy",
		"Jon",
		"Jorund",
		"Kalf",
		"Ketil",
		"Kheldar",
		"Klaengr",
		"Knut",
		"Kolbeinn",
		"Kolli",
		"Kollr",
		"Lambi",
		"Magnus",
		"Moldof",
		"Mursi",
		"Njall",
		"Oddr",
		"Olaf",
		"Orlyg",
		"Ormr",
		"Ornolf",
		"Osvald",
		"Ozurr",
		"Poror",
		"Prondir",
		"Ragi",
		"Ragnvald",
		"Refr",
		"Runolf",
		"Saemund",
		"Siegfried",
		"Sigmundr",
		"Sigurd",
		"Sigvat",
		"Skeggi",
		"Skomlr",
		"Slode",
		"Snorri",
		"Sokkolf",
		"Solvi",
		"Surt",
		"Sven",
		"Thangbrand",
		"Thjodoft",
		"Thorod",
		"Thorgest",
		"Thorvald",
		"Thrain",
		"Throst",
		"Torfi",
		"Torix",
		"Tryfing",
		"Ulf",
		"Valgaror",
		"Vali",
		"Vifil",
		"Vigfus",
		"Vika",
		"Waltheof"
	];
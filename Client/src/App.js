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
var opponentName = "";
var isRoomHost = false;

const ENDPOINT = 'localhost:5000';

class App extends React.Component {

  state = initialState;

  handleChangehandleChangeName = (e) => {
    name = e.target.value;
  }

  handleChangehandleRoom = (e) => {
    name = e.target.value;
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

	socket.on('joining-failed', () => {console.log("Failed to join room "); });
	socket.on('user-joined', (enemy) => {
		console.log(enemy);
		opponentName = enemy;

		this.setState({
			step: "Playing",
		})
	});

	socket.on('user-left', () => {
		console.log('user left');

		opponentName = "";
		isRoomHost = false;

		this.setState({
			step: "Searching",
		})
	})
  }

  joinRoom = () => {
	socket.emit('user-join-room', {
		name: name,
		roomName: "TestRoom"
	});
  }

  createRoom = () => {
	socket.emit('user-create-room', "TestRoom");
	isRoomHost = true;

	this.setState({
		step: "Playing",
	})
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
          <input placeholder="Enter room name..." onChange={ this.handleChangehandleRoom }></input>
          <div>
            <CenteredButton callback={this.createRoom} text="Create room"></CenteredButton>
            <CenteredButton callback={this.joinRoom} text="Join room"></CenteredButton>
          </div>
      </div>
      ]
    } else {
      UI = [
        <div className="container">
			<Display dir="left" text={ isRoomHost ? name : opponentName }></Display>
			<div className="boardContainer">
				<Checkers/>
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
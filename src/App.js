import React,{ Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation.js';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';


const app = new Clarifai.App({
  apiKey: '32180af47a674803a860c0b274c9a201'
 });

 const particlesOptions = {
   particles:{
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends React.Component{
  constructor(){
    super();
    this.state = {
      input:'',
      imgUrl:'',
      box:{},
      route:'',
      issignedin: false,
      user:{
        id:'',
        name:'',
        email:'',
        entries:0,
        joined: ''
      }
    }
  }

  loadUser = (data)=>{
    this.setState({user:{
      id:data.id,
      name:data.name,
      email:data.email,
      password:data.password,
      entries:data.entries,
      joined: data.joined
    }})
  }

  componentDidMount(){
    fetch('http://localhost:3000/')
    .then(response=>response.json())
    .then(console.log)
  }

  onInputChange = (event) =>{
   //console.log(event.target.value)
   this.setState({input: event.target.value});
   
  }
  displayFaceBox = (box) =>{
    console.log(box);
    this.setState({box: box})
  }

  calculateFaceLoacation = (data) =>{
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width)
    const height = Number(image.height)
    console.log(width,height)
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
    
  }

  onSubmit = () =>{
    
    this.setState({imgUrl: this.state.input})
    
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
    .then(response =>{
      if(response){
        fetch('http://localhost:3000/image',{
          method:'put',
          headers:{'Content-type':'application/json'},
          body:JSON.stringify({
              id:this.state.user.id
          })
        })
        .then(response=>response.json())
        .then(count => {
          this.setState(Object.assign(this.state.user,{entries:count}))
        })
      }
      this.displayFaceBox(this.calculateFaceLoacation(response)) 
    })

    .catch(err => console.log(err));    
  }

  onRouteChange = (route,issignedin) =>{
    if(route ==='signout'){
      this.setState({issignedin:false})
    }else if(route ==='Home'){
      this.setState({issignedin:true})
    }
    this.setState({route:route})
    console.log(route)
  }
  // onSignout = () =>{
  //   this.setState({route:'signin'})
  // }

  render(){
    return (
      <div className="App">
      <Particles className = 'particles' 
      params={particlesOptions}
      />
      <Navigation issignedin = {this.state.issignedin} onRouteChange = {this.onRouteChange}/>
      { 
        this.state.route === 'Home'
        ? 
         <div>
            <Logo/>
            <Rank name = {this.state.user.name} entries = {this.state.user.entries}/>
            <ImageLinkForm 
            onInputChange  = {this.onInputChange} 
            onSubmit = {this.onSubmit} 
            />
            <FaceRecognition box = {this.state.box} imgUrl = {this.state.imgUrl}/>
          </div>
        : (
            this.state.route ==='signin'
            ? <Signin issignedin = {this.state.issignedin} onRouteChange = {this.onRouteChange} loadUser = {this.loadUser}/>
            : <Register  issignedin = {this.state.issignedin}  onRouteChange = {this.onRouteChange} loadUser = {this.loadUser}/>
          )
      }
      </div>
    );
  }

}
export default App;

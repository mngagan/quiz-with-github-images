import React, { Component } from 'react';
import { render } from 'react-dom';
import './style.css';
import config from './config.json'
import _ from 'underscore'
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import $ from 'jquery'
import { uuid } from 'uuidv4';
// import { QuestionAnswers } from './questionAnswers';


// let effects = ['Zoom', 'FlipXDown', 'FlipXUp', 'FlipYLeft', 'FlipYRight']
let effects = ['Zoom']
class App extends Component {

  constructor() {
    super();
    this.state = {
      name: 'React',
      startPage: true,
      quiz: this.createCountObj(),
      showDialog: false,
      activeId: null,
      imagePaths : []
    };
    this.animationSettings = { effect: _.sample(effects), duration: 1000 };
    this.dlgButton = [{
      click: () => { this.dialogClose() },
      buttonModel: { content: 'Done', isPrimary: true }
    }];
    this.seconds = 0
    this.minutes = 0
  }

  componentDidMount = () => {
    var that = this
     $.ajax({url: "https://api.github.com/repos/mngagan/react-quiz-working/git/trees/master?recursive=1", success: function(result){
    that.handleResponse({result})
  }});
    setInterval(function () {
      if (that.seconds === 59) {
        that.seconds = 0
      }
      else {
        that.seconds = that.seconds + 1
      }
      $('#secs').html(that.seconds)
    }, 1000);

    setInterval(function () {
      if (that.minutes === 59) {
        that.minutes = 0
      }
      else {
        that.minutes = that.minutes + 1
      }
      $('#mins').html(that.minutes)
    }, 60000);

  }
  handleResponse = (arg) => {
    let {tree} = arg.result
    let images = _.filter(tree , (obj) => {return obj.type =='blob' && obj.path.split('/')[0] == 'QUIZE' } )
    let imagePaths = _.pluck(images, 'path')
    let result = []
    imagePaths.map((val, index) => {
      result.push({
        id: index + 1,
        active: true,
        imagePath : `https://raw.githubusercontent.com/mngagan/react-quiz-working/master/${val}`
      })
    })

    this.setState({
      quiz : result, 
    })
  }
  createCountObj = () => {
    let count = config.count
    let result = []
    _.range(1, count + 1).map((val, index) => {
      result.push({
        id: val,
        active: true,
      })
    })
    return result
  }

  dialogClose = () => {
    let quiz = this.state.quiz
    quiz = quiz.map((arg, index) => {
      if (arg.id === this.state.activeId) {
        arg.active = false
      }
      return arg
    })
    this.setState({ showDialog: false, quiz });
    this.animationSettings.effect = _.sample(effects)

  }
  renderButtons = () => {
    console.log(' in render buttons')
    return (
      <div style={{ textAlign: "center" }}>
        {this.state.quiz.map((val, index) => {
          return <button key={uuid()} className='e-control e-btn e-outline e-primary buttonStyle' onClick={() => { this.handleButtonClick({ id: val.id }) }} id={val.id} disabled={!val.active}>{val.id}</button>
        })}
      </div>
    )
  }

  handleButtonClick = (arg) => {
    let { id } = arg
    this.setState({
      activeId: id,
      showDialog: true
    })
  }

  render() {
    window.state = this.state
    let remainingCount = _.filter(this.state.quiz, (arg) => { return !arg.active }).length
    window.state = this.state
    return (
      <div className='container'>
        <div className='row'>
          <div className='title'>
            {config.title}
            <div className={'remainingCount'}> {remainingCount} of {config.count} </div>
            {false &&<div className={'time'}><span id='mins'>00</span> : <span id='secs'>0</span></div>}
          </div>
        </div>
        {config.type === 'image' && this.renderButtons()}
        {this.state.showDialog && config.type === 'image' && this.renderModal()}
        {config.type === 'questions' && <QuestionAnswers/>}
      </div>
    );
  }

  renderModal = () => {
    return <DialogComponent
      id='AnimationDialog'
      isModal={true}
      header={'Question ' + this.state.activeId}
      showCloseIcon={true}
      animationSettings={this.animationSettings}
      width='95%'
      height='95%'
      ref={defaultDialog => this.defaultDialogInstance = defaultDialog}
      target='#target'
      buttons={this.dlgButton}
      visible={this.state.showDialog}
      beforeClose={() => this.dialogClose()}
    >
       <span><img src={`${this.state.quiz[this.state.activeId - 1].imagePath}`} 
      //  width={'100%'} 
      //  height={'100%'} 
       style={{maxHeight:'450px',maxWidth:'800px',height:'auto',width:'auto'}}
       className='imageStyle' /></span>
    </DialogComponent>
  }
}

render(<App />, document.getElementById('root'));

import React, { Component } from 'react'

import './App.css'
import Silhouette from './Silhouette'

// eslint-disable-next-line react/prefer-stateless-function
class App extends Component {
  render() {
    return (
      <div className="App">
        <Silhouette />
      </div>
    )
  }
}

export default App

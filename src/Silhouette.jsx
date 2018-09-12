import React from 'react'
import * as Pixi from 'pixi.js'

import './scene.css'

// eslint-disable-next-line react/prefer-stateless-function
class Silhouette extends React.Component {
  state = {
    viewWidth: 800,
    viewHeight: 600,
  }

  componentDidMount() {
    const { viewWidth, viewHeight } = this.state
    // this.app = new Pixi.Application(window.innerWidth, window.innerHeight)
    this.app = new Pixi.Application(viewWidth, viewHeight, { antialias: true })
    this.gameCanvas.appendChild(this.app.view)

    let renderTexture = new Pixi.RenderTexture(this.app.renderer, this.app.renderer.width, this.app.renderer.height)
    let renderTexture2 = new Pixi.RenderTexture(this.app.renderer, this.app.renderer.width, this.app.renderer.height)

    const outputSprite = new Pixi.Sprite(renderTexture)
    this.app.stage.addChild(outputSprite)

    const dot = new Pixi.Graphics()
    dot.beginFill(0xFF9900)
    dot.drawCircle(-8, -8, 16)
    dot.endFill()
    dot.cacheAsBitmap = true
    this.app.stage.addChild(dot)

    const MAX_VEL = 10
    const bounceRandomness = 0.2 * MAX_VEL
    dot.xVel = Math.random() * MAX_VEL
    dot.yVel = Math.random() * MAX_VEL

    const bounceVariationFn = (range) => {
      function a() {
        return Math.random() * (range * 2) - range
      }
      return a
    }
    const bounceVariation = bounceVariationFn(bounceRandomness)

    const bg = new Pixi.Graphics()
    bg.beginFill(0, 0.1)
    bg.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height)
    bg.endFill()
    bg.cacheAsBitmap = true
    this.app.stage.addChild(bg)

    this.app.ticker.add(() => {
      const dt = this.app.ticker.deltaTime

      dot.x += dot.xVel * dt
      dot.y += dot.yVel * dt

      if ((dot.x >= viewWidth && dot.xVel >= 0)
        || (dot.x < 0 && dot.xVel <= 0)) {
        dot.xVel = -dot.xVel + bounceVariation()
        dot.yVel += bounceVariation()
        if (dot.xVel > MAX_VEL) {
          dot.xVel *= 0.99
        }
      }
      if ((dot.y >= viewHeight && dot.yVel >= 0)
        || (dot.y < 0 && dot.yVel <= 0)) {
        dot.yVel = -dot.yVel + bounceVariation()
        dot.xVel += bounceVariation()
        if (dot.yVel > MAX_VEL) {
          dot.yVel *= 0.99
        }
      }

      // dot.x = this.app.renderer.width * 0.5 + (Math.cos(tick) * 200)
      // dot.y = this.app.renderer.height * 0.5 + (Math.sin(tick) * 200)

      const temp = renderTexture
      renderTexture = renderTexture2
      renderTexture2 = temp
      outputSprite.texture = renderTexture

      renderTexture2.render(this.app.stage, null, false)
      this.app.renderer.render(this.app.stage)
    })

    this.app.start()
  }

  componentWillUnmount() {
    this.app.stop()
  }

  render() {
    const component = this
    // const { fps } = this.state
    return (
      <div className="scene-container">
        <div className="scene-controls">
          <h2>2D Scenes</h2>
        </div>
        <div className="scene-view" ref={(thisDiv) => { component.gameCanvas = thisDiv }} />
      </div>
    )
  }
}

export default Silhouette

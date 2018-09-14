/* eslint-disable no-param-reassign */
import React from 'react'
import * as Pixi from 'pixi.js'

import './scene.css'
import silhouetteSvg from './svg/teapot-white.svg'

// eslint-disable-next-line react/prefer-stateless-function
class Silhouette extends React.Component {
  state = {
    viewWidth: 800,
    viewHeight: 600,
    trails: true,
  }

  componentDidMount() {
    const { loader } = Pixi
    loader.add('silhouette', silhouetteSvg)
    loader.load((loaders, resources) => {
      this.silhouette = new Pixi.Sprite(resources.silhouette.texture)
    })
    loader.onComplete.add(() => this.initialize())
  }

  componentWillUnmount() {
    this.app.stop()
  }

  handleTrailsChange = () => {
    const { trails } = this.state
    this.setState({
      trails: !trails,
    })
  }

  initialize = () => {
    const { viewWidth, viewHeight } = this.state
    const { silhouette } = this
    // this.app = new Pixi.Application(window.innerWidth, window.innerHeight)
    this.app = new Pixi.Application(viewWidth, viewHeight, { antialias: true })
    this.app.renderer.plugins.interaction.autoPreventDefault = false
    this.app.renderer.view.style.touchAction = 'auto'

    this.gameCanvas.appendChild(this.app.view)

    // const silhouetteTexture = Pixi.Texture.fromImage(silhouetteSvg)
    // const silhouette = new Pixi.Sprite(silhouetteTexture)
    const silhouetteMatrix = new Pixi.filters.ColorMatrixFilter()
    silhouetteMatrix.brightness(0.0022)
    // // silhouetteMatrix.lsd(true)
    // silhouetteMatrix.blackAndWhite(true)
    silhouette.filters = [silhouetteMatrix]
    silhouette.anchor.set(0.5)
    silhouette.x = this.app.renderer.width / 2
    silhouette.y = this.app.renderer.height / 2
    this.app.stage.addChild(silhouette)
    const silhouettePixels = this.app.renderer.plugins.extract.pixels(silhouette)

    // console.log(silhouette.x, silhouette.y, silhouette.width, silhouette.height)

    const silhouettePolygon = new Pixi.Polygon([
      silhouette.x - silhouette.width / 2, silhouette.y - silhouette.height / 2,
      silhouette.x + silhouette.width / 2, silhouette.y - silhouette.height / 2,
      silhouette.x + silhouette.width / 2, silhouette.y + silhouette.height / 2,
      silhouette.x - silhouette.width / 2, silhouette.y + silhouette.height / 2,
    ])

    const renderTexture = Pixi.RenderTexture.create(this.app.renderer.width, this.app.renderer.height)
    const renderTexture2 = Pixi.RenderTexture.create(this.app.renderer.width, this.app.renderer.height)

    const outputSprite = new Pixi.Sprite(renderTexture)
    this.app.stage.addChild(outputSprite)

    const maxVel = 5
    const bounceRandomness = 0.2 * maxVel

    const dots = []
    for (let i = 0; i < 1000; i += 1) {
      const dot = new Pixi.Graphics()
      dot.beginFill(0xFF9900)
      dot.drawCircle(-1, -1, 2)
      dot.endFill()
      dot.cacheAsBitmap = true

      dot.x = Math.random() * viewWidth


      dot.xVel = Math.random() * maxVel
      dot.yVel = Math.random() * maxVel

      dots.push(dot)
      this.app.stage.addChild(dot)
    }

    const bounceVariationFn = (range) => {
      function a() {
        return Math.random() * (range * 2) - range
      }
      return a
    }
    const bounceVariation = bounceVariationFn(bounceRandomness)

    const bg = new Pixi.Graphics()
    bg.beginFill(0, 0.08)
    bg.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height)
    bg.endFill()
    bg.cacheAsBitmap = true
    this.app.stage.addChild(bg)

    this.app.ticker.add(this.tick)

    this.setState({
      dots,
      silhouette,
      silhouettePolygon,
      silhouettePixels,
      viewWidth,
      viewHeight,
      bounceVariation,
      maxVel,
      renderTexture,
      renderTexture2,
      bg,
      outputSprite,
    }, () => {
      this.app.start()
    })
  }

  tick = () => {
    const {
      dots, silhouette, silhouettePolygon, silhouettePixels, viewWidth, viewHeight,
      bounceVariation, maxVel, renderTexture, renderTexture2, outputSprite, trails, bg,
    } = this.state

    const dt = this.app.ticker.deltaTime

    dots.forEach((dot) => {
      dot.x += dot.xVel * dt
      dot.y += dot.yVel * dt

      // console.log(JSON.stringify(silhouettePolygon, null, 2))
      if (silhouettePolygon.contains(dot.x, dot.y)) {
        const px = Math.floor(dot.x - (silhouette.x - silhouette.width / 2))
        const py = Math.floor(dot.y - (silhouette.y - silhouette.height / 2))
        const index = px + py * silhouette.width
        // const alpha = silhouettePixels[index * 3]
        const alpha = silhouettePixels[index * 4]
        if (alpha !== 0) {
          // this.app.renderer.render(silhouette, renderTexture2)
          dot.xVel = Math.abs(dot.xVel) * (dot.x < silhouette.x ? -1 : 1)
          dot.yVel = Math.abs(dot.yVel) * (dot.y < silhouette.y ? -1 : 1)
        }
      }

      if ((dot.x >= viewWidth && dot.xVel >= 0)
        || (dot.x < 0 && dot.xVel <= 0)) {
        dot.xVel = -dot.xVel + bounceVariation()
      }
      if ((dot.y >= viewHeight && dot.yVel >= 0)
        || (dot.y < 0 && dot.yVel <= 0)) {
        dot.yVel = -dot.yVel + bounceVariation()
      }

      if (dot.xVel > maxVel) {
        dot.xVel *= 0.99
      }
      if (dot.yVel > maxVel) {
        dot.yVel *= 0.99
      }
    })


    // dot.x = this.app.renderer.width * 0.5 + (Math.cos(tick) * 200)
    // dot.y = this.app.renderer.height * 0.5 + (Math.sin(tick) * 200)

    outputSprite.texture = renderTexture2

    this.setState({
      renderTexture: renderTexture2,
      renderTexture2: renderTexture,
    }, () => {
      if (trails) {
        this.app.renderer.render(this.app.stage, renderTexture)
      } else {
        this.app.renderer.render(bg, renderTexture)
      }
      this.app.renderer.render(this.app.stage)
    })
  }

  render() {
    const component = this
    return (
      <div className="scene-container">
        <div className="scene-controls">
          <h2>Silhouette</h2>
          {/* <label htmlFor="trails">
            Trails
            <input
              type="checkbox"
              id="trails"
              checked={trails}
              onChange={this.handleTrailsChange}
            />
          </label> */}
          <button
            onClick={this.handleTrailsChange}
            type="button"
          >
            Toggle Trails
          </button>
        </div>
        <div className="scene-view" ref={(thisDiv) => { component.gameCanvas = thisDiv }} />
      </div>
    )
  }
}

export default Silhouette

import * as React from 'react'
import { Snackbar, Grow, Slide } from './Snackbar'

function GrowTransition(props) {
  return <Grow {...props} />
}

function makeSlideTransition(direction) {
  return function SlideTransition(props) {
    return <Slide {...props} direction={direction} />
  }
}

function App() {
  const [state, setState] = React.useState({
    open: false,
    Transition: GrowTransition,
  })

  const makeHandleOpen = (Transition) => () => {
    setState({
      open: true,
      Transition,
    })
  }

  const handleClose = () => {
    setState({
      ...state,
      open: false,
    })
  }

  return (
    <div className="App">
      <Snackbar
        message="Hi, I'm Snackbar"
        open={state.open}
        TransitionComponent={state.Transition}
      />

      <div>
        <button
          onClick={state.open ? handleClose : makeHandleOpen(GrowTransition)}
        >
          Grow
        </button>
      </div>

      <div>
        {['up', 'down', 'left', 'right'].map((direction) => (
          <button
            onClick={
              state.open
                ? handleClose
                : makeHandleOpen(makeSlideTransition(direction))
            }
          >
            Slide {direction}
          </button>
        ))}
      </div>
    </div>
  )
}

export default App

import * as React from 'react'
import PropTypes from 'prop-types'
import { Grow } from './TransitionComponent'
import SnackbarContent from './SnackbarContent'

const SnackbarRoot = ({ children }) => {
  return (
    <div
      style={{
        zIndex: 2000,
        position: 'fixed',
        left: 8,
        right: 8,
        bottom: 8,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {children}
    </div>
  )
}

export default function Snackbar({
  message,
  open,
  transitionDuration,
  TransitionComponent,
  transitionProps,
}) {
  const { onEnter, onExited, ...otherTransitionProps } = transitionProps
  const [exited, setExited] = React.useState(true)

  const handleExited = (node) => {
    setExited(true)

    if (onExited) {
      onExited(node)
    }
  }

  const handleEnter = (node, isAppearing) => {
    setExited(false)

    if (onEnter) {
      onEnter(node, isAppearing)
    }
  }

  if (!open && exited) {
    return null
  }

  return (
    <SnackbarRoot>
      <TransitionComponent
        appear
        in={open}
        timeout={transitionDuration}
        onEnter={handleEnter}
        onExited={handleExited}
        {...otherTransitionProps}
      >
        <SnackbarContent message={message} />
      </TransitionComponent>
    </SnackbarRoot>
  )
}

Snackbar.propTypes = {
  /**
   * If `true`, the component is shown.
   */
  open: PropTypes.bool.isRequired,
  /**
   * The component used for the transition.
   */
  TransitionComponent: PropTypes.elementType,
  /**
   * The duration for the transition, in milliseconds.
   */
  transitionDuration: PropTypes.number,
  /**
   * Props applied to the transition element.
   * By default, the element is based on this [`Transition`](http://reactcommunity.org/react-transition-group/transition/) component.
   */
  transitionProps: PropTypes.object,
}

Snackbar.defaultProps = {
  TransitionComponent: Grow,
  transitionDuration: 500,
  transitionProps: {},
}

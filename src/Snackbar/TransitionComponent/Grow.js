import * as React from 'react'
import PropTypes from 'prop-types'
import { Transition } from 'react-transition-group'

import { reflow } from '../utils'

function getScale(value) {
  return `scale(${value}, ${value ** 2})`
}

const defaultStyles = {
  opacity: 0,
  transform: getScale(0.75),
}

const styles = {
  entering: {
    opacity: 1,
    transform: getScale(1),
  },
  entered: {
    opacity: 1,
    transform: 'none',
  },
  exiting: defaultStyles,
  exited: defaultStyles,
}

export default function Grow({
  children,
  appear,
  in: inProp,
  timeout,
  onEnter,
  onEntered,
  onEntering,
  onExit,
  onExited,
  onExiting,
}) {
  const nodeRef = React.useRef(null)

  const normalizedTransitionCallback = (callback) => (maybeIsAppearing) => {
    if (callback) {
      const node = nodeRef.current

      // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
      if (maybeIsAppearing === undefined) {
        callback(node)
      } else {
        callback(node, maybeIsAppearing)
      }
    }
  }

  const handleEnter = (node, isAppearing) => {
    reflow(node) // So the animation always start from the start.

    if (onEnter) {
      onEnter(node, isAppearing)
    }
  }

  return (
    <Transition
      nodeRef={nodeRef}
      onEnter={normalizedTransitionCallback(handleEnter)}
      onEntered={normalizedTransitionCallback(onEntered)}
      onEntering={normalizedTransitionCallback(onEntering)}
      onExit={normalizedTransitionCallback(onExit)}
      onExited={normalizedTransitionCallback(onExited)}
      onExiting={normalizedTransitionCallback(onExiting)}
      appear={appear}
      in={inProp}
      timeout={timeout}
    >
      {(state, childProps) => {
        return React.cloneElement(children, {
          ref: nodeRef,
          style: {
            transition: [
              `opacity ${timeout / 1000}s ease-in-out`,
              `transform ${timeout / 1000}s ease-in-out`,
            ].join(','),
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...styles[state],
            ...children.props.style,
          },
          ...childProps,
        })
      }}
    </Transition>
  )
}

Grow.propTypes = {
  /**
   * A single child content element.
   */
  children: PropTypes.element.isRequired,
  /**
   * Perform the enter transition when it first mounts if `in` is also `true`.
   * Set this to `false` to disable this behavior.
   */
  appear: PropTypes.bool,
  /**
   * If `true`, the component will transition in.
   */
  in: PropTypes.bool,
  /**
   * The duration for the transition, in milliseconds.
   */
  timeout: PropTypes.number,
  onEnter: PropTypes.func,
  onEntered: PropTypes.func,
  onEntering: PropTypes.func,
  onExit: PropTypes.func,
  onExited: PropTypes.func,
  onExiting: PropTypes.func,
}

Grow.defaultProps = {
  appear: true,
  timeout: 300,
  onEnter: () => {},
  onEntered: () => {},
  onEntering: () => {},
  onExit: () => {},
  onExited: () => {},
  onExiting: () => {},
}

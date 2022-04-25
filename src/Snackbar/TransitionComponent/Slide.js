import * as React from 'react'
import PropTypes from 'prop-types'
import { Transition } from 'react-transition-group'

import { reflow, ownerWindow, debounce } from '../utils'
import { easing, duration } from '../constants'

// Translate the node so it can't be seen on the screen.
// Later, we're going to translate the node back to its original location with `none`.
function getTranslateValue(direction, node) {
  const rect = node.getBoundingClientRect()
  const containerWindow = ownerWindow(node)

  let transform

  if (node.fakeTransform) {
    transform = node.fakeTransform
  } else {
    const computedStyle = containerWindow.getComputedStyle(node)
    transform = computedStyle.getPropertyValue('transform')
  }

  let offsetX = 0
  let offsetY = 0

  if (transform && transform !== 'none' && typeof transform === 'string') {
    const transformValues = transform.split('(')[1].split(')')[0].split(',')
    offsetX = parseInt(transformValues[4], 10)
    offsetY = parseInt(transformValues[5], 10)
  }

  if (direction === 'left') {
    return `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`
  }

  if (direction === 'right') {
    return `translateX(-${rect.left + rect.width - offsetX}px)`
  }

  if (direction === 'up') {
    return `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`
  }

  // direction === 'down'
  return `translateY(-${rect.top + rect.height - offsetY}px)`
}

export function setTranslateValue(direction, node) {
  const transform = getTranslateValue(direction, node)

  if (transform) {
    node.style.webkitTransform = transform
    node.style.transform = transform
  }
}

export default function Slide({
  children,
  appear,
  in: inProp,
  timeout,
  easing,
  direction,
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
    setTranslateValue(direction, node)
    reflow(node) // So the animation always start from the start.

    if (onEnter) {
      onEnter(node, isAppearing)
    }
  }

  const handleEntering = (node, isAppearing) => {
    const timingFunction = typeof easing === 'object' ? easing.enter : easing
    const duration = typeof timeout === 'number' ? timeout : timeout.enter
    node.style.transition = `transform ${duration / 1000}s ${timingFunction}`
    node.style.transform = 'none'

    if (onEntering) {
      onEntering(node, isAppearing)
    }
  }

  const handleExit = (node) => {
    const timingFunction = typeof easing === 'object' ? easing.exit : easing
    const duration = typeof timeout === 'number' ? timeout : timeout.exit
    node.style.transition = `transform ${duration / 1000}s ${timingFunction}`

    setTranslateValue(direction, node)

    if (onExit) {
      onExit(node)
    }
  }

  const handleExited = (node) => {
    // No need for transitions when the component is hidden
    node.style.transition = ''

    if (onExited) {
      onExited(node)
    }
  }

  const updatePosition = React.useCallback(() => {
    if (nodeRef.current) {
      setTranslateValue(direction, nodeRef.current)
    }
  }, [direction])

  React.useEffect(() => {
    // Skip configuration where the position is screen size invariant.
    if (inProp || direction === 'down' || direction === 'right') {
      return undefined
    }

    const handleResize = debounce(() => {
      if (nodeRef.current) {
        setTranslateValue(direction, nodeRef.current)
      }
    })

    const containerWindow = ownerWindow(nodeRef.current)
    containerWindow.addEventListener('resize', handleResize)
    return () => {
      handleResize.clear()
      containerWindow.removeEventListener('resize', handleResize)
    }
  }, [direction, inProp])

  React.useEffect(() => {
    if (!inProp) {
      // We need to update the position of the drawer when the direction change and
      // when it's hidden.
      updatePosition()
    }
  }, [inProp, updatePosition])

  return (
    <Transition
      nodeRef={nodeRef}
      onEnter={normalizedTransitionCallback(handleEnter)}
      onEntered={normalizedTransitionCallback(onEntered)}
      onEntering={normalizedTransitionCallback(handleEntering)}
      onExit={normalizedTransitionCallback(handleExit)}
      onExited={normalizedTransitionCallback(handleExited)}
      onExiting={normalizedTransitionCallback(onExiting)}
      appear={appear}
      in={inProp}
      timeout={timeout}
    >
      {(state, childProps) => {
        return React.cloneElement(children, {
          ref: nodeRef,
          style: {
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...children.props.style,
          },
          ...childProps,
        })
      }}
    </Transition>
  )
}

Slide.propTypes = {
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
   * You may specify a single timeout for all transitions, or individually with an object.
   */
  timeout: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      enter: PropTypes.number,
      exit: PropTypes.number,
    }),
  ]),
  /**
   * The transition timing function.
   * You may specify a single easing or a object containing enter and exit values.
   */
  easing: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      enter: PropTypes.string,
      exit: PropTypes.string,
    }),
  ]),
  /**
   * Direction the child node will enter from.
   */
  direction: PropTypes.oneOf(['down', 'left', 'right', 'up']),
  onEnter: PropTypes.func,
  onEntered: PropTypes.func,
  onEntering: PropTypes.func,
  onExit: PropTypes.func,
  onExited: PropTypes.func,
  onExiting: PropTypes.func,
}

Slide.defaultProps = {
  appear: true,
  timeout: {
    enter: duration.enteringScreen,
    exit: duration.leavingScreen,
  },
  easing: {
    enter: easing.easeOut,
    exit: easing.sharp,
  },
  direction: 'up',
  onEnter: () => {},
  onEntered: () => {},
  onEntering: () => {},
  onExit: () => {},
  onExited: () => {},
  onExiting: () => {},
}

import * as React from 'react'
import PropTypes from 'prop-types'
import { Transition } from 'react-transition-group'

import { reflow } from '../utils'
import { easing } from '../constants'

function getScale(value) {
  return `scale(${value}, ${value ** 2})`
}

function getAutoHeightDuration(height) {
  if (!height) {
    return 0
  }

  const constant = height / 36

  // https://www.wolframalpha.com/input/?i=(4+%2B+15+*+(x+%2F+36+)+**+0.25+%2B+(x+%2F+36)+%2F+5)+*+10
  return Math.round((4 + 15 * constant ** 0.25 + constant / 5) * 10)
}

/**
 * Conditionally apply a workaround for the CSS transition bug in Safari 15.4 / WebKit browsers.
 * Remove this workaround once the WebKit bug fix is released.
 */
const isWebKit154 =
  typeof navigator !== 'undefined' &&
  /^((?!chrome|android).)*(safari|mobile)/i.test(navigator.userAgent) &&
  /(os |version\/)15(.|_)[4-9]/i.test(navigator.userAgent)

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
  easing,
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

    const timingFunction = typeof easing === 'object' ? easing.enter : easing

    let duration
    if (timeout === 'auto') {
      duration = getAutoHeightDuration(node.clientHeight)
    } else {
      duration = typeof timeout === 'number' ? timeout : timeout.enter
    }
    const transformDuration = isWebKit154 ? duration : duration * 0.666

    node.style.transition = [
      `opacity ${duration / 1000}s`,
      `transform ${transformDuration / 1000}s ${timingFunction}`,
    ].join(',')

    if (onEnter) {
      onEnter(node, isAppearing)
    }
  }

  const handleExit = (node) => {
    const timingFunction = typeof easing === 'object' ? easing.enter : easing

    let duration
    if (timeout === 'auto') {
      duration = getAutoHeightDuration(node.clientHeight)
    } else {
      duration = typeof timeout === 'number' ? timeout : timeout.enter
    }
    const transformDuration = isWebKit154 ? duration : duration * 0.666
    const transformDelay = duration * 0.333

    node.style.transition = [
      `opacity ${duration / 1000}s`,
      `transform ${
        transformDuration / 1000
      }s ${timingFunction} ${transformDelay}`,
    ].join(',')

    node.style.opacity = 0
    node.style.transform = getScale(0.75)

    if (onExit) {
      onExit(node)
    }
  }

  return (
    <Transition
      nodeRef={nodeRef}
      onEnter={normalizedTransitionCallback(handleEnter)}
      onEntered={normalizedTransitionCallback(onEntered)}
      onEntering={normalizedTransitionCallback(onEntering)}
      onExit={normalizedTransitionCallback(handleExit)}
      onExited={normalizedTransitionCallback(onExited)}
      onExiting={normalizedTransitionCallback(onExiting)}
      addEndListener={() => {}}
      appear={appear}
      in={inProp}
      timeout={timeout === 'auto' ? null : timeout}
    >
      {(state, childProps) => {
        return React.cloneElement(children, {
          ref: nodeRef,
          style: {
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
   * You may specify a single timeout for all transitions, or individually with an object.
   */
  timeout: PropTypes.oneOfType([
    PropTypes.oneOf(['auto']),
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
  onEnter: PropTypes.func,
  onEntered: PropTypes.func,
  onEntering: PropTypes.func,
  onExit: PropTypes.func,
  onExited: PropTypes.func,
  onExiting: PropTypes.func,
}

Grow.defaultProps = {
  appear: true,
  timeout: 'auto',
  easing: easing.easeInOut,
  onEnter: () => {},
  onEntered: () => {},
  onEntering: () => {},
  onExit: () => {},
  onExited: () => {},
  onExiting: () => {},
}

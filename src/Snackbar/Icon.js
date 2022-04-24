import React, { forwardRef } from 'react'
import styled, { css, keyframes } from 'styled-components'

const animSpin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const IconWrapper = styled.span`
  display: inline-flex;
  ${(props) =>
    props.$spinning &&
    css`
      animation: ${animSpin} 2s infinite linear;
    `}
  ${(props) =>
    props.$size &&
    css`
      font-size: ${({ $size }) =>
        typeof $size === 'number' ? `${$size}em` : $size};
    `}
  ${(props) =>
    props.$color &&
    css`
      color: ${({ $color }) => $color};
    `}
`

function SyncFill(props) {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.474-6.886a3.644 3.644 0 00-6.44-2.772l-.945-.41a4.644 4.644 0 018.337 3.564l.39.156a.1.1 0 01.006.183l-1.375.659a.1.1 0 01-.137-.055l-.539-1.427a.1.1 0 01.131-.128l.572.23zM2.74 7.479l.49.113a4.644 4.644 0 008.457 2.84l-.952-.394a3.644 3.644 0 01-6.508-2.19v-.026l.57.132a.1.1 0 00.113-.14l-.73-1.536a.1.1 0 00-.152-.035l-1.328 1.06a.1.1 0 00.04.176z"
        fill="currentColor"
      />
    </svg>
  )
}

const Icon = forwardRef(
  ({ className, color, size, spinning, svgProps, ...otherProps }, ref) => {
    const SvgComponent = SyncFill

    return (
      <IconWrapper
        className={className}
        role="presentation"
        $color={color}
        $spinning={spinning}
        $size={size}
        ref={ref}
        {...otherProps}
      >
        {SvgComponent && <SvgComponent {...svgProps} />}
      </IconWrapper>
    )
  }
)

export default Icon

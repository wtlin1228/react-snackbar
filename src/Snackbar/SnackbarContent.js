import * as React from 'react'
import styled from 'styled-components'
import Icon from './Icon'

const riverBedGrey = '#454F5B'

const Container = styled.div`
  z-index: 2001;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: ${riverBedGrey};
`

const StyledIcon = styled(Icon)`
  margin-right: 8px;
`

const Message = styled.div`
  font-weight: 400;
  font-size: 20px;
  line-height: 29px;
  color: white;
`

export default React.forwardRef(function SnackbarContent(
  { style, message },
  ref
) {
  return (
    <Container ref={ref} style={{ ...style }}>
      <StyledIcon spinning color="#FBB03F" size="14px" />
      <Message>{message}</Message>
    </Container>
  )
})

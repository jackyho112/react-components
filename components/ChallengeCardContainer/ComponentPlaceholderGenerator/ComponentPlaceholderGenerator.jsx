import React from 'react'
import ChallengeCardPlaceholder from '../ComponentPlaceholders/ChallengeCardPlaceholder/ChallengeCardPlaceholder'

const ComponentPlaceholderGenerator = ({ type }) => {
  switch (type) {
    case 'challenge-card':
      return <ChallengeCardPlaceholder />
    default:
      return null
  }
}

export default ComponentPlaceholderGenerator

import React from 'react'
import '../../../ChallengeCard/ChallengeCard.scss'
import './ChallengeCardPlaceholder.scss'
import '../../ComponentPlaceholderGenerator/ComponentPlaceholder.scss'

const ChallengeCardPlaceholder = ({ height }) => (
  <div className="challengeCard placeholder">
    <div className="left-panel">
      <div className="challenge-track placeholder-template"></div>

      <div className="challenge-details">
        <div className="challenge-title placeholder-template"></div>
        <div className="details-footer placeholder-template"></div>
      </div>
    </div>

    <div className="right-panel">
      <div className="prizes placeholder-template"></div>

      <div className="challenge-status">
        <div className="progress-container placeholder-template"></div>

        <div className="challenge-stats-container">
          <div className="challenge-stats placeholder-template"></div>
        </div>
      </div>
    </div>
  </div>
)

export default ChallengeCardPlaceholder

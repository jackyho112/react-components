import React from 'react';
import ChallengeCardPlaceholder from './ComponentPlaceholders/ChallengeCardPlaceholder/ChallengeCardPlaceholder';
import ChallengeCard from '../ChallengeCard/ChallengeCard';

export function getChallengeCardPlaceholder(id) {
  return (
    <ChallengeCardPlaceholder key={id} />
  );
}

export function getChallengeCard(id, challenge, onTechTagClicked) {
  return (
    <ChallengeCard
      challenge={challenge}
      onTechTagClicked={onTechTagClicked}
      key={id}
    />
  );
}

export function getExpandBucketButton(hiddenNumber, onClick) {
  return (
    <button onClick={onClick} className="view-more">
      View {hiddenNumber} more challenges
    </button>
  );
}

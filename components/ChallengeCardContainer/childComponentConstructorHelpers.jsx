import React from 'react';
import ComponentPlaceholderGenerator from './ComponentPlaceholderGenerator/ComponentPlaceholderGenerator';
import ChallengeCard from '../ChallengeCard/ChallengeCard';

export function getChallengeCardPlaceholder(id) {
  return (
    <ComponentPlaceholderGenerator
      type="challenge-card"
      key={id}
    />
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
    <button
      onClick={onClick}
      className="view-more"
    >
      View {hiddenNumber} more challenges
    </button>
  );
}

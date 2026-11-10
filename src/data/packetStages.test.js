// [라이브러리] vitest: 스테이지 데이터가 규칙과 맞는지 화면 없이 확인한다 (자세한 이유는 scripts/tokenRules.test.js)
import { describe, expect, it } from 'vitest';
import { judgeStep } from '../rules/packetRules.js';
import { packetStages } from './packetStages.js';

// 트레이에서 계층마다 한 장씩 고르는 모든 조합을 만든다. 예: [[L4a, L3a], [L4a, L3b]]
function listCardChoices(step) {
  let choices = [[]];
  for (const layer of step.layers) {
    const cards = step.tray.filter((card) => card.layer === layer);
    const nextChoices = [];
    for (const choice of choices) {
      for (const card of cards) {
        nextChoices.push([...choice, card]);
      }
    }
    choices = nextChoices;
  }
  return choices;
}

const allSteps = packetStages.flatMap((stage) => {
  return stage.deliveries.flatMap((delivery) => {
    return delivery.steps.map((step) => ({ stage, delivery, step }));
  });
});

describe('packetStages 데이터', () => {
  it('스테이지 번호가 목록에서의 순서와 같다', () => {
    packetStages.forEach((stage, index) => {
      expect(stage.number).toBe(index + 1);
    });
  });
  it('힌트는 2단계 이하다', () => {
    packetStages.forEach((stage) => {
      expect(stage.hints.length).toBeLessThanOrEqual(2);
    });
  });
  it('부품 트레이의 카드는 한 번에 3장 이하이고 id가 겹치지 않는다', () => {
    allSteps.forEach(({ step }) => {
      const ids = step.tray.map((card) => card.id);
      expect(ids.length).toBeLessThanOrEqual(3);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
  it('작업마다 통과하는 카드 조합이 정확히 하나 있다', () => {
    allSteps.forEach(({ stage, delivery, step }) => {
      const passing = listCardChoices(step).filter((cards) => judgeStep(step, cards, delivery).passed);
      expect(passing.length, `스테이지 ${stage.number}: ${step.prompt}`).toBe(1);
    });
  });
  it('작업 지시서에 써야 할 포트 번호가 적혀 있다', () => {
    packetStages.forEach((stage) => {
      stage.deliveries.forEach((delivery) => {
        expect(stage.goal).toContain(String(delivery.transport.destinationPort));
      });
    });
  });
});

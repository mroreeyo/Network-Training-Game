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

const allDeliveries = packetStages.flatMap((stage) => {
  return stage.deliveries.map((delivery) => ({ stage, delivery }));
});

// 경로 표의 장비 한 칸에 적힌 주소 목록. kind는 'ip' 또는 'mac'이다.
function listStopAddresses(stop, kind) {
  return stop.ports.map((port) => port[kind]);
}

describe('packetStages 데이터', () => {
  // 경로 표(stops)와 판정용 값(sourceIp, destinationIp, segments)은 같은 주소를 따로 적는다.
  // 한쪽만 고치면 화면에 보이는 주소로는 정답 카드를 찾을 수 없게 되므로 서로 맞는지 확인한다.
  it('경로 표에 보이는 주소가 판정에 쓰는 주소와 같다', () => {
    allDeliveries.forEach(({ stage, delivery }) => {
      const { stops, segments } = delivery;
      const where = `스테이지 ${stage.number}: ${delivery.application}`;
      expect(stops.length, where).toBe(segments.length + 1);
      expect(listStopAddresses(stops[0], 'ip'), where).toContain(delivery.sourceIp);
      expect(listStopAddresses(stops[stops.length - 1], 'ip'), where).toContain(delivery.destinationIp);
      segments.forEach((segment, index) => {
        expect(listStopAddresses(stops[index], 'mac'), where).toContain(segment.sourceMac);
        expect(listStopAddresses(stops[index + 1], 'mac'), where).toContain(segment.destinationMac);
      });
    });
  });
  it('작업마다 경로에 있는 구간을 가리킨다', () => {
    allSteps.forEach(({ stage, delivery, step }) => {
      expect(delivery.segments[step.segmentIndex], `스테이지 ${stage.number}: ${step.prompt}`).toBeDefined();
    });
  });
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

// 챕터 1(패킷 택배)의 게임 규칙이다. 화면 코드가 없는 순수 함수라서 따로 테스트할 수 있다.
// 판정 결과는 모든 챕터가 같은 모양이다: { passed, reason: { what, why, next }, record? }
//
// 이 파일이 받는 데이터의 모양 (스테이지 데이터는 src/data/packetStages.js에 둔다)
//   card: 헤더 카드 한 장. { id, layer: 'L4' | 'L3' | 'L2', values }
//     L4 values: { protocol: 'TCP' | 'UDP', destinationPort }
//     L3 values: { sourceIp, destinationIp }
//     L2 values: { sourceMac, destinationMac }
//   delivery: 배송 한 건. { application, sourceIp, destinationIp, routerIps, transport, transportReason, segments, steps }
//     transport: 이 배송에 맞는 전송 방식. { protocol, destinationPort }
//     segments: 구간 목록. 구간마다 { sourceMac, destinationMac } (보내는 장비와 바로 다음 장비의 MAC)
//   step: 상자에 헤더를 붙이는 한 번의 작업. { layers: 붙일 계층(붙이는 순서), segmentIndex: 몇 번째 구간인지(0부터) }

// 보내는 쪽은 L4 → L3 → L2 순서로 붙인다. 바깥 헤더(L2)일수록 나중에 붙는다.
export const ATTACH_ORDER = ['L4', 'L3', 'L2'];

// 받는 쪽은 바깥부터 벗긴다: L2 → L3 → L4.
export const PEEL_ORDER = ['L2', 'L3', 'L4'];

const RETURNED = '패킷이 반송됐어요.';

function makeFailure(why, next, card) {
  const reason = { what: RETURNED, why, next };
  if (card === undefined) {
    return { passed: false, reason };
  }
  return { passed: false, reason, record: makeRecord(card) };
}

// 플레이어가 실제로 붙인 값을 결과 화면에 보여 주려고 카드 값을 글자 쌍으로 바꾼다.
export function describeHeaderCard(card) {
  const values = card.values;
  if (card.layer === 'L4') {
    return { name: `${values.protocol} 헤더`, rows: [['목적지 포트', String(values.destinationPort)]] };
  }
  if (card.layer === 'L3') {
    return {
      name: 'IP 헤더',
      rows: [['출발지 IP', values.sourceIp], ['목적지 IP', values.destinationIp]],
    };
  }
  return {
    name: '이더넷 헤더',
    rows: [['출발지 MAC', values.sourceMac], ['목적지 MAC', values.destinationMac]],
  };
}

function makeRecord(card) {
  const description = describeHeaderCard(card);
  return { title: `붙인 ${card.layer} ${description.name}`, rows: description.rows };
}

// 붙인 순서가 L4 → L3 → L2인지 확인한다.
export function checkHeaderOrder(attachedCards, requiredLayers) {
  for (let index = 0; index < requiredLayers.length; index += 1) {
    const attached = attachedCards[index];
    if (attached === undefined) {
      return makeFailure(
        `${requiredLayers[index]} 헤더가 빠진 채로 보냈어요.`,
        '헤더를 모두 붙인 다음에 보내 보세요.',
      );
    }
    if (attached.layer !== requiredLayers[index]) {
      return makeFailure(
        `${attached.layer} 헤더를 ${requiredLayers[index]} 헤더보다 먼저 붙였어요. 바깥 헤더일수록 나중에 붙여요.`,
        '헤더를 L4, L3, L2 순서로 붙여 보세요.',
      );
    }
  }
  return { passed: true };
}

// L4: 전송 방식(TCP/UDP)과 목적지 포트가 맞는지 분류한다.
export function classifyTransportHeader(card, transport) {
  if (card.values.protocol !== transport.protocol) {
    return 'wrong-protocol';
  }
  if (card.values.destinationPort !== transport.destinationPort) {
    return 'wrong-port';
  }
  return 'correct';
}

// L3: IP 헤더의 목적지는 라우터를 거쳐도 최종 목적지 그대로다.
export function classifyNetworkHeader(card, delivery) {
  const { sourceIp, destinationIp } = card.values;
  if (sourceIp === delivery.sourceIp && destinationIp === delivery.destinationIp) {
    return 'correct';
  }
  if (sourceIp === delivery.destinationIp && destinationIp === delivery.sourceIp) {
    return 'swapped';
  }
  if (delivery.routerIps.includes(destinationIp)) {
    return 'router-as-destination';
  }
  return 'other';
}

// 구간별 출발지 MAC은 보내는 장비, 목적지 MAC은 바로 다음 장비의 MAC이다.
export function getSegmentMacAddresses(delivery, segmentIndex) {
  return delivery.segments[segmentIndex];
}

// L2: MAC 주소는 같은 구간 안에서만 통하는 주소라서 구간마다 바뀐다.
export function classifyLinkHeader(card, delivery, segmentIndex) {
  const expected = getSegmentMacAddresses(delivery, segmentIndex);
  const { sourceMac, destinationMac } = card.values;
  if (sourceMac === expected.sourceMac && destinationMac === expected.destinationMac) {
    return 'correct';
  }
  if (sourceMac === expected.destinationMac && destinationMac === expected.sourceMac) {
    return 'swapped';
  }
  const previous = delivery.segments[segmentIndex - 1];
  if (previous && sourceMac === previous.sourceMac && destinationMac === previous.destinationMac) {
    return 'previous-segment';
  }
  if (destinationMac === expected.destinationMac) {
    return 'wrong-source';
  }
  const isLastSegment = segmentIndex === delivery.segments.length - 1;
  const finalMac = delivery.segments[delivery.segments.length - 1].destinationMac;
  if (!isLastSegment && destinationMac === finalMac) {
    return 'final-destination';
  }
  return 'other';
}

function judgeTransportCard(card, delivery) {
  const kind = classifyTransportHeader(card, delivery.transport);
  if (kind === 'correct') {
    return { passed: true };
  }
  if (kind === 'wrong-protocol') {
    return makeFailure(
      `${delivery.application}에는 ${delivery.transport.protocol}가 맞는데 ${card.values.protocol}를 붙였어요. ${delivery.transportReason}`,
      '전송 방식을 다시 골라 보세요.',
      card,
    );
  }
  return makeFailure(
    `목적지 포트가 ${card.values.destinationPort}번이에요. 이 통신은 ${delivery.transport.destinationPort}번 포트로 가야 해요.`,
    '목적지 포트가 맞는 L4 헤더를 골라 보세요.',
    card,
  );
}

const NETWORK_FAILURES = {
  'router-as-destination': {
    why: '목적지 IP에 라우터 IP를 적었어요. IP 헤더의 목적지는 라우터를 거쳐도 최종 목적지 그대로예요.',
    next: '라우터는 MAC 주소로 찾아가요. 목적지 IP에는 최종 목적지를 적어 보세요.',
  },
  swapped: {
    why: '출발지 IP와 목적지 IP가 바뀌었어요.',
    next: '출발지는 보내는 PC, 목적지는 받는 장비예요.',
  },
  other: {
    why: '경로의 출발지·목적지 IP와 맞지 않아요.',
    next: '경로 표에서 양 끝 장비의 IP를 확인해 보세요.',
  },
};

function judgeNetworkCard(card, delivery) {
  const kind = classifyNetworkHeader(card, delivery);
  if (kind === 'correct') {
    return { passed: true };
  }
  const message = NETWORK_FAILURES[kind];
  return makeFailure(message.why, message.next, card);
}

const LINK_FAILURES = {
  'previous-segment': {
    why: '라우터를 지났는데 이전 구간의 MAC 주소가 그대로예요.',
    next: 'L2 헤더를 새로 붙여 보세요. 출발지는 보내는 장비, 목적지는 바로 다음 장비의 MAC이에요.',
  },
  'final-destination': {
    why: '목적지 MAC에 최종 목적지의 MAC을 적었어요. MAC은 같은 구간 안에서만 통하는 주소예요.',
    next: '이번 구간에서 상자를 받는 바로 다음 장비의 MAC을 찾아보세요.',
  },
  'wrong-source': {
    why: '출발지 MAC이 이번 구간에서 상자를 내보내는 포트의 MAC과 달라요.',
    next: '라우터는 상자가 나가는 쪽 포트의 MAC을 출발지로 써요. 경로 표에서 확인해 보세요.',
  },
  swapped: {
    why: '출발지 MAC과 목적지 MAC이 바뀌었어요.',
    next: '출발지는 보내는 장비, 목적지는 받는 장비예요.',
  },
  other: {
    why: '이번 구간의 장비 MAC과 맞지 않아요.',
    next: '경로 표에서 이번 구간 양쪽 장비의 MAC을 확인해 보세요.',
  },
};

function judgeLinkCard(card, delivery, segmentIndex) {
  const kind = classifyLinkHeader(card, delivery, segmentIndex);
  if (kind === 'correct') {
    return { passed: true };
  }
  const message = LINK_FAILURES[kind];
  return makeFailure(message.why, message.next, card);
}

// 한 단계(step)에서 붙인 카드를 판정한다. 순서를 먼저 보고, 그다음 카드 값을 하나씩 본다.
export function judgeStep(step, attachedCards, delivery) {
  const orderResult = checkHeaderOrder(attachedCards, step.layers);
  if (!orderResult.passed) {
    return orderResult;
  }
  for (const card of attachedCards) {
    let result = { passed: true };
    if (card.layer === 'L4') {
      result = judgeTransportCard(card, delivery);
    } else if (card.layer === 'L3') {
      result = judgeNetworkCard(card, delivery);
    } else {
      result = judgeLinkCard(card, delivery, step.segmentIndex);
    }
    if (!result.passed) {
      return result;
    }
  }
  return { passed: true };
}

// 라우터를 지나면 L2 헤더는 떼어지고, L4·L3 헤더는 그대로 남는다.
export function stripLinkHeader(labels) {
  return labels.filter((card) => card.layer !== 'L2');
}

const PEEL_NOTES = {
  L2: '이더넷 헤더의 목적지 MAC이 내 것인지 확인하고 L2 헤더를 벗겨요.',
  L3: 'IP 헤더의 목적지 IP가 내 것인지 확인하고 L3 헤더를 벗겨요.',
  L4: '포트 번호로 어떤 프로그램에 줄지 정하고 L4 헤더를 벗겨요.',
};

export function describePeel(layer) {
  return PEEL_NOTES[layer];
}

// 받는 쪽은 바깥(L2)부터 벗긴다. 안쪽 헤더부터 벗기려고 하면 반송된다.
export function judgePeel(remainingLayers, pickedLayer) {
  const outermost = remainingLayers[0];
  if (pickedLayer === outermost) {
    return { passed: true };
  }
  return makeFailure(
    `${pickedLayer} 헤더를 먼저 벗기려고 했어요. 지금 가장 바깥에 있는 헤더는 ${outermost}예요.`,
    '받는 쪽에서는 L2, L3, L4 순서로 바깥부터 벗겨 보세요.',
  );
}

// 판정을 통과한 뒤 다음에 할 일을 정한다.
//   next-step: 같은 배송의 다음 작업. 라우터에 도착했으니 L2 헤더는 떼어진다.
//   next-delivery: 다음 배송(스테이지 3처럼 배송이 여러 개일 때)
//   finished: 스테이지의 마지막 배송까지 끝
export function advanceAfterPass({ labels, attached, delivery, stepIndex, deliveryIndex, deliveryCount }) {
  const nextLabels = [...labels, ...attached];
  if (stepIndex + 1 < delivery.steps.length) {
    return { kind: 'next-step', labels: stripLinkHeader(nextLabels), stepIndex: stepIndex + 1, deliveryIndex };
  }
  if (deliveryIndex + 1 < deliveryCount) {
    return { kind: 'next-delivery', labels: [], stepIndex: 0, deliveryIndex: deliveryIndex + 1 };
  }
  return { kind: 'finished', labels: nextLabels, stepIndex, deliveryIndex };
}
